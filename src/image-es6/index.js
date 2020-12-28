const templates = require("./templates");
const Docxtemplater = require("docxtemplater");
const {
	traits,
	str2xml,
	xml2str,
	isContent,
} = require("docxtemplater").DocUtils;

const converter = require("./converter");
const getMaxDocPrId = require("./max-docprid");
const addImageTraits = require("./image-rels-traits");
const { getSingleAttribute } = require("./attributes");
const verifyApiVersion = require("./api-verify");
const normalizePath = require("./normalize-path");
const RelsManager = require("./relationship-manager");
const { isNaN, isInteger, isPositive } = require("./type-conditions");
const {
	collectSectionsWidth,
	collectCellsWidth,
	getSectionWidth,
	getCellWidth,
} = require("./get-widths");
const svgUnsupportedBase64 = require("./svg-unsupported");
const { isSVG, getSVGSize } = require("./svg");
const ctXML = "[Content_Types].xml";
const {
	mainContentType,
	headerContentType,
	footerContentType,
} = require("./content-types");
const calculatePlaceholderPositions = require("./calculate-placeholder-positions");

const moduleName = "open-xml-templating/docxtemplater-image-module";
const moduleNameCentered =
	"open-xml-templating/docxtemplater-image-module-centered";
const defaultDeviceWidth = 576;

function defaultGetDxaWidth() {
	return 8640;
}

function getInnerDocxInline({ part }) {
	return part;
}

function getInnerDocxBlockCentered({ part, left, right, postparsed, index }) {
	const paragraphParts = postparsed.slice(left + 1, right);
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (isContent(p)) {
			const err = new Docxtemplater.Errors.RenderingError(
				"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag"
			);
			err.properties = {
				part,
				explanation:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				id: "centered_image_should_be_in_paragraph",
			};
			throw err;
		}
	});
	return part;
}

function getInnerPptx({ part }) {
	let cx;
	let cy;
	let x;
	let y;
	this.placeholderIds[this.filePath].forEach(function (ph) {
		if (ph.lIndex[0] < part.lIndex && part.lIndex < ph.lIndex[1]) {
			cx = ph.cx;
			cy = ph.cy;
			x = ph.x;
			y = ph.y;
		}
	});

	part.ext = { cx, cy };
	part.offset = { x, y };
	part.extPx = {
		cx: converter.emuToPixel(cx, this.dpi),
		cy: converter.emuToPixel(cy, this.dpi),
	};
	part.offsetPx = {
		x: converter.emuToPixel(x, this.dpi),
		y: converter.emuToPixel(y, this.dpi),
	};
	return part;
}

function getResolvedId(part, options) {
	return (
		options.filePath +
		"@" +
		part.lIndex.toString() +
		"-" +
		options.scopeManager.scopePathItem.join("-")
	);
}

class ImageModule {
	constructor(options) {
		this.requiredAPIVersion = "3.20.0";
		this.placeholderIds = {};
		this.name = "ImageModule";
		this.filePathToContentType = {};
		this.supportedFileTypes = ["docx", "pptx"];
		options = options || {};
		this.options = options;
		options.getSVGFallback = options.getSVGFallback || svgUnsupportedBase64;
		this.imgManagers = {};
		this.resolved = {};
		this.deviceWidth = this.options.deviceWidth || defaultDeviceWidth;
		this.dpi = this.options.dpi;
		if (this.options.centered == null) {
			this.options.centered = false;
		}
		if (this.options.getImage == null) {
			throw new Error(
				'You should pass "getImage" to the imagemodule constructor'
			);
		}
		if (this.options.getSize == null) {
			throw new Error(
				'You should pass "getSize" to the imagemodule constructor'
			);
		}
		this.prefix = {
			normal: "%",
			centered: "%%",
		};
		this.imageNumber = 1;
	}
	on(event) {
		if (this.fileType === "xlsx") {
			return;
		}
		if (event !== "syncing-zip") {
			return;
		}
		// This is needed for subsection-module for example (tested by subsection module)
		this.xmlDocuments = this.zip
			.file(/\.xml\.rels/)
			.map((file) => file.name)
			.reduce((xmlDocuments, fileName) => {
				if (xmlDocuments[fileName]) {
					return xmlDocuments;
				}
				const content = this.zip.files[fileName].asText();
				xmlDocuments[fileName] = str2xml(content);
				return xmlDocuments;
			}, this.xmlDocuments);
		const relsFiles = Object.keys(this.xmlDocuments).filter(function (
			fileName
		) {
			return /\.xml\.rels/.test(fileName);
		});

		const imageFiles = [];
		relsFiles.forEach((relf) => {
			const xmldoc = this.xmlDocuments[relf];
			const associatedXml = relf.replace(/_rels\/|\.rels/g, "");
			const rids = [];
			const associatedFile = this.zip.files[associatedXml];
			if (associatedFile) {
				let text = "";

				if (this.xmlDocuments[associatedXml]) {
					text = xml2str(this.xmlDocuments[associatedXml]);
				} else {
					text = associatedFile.asText();
				}
				const lexed = this.Lexer.xmlparse(text, {
					text: [],
					other: [
						"a:blip",
						"asvg:svgBlip",
						"v:imagedata",
						"o:OLEObject",
						"v:fill",
					],
				});

				lexed.forEach(function (part) {
					const { type, value, position, tag } = part;
					if (
						type === "tag" &&
						["start", "selfclosing"].indexOf(position) !== -1
					) {
						if (["v:imagedata", "o:OLEObject", "v:fill"].indexOf(tag) !== -1) {
							rids.push(getSingleAttribute(value, "r:id"));
						} else {
							rids.push(getSingleAttribute(value, "r:embed"));
						}
					}
				});
			}
			if (rids.length === 0) {
				return;
			}
			const rels = xmldoc.getElementsByTagName("Relationship");
			for (let i = 0, len = rels.length; i < len; i++) {
				const rel = rels[i];
				const target = rel.getAttribute("Target");
				const normalized = normalizePath(target, relf);
				if (normalized.indexOf("/media/") !== -1) {
					if (associatedFile) {
						const rId = rel.getAttribute("Id");
						if (rids.indexOf(rId) === -1) {
							continue;
						}
					}
					imageFiles.push(normalized);
				}
			}
		});

		this.zip.file(/\/media\//).forEach((file) => {
			if (imageFiles.indexOf(`/${file.name}`) === -1) {
				this.zip.remove(file.name);
			}
		});

		relsFiles.forEach((relf) => {
			const xmldoc = this.xmlDocuments[relf];
			let rels = xmldoc.getElementsByTagName("Relationship");
			let len = rels.length;
			for (let i = 0; i < len; i++) {
				const rel = rels[i];
				const target = rel.getAttribute("Target");
				const normalized = normalizePath(target, relf);
				if (
					normalized.indexOf("/media") !== -1 &&
					imageFiles.indexOf(normalized) === -1
				) {
					rel.parentNode.removeChild(rel);
					rels = xmldoc.getElementsByTagName("Relationship");
					i = -1;
					len = rels.length;
				}
			}
		});
	}
	optionsTransformer(options, docxtemplater) {
		verifyApiVersion(docxtemplater, this.requiredAPIVersion);
		this.fileTypeConfig = docxtemplater.fileTypeConfig;
		this.fileType = docxtemplater.fileType;
		if (this.fileType === "pptx") {
			this.dpi = this.dpi || 96;
		}
		this.zip = docxtemplater.zip;
		this.maxDocPrId = getMaxDocPrId(this.zip);
		const relsFiles = this.zip
			.file(/\.xml\.rels/)
			.concat(docxtemplater.zip.file(/\[Content_Types\].xml/))
			.concat(docxtemplater.zip.file(/slideMasters\/.*.xml/))
			.concat(docxtemplater.zip.file(/slideLayouts\/.*.xml/))
			.map((file) => file.name);
		options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
		const contentTypes = this.zip.files[ctXML];
		this.targets = [];
		const contentTypeXml = contentTypes ? str2xml(contentTypes.asText()) : null;
		const overrides = contentTypeXml
			? contentTypeXml.getElementsByTagName("Override")
			: null;

		for (let i = 0, len = overrides.length; i < len; i++) {
			const override = overrides[i];
			const contentType = override.getAttribute("ContentType");
			const partName = override.getAttribute("PartName").substr(1);
			if (contentType === mainContentType) {
				this.mainFile = partName;
			}
			this.filePathToContentType[partName] = contentType;
		}
		this.fileTypeConfig.tagsXmlLexedArray.push(
			"a:off",
			"a:ext",
			"w:tcW",
			"w:tc",
			"w:pgSz",
			"w:sectPr",
			"w:pgMar",
			"w:headerReference",
			"w:footerReference",
			"p:sp",
			"p:ph"
		);
		return options;
	}
	set(options) {
		if (options.Lexer) {
			this.Lexer = options.Lexer;
		}
		if (options.xmlDocuments) {
			this.xmlDocuments = options.xmlDocuments;
			if (this.fileType === "docx") {
				this.mainRels = new RelsManager(this, this.mainFile);
			}
		}
		if (options.inspect && options.inspect.filePath) {
			this.filePath = options.inspect.filePath;
		}
	}
	parse(placeHolderContent, options) {
		const type = "placeholder";
		let { normal, centered } = this.prefix;
		if (this.options.centered) {
			normal = this.prefix.centered;
			centered = this.prefix.normal;
		}
		let matchCentered = null;
		let matchNormal = null;

		let containerWidth;
		if (this.fileType === "docx") {
			const contentType = this.filePathToContentType[this.filePath];
			if (
				[headerContentType, footerContentType, mainContentType].indexOf(
					contentType
				) === -1
			) {
				return null;
			}
			containerWidth =
				getCellWidth(this.dpi, this.cells, options.lIndex) ||
				getSectionWidth(
					this.dpi,
					this.sections,
					options.lIndex,
					this.filePathToContentType[this.filePath]
				);
		}

		if (placeHolderContent.indexOf(centered) === 0) {
			matchCentered = {
				type,
				value: placeHolderContent.substr(centered.length),
				module: moduleNameCentered,
				containerWidth,
			};
		}
		if (placeHolderContent.indexOf(normal) === 0) {
			matchNormal = {
				type,
				value: placeHolderContent.substr(normal.length),
				module: moduleName,
				containerWidth,
			};
		}
		if (matchCentered && matchNormal) {
			if (centered.length > normal.length) {
				return matchCentered;
			}
			return matchNormal;
		}
		if (matchCentered) {
			return matchCentered;
		}
		if (matchNormal) {
			return matchNormal;
		}
		return null;
	}
	preparse(parsed, options) {
		const contentType = this.filePathToContentType[options.filePath];
		if (contentType === mainContentType) {
			this.sections = collectSectionsWidth(parsed, this.mainRels);
		}
		if (!this.dpi) {
			const dxaWidth = (this.getDxaWidth || defaultGetDxaWidth)(this.sections);
			this.dpi = converter.calculateDpi(this.deviceWidth, dxaWidth);
		}
		this.cells = collectCellsWidth(parsed);
	}
	getRelsManager(filePath) {
		return addImageTraits(new RelsManager(this, filePath));
	}
	postparse(parsed, options) {
		let expandToNormal;
		let expandToCentered;
		let getInner;
		let getInnerCentered;
		let errorNormal = {};
		let errorCentered = {};
		if (this.fileType === "pptx") {
			getInner = getInnerPptx;
			getInnerCentered = getInnerPptx;
			expandToNormal = "p:sp";
			expandToCentered = "p:sp";
			errorNormal = {
				message: "Image tag should not be placed inside a loop",
				id: "image_tag_no_access_to_p_sp",
				explanation: (part) =>
					`The image tag "${part.value}" should not be placed inside a loop, it should be the only text in a given shape`,
			};
			errorCentered = errorNormal;
		} else {
			getInner = getInnerDocxInline;
			getInnerCentered = getInnerDocxBlockCentered;
			expandToNormal = false;
			expandToCentered = "w:p";
			errorCentered = {
				message: "Block Image tag should not be placed inside an inline loop",
				id: "image_tag_no_access_to_w_p",
				explanation: (part) =>
					`The block image tag "${part.value}" should not be placed inside an inline loop, it can be placed in a block loop (paragraphLoop)`,
			};
		}
		calculatePlaceholderPositions.apply(this, [parsed, options]);

		const postparsed = traits.expandToOne(parsed, {
			moduleName,
			getInner: getInner.bind(this),
			expandTo: expandToNormal,
			error: errorNormal,
		});

		return traits.expandToOne(postparsed, {
			moduleName: moduleNameCentered,
			getInner: getInnerCentered.bind(this),
			expandTo: expandToCentered,
			error: errorCentered,
		});
	}
	resolve(part, options) {
		if (
			!part.type === "placeholder" ||
			[moduleName, moduleNameCentered].indexOf(part.module) === -1
		) {
			return null;
		}

		const tagValue = options.scopeManager.getValue(part.value, { part });
		const resolvedId = getResolvedId(part, options);
		return Promise.resolve(tagValue)
			.then((tagValue) => {
				if (!tagValue) {
					this.resolved[resolvedId] = null;
					return { value: "" };
				}
				return Promise.resolve(
					this.options.getImage(tagValue, part.value)
				).then((imgBuffer) => {
					if (!imgBuffer) {
						this.resolved[resolvedId] = null;
						return { value: "" };
					}
					let sizePixel;
					let svgFallback;
					if (isSVG(imgBuffer)) {
						sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
							svgSize: getSVGSize(imgBuffer),
							part,
							options,
						});
						svgFallback = Promise.resolve(sizePixel).then((size) => {
							if (!size || size.length !== 2) {
								return;
							}
							return this.options.getSVGFallback(imgBuffer, size);
						});
					} else {
						sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
							part,
							options,
						});
					}
					return Promise.all([
						Promise.resolve(sizePixel),
						Promise.resolve(svgFallback),
					]).then(([sizePixel, svgFallback]) => {
						const resolved = {
							sizePixel,
							imgBuffer,
							tagValue,
							svgFallback,
							align: "center",
						};
						if (this.options.getProps) {
							const props = this.options.getProps(
								imgBuffer,
								tagValue,
								part.value,
								{
									part,
									options,
								}
							);
							if (props != null) {
								if (props.caption) {
									resolved.caption = props.caption;
								}
								if (props.align) {
									resolved.align = props.align;
								}
							}
						}
						if (isSVG(imgBuffer)) {
							resolved.type = "svg";
						}
						this.resolved[resolvedId] = resolved;
					});
				});
			})
			.catch((e) => {
				this.resolved[resolvedId] = null;
				throw e;
			});
	}
	getValues(part, options) {
		const resolvedId = getResolvedId(part, options);
		if (this.resolved[resolvedId] === null) {
			return null;
		}
		if (this.resolved[resolvedId]) {
			return this.resolved[resolvedId];
		}
		let tagValue = options.scopeManager.getValue(part.value, { part });
		if (!tagValue) {
			tagValue = options.nullGetter(part);
			if (!tagValue) {
				return null;
			}
		}
		const imgBuffer = this.options.getImage(tagValue, part.value);
		if (!imgBuffer) {
			return null;
		}
		if (isSVG(imgBuffer)) {
			const sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
				svgSize: getSVGSize(imgBuffer),
				part,
				options,
			});
			const svgFallback = this.options.getSVGFallback(imgBuffer);
			return {
				type: "svg",
				imgBuffer,
				svgFallback,
				tagValue,
				sizePixel,
			};
		}
		const sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
			part,
			options,
		});
		const result = {
			type: "image",
			imgBuffer,
			sizePixel,
			tagValue,
			align: "center",
		};
		if (this.options.getProps) {
			const props = this.options.getProps(imgBuffer, tagValue, part.value, {
				part,
				options,
			});
			if (props != null) {
				if (props.caption) {
					result.caption = props.caption;
				}
				if (props.align) {
					result.align = props.align;
				}
			}
		}
		return result;
	}
	render(part, options) {
		if (
			!part.type === "placeholder" ||
			[moduleName, moduleNameCentered].indexOf(part.module) === -1
		) {
			return null;
		}
		const values = this.getValues(part, options);
		if (values === null) {
			return { value: "" };
		}
		const { imgBuffer, sizePixel, tagValue, type, svgFallback } = values;
		const errMsg =
			"Size for image is not valid (it should be an array of two integers, such as [ 1024, 1024 ])";
		sizePixel.forEach(function (size) {
			if (!isInteger(size) || !isPositive(size)) {
				const e = new Error(errMsg);
				e.properties = {
					sizePixel,
					tagValue,
				};
				throw e;
			}
		});
		if (!sizePixel || sizePixel.length !== 2) {
			const e = new Error(errMsg);
			e.properties = {
				tagValue,
			};
			throw e;
		}

		const imgManager = this.getRelsManager(options.filePath);

		if (type === "svg") {
			const rIdSvg = imgManager.addImageRels(
				this.getNextImageName("svg"),
				imgBuffer
			);
			const rIdPng = imgManager.addImageRels(
				this.getNextImageName("png"),
				svgFallback
			);
			return this.getRenderedPart(
				type,
				part,
				[rIdPng, rIdSvg],
				sizePixel,
				values
			);
		}

		const rId = imgManager.addImageRels(
			this.getNextImageName("png"),
			imgBuffer
		);
		return this.getRenderedPart(type, part, rId, sizePixel, values);
	}
	getRenderedPart(type, part, rId, sizePixel, values) {
		if (isNaN(rId)) {
			throw new Error("rId is NaN, aborting");
		}
		const size = [
			converter.pixelToEMU(sizePixel[0], this.dpi),
			converter.pixelToEMU(sizePixel[1], this.dpi),
		];
		const centered = part.module === moduleNameCentered;
		let newText;
		const props = {
			size,
			sizePixel,
			dpi: this.dpi,
			type,
			part,
			caption: values.caption,
			align: values.align,
		};
		if (this.fileType === "pptx") {
			newText = this.getRenderedPartPptx(part, rId, size, centered, props);
		} else {
			newText = this.getRenderedPartDocx(type, rId, size, centered, props);
		}
		// the part.raw != null is necessary to not add <w:t> when the render
		// happens from the HTML module
		if (this.fileType === "docx" && centered === false && part.raw != null) {
			newText = `</w:t>${newText}<w:t xml:space="preserve">`;
		}
		return { value: newText };
	}
	getRenderedPartPptx(part, rId, size, centered, props) {
		const offset = { x: part.offset.x, y: part.offset.y };
		const cellCX = part.ext.cx;
		const cellCY = part.ext.cy;
		const imgW = size[0];
		const imgH = size[1];

		if (centered) {
			offset.x += parseInt(cellCX / 2 - imgW / 2, 10);
			offset.y += parseInt(cellCY / 2 - imgH / 2, 10);
		}

		return templates.getPptxImageXml(rId, [imgW, imgH], offset, props);
	}
	getRenderedPartDocx(type, rId, size, centered, props) {
		const docPrId = ++this.maxDocPrId;
		if (type === "svg") {
			return centered
				? templates.getImageSVGXmlCentered(rId[0], rId[1], size, docPrId, props)
				: templates.getImageSVGXml(rId[0], rId[1], size, docPrId, props);
		}
		const value = centered
			? templates.getImageXmlCentered(rId, size, docPrId, props)
			: templates.getImageXml(rId, size, docPrId, props);
		if (props.caption && !centered) {
			this.maxDocPrId++;
		}
		return value;
	}
	getNextImageName(extension) {
		const name = `image_generated_${this.imageNumber}.${extension}`;
		this.imageNumber++;
		return name;
	}
}

module.exports = ImageModule;

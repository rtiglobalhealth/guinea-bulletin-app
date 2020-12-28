const { expect } = require("chai");
const path = require("path");
const { times } = require("lodash");
const Errors = require("docxtemplater/js/errors");
const ImageModule = require("./index.js");

const {
	shouldBeSame,
	expectToThrow,
	expectToThrowAsync,
	resolveSoon,
	rejectSoon,
	imageData,
	start,
	setExamplesDirectory,
	setStartFunction,
	createDoc,
	createDocV4,
	wrapMultiError,
} = require("docxtemplater/js/tests/utils");

let opts, async, name, data, expectedName, v4;

function nullGetter(part) {
	if (part.module === "open-xml-templating/docxtemplater-image-module") {
		return "default";
	}
	if (
		part.module === "open-xml-templating/docxtemplater-image-module-centered"
	) {
		return "default";
	}
	if (!part.module) {
		return "undefined";
	}
	if (part.module === "rawxml") {
		return "";
	}
	return "";
}

const base64Image =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==";

const base64svgimage =
	"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0icmVkIiAvPgo8L3N2Zz4g";

function base64DataURLToArrayBuffer(dataURL) {
	const stringBase64 = dataURL.replace(
		/^data:image\/(png|jpg|svg|svg\+xml);base64,/,
		""
	);
	let binaryString;
	if (typeof window !== "undefined") {
		binaryString = window.atob(stringBase64);
	} else {
		binaryString = Buffer.from(stringBase64, "base64").toString("binary");
	}
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		const ascii = binaryString.charCodeAt(i);
		bytes[i] = ascii;
	}
	return bytes.buffer;
}
let sizeParsing = true;

const expressions = require("angular-expressions");
expressions.filters.size = function (input, width, height) {
	return {
		data: input,
		size: [width, height],
	};
};

function angularParser(tag) {
	const expr = expressions.compile(tag.replace(/’/g, "'"));
	return {
		get(scope) {
			return expr(scope);
		},
	};
}

let options;

beforeEach(function () {
	async = false;
	sizeParsing = false;
	opts = {
		getImage(tagValue) {
			return imageData[tagValue];
		},
		getSize() {
			return [150, 150];
		},
		centered: false,
	};
	options = { nullGetter };

	this.loadAndRender = function () {
		const imageModule = new ImageModule(opts);
		if (sizeParsing) {
			options.parser = angularParser;
		}

		if (v4) {
			this.doc = createDocV4(name, { modules: [imageModule], ...options });
		} else {
			this.doc = createDoc(name);
			this.doc.setOptions(options);
			this.doc.attachModule(imageModule);
			this.doc.compile();
		}

		if (async) {
			return this.doc.resolveData(data).then(() => {
				this.doc.setData(data);
				this.renderedDoc = this.doc.render();
				const doc = this.renderedDoc;
				shouldBeSame({ doc, expectedName });
			});
		}
		this.doc.setData(data);
		this.renderedDoc = this.doc.render();
		const doc = this.renderedDoc;
		shouldBeSame({ doc, expectedName });
	};
});

function testStart() {
	describe("{%image}", function () {
		it("should work with one image", function () {
			name = "image-example.docx";
			expectedName = "expected-one-image.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});
		it("should work with one image v4 constructor", function () {
			v4 = true;
			name = "image-example.docx";
			expectedName = "expected-one-image.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image from buffer", function () {
			name = "image-example.docx";
			expectedName = "expected-buffer.docx";
			imageData["17.png"] = Buffer.from(imageData["2.png"], "binary");
			data = { image: "17.png" };
			this.loadAndRender();
		});
		it("should work with huge image", function () {
			name = "image-example.docx";
			expectedName = "expectedBig.docx";
			imageData["5.png"] = base64DataURLToArrayBuffer("a".repeat(1000000));
			data = { image: "5.png" };
			this.doc.render();
		});
		it("should work without initial rels", function () {
			name = "without-rels.docx";
			expectedName = "expected-without-rels.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image tag == null", function () {
			name = "image-example.docx";
			expectedName = "expected-no-image.docx";
			data = {};
			this.loadAndRender();
		});

		it("should work with inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline.docx";
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with centering", function () {
			name = "image-example.docx";
			expectedName = "expected-centered.docx";
			opts.centered = true;
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with async and reject", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "expected-image-example.docx";
			opts.getImage = function (image, tagValue) {
				return rejectSoon(new Error(`Error for tag '${tagValue}'`));
			};
			opts.centered = true;
			data = { image: "image.png" };
			const expectedError = {
				message: "Error for tag 'image'",
				properties: {
					file: "word/document.xml",
				},
			};
			return expectToThrowAsync(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should work with centering in docx", function () {
			name = "double.docx";
			expectedName = "expected-centered-from-doc.docx";
			data = { double: "image.png" };
			this.loadAndRender();
		});

		it("should be possible to negate centering in docx", function () {
			opts.centered = true;
			name = "double.docx";
			expectedName = "expected-uncentered-from-negation.docx";
			data = { double: "image.png" };
			this.loadAndRender();
		});

		it("should work with loops", function () {
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			opts.centered = true;
			data = { images: ["image.png", "image2.png"] };
			this.loadAndRender();
		});

		it("should not corrupt image in table", function () {
			name = "image-in-table.docx";
			expectedName = "expected-table.docx";
			opts.centered = true;
			data = {};
			this.loadAndRender();
		});

		it("should work with loops async", function () {
			async = true;
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			opts.centered = true;
			data = { images: ["image.png", "image2.png"] };
			return this.loadAndRender();
		});

		it("should work with loops async and reject", function () {
			async = true;
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			opts.getImage = function (image, tagValue) {
				return rejectSoon(new Error(`Error for tag '${tagValue}'`));
			};
			opts.centered = true;
			data = { images: ["image.png", "image2.png"] };

			const expectedError = {
				name: "TemplateError",
				message: "Multi error",
				properties: {
					errors: [
						{
							message: "Error for tag '.'",
							properties: {
								file: "word/document.xml",
							},
						},
						{
							message: "Error for tag '.'",
							properties: {
								file: "word/document.xml",
							},
						},
					],
					id: "multi_error",
				},
			};
			return expectToThrowAsync(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				expectedError
			);
		});

		it("should work with image in header/footer", function () {
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image in header/footer async", function () {
			async = true;
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer.docx";
			data = { image: "image.png" };
			return this.loadAndRender();
		});

		it("should work with PPTX documents", function () {
			name = "tag-image.pptx";
			expectedName = "expected-tag-image.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with PPTX documents async", function () {
			async = true;
			name = "tag-image.pptx";
			expectedName = "expected-tag-image.pptx";
			data = { image: "image.png" };
			return this.loadAndRender();
		});

		it("should work with PPTX documents centered", function () {
			name = "tag-image-centered.pptx";
			expectedName = "expected-tag-image-centered.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with PPTX slideLayouts", function () {
			name = "image-with-slidelayout.pptx";
			expectedName = "expected-tag-image-slide-layout.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work even when extList tag present", function () {
			name = "tag-with-extlist.pptx";
			expectedName = "expected-rendered-extlist.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with auto resize", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-resize.docx";
			opts.getSize = function () {
				return [500, 555];
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with base64 data", function () {
			name = "image-example.docx";
			opts.getImage = function (image) {
				return image;
			};
			expectedName = "expected-base64.docx";
			data = { image: base64DataURLToArrayBuffer(base64Image) };
			this.loadAndRender();
		});

		it("should work with base64 data async", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "image-example-async.docx";
			opts.getSize = function () {
				return resolveSoon([300, 300]);
			};
			opts.getImage = function () {
				return resolveSoon(base64DataURLToArrayBuffer(base64Image));
			};
			data = { image: "foobar.png" };
			return this.loadAndRender();
		});

		it("should work with svg sync and base64", function () {
			name = "image-example.docx";
			expectedName = "expected-svg-sync.docx";
			let svgSize = null;
			opts.getSize = function (a, b, c, d) {
				svgSize = d.svgSize;
				return [300, 300];
			};
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64svgimage);
			};
			data = { image: "foobar.png" };
			this.loadAndRender();
			expect(svgSize).to.deep.equal([100, 100]);
		});

		it("should work with svg async and base64", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "expected-svg-async.docx";
			let svgSize = null;
			opts.getSize = function (a, b, c, d) {
				svgSize = d.svgSize;
				return resolveSoon([300, 300]);
			};
			opts.getImage = function () {
				return resolveSoon(base64DataURLToArrayBuffer(base64svgimage));
			};
			data = { image: "foobar.png" };
			return this.loadAndRender().then(function () {
				expect(svgSize).to.deep.equal([100, 100]);
			});
		});

		it("should work with svg sync inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-svg-inline-sync.docx";
			let svgSize = null;
			opts.getSize = function (a, b, c, d) {
				svgSize = d.svgSize;
				expect(typeof a).to.equal("object");
				expect(b).to.equal("foobar");
				expect(c).to.equal("firefox");
				expect(d.svgSize).to.be.an("array");
				expect(d.part).to.be.an("object");
				return [300, 300];
			};
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64svgimage);
			};
			data = { firefox: "foobar" };
			this.loadAndRender();
			expect(svgSize).to.deep.equal([100, 100]);
		});

		it("should work async with two images", function () {
			async = true;
			name = "multi-image.docx";
			expectedName = "expected-multi-image-async.docx";
			opts.getSize = function () {
				return resolveSoon([300, 300]);
			};
			let myTagName;
			opts.getImage = function (tagValue, tagName) {
				myTagName = tagName;
				return resolveSoon(imageData[tagValue]);
			};
			data = { image1: "image.png", image2: "image2.png" };
			return this.loadAndRender().then(function () {
				expect(myTagName).to.be.deep.equal("image2");
			});
		});

		it("should work with docprid of 8 and 10", function () {
			name = "loop-with-already-existing-images.docx";
			expectedName = "expected-many-images.docx";
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64Image);
			};
			data = {
				images: times(19, () => 0),
			};
			this.loadAndRender();
		});

		it("should work when using svg", function () {
			name = "image-example.docx";
			expectedName = "expected-svg.docx";
			data = { image: "logo.svg" };
			this.loadAndRender();
		});

		it("should not suppress images", function () {
			name = "doc-with-vfill.docx";
			expectedName = "expected-doc-with-vfill.docx";
			data = {};
			this.loadAndRender();
		});

		it("should work to remove unused images", function () {
			name = "image-in-condition-to-remove.docx";
			expectedName = "expected-one-media.docx";
			this.loadAndRender();
			const files = this.doc
				.getZip()
				.file(/media/)
				.map((file) => file.name);
			expect(files).to.be.deep.equal(["word/media/image2.png"]);
		});

		it("should work to remove unused images in header/footer", function () {
			name = "image-in-header-footer-condition-to-remove.docx";
			expectedName = "expected-removed-header-footer.docx";
			this.loadAndRender();
			const files = this.doc
				.getZip()
				.file(/media/)
				.map((file) => file.name);
			expect(files.length).to.be.equal(3);
		});

		it("should work with angular expressions to set size", function () {
			sizeParsing = true;
			opts.getImage = function (tagValue) {
				if (tagValue.size && tagValue.data) {
					return imageData[tagValue.data];
				}
				return imageData[tagValue];
			};
			opts.getSize = function (_, tagValue) {
				if (tagValue.size && tagValue.data) {
					return tagValue.size;
				}
				return [150, 150];
			};
			data = { image: "logo.svg" };
			name = "image-example-sized.docx";
			expectedName = "expected-sized-image.docx";
			this.loadAndRender();
		});

		it("should work with inline image without dropping text", function () {
			name = "inline-image-with-close-text.docx";

			expectedName = "expected-inline-image-with-close-text.docx";
			opts.getSize = function () {
				return [200, 200];
			};
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with inline image inside inline loop", function () {
			name = "inline-image-inside-inline-loop.docx";

			expectedName = "expected-inline-images.docx";
			opts.getSize = function () {
				return [200, 200];
			};
			data = { images: ["image.png", "image2.png", "2.png"] };
			this.loadAndRender();
		});
	});

	describe("Retrieve container width", function () {
		it("should be possible to set width to 100% in table", function () {
			name = "image-in-table.docx";
			expectedName = "expected-100pct-table.docx";
			data = { image: "image.png" };
			opts.getSize = function (a, b, c, d) {
				const width = d.part.containerWidth;
				expect(width).to.equal(288);
				return [width, width];
			};
			this.loadAndRender();
		});

		it("should work with centering", function () {
			name = "image-example.docx";
			expectedName = "expected-centered-100pct.docx";
			opts.centered = true;
			opts.getSize = function (a, b, c, d) {
				const width = d.part.containerWidth;
				expect(width).to.equal(576);
				return [width, width];
			};
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should be possible to set width to 100% in footer", function () {
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer-100pct.docx";
			data = { image: "image.png" };
			const filePaths = [];
			opts.getSize = function (a, b, c, d) {
				const filePath = d.options.filePath;
				filePaths.push(filePath);
				const width = d.part.containerWidth;
				expect(width).to.equal(576);
				return [width, 100];
			};
			this.loadAndRender();
			expect(filePaths).to.deep.equal(["word/footer1.xml", "word/header1.xml"]);
		});

		it("should be possible to set width to 100% in document", function () {
			name = "image-example.docx";
			expectedName = "expected-image-100pct.docx";
			data = { image: "image.png" };
			opts.getSize = function (a, b, c, d) {
				const width = d.part.containerWidth;
				expect(width).to.equal(576);
				return [width, width];
			};
			this.loadAndRender();
		});

		it("should not regress without section", function () {
			name = "multi-footer-section.docx";
			expectedName = "expected-multi-footer-section.docx";
			data = { image: "image.png" };
			opts.getSize = function (a, b, c, d) {
				const width = d.part.containerWidth;
				expect(width).to.equal(576);
				const pct = 10 / 100;
				return [parseInt(width * pct, 10), parseInt(width * pct, 10)];
			};
			this.loadAndRender();
		});

		it("should not regress with office 365", function () {
			name = "office365.docx";
			expectedName = "expected-office365.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should not regress with foobar", function () {
			name = "properties.docx";
			expectedName = "expected-properties.docx";
			data = { tag1: "John", tag2: "Doe" };
			this.loadAndRender();
		});
	});

	describe("Captions", function () {
		it("should be possible to add some caption block", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-with-caption.docx";
			opts.getProps = function () {
				return { caption: { text: "My custom <apple>" } };
			};
			opts.getSize = function () {
				return [200, 200];
			};
			this.loadAndRender();
		});

		it("should be possible to add some caption inline", function () {
			name = "image-example.docx";
			data = { image: "image.png" };

			expectedName = "expected-inline-caption.docx";
			opts.getProps = function () {
				return { caption: { text: "My custom <apple>" } };
			};
			opts.getSize = function () {
				return [200, 200];
			};
			this.loadAndRender();
		});

		it("should work with inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-caption-surrounded.docx";
			opts.getProps = function () {
				return { caption: { text: "My custom <apple>" } };
			};
			opts.getSize = function () {
				return [200, 200];
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with two images", function () {
			name = "multi-image.docx";
			expectedName = "expected-multi-image-caption.docx";
			opts.getSize = function () {
				return [300, 300];
			};
			opts.getProps = function () {
				return { caption: { text: "My custom <apple>" } };
			};
			data = { image1: "image.png", image2: "image2.png" };
			this.loadAndRender();
		});

		it("should work without caption", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-no-caption.docx";
			opts.getProps = function () {
				return null;
			};
			opts.getSize = function () {
				return [200, 200];
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});
	});

	describe("Alignments", function () {
		it("should be possible to left align image", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-left-aligned.docx";
			opts.getProps = function () {
				return { align: "left" };
			};
			opts.getSize = function () {
				return [200, 200];
			};
			this.loadAndRender();
		});

		it("should be possible to right align image", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-right-aligned.docx";
			opts.getProps = function () {
				return { align: "right" };
			};
			opts.getSize = function () {
				return [200, 200];
			};
			this.loadAndRender();
		});
	});

	describe("Errors", function () {
		it("should fail if the slide doesn't have any offset", function () {
			name = "without-offset.pptx";
			expectedName = "expected-without-offset.pptx";
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64Image);
			};
			data = {
				image: true,
			};
			return this.loadAndRender();
		});

		it("should fail with centered if text inside paragraph", function () {
			opts.centered = true;
			name = "image-inline-example.docx";
			expectedName = "expected-svg-centered-sync.docx";
			opts.getSize = function () {
				return [300, 300];
			};
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64svgimage);
			};
			data = { firefox: "foobar" };
			const expectedError = {
				name: "RenderingError",
				message:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				properties: {
					id: "centered_image_should_be_in_paragraph",
					part: {
						containerWidth: 576,
						endLindex: 28,
						lIndex: 28,
						module: "open-xml-templating/docxtemplater-image-module-centered",
						offset: 24,
						raw: "%firefox",
						type: "placeholder",
						value: "firefox",
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.RenderingError,
				expectedError
			);
		});

		it("should fail if in pptx, the image is inside a loop", function () {
			name = "within-loop.pptx";
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64Image);
			};
			data = {
				image: true,
			};
			const expectedError = {
				name: "TemplateError",
				message: "Image tag should not be placed inside a loop",
				properties: {
					expandTo: "p:sp",
					file: "ppt/slides/slide1.xml",
					id: "image_tag_no_access_to_p_sp",
					index: 11,
					postparsedLength: 23,
					xtag: "image",
					rootError: {
						message: 'No tag "p:sp" was found at the left',
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should fail in docx when placing block image inside inline loop", function () {
			name = "block-image-inside-inline-loop.docx";
			opts.getImage = function () {
				return base64DataURLToArrayBuffer(base64Image);
			};
			data = {
				image: true,
			};
			const expectedError = {
				name: "TemplateError",
				message: "Block Image tag should not be placed inside an inline loop",
				properties: {
					expandTo: "w:p",
					file: "word/document.xml",
					id: "image_tag_no_access_to_w_p",
					index: 0,
					postparsedLength: 1,
					xtag: ".",
					rootError: {
						message: 'No tag "w:p" was found at the left',
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});
	});

	describe("SVG fallback", function () {
		const childProcess = require("child_process");
		if (childProcess.spawnSync) {
			it("should be possible to declare svg fallback to transform SVG to png", function () {
				async = true;
				name = "image-example.docx";
				expectedName = "expected-svg-async-with-fallback.docx";
				opts.getSize = function () {
					return resolveSoon([50, 50]);
				};
				opts.getImage = function () {
					return resolveSoon(base64DataURLToArrayBuffer(base64svgimage));
				};
				opts.getSVGFallback = function (svgFile, sizePixel) {
					return new Promise(function (resolve, reject) {
						const result = childProcess.spawnSync(
							"gm",
							["convert", "SVG:-", "-resize", sizePixel.join("x"), "PNG:-"],
							{
								input: Buffer.from(svgFile),
							}
						);
						if (result.status !== 0) {
							/* eslint-disable-next-line no-console */
							console.error(
								JSON.stringify({
									"result.stderr": result.stderr.toString(),
								})
							);
							reject(new Error("Error while executing graphicsmagick"));
						}
						return resolve(Buffer.from(result.stdout));
					});
				};
				data = { image: "foobar.png" };
				return this.loadAndRender();
			});
		}

		if (typeof window !== "undefined") {
			it.skip("should be possible to declare svg fallback to transform SVG to png", function () {
				async = true;
				name = "image-example.docx";
				expectedName = "expected-chrome-svg-async-with-fallback.docx";
				opts.getSize = function () {
					return resolveSoon([50, 50]);
				};
				opts.getImage = function () {
					return resolveSoon(base64DataURLToArrayBuffer(base64svgimage));
				};
				opts.getSVGFallback = function (svgFile, sizePixel) {
					function arrayBufferToString(buffer) {
						let binary = "";
						const bytes = new Uint8Array(buffer);
						const len = bytes.byteLength;
						for (let i = 0; i < len; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						return binary;
					}

					return new Promise(function (resolve, reject) {
						function svgUrlToPng(svgUrl) {
							const svgImage = document.createElement("img");
							svgImage.style.position = "absolute";
							svgImage.style.top = "-9999px";
							document.body.appendChild(svgImage);
							const width = sizePixel[0];
							const height = sizePixel[1];
							svgImage.width = width;
							svgImage.height = height;
							svgImage.onload = function () {
								const canvas = document.createElement("canvas");
								canvas.width = width;
								canvas.height = height;
								const canvasCtx = canvas.getContext("2d");
								canvasCtx.drawImage(svgImage, 0, 0, width, height);
								const imgData = canvas.toDataURL("image/png");
								resolve(base64DataURLToArrayBuffer(imgData));
							};
							svgImage.onerror = function () {
								reject(new Error("Could not transform svg to png"));
							};
							svgImage.src = "data:image/svg+xml;utf8," + svgUrl;
						}
						svgUrlToPng(
							arrayBufferToString(svgFile).replace(
								"<svg",
								"<svg xmlns='http://www.w3.org/2000/svg'"
							)
						);
					});
				};
				data = { image: "foobar.png" };
				return this.loadAndRender();
			});
		}
	});
}

setExamplesDirectory(path.resolve(__dirname, "..", "examples"));
setStartFunction(testStart);
start();

const { slideContentType } = require("./content-types");
const RelsManager = require("./relationship-manager");
const { getSingleAttribute } = require("./attributes");

function updatePlaceholders(xml, filePath) {
	const placeholders = xml.getElementsByTagName("p:ph");
	for (let i = 0, len = placeholders.length; i < len; i++) {
		const placeholder = placeholders[i];
		const tripleParent = placeholder.parentNode.parentNode.parentNode;
		const xfrm = tripleParent.getElementsByTagName("a:xfrm");
		const idx = placeholder.getAttribute("idx");
		const type = placeholder.getAttribute("type");
		if (xfrm.length !== 1) {
			continue;
		}
		const offset = xfrm[0].getElementsByTagName("a:off")[0];
		const ext = xfrm[0].getElementsByTagName("a:ext")[0];

		this.placeholderIds[filePath].forEach(function (placeholder) {
			if (
				(placeholder.type == null || placeholder.type === type) &&
				(placeholder.idx == null || placeholder.idx === idx) &&
				placeholder.x == null
			) {
				placeholder.x = parseInt(offset.getAttribute("x"), 10);
				placeholder.y = parseInt(offset.getAttribute("y"), 10);
				placeholder.cx = parseInt(ext.getAttribute("cx"), 10);
				placeholder.cy = parseInt(ext.getAttribute("cy"), 10);
			}
		});
	}
}

module.exports = function calculatePlaceholderPositions(parsed, options) {
	const { filePath, contentType } = options;
	if (this.fileType === "pptx" && slideContentType === contentType) {
		this.placeholderIds[filePath] = this.placeholderIds[filePath] || [];
		let lastIndex = null;
		let lastOffset = null;
		let idx;
		let type;
		let x, y, cx, cy;
		let lastI = null;
		const tags = ["p:sp", "p:graphicFrame"];
		parsed.forEach(({ tag, position, value, lIndex, offset }, i) => {
			if (tags.indexOf(tag) !== -1 && position === "start") {
				lastIndex = lIndex;
				lastOffset = offset;
				lastI = i;
			}
			if (tag === "p:ph" && position === "selfclosing") {
				idx = getSingleAttribute(value, "idx");
				type = getSingleAttribute(value, "type");
			}
			if (tag === "a:ext") {
				cx = parseInt(getSingleAttribute(value, "cx"), 10);
				cy = parseInt(getSingleAttribute(value, "cy"), 10);
			}
			if (tag === "a:off") {
				x = parseInt(getSingleAttribute(value, "x"), 10);
				y = parseInt(getSingleAttribute(value, "y"), 10);
			}
			if (tags.indexOf(tag) !== -1 && position === "end") {
				this.placeholderIds[filePath].push({
					lIndex: [lastIndex, lIndex],
					offset: [lastOffset, offset],
					idx,
					type,
					i: [lastI, i],
					cx,
					cy,
					x,
					y,
				});
				i = null;
				lastI = null;
				x = null;
				y = null;
				cx = null;
				cy = null;
				lastIndex = null;
				idx = null;
				type = null;
			}
		});
		const im = this.getRelsManager(filePath);
		im.forEachRel((rel) => {
			if (
				rel.type ===
				"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
			) {
				const layout = this.xmlDocuments[rel.absoluteTarget];
				new RelsManager(this, rel.absoluteTarget).forEachRel((rel) => {
					if (
						rel.type ===
						"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
					) {
						updatePlaceholders.apply(this, [layout, filePath]);
						const master = this.xmlDocuments[rel.absoluteTarget];
						updatePlaceholders.apply(this, [master, filePath]);
					}
				});
			}
		});
	}
};

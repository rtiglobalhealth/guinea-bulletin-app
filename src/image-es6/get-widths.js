const { isStartingTag, isEndingTag } = require("./tag");
const normalizePath = require("./normalize-path");
const {
	getAttributes,
	getAttribute,
	getSingleAttribute,
} = require("./attributes");
const converter = require("./converter");
const { mainContentType } = require("./content-types");

function collectSectionsWidth(parsed, mainRels) {
	const sections = [];
	let section = null;
	for (let i = 0; i < parsed.length; i++) {
		const part = parsed[i];
		if (isStartingTag(part, "w:sectPr")) {
			section = [];
		}
		if (section) {
			section.push(part);
		}
		if (isEndingTag(part, "w:sectPr")) {
			const width = parseInt(getAttribute(section, "w:pgSz", "w:w"), 10);
			const leftMargin = parseInt(
				getAttribute(section, "w:pgMar", "w:left"),
				10
			);
			const rightMargin = parseInt(
				getAttribute(section, "w:pgMar", "w:right"),
				10
			);
			const headerRefs = getAttributes(section, "w:headerReference", "r:id");
			const footerRefs = getAttributes(section, "w:footerReference", "r:id");
			const headerFiles = [],
				footerFiles = [];
			headerRefs.forEach(function (ref) {
				const rel = mainRels.getRelationship(ref);
				headerFiles.push(normalizePath(rel.getAttribute("Target"), "word"));
			});
			footerRefs.forEach(function (ref) {
				const rel = mainRels.getRelationship(ref);
				footerFiles.push(normalizePath(rel.getAttribute("Target"), "word"));
			});
			sections.push({
				width,
				leftMargin,
				rightMargin,
				part,
				headerFiles,
				footerFiles,
			});
			section = null;
		}
	}
	return sections;
}

function collectCellsWidth(parsed) {
	const cells = [];
	let inCell = false;
	let width = 0;
	let startLIndex;
	for (let i = 0; i < parsed.length; i++) {
		const part = parsed[i];
		if (isStartingTag(part, "w:tc")) {
			inCell = true;
			width = 0;
			startLIndex = part.lIndex;
		}

		if (inCell && isStartingTag(part, "w:tcW")) {
			width = parseInt(getSingleAttribute(part.value, "w:w"), 10);
		}

		if (isEndingTag(part, "w:tc")) {
			inCell = false;
			cells.push({
				width,
				startLIndex,
				endLIndex: part.lIndex,
			});
		}
	}
	return cells;
}

function getSectionWidth(dpi, sections, lIndex, contentType) {
	for (let i = 0, len = sections.length; i < len; i++) {
		const currentSection = sections[i];
		const width =
			currentSection.width -
			currentSection.leftMargin -
			currentSection.rightMargin;

		if (contentType !== mainContentType) {
			return converter.dxaToPixel(width, dpi);
		}
		const lastSectionIndex = sections[i - 1] ? sections[i - 1].part.lIndex : -1;
		if (lastSectionIndex < lIndex && lIndex < currentSection.part.lIndex) {
			return converter.dxaToPixel(width, dpi);
		}
	}
	throw new Error("No section found");
}

function getCellWidth(dpi, cells, lIndex) {
	for (let i = 0, len = cells.length; i < len; i++) {
		const cell = cells[i];
		if (cell.startLIndex < lIndex && lIndex < cell.endLIndex) {
			return converter.dxaToPixel(cell.width, dpi);
		}
	}
	return false;
}

module.exports = {
	collectSectionsWidth,
	collectCellsWidth,
	getSectionWidth,
	getCellWidth,
};

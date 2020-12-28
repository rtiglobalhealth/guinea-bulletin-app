const extensionRegex = /[^.]+\.([^.]+)/;
const imgify = require("./img-manager");

module.exports = function (relM) {
	imgify(relM);
	relM.loadImageRels = () => {
		const iterable = relM.relsDoc.getElementsByTagName("Relationship");
		return Array.prototype.reduce.call(
			iterable,
			function (max, relationship) {
				const id = relationship.getAttribute("Id");
				if (/^rId[0-9]+$/.test(id)) {
					return Math.max(max, parseInt(id.substr(3), 10));
				}
				return max;
			},
			0
		);
	};
	relM.addImageRels = (name, data) => {
		let i = 0;
		let realImageName;
		let path;
		do {
			realImageName = i === 0 ? name : name + `(${i})`;
			path = `${relM.prefix}/media/${realImageName}`;
			i++;
		} while (relM.zip.files[path] != null);
		const image = {
			path,
			data,
			createFolders: true,
			options: {
				binary: true,
			},
		};
		relM.zip.file(image.path, image.data, image.options);
		const extension = realImageName.replace(extensionRegex, "$1");
		relM.addExtensionRels(`image/${extension}`, extension);
		relM.addExtensionRels(
			"application/vnd.openxmlformats-package.relationships+xml",
			"rels"
		);
		const relationships = relM.relsDoc.getElementsByTagName("Relationships")[0];

		const mediaPrefix = relM.fileType === "pptx" ? "../media" : "media";

		const relationshipChilds = relationships.getElementsByTagName(
			"Relationship"
		);
		for (let j = 0, len = relationshipChilds.length; j < len; j++) {
			const c = relationshipChilds[j];
			if (c.getAttribute("Target") === `${mediaPrefix}/${realImageName}`) {
				return c.getAttribute("Id").substr(3);
			}
		}

		const maxRid = relM.loadImageRels() + 1;
		const newTag = relM.relsDoc.createElement("Relationship");
		relM.setAttributes(newTag, {
			Id: `rId${maxRid}`,
			Type:
				"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
			Target: `${mediaPrefix}/${realImageName}`,
		});
		relationships.appendChild(newTag);
		return maxRid;
	};
	return relM;
};

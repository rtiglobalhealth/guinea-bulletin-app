const { utf8ToWord } = require("docxtemplater").DocUtils;
let captionNum = 1;

module.exports = {
	getImageSVGXmlCentered(rIdImg, rIdSvg, size, docPrId, props) {
		return `<w:p>
			<w:pPr>
				<w:jc w:val="${props.align}"/>
			</w:pPr>
			<w:r>
				<w:rPr/>
				${this.getImageSVGXml(rIdImg, rIdSvg, size, docPrId)}
			</w:r>
			</w:p>
		`;
	},
	getImageSVGXml(rIdImg, rIdSvg, size, docPrId) {
		return `<w:drawing>
		  <wp:inline distT="0" distB="0" distL="0" distR="0">
			<wp:extent cx="${size[0]}" cy="${size[1]}"/>
			<wp:effectExtent l="0" t="0" r="0" b="0"/>
			<wp:docPr id="${docPrId}" name="Graphique 1"/>
			<wp:cNvGraphicFramePr>
			  <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
			</wp:cNvGraphicFramePr>
			<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
			  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
				<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
				  <pic:nvPicPr>
					<pic:cNvPr id="1" name="rect.svg"/>
					<pic:cNvPicPr/>
				  </pic:nvPicPr>
				  <pic:blipFill>
					<a:blip r:embed="rId${rIdImg}">
					  <a:extLst>
						<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
						  <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
						</a:ext>
						<a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}">
						  <asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main" r:embed="rId${rIdSvg}"/>
						</a:ext>
					  </a:extLst>
					</a:blip>
					<a:stretch>
					  <a:fillRect/>
					</a:stretch>
				  </pic:blipFill>
				  <pic:spPr>
					<a:xfrm>
					  <a:off x="0" y="0"/>
					  <a:ext cx="${size[0]}" cy="${size[1]}"/>
					</a:xfrm>
					<a:prstGeom prst="rect">
					  <a:avLst/>
					</a:prstGeom>
				  </pic:spPr>
				</pic:pic>
			  </a:graphicData>
			</a:graphic>
		  </wp:inline>
		</w:drawing>`.replace(/\t|\n/g, "");
	},
	getImageXmlWithCaption(rId, size, docPrId, props) {
		const captionProps = props.caption;
		const cHeight = 1438910 - 952500;

		return `<w:drawing>
			<wp:inline distT="0" distB="0" distL="0" distR="0">
				<wp:extent cx="${size[0]}" cy="${size[1] + cHeight}"/>
				<wp:effectExtent l="0" t="0" r="0" b="0"/>
				<wp:docPr id="${docPrId}" name="Frame1"/>
				<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
				<a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
					<wps:wsp xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
					<wps:cNvSpPr txBox="1"/>
					<wps:spPr>
						<a:xfrm>
						<a:off x="0" y="0"/>
						<a:ext cx="${size[0]}" cy="${size[1] + cHeight}"/>
						</a:xfrm>
						<a:prstGeom prst="rect"/>
					</wps:spPr>
					<wps:txbx>
						<w:txbxContent>
						<w:p>
							<w:pPr>
							<w:spacing w:before="120" w:after="120"/>
							<w:rPr/>
							</w:pPr>
							<w:r>
							<w:rPr/>
							<w:drawing>
								<wp:inline distT="0" distB="0" distL="0" distR="0">
								<wp:extent cx="${size[0]}" cy="${size[1]}"/>
								<wp:effectExtent l="0" t="0" r="0" b="0"/>
								<wp:docPr id="${docPrId + 1}" name="Image1" descr=""/>
								<wp:cNvGraphicFramePr>
									<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
								</wp:cNvGraphicFramePr>
								<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
									<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
									<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
										<pic:nvPicPr>
										<pic:cNvPr id="2" name="Image1" descr=""/>
										<pic:cNvPicPr>
											<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
										</pic:cNvPicPr>
										</pic:nvPicPr>
										<pic:blipFill>
										<a:blip r:embed="rId${rId}"/>
										<a:stretch>
											<a:fillRect/>
										</a:stretch>
										</pic:blipFill>
										<pic:spPr bwMode="auto">
										<a:xfrm>
											<a:off x="0" y="0"/>
											<a:ext cx="${size[0]}" cy="${size[1]}"/>
										</a:xfrm>
										<a:prstGeom prst="rect">
											<a:avLst/>
										</a:prstGeom>
										</pic:spPr>
									</pic:pic>
									</a:graphicData>
								</a:graphic>
								</wp:inline>
							</w:drawing>
							</w:r>
							<w:r>
							<w:rPr>
								<w:vanish/>
							</w:rPr>
							<w:br/>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:t xml:space="preserve">Illustration </w:t>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:fldChar w:fldCharType="begin"/>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:instrText xml:space="preserve">SEQ Figure \\* ARABIC</w:instrText>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:fldChar w:fldCharType="separate"/>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:t>1</w:t>
							</w:r>
							<w:r>
							<w:rPr/>
							<w:fldChar w:fldCharType="end"/>
							</w:r>
							<w:r>
							<w:rPr/>
								<w:t>${utf8ToWord(captionProps.text)}</w:t>
							</w:r>
						</w:p>
						</w:txbxContent>
					</wps:txbx>
					<wps:bodyPr anchor="t" lIns="0" tIns="0" rIns="0" bIns="0">
						<a:noAutofit/>
					</wps:bodyPr>
					</wps:wsp>
				</a:graphicData>
				</a:graphic>
			</wp:inline>
		</w:drawing>`;
	},
	getImageXml(rId, size, docPrId, props) {
		if (props.caption) {
			return this.getImageXmlWithCaption(rId, size, docPrId, props);
		}
		return `<w:drawing>
		<wp:inline distT="0" distB="0" distL="0" distR="0">
			<wp:extent cx="${size[0]}" cy="${size[1]}"/>
			<wp:effectExtent l="0" t="0" r="0" b="0"/>
			<wp:docPr id="${docPrId}" name="Image 2" descr="image"/>
			<wp:cNvGraphicFramePr>
				<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
			</wp:cNvGraphicFramePr>
			<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
				<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
					<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
						<pic:nvPicPr>
							<pic:cNvPr id="0" name="Picture 1" descr="image"/>
							<pic:cNvPicPr>
								<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
							</pic:cNvPicPr>
						</pic:nvPicPr>
						<pic:blipFill>
							<a:blip r:embed="rId${rId}">
								<a:extLst>
									<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
										<a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
									</a:ext>
								</a:extLst>
							</a:blip>
							<a:srcRect/>
							<a:stretch>
								<a:fillRect/>
							</a:stretch>
						</pic:blipFill>
						<pic:spPr bwMode="auto">
							<a:xfrm>
								<a:off x="0" y="0"/>
								<a:ext cx="${size[0]}" cy="${size[1]}"/>
							</a:xfrm>
							<a:prstGeom prst="rect">
								<a:avLst/>
							</a:prstGeom>
							<a:noFill/>
							<a:ln>
								<a:noFill/>
							</a:ln>
						</pic:spPr>
					</pic:pic>
				</a:graphicData>
			</a:graphic>
		</wp:inline>
	</w:drawing>
		`.replace(/\t|\n/g, "");
	},
	getImageXmlCentered(rId, size, docPrId, props) {
		let caption = "";
		if (props.caption) {
			const captionProps = props.caption;
			caption = `<w:p>
			<w:pPr>
			${captionProps.pStyle ? `<w:pStyle w:val="${captionProps.pStyle}"/>` : ""}
			<w:jc w:val="center"/>
			</w:pPr>
			<w:r>
			<w:t xml:space="preserve">Illustration </w:t>
			</w:r>
			<w:r>
			<w:fldChar w:fldCharType="begin"/>
			</w:r>
			<w:r>
			<w:instrText xml:space="preserve">SEQ Figure \\* ARABIC</w:instrText>
			</w:r>
			<w:r>
			<w:fldChar w:fldCharType="separate"/>
			</w:r>
			<w:r>
			<w:rPr>
			<w:noProof/>
			</w:rPr>
			<w:t>${captionNum++}</w:t>
			</w:r>
			<w:r>
			<w:fldChar w:fldCharType="end"/>
			</w:r>
			<w:r>
			<w:t>${utf8ToWord(captionProps.text)}</w:t>
			</w:r>
			</w:p>`;
		}

		return `<w:p>
			<w:pPr>
				<w:jc w:val="${props.align}"/>
			</w:pPr>
			<w:r>
				<w:rPr/>
				<w:drawing>
					<wp:inline distT="0" distB="0" distL="0" distR="0">
					<wp:extent cx="${size[0]}" cy="${size[1]}"/>
					<wp:docPr id="${docPrId}" name="Picture" descr=""/>
					<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
						<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
						<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
							<pic:nvPicPr>
							<pic:cNvPr id="0" name="Picture" descr=""/>
							<pic:cNvPicPr>
								<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
							</pic:cNvPicPr>
							</pic:nvPicPr>
							<pic:blipFill>
							<a:blip r:embed="rId${rId}"/>
							<a:stretch>
								<a:fillRect/>
							</a:stretch>
							</pic:blipFill>
							<pic:spPr bwMode="auto">
							<a:xfrm>
								<a:off x="0" y="0"/>
								<a:ext cx="${size[0]}" cy="${size[1]}"/>
							</a:xfrm>
							<a:prstGeom prst="rect">
								<a:avLst/>
							</a:prstGeom>
							<a:noFill/>
							<a:ln w="9525">
								<a:noFill/>
								<a:miter lim="800000"/>
								<a:headEnd/>
								<a:tailEnd/>
							</a:ln>
							</pic:spPr>
						</pic:pic>
						</a:graphicData>
					</a:graphic>
					</wp:inline>
				</w:drawing>
			</w:r>
		</w:p>${caption}
		`.replace(/\t|\n/g, "");
	},
	getPptxImageXml(rId, size, offset) {
		return `<p:pic>
			<p:nvPicPr>
				<p:cNvPr id="6" name="Picture 2"/>
				<p:cNvPicPr>
					<a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
				</p:cNvPicPr>
				<p:nvPr/>
			</p:nvPicPr>
			<p:blipFill>
				<a:blip r:embed="rId${rId}" cstate="print">
					<a:extLst>
						<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
							<a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
						</a:ext>
					</a:extLst>
				</a:blip>
				<a:srcRect/>
				<a:stretch>
					<a:fillRect/>
				</a:stretch>
			</p:blipFill>
			<p:spPr bwMode="auto">
				<a:xfrm>
					<a:off x="${offset.x}" y="${offset.y}"/>
					<a:ext cx="${size[0]}" cy="${size[1]}"/>
				</a:xfrm>
				<a:prstGeom prst="rect">
					<a:avLst/>
				</a:prstGeom>
				<a:noFill/>
				<a:ln>
					<a:noFill/>
				</a:ln>
				<a:effectLst/>
				<a:extLst>
					<a:ext uri="{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}">
						<a14:hiddenFill xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main">
							<a:solidFill>
								<a:schemeClr val="accent1"/>
							</a:solidFill>
						</a14:hiddenFill>
					</a:ext>
					<a:ext uri="{91240B29-F687-4F45-9708-019B960494DF}">
						<a14:hiddenLine xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" w="9525">
							<a:solidFill>
								<a:schemeClr val="tx1"/>
							</a:solidFill>
							<a:miter lim="800000"/>
							<a:headEnd/>
							<a:tailEnd/>
						</a14:hiddenLine>
					</a:ext>
					<a:ext uri="{AF507438-7753-43E0-B8FC-AC1667EBCBE1}">
						<a14:hiddenEffects xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main">
							<a:effectLst>
								<a:outerShdw dist="35921" dir="2700000" algn="ctr" rotWithShape="0">
									<a:schemeClr val="bg2"/>
								</a:outerShdw>
							</a:effectLst>
						</a14:hiddenEffects>
					</a:ext>
				</a:extLst>
			</p:spPr>
		</p:pic>
		`.replace(/\t|\n/g, "");
	},
};

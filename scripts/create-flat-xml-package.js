import { replaceExtension, stringBySegment } from './utils.js';
import { parseXML, serialiseXML } from './utils.js';
import { binaryToBase64 } from './utils.js';
import { MIMETYPE, NS } from './constants.js';

/**
 * Creates a 'Flat OPC' Office Open XML file
 *
 * @export
 * @param {Map} parts The parts to be packed into the OPC XML file
 * @param {string} [filename='document.xml'] The name of the OPC XML file to be created
 * @returns {File} The packaged OPC XML file
 */
export function createFlatXmlOPC (parts, filename = 'document.xml') {
  const base = parseXML([
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<?mso-application progid="Word.Document"?>',
    '<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage" />'
  ].join(''));
  
  for (const path of [...parts.keys()].sort()) {
    const { contentType, content } = parts.get(path);
    const part = base.createElementNS(NS.PKG, 'part');
    part.setAttributeNS(NS.PKG, 'name', path);
    part.setAttributeNS(NS.PKG, 'contentType', contentType);
    if (content instanceof XMLDocument) {
      const xmlData = base.createElementNS(NS.PKG, 'xmlData');
      const data = base.importNode(content.documentElement, true);
      xmlData.append(data);
      part.append(xmlData);
    } else {
      part.setAttributeNS(NS.PKG, 'compression', 'store');
      const binaryData = base.createElementNS(NS.PKG, 'binaryData');
      binaryData.textContent = stringBySegment(binaryToBase64(content), 76);
      part.append(binaryData);
    }
    base.documentElement.append(part);
  }

  const output = serialiseXML(base);
  return new File([output], replaceExtension(filename, '.xml'), { type: MIMETYPE.XML });
}


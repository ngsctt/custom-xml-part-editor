import { unzip } from './fflate-promises.js';
import { detect, convert } from './external/encoding.js';
import { MIMETYPES_XML, NS_CONTENT_TYPES, MIME_DOCX, PATH_CONTENT_TYPES, NS_PKG } from './constants.js';
import { parseXML } from './utils.js';
import { XMap } from './utils.js';
import { getExtension, isXML } from './utils.js';
import { base64ToBinary } from './utils.js';

export async function unpackOPC (file) {
  const parts = new XMap();
  const contentTypePaths = new XMap();
  const contentTypeExtensions = new XMap();

  async function loadContentTypes (uint8array) {

    function resultsToEntries (results, attr, replacer, map) {
      let node = results.iterateNext();
      while (node) {
        map.add(replacer(node.getAttribute(attr)), node.getAttribute('ContentType'));
        node = results.iterateNext();
      }
    }

    const text = await new Blob([uint8array]).text();
    const xml = parseXML(text);
    const defaults = xml.evaluate('/_:Types/_:Default', xml.documentElement, () => NS_CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    const overrides = xml.evaluate('/_:Types/_:Override', xml.documentElement, () => NS_CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    resultsToEntries(defaults, 'Extension', x => x.toLowerCase(), contentTypeExtensions);
    resultsToEntries(overrides, 'PartName', x => x.replace(/^\//, '/'), contentTypePaths);
  }

  if (file.type === MIME_DOCX) {
    const data = new Uint8Array(await file.arrayBuffer());
    const unzipped = await unzip(data);
    if (unzipped[PATH_CONTENT_TYPES]) {
      await loadContentTypes(unzipped[PATH_CONTENT_TYPES]);
      delete unzipped[PATH_CONTENT_TYPES];
    }
    for (const [path, bytes] of Object.entries(unzipped)) {
      const npath = path.replace(/^\/?/, '/');
      const extension = getExtension(npath);
      let contentType, content, enc, xml = false;
      if (contentTypePaths.has(npath)) contentType = contentTypePaths.get(npath);
      else if (contentTypeExtensions.has(extension)) contentType = contentTypeExtensions.get(extension);
      if (isXML(contentType)) {
        xml = true;
        enc = detect(bytes);
        const text = convert(bytes, { to: 'unicode', from: enc, type: 'string' });
        content = parseXML(text);
      } else content = bytes;
      parts.set(npath, { contentType, content });
    }
  } else if (MIMETYPES_XML.includes(file.type)) {
    const xml = parseXML(await file.text());
    const enc = xml.characterSet;
    const pkgParts = xml.getElementsByTagNameNS(NS_PKG, 'part');

    for (const part of pkgParts) {
      const name = part.getAttributeNS(NS_PKG, 'name');
      const contentType = part.getAttributeNS(NS_PKG, 'contentType');
      // console.log({ name, contentType, part });
      let content, xml = false;
      if (part.firstChild.localName === 'xmlData') {
        xml = true;
        content = document.implementation.createDocument('', '', null);
        // const declaration = content.createProcessingInstruction('xml', `version="1.0" encoding="${enc}" standalone="yes"`);
        // content.append(declaration);
        for (const child of part.firstElementChild.children) content.append(content.importNode(child, true));
      } else if (part.firstChild.localName === 'binaryData') {
        content = base64ToBinary(part.firstElementChild.textContent);
        xml = false;
      }
      parts.set(name, { contentType, content });
    }
  }

  return parts;
}

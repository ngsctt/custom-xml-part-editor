import { unzip } from './fflate-promises.js';
import { PATHS, NS } from './constants.js';
import { isOOXMLPackage, parseXML, getExtension, isXML, base64ToBinary } from './utils.js';
import { XMap, Package } from './classes.js';


/**
 * @param {File} file
 * @return {Package} 
 */
export async function unpackOPC (file) {
  const pkg = new Package(file.type);
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
    const defaults = xml.evaluate('/_:Types/_:Default', xml.documentElement, () => NS.CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    const overrides = xml.evaluate('/_:Types/_:Override', xml.documentElement, () => NS.CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    resultsToEntries(defaults, 'Extension', x => x.toLowerCase(), contentTypeExtensions);
    resultsToEntries(overrides, 'PartName', x => x.replace(/^\//, '/'), contentTypePaths);
  }

  if (isOOXMLPackage(file.type)) {
    const data = new Uint8Array(await file.arrayBuffer());
    const unzipped = await unzip(data);

    if (unzipped[PATHS.CONTENT_TYPES]) {
      await loadContentTypes(unzipped[PATHS.CONTENT_TYPES]);
      delete unzipped[PATHS.CONTENT_TYPES];
    }

    for (const [path, bytes] of Object.entries(unzipped)) {
      const npath = path.replace(/^\/?/, '/');
      const extension = getExtension(npath);
      let contentType;
      if (contentTypePaths.has(npath)) contentType = contentTypePaths.get(npath);
      else if (contentTypeExtensions.has(extension)) contentType = contentTypeExtensions.get(extension);
      pkg.addPart(npath, contentType, bytes)
    }
  }
  
  else if (isXML(file.type)) {
    const xml = parseXML(await file.text());
    const pkgParts = xml.getElementsByTagNameNS(NS.PKG, 'part');

    for (const part of pkgParts) {
      const name = part.getAttributeNS(NS.PKG, 'name');
      const contentType = part.getAttributeNS(NS.PKG, 'contentType');
      if (part.firstChild.localName === 'xmlData') pkg.addXmlPart(name, contentType, part.firstChild.firstChild);
      else if (part.firstChild.localName === 'binaryData') pkg.addPart(name, contentType, base64ToBinary(part.firstChild.textContent))
    }
  }

  else throw new Error(`Content type '${file.type} not valid — aborting`);

  return pkg;
}

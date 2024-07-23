import { unzip, zip } from './fflate-promises.js';
import { detect, convert } from './encoding.js';
import { xml as prettifyXML } from './vkbeautify.js';
import { MIME_XML, NS_CONTENT_TYPES, MIME_DOCX, PATH_CONTENT_TYPES, NS_PKG, isImg } from './utils.js';
import { parseXML, serialiseXML, newXML } from './utils.js';
import { XMap } from './utils.js';
import { getExtension, isXML } from './utils.js';

const upload = document.getElementById('upload');
const output = document.getElementById('output');

const parts = new XMap();

upload.addEventListener('change', async event => {
  while (output.firstChild) output.lastChild.remove();
  const { files } = event.target;
  const file = files[0];
  fileName = file.name.replace(/(?<=.+)[.][^.]+$/, '');
  console.log({ fileName });
  const contentTypePaths = new XMap();
  const contentTypeExtensions = new XMap();
  parts.clear();

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
    // console.log(unzipped);
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
      parts.set(npath, { contentType, content, xml, enc });
    }
  } else if (MIME_XML.includes(file.type)) {
    const xml = parseXML(await file.text());
    const enc = 'UTF-8';
    const pkgParts = xml.getElementsByTagNameNS(NS_PKG, 'part');

    for (const part of pkgParts) {
      const name = part.getAttributeNS(NS_PKG, 'name');
      const contentType = part.getAttributeNS(NS_PKG, 'contentType');
      // console.log({ name, contentType, part });
      let content, xml = false;
      if (isXML(contentType)) {
        xml = true;
        content = document.implementation.createDocument('', '', null);
        const declaration = content.createProcessingInstruction('xml', `version="1.0" encoding="${enc}" standalone="yes"`);
        content.append(declaration);
        for (const child of part.firstElementChild.children) content.append(content.importNode(child, true));
      } else content = part.textContent;
      parts.set(name, { contentType, content, xml, enc });
      console.log(serialiseXML(content));
    }
  }

  for (const key of [...parts.keys()].sort()) {
    const { contentType, content } = parts.get(key);
    const details = document.createElement('details');
    details.classList.add('pkg-part');
    const summary = document.createElement('summary');
    const metadata = document.createElement('p');
    metadata.classList.add('pkg-metadata');
    summary.textContent = key;
    metadata.innerHTML = `content type: "${contentType}"`;
    details.append(summary);
    details.append(metadata);
    if (content instanceof XMLDocument) {
      const pre = document.createElement('pre');
      pre.classList.add('pkg-xml');
      const text = serialiseXML(content);
      pre.append(prettifyXML(text));
      details.append(pre);
    } else if (isImg(contentType)) {
      const img = new Image()
      img.src = URL.createObjectURL(new Blob([content], { type: contentType }));
      details.append(img);
    } else details.append(content.toString());
    output.append(details);
  }

});

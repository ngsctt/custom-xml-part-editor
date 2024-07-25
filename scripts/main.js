import { unzip, zip } from './fflate-promises.js';
import { detect, convert } from './encoding.js';
import { xml as prettifyXML } from './vkbeautify.js';
import { MIMETYPES_XML, NS_CONTENT_TYPES, MIME_DOCX, PATH_CONTENT_TYPES, NS_PKG, isImg, MIME_XML } from './utils.js';
import { parseXML, serialiseXML, newXML } from './utils.js';
import { XMap } from './utils.js';
import { getExtension, isXML } from './utils.js';

const upload = document.getElementById('upload');
const output = document.getElementById('output');
const downloadZip = document.getElementById('download-zip');
const downloadXml = document.getElementById('download-xml');

let fileName = 'document';
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
  } else if (MIMETYPES_XML.includes(file.type)) {
    const xml = parseXML(await file.text());
    const enc = 'UTF-8';
    const pkgParts = xml.getElementsByTagNameNS(NS_PKG, 'part');

    for (const part of pkgParts) {
      const name = part.getAttributeNS(NS_PKG, 'name');
      const contentType = part.getAttributeNS(NS_PKG, 'contentType');
      // console.log({ name, contentType, part });
      let content, xml = false;
      if (part.firstChild.localName === 'xmlData') {
        xml = true;
        content = document.implementation.createDocument('', '', null);
        const declaration = content.createProcessingInstruction('xml', `version="1.0" encoding="${enc}" standalone="yes"`);
        content.append(declaration);
        for (const child of part.firstElementChild.children) content.append(content.importNode(child, true));
      } else if (part.firstChild.localName === 'binaryData') {
        content = base64ToBinary(part.firstElementChild.textContent);
        xml = false;
      }
      parts.set(name, { contentType, content, xml, enc });
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
    } else if (content) details.append(content.toString());
    output.append(details);
  }

});

async function createZipPackage (parts) {
  const newParts = {};
  const contentTypePaths = new XMap();
  const defaultExtensions = new Map([
    ['rels', 'application/vnd.openxmlformats-package.relationships+xml'],
    ['xml', 'application/xml'],
    ['txt', 'text/plain'],
    ['htm', 'text/html'],
    ['html', 'text/html'],
    ['pdf', 'application/pdf'],
    ['gif', 'image/gif'],
    ['jpg', 'image/jpg'],
    ['jpeg', 'image/jpg'],
    ['png', 'image/png'],
    ['tiff', 'image/tiff'],
  ]);
  const contentTypeExtensions = new XMap();
  const encoder = new TextEncoder();

  for (const path of [...parts.keys()].sort()) {
    const { contentType, content } = parts.get(path);
    const npath = path.replace(/^[/]?/, '');
    const extn = getExtension(path);
    contentTypePaths.add(path, contentType);
    if (defaultExtensions.has(extn)) {
      if (contentType === defaultExtensions.get(extn)) contentTypeExtensions.set(extn, defaultExtensions.get(extn));
    } else {
      if (!contentTypeExtensions.has(extn)) contentTypeExtensions.add(extn, contentType);
      else contentTypeExtensions.set(extn, null);
    }

    if (content instanceof XMLDocument) {
      const serialised = serialiseXML(content);
      newParts[npath] = encoder.encode(serialised);
    } else if (typeof content === 'string' || content instanceof String) {
      newParts[npath] = encoder.encode(content);
    } else newParts[npath] = content;

    // newParts[path] = encoder.encode(output);
    // newParts[npath] = new Uint8Array([0]);
  }

  // const compressed = zipSync({
  //   'dir1': {
  //     'nested': {
  //       '你好.txt': encoder.encode('Hey there!')
  //     },
  //     'other/tmp.txt': new Uint8Array([97, 98, 99, 100])
  //   },
  //   'superTinyFile.bin': [new Uint8Array([0]), { level: 0 }]
  // }, {
  //   level: 1
  // });
  // const decompressed = unzipSync(compressed);
  // console.log({compressed, decompressed});

  const ctStream = newXML({ standalone: true });
  ctStream.append(ctStream.createElementNS(NS_CONTENT_TYPES, 'Types'));
  for (const [extension, type] of contentTypeExtensions) {
    const node = ctStream.createElementNS(NS_CONTENT_TYPES, 'Default');
    node.setAttribute('Extension', extension);
    node.setAttribute('ContentType', type);
    ctStream.documentElement.append(node);
  }
  for (const [path, type] of contentTypePaths) {
    if (contentTypeExtensions.get(getExtension(path)) === type) continue;
    const node = ctStream.createElementNS(NS_CONTENT_TYPES, 'Override');
    node.setAttribute('PartName', path);
    node.setAttribute('ContentType', type);
    ctStream.documentElement.append(node);
  }
  console.log(serialiseXML(ctStream));
  newParts[PATH_CONTENT_TYPES] = encoder.encode(serialiseXML(ctStream));

  console.log({ ctStream, newParts });
  const zipped = await zip(newParts, { level: 1 });
  const zipfile = new File([zipped], `${fileName}.docx`, { type: MIME_DOCX });
  console.log({ zipped, zipfile });
  const a = document.createElement('a');
  const href = URL.createObjectURL(zipfile);
  a.href = href;
  a.download = zipfile.name;
  a.click();
  // const data = new Uint8Array(await zipfile.arrayBuffer());
  // console.log({ data });
  // const unzipped = await unzip(data);
  // console.log({ unzipped });
}

function binaryToBase64 (uint8array) {
  const output = [];

  // for (let i = 0, length = uint8array.length; i < length; i++) {
  //   output.push(String.fromCharCode(uint8array[i]));
  // }
  for (const code of uint8array) {
    output.push(String.fromCharCode(code));
  }

  const base64 = btoa(output.join(''));
  const segments = [];

  for (let i = 0; i < base64.length; i+= 76) {
    segments.push(base64.substring(i, i + 76));
  }
  console.log({base64, segments});
  return segments.join('\n');
};

function base64ToBinary (base64) {
  const ascii = atob(base64.replace(/[\s\n]+/g, ''));
  const bytes = [];

  for (let i = 0; i < ascii.length; i++) {
    bytes.push(ascii.charCodeAt(i));
  }

  return new Uint8Array(bytes);
};

function createXmlPackage (parts) {
  const base = parseXML([
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<?mso-application progid="Word.Document"?>',
    '<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage" />'
  ].join(''));
  for (const path of [...parts.keys()].sort()) {
    const { contentType, content } = parts.get(path);
    const part = base.createElementNS(NS_PKG, 'part');
    part.setAttributeNS(NS_PKG, 'name', path);
    part.setAttributeNS(NS_PKG, 'contentType', contentType);
    if (content instanceof XMLDocument) {
      const xmlData = base.createElementNS(NS_PKG, 'xmlData');
      const data = base.importNode(content.documentElement, true);
      xmlData.append(data);
      part.append(xmlData);
    } else {
      part.setAttributeNS(NS_PKG, 'compression', 'store');
      const binaryData = base.createElementNS(NS_PKG, 'binaryData');
      binaryData.textContent = binaryToBase64(content);
      // console.log(binaryData);
      part.append(binaryData);
    }
    base.documentElement.append(part);
  }
  console.log({ base });
  const output = serialiseXML(base);
  console.log({ output });
  const file = new File([output], `${fileName}.xml`, { type: MIME_XML });
  console.log({ file });
  const a = document.createElement('a');
  const href = URL.createObjectURL(file);
  a.href = href;
  a.download = file.name;
  a.click();

}

downloadXml.addEventListener('click', event => createXmlPackage(parts));
downloadZip.addEventListener('click', async event => await createZipPackage(parts));

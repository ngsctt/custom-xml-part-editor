import { unzip, zip } from './fflate-promises.js';
import { codeToString, detect, convert } from './encoding.js';
import { xml as prettifyXML } from './vkbeautify.js';
// import { parse } from './xml.js';
import * as _xml from './x.js';

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MIME_XML = 'text/xml';
const NS_PKG = 'http://schemas.microsoft.com/office/2006/xmlPackage'

const upload = document.getElementById('upload');
const output = document.getElementById('output');
const parser = new DOMParser();

class Dir {
  name;
  children = {};

  constructor (name) {
    this.name = name;
    return this;
  }
}

class XMap extends Map {
  constructor (...args) { super(...args); }
  add (key, value) {
    if (this.has(key)) throw new Error(`Key '${key}' already set — aborting`);
    this.set(key, value);
  }
}

const getExtension = path => path.match(/.+[.]([^.]+)$/)[1].toLowerCase() 

upload.addEventListener('change', async event => {
  while (output.firstChild) output.lastChild.remove();
  const {files} = event.target;
  const file = files[0];
  const partPaths = new XMap();
  const contentTypePaths = new XMap();
  const contentTypeExtensions = new XMap();

  async function loadContentTypes (uint8array) {
    const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';

    function resultsToEntries (results, attr, replacer, map) {
      let node = results.iterateNext();
      while (node) {
        map.add(replacer(node.getAttribute(attr)), node.getAttribute('ContentType'));
        node = results.iterateNext();
      }  
    }
    
    const text = await new Blob([uint8array]).text();
    const xml = parser.parseFromString(text, 'application/xml');
    const defaults = xml.evaluate('/_:Types/_:Default', xml.documentElement, () => NS_CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    const overrides = xml.evaluate('/_:Types/_:Override', xml.documentElement, () => NS_CONTENT_TYPES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    resultsToEntries(defaults, 'Extension', x => x.toLowerCase(), contentTypeExtensions);
    resultsToEntries(overrides, 'PartName', x => x.replace(/^\//, '/') , contentTypePaths);
  }

  if (file.type === MIME_DOCX) {
    const data = new Uint8Array(await file.arrayBuffer());
    const unzipped = await unzip(data);
    if (unzipped['[Content_Types].xml']) {
      loadContentTypes(unzipped['[Content_Types].xml']);
      delete unzipped['[Content_Types].xml'];
    }
    console.log(unzipped);
    for (const [rawPath, content] of Object.entries(unzipped)) {
      const path = rawPath.replace(/^\/?/, '/');
      const extension = getExtension(path);
      const data = { contentType, content };
      if (contentTypePaths.has(path)) data.contentType = contentTypePaths.get(path);
      else if (contentTypeExtensions.has(extension)) data.contentType = contentTypeExtensions.get(extension);
      partPaths.set(path, data);
    }
  } else if (file.type === MIME_XML) {
    // const xml = parse(await file.text());
    // const parser = new DOMParser();
    // const xml = parser.parseFromString(await file.text(), "application/xml");
    const xml = _xml.parse(await file.text());
    // console.log(xml);
    const pretty = _xml.pretty(xml, true);
    // console.log({pretty});
    // const parts = xml.querySelectorAll('ns|a');
    // console.log({parts});

    // const nodesSnapshot = xml.evaluate(
    //   "//pkg:part",
    //   xml,
    //   null,
    //   XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    //   null,
    // );
    
    // for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    //   console.log(nodesSnapshot.snapshotItem(i).textContent);
    // }

    const parts = xml.getElementsByTagNameNS(NS_PKG, 'part');
    console.log({parts});
    for (const part of parts) {
      const name = part.getAttributeNS(NS_PKG, 'name');
      const contentType = part.getAttributeNS(NS_PKG, 'contentType');
      console.log({name, contentType, part});
      const doc = document.implementation.createDocument('', '', null);
      for (const child of part.firstElementChild.children) {
        doc.append(doc.importNode(child, true));
      }
      console.log({doc});
      partPaths.set(name, doc);
    }
  }

  const root = {};
  console.log({paths: [...partPaths.keys()] });
  for (const p of partPaths.keys()) {
    const levels = p.replace(/^\/?/, '').split('/');
    let c = root;
    while (levels.length > 1) {
      const l = levels.shift();
      if (!c[l]) c[l] = new Dir(l);
      c = c[l].children;
    }
    c[levels[0]] = partPaths.get(p);
  }
  console.log({root});

  // output.innerHTML = paths.join('<br>');

  async function makeDetails (dir) {
    const items = [];
    for (const key of Object.keys(dir).sort()) {
      const value = dir[key];
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = key;
      details.append(summary);
      let text;
      if (value instanceof Dir) {
        details.append(...await makeDetails(value.children))
        details.open = true;
      } else {
        let text;
        if (value instanceof Uint8Array) {
          const enc = detect(value);
          text = convert(value, {to: 'unicode', from: enc, type: 'string'});
        } else if (value instanceof XMLDocument) {
          text = new XMLSerializer().serializeToString(value);
        }
        // console.log({value});
        // const blob = new Blob([value]);
        // console.log({blob});
        // const text = await blob.text();
        // console.log(text);
        const pre = document.createElement('pre');
        pre.append(prettifyXML(text));
        details.append(pre);
        // console.log(text, prettifyXML(text));
      }
      items.push(details);
    }
    return items;
  }
  output.append(...await makeDetails(root));

});

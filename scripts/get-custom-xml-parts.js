import { unpackOPC } from './unpack-opc.js';
import { createFlatXmlOPC } from './create-flat-xml-package.js';
import { createZipOPC } from './create-zip-package.js';
import { download } from './interface.js';
import { NS, RELS } from './constants.js';
import { Relationships } from './classes.js';

const upload = document.getElementById('upload');
const expandAll = document.getElementById('expand-all');
const collapseAll = document.getElementById('collapse-all');
const output = document.getElementById('output');
const downloadZip = document.getElementById('download-zip');
const downloadXml = document.getElementById('download-xml');

let fileName, parts;

expandAll.addEventListener('click', event => {
  const details = output.querySelectorAll('details.pkg-part');
  for (const d of details) d.open = true;
})

collapseAll.addEventListener('click', event => {
  const details = output.querySelectorAll('details.pkg-part');
  for (const d of details) d.open = false;
})

upload.addEventListener('change', async event => {
  while (output.firstChild) output.lastChild.remove();
  const { files } = event.target;
  const file = files[0];
  fileName = file.name.replace(/(?<=.+)[.][^.]+$/, '');

  parts = await unpackOPC(file);
  getCustomXmlParts(parts);
});

downloadXml.addEventListener('click', event => {
  const file = createFlatXmlOPC(parts, fileName);
  download(file);
});
downloadZip.addEventListener('click', async event => {
  const file = await createZipOPC(parts, fileName);
  download(file);
});



const resolver = prefix => NS.RELATIONSHIPS;

// const resolver = prefix => ({
//   rels: NS.RELATIONSHIPS
// })[prefix] ?? '';

function getCustomXmlParts (parts) {
  const getPart = path => parts.get(path.replace(/^[/]?/, '/')) ?? parts.get(path.replace(/^[/]?/, ''));
  const getRels = path => {
    path = path.replace(/^[/]?/, '/');
    /** @type {[]} */
    const segments = path.split('/');
    const relsPath = [...segments.slice(0, -2), '_rels', ...segments.slice(-1)].join('/');
    console.log({relsPath});
    return getPart(relsPath);
  }

  const _relsPart = getPart('/_rels/.rels');
  console.log({_relsPart});
  /** @type {XMLDocument} */
  const _rels = _relsPart.xml;
  // console.log(`//Relationship[@Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument']/@Target`);
  // const officeDocPath = _rels.evaluate(`/rels:Relationships/rels:Relationship[@Type='${RELS.MAIN_STRICT}']/@Target`, _rels.documentElement, resolver, XPathResult.ANY_TYPE, null);
  const relNodes = _rels.evaluate(`//*[local-name()='Relationship']`, _rels.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
  const relationships = new Relationships(relNodes);
  console.log({relNodes, relationships});
  const officeDocPath = relationships.getTargets(RELS.MAIN_STRICT) ?? relationships.getTargets(RELS.MAIN_TRANSITIONAL);
  console.log({officeDocPath});
  const officeDocPart = getPart(officeDocPath[0]);
  console.log({officeDocPart});
  // const officeDocRels = getRels(officeDocPath);
}
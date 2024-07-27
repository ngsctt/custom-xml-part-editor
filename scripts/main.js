import { unpackOPC } from './unpack-opc.js';
import { createFlatXmlOPC } from './create-flat-xml-package.js';
import { createZipOPC } from './create-zip-package.js';
import { displayParts, download } from './interface.js';

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
  displayParts(parts, output);
});

downloadXml.addEventListener('click', event => {
  const file = createFlatXmlOPC(parts, fileName);
  download(file);
});
downloadZip.addEventListener('click', async event => {
  const file = await createZipOPC(parts, fileName);
  download(file);
});

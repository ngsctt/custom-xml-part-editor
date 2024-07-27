import { unpackOPC } from './unpackOPC.js';
import { createFlatXmlOPC } from './createFlatXmlOPC.js';
import { createZipOPC } from './createZipOPC.js';
import { displayParts, download } from './interface.js';

const upload = document.getElementById('upload');
const output = document.getElementById('output');
const downloadZip = document.getElementById('download-zip');
const downloadXml = document.getElementById('download-xml');

let fileName, parts;

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

import { zip } from './fflate-promises.js';
import { MIMETYPE, NS, PATHS } from './constants.js';
import { serialiseXML, newXML, getExtension } from './utils.js';
import { XMap } from './classes.js';

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
const encoder = new TextEncoder();

/**
 * Creates a zipped Office Open XML OPC package
 *
 * @export
 * @param {Package} parts The parts to be packed into the OPC file
 * @param {string} [filename='document.zip'] The name of the OPC file to be created
 * @returns {File} The packaged OPC file
 */
export async function createZipOPC (parts, filename = 'document.zip') {
  console.log({filename});
  if (getExtension(filename)?.toLowerCase() === 'xml') replaceExtension(filename, '.zip');

  const newParts = {};
  const contentTypePaths = new XMap();
  const contentTypeExtensions = new XMap();

  for (const path of [...parts.keys()].sort()) {
    const { type, bytes, xml, isXML } = parts.get(path)
    const npath = path.replace(/^[/]?/, '');
    const extn = getExtension(path);

    contentTypePaths.add(path, type);
    if (defaultExtensions.has(extn)) {
      if (type === defaultExtensions.get(extn)) contentTypeExtensions.set(extn, defaultExtensions.get(extn));
    } else {
      if (!contentTypeExtensions.has(extn)) contentTypeExtensions.add(extn, type);
      else contentTypeExtensions.set(extn, null);
    }

    newParts[npath] = bytes;
  }

  const ctStream = newXML({ standalone: true });
  ctStream.append(ctStream.createElementNS(NS.CONTENT_TYPES, 'Types'));
  for (const [extension, type] of contentTypeExtensions) {
    const node = ctStream.createElementNS(NS.CONTENT_TYPES, 'Default');
    node.setAttribute('Extension', extension);
    node.setAttribute('ContentType', type);
    ctStream.documentElement.append(node);
  }
  for (const [path, type] of contentTypePaths) {
    if (contentTypeExtensions.get(getExtension(path)) === type) continue;
    const node = ctStream.createElementNS(NS.CONTENT_TYPES, 'Override');
    node.setAttribute('PartName', path);
    node.setAttribute('ContentType', type);
    ctStream.documentElement.append(node);
  }
  console.log(serialiseXML(ctStream));
  newParts[PATHS.CONTENT_TYPES] = encoder.encode(serialiseXML(ctStream));

  console.log({ ctStream, newParts });
  const zipped = await zip(newParts, { level: 1 });
  return new File([zipped], filename, { type: MIMETYPE.DOCX });
}

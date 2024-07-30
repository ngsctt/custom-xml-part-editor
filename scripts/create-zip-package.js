import { zip } from './fflate-promises.js';
import { serialiseXML, newXML } from './utils.js';
import { XMap } from './utils.js';
import { getExtension } from './utils.js';
import { MIMETYPE, NS, PATHS } from './constants.js';

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
 * @param {Map} parts The parts to be packed into the OPC file
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

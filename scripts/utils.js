export const parseXML = string => new DOMParser().parseFromString(string, 'application/xml');
export const serialiseXML = node => new XMLSerializer().serializeToString(node);
export const getExtension = path => path.match(/.+[.]([^.]+)$/)?.[1]?.toLowerCase() ?? null;
export const replaceExtension = (path, newExtension) => path.replace(/[.]([^.]+)$/i, newExtension);
export const isXML = mediaType => /^(?:application|text)[/]xml$/i.test(mediaType.trim()) || /[+]xml$/i.test(mediaType.trim());
export const isImg = mediaType => /^image[/].+/i.test(mediaType.trim());

export function newXML ({ version = '1.0', encoding = 'UTF-8', standalone = true } = {}) {
  const xml = document.implementation.createDocument('', '', null);
  // const instructions = [];
  // if (version != null) instructions.push(`version="${version}"`);
  // if (encoding != null) instructions.push(`encoding="${encoding}"`);
  // if (standalone != null) instructions.push(`standalone="${standalone ? 'yes' : 'no'}"`);
  // if (instructions.length > 0) xml.append(xml.createProcessingInstruction('xml', instructions.join(' ')));
  return xml;
}

export class XMap extends Map {
  constructor (...args) { super(...args); }
  add (key, value) {
    if (this.has(key)) throw new Error(`Key '${key}' already set — aborting`);
    this.set(key, value);
  }
}

/**
 * Converts binary data into a base64 string
 *
 * @export
 * @param {*} uint8array
 * @return {*} 
 */
export function binaryToBase64 (uint8array) {
  const output = [], segments = [];

  for (const code of uint8array) {
    output.push(String.fromCharCode(code));
  }

  return btoa(output.join(''));
}

export function base64ToBinary (string) {
  const binary = atob(string.replace(/[\s\n]+/g, ''));
  const bytes = [];

  for (let i = 0; i < binary.length; i++) {
    bytes.push(binary.charCodeAt(i));
  }

  return new Uint8Array(bytes);
}

export function stringBySegment (string, length, separator = '\n') {
  if (!string) throw new Error(`Must provide 'string' to segment – aborting`);
  length = Number(length);
  if (Number.isNaN(length)) throw new Error(`'length' must be a number – aborting`);

  const segments = [];

  for (let i = 0; i < string.length; i += length) {
    segments.push(string.substring(i, i + length));
  }
  return segments.join(separator);
}


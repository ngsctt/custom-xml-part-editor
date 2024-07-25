export const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const MIMETYPES_XML = ['application/xml', 'text/xml'];
export const MIME_XML = 'application/xml';
export const MIME_CUSTOM_XML_PROPS = 'application/vnd.openxmlformats-officedocument.customXmlProperties+xml';
export const NS_PKG = 'http://schemas.microsoft.com/office/2006/xmlPackage';
export const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
export const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
export const NS_CUSTOM_XML = 'http://schemas.openxmlformats.org/officeDocument/2006/customXml';
export const PATH_CONTENT_TYPES = '[Content_Types].xml';

export const parseXML = string => new DOMParser().parseFromString(string, 'application/xml');
export const serialiseXML = node => new XMLSerializer().serializeToString(node);
export const getExtension = path => path.match(/.+[.]([^.]+)$/)[1].toLowerCase();
export const isXML = mediaType => MIMETYPES_XML.includes(mediaType) || /\+xml$/i.test(mediaType);
export const isImg = mediaType => /^image[/]/.test(mediaType);

export function newXML ({ version = '1.0', encoding = 'UTF-8', standalone = false } = {}) {
  const xml = document.implementation.createDocument('', '', null);
  const instructions = [];
  if (version != null) instructions.push(`version="${version}"`);
  if (encoding != null) instructions.push(`encoding="${encoding}"`);
  if (standalone != null) instructions.push(`standalone="${standalone ? 'yes' : 'no'}"`);
  if (instructions.length > 0) xml.append(xml.createProcessingInstruction('xml', instructions.join(' ')));
  return xml;

}export class XMap extends Map {
  constructor (...args) { super(...args); }
  add (key, value) {
    if (this.has(key)) throw new Error(`Key '${key}' already set — aborting`);
    this.set(key, value);
  }
}
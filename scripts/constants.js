export const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const MIMETYPES_XML = ['application/xml', 'text/xml'];
export const MIME_XML = 'application/xml';
export const MIME_CUSTOM_XML_PROPS = 'application/vnd.openxmlformats-officedocument.customXmlProperties+xml';
export const NS_PKG = 'http://schemas.microsoft.com/office/2006/xmlPackage';
export const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
export const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
export const NS_CUSTOM_XML = 'http://schemas.openxmlformats.org/officeDocument/2006/customXml';
export const PATH_CONTENT_TYPES = '[Content_Types].xml';

export const MIMETYPE = {
  XML: 'application/xml',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  CUSTOM_XML_PROPS: 'application/vnd.openxmlformats-officedocument.customXmlProperties+xml',
}

export const NS = {
  PKG: 'http://schemas.microsoft.com/office/2006/xmlPackage',
  CONTENT_TYPES: 'http://schemas.openxmlformats.org/package/2006/content-types',
  RELATIONSHIPS: 'http://schemas.openxmlformats.org/package/2006/relationships',
  CUSTOM_XML: 'http://schemas.openxmlformats.org/officeDocument/2006/customXml',
}

const OPC_EXTENSIONS = {
  'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'vnd.openxmlformats-officedocument.wordprocessingml.template': 'dotx',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xltx',
  'vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx',
  'vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppsx',
  'vnd.openxmlformats-officedocument.presentationml.template': 'potx',
  'vnd.ms-word.document.macroEnabled.12': 'docm',
  'vnd.ms-word.template.macroEnabled.12': 'dotm',
  'vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
  'vnd.ms-excel.template.macroEnabled.12': 'xltm',
  'vnd.ms-powerpoint.presentation.macroEnabled.12': 'pptm',
  'vnd.ms-powerpoint.slideshow.macroEnabled.12': 'ppsm',
  'vnd.ms-powerpoint.template.macroEnabled.12': 'potm',
}

// const OPC_MIME_EXTENSIONS_MATRIX = [
//   ['vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
//   ['vnd.openxmlformats-officedocument.wordprocessingml.template', 'dotx'],
//   ['vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xltx'],
//   ['vnd.openxmlformats-officedocument.spreadsheetml.template', 'xltx'],
//   ['vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx'],
//   ['vnd.openxmlformats-officedocument.presentationml.slideshow', 'ppsx'],
//   ['vnd.openxmlformats-officedocument.presentationml.template', 'potx'],
//   ['vnd.ms-word.document.macroEnabled.12', 'docm'],
//   ['vnd.ms-word.template.macroEnabled.12', 'dotm'],
//   ['vnd.ms-excel.sheet.macroEnabled.12', 'xlsm'],
//   ['vnd.ms-excel.template.macroEnabled.12', 'xltm'],
//   ['vnd.ms-powerpoint.presentation.macroEnabled.12', 'pptm'],
//   ['vnd.ms-powerpoint.slideshow.macroEnabled.12', 'ppsm'],
//   ['vnd.ms-powerpoint.template.macroEnabled.12', 'potm'],
// ]

// export const OPC_EXTENSIONS = new Map(OPC_MIME_EXTENSIONS_MATRIX);
// export const OPC_MIMTYPES = new Map(OPC_MIME_EXTENSIONS_MATRIX.map(([a, b]) => [b, a]));
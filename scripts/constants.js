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
  MAIN_STRICT: 'http://purl.oclc.org/ooxml/wordprocessingml/main',
  MAIN_TRANSITIONAL: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
}

export const RELS = {
  MAIN_STRICT: 'http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument',
  MAIN_TRANSITIONAL: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
}

export const PATHS = {
  CONTENT_TYPES: '[Content_Types].xml',
  PACKAGE_RELS: '_rels/.rels'
}

export const CONTENT_TYPES = {
  MAIN: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
  TEMPLATE_MAIN: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml'
}

const OPC_EXTENSIONS = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'dotx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xltx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppsx',
  'application/vnd.openxmlformats-officedocument.presentationml.template': 'potx',
  'application/vnd.ms-word.document.macroEnabled.12': 'docm',
  'application/vnd.ms-word.template.macroEnabled.12': 'dotm',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
  'application/vnd.ms-excel.template.macroEnabled.12': 'xltm',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12': 'pptm',
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': 'ppsm',
  'application/vnd.ms-powerpoint.template.macroEnabled.12': 'potm',
}

export const MIMETYPES_OOXML = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.ms-word.document.macroEnabled.12',
  'application/vnd.ms-word.template.macroEnabled.12',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel.template.macroEnabled.12',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
  'application/vnd.ms-powerpoint.template.macroEnabled.12',
]

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
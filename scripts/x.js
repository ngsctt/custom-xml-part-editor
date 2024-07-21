// Adapted from https://gist.github.com/max-pub/a5c15b7831bbfaba7ad13acefc3d0781
export const parse = (string, type = 'text/xml') => new DOMParser().parseFromString(string, type);  // like JSON.parse
export const stringify = DOM => new XMLSerializer().serializeToString(DOM);                         // like JSON.stringify

export const transform = (xml, xsl) => {
  let proc = new XSLTProcessor();
  proc.importStylesheet(typeof xsl == 'string' ? parse(xsl) : xsl);
  let output = proc.transformToFragment(typeof xml == 'string' ? parse(xml) : xml, document);
  return typeof xml == 'string' ? stringify(output) : output; // if source was string then stringify response, else return object
};

export const minify = node => toString(node, { pretty: false });
export const prettify = node => toString(node, { pretty: true });
export const toString = (node, { pretty, level = 0, singleton = false }) => { // einzelkind
  if (typeof node == 'string') node = parse(node);
  let tabs = pretty ? Array(level + 1).fill('').join('\t') : '';
  let newLine = pretty ? '\n' : '';
  if (node.nodeType == 3) return (singleton ? '' : tabs) + node.textContent.trim() + (singleton ? '' : newLine)
  if (!node.tagName) return toString(node.firstChild, { pretty });
  let output = tabs + `<${node.tagName}`; // >\n
  for (let i = 0; i < node.attributes.length; i++)
    output += ` ${node.attributes[i].name}="${node.attributes[i].value}"`;
  if (node.childNodes.length == 0) return output + ' />' + newLine;
  else output += '>';
  let onlyOneTextChild = ((node.childNodes.length == 1) && (node.childNodes[0].nodeType == 3));
  if (!onlyOneTextChild) output += newLine;
  for (let i = 0; i < node.childNodes.length; i++)
    output += toString(node.childNodes[i], { pretty, level: level + 1, singleton: onlyOneTextChild });
  return output + (onlyOneTextChild ? '' : tabs) + `</${node.tagName}>` + newLine;
};

export function pretty (source, serialize = false) {
  const parser = new DOMParser();
  if (typeof source === 'string' || source instanceof String) source = parser.parseFromString(source, 'application/xml');
  else if (!source instanceof XMLDocument) throw new Error('Input must be an XML string, or an instance of XMLDocument.');
  const xslt = parser.parseFromString([
    // describes how we want to modify the XML - indent everything
    '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">',
    '  <xsl:strip-space elements="*"/>',
    '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
    '    <xsl:value-of select="normalize-space(.)"/>',
    '  </xsl:template>',
    '  <xsl:template match="node()|@*">',
    '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
    '  </xsl:template>',
    '  <xsl:output indent="yes"/>',
    '</xsl:stylesheet>',
  ].join('\n'), 'application/xml');

  const processor = new XSLTProcessor();
  processor.importStylesheet(xslt);
  const result = processor.transformToDocument(source);
  if (!serialize) return result;
  return new XMLSerializer().serializeToString(result);
}
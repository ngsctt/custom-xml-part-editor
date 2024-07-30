import { convert, detect } from './encoding/encoding.js';
import { isXML, parseXML, serialiseXML } from './utils.js';

export class BinaryPart {
  type; #bytes;
  constructor (type, bytes) {
    if (!type) throw new Error(`'type' must be provided — aborting`)
    this.type = type;
    if (bytes) this.bytes = bytes;
  }
  get bytes () { return this.#bytes }
  set bytes (bytes) {
    if (bytes instanceof Uint8Array) null;
    else if (bytes instanceof ArrayBuffer) null;
    else throw new Error(`'bytes' argument must be of type Uint8Array or ArrayBuffer — aborting`);
    this.#bytes = new Uint8Array(bytes);
  }
  get isXML () { return false; }
  get isBinary () { return true; }
}

export class XMLPart {
  #xml; #bytes;
  constructor (type, bytes) {
    if (!type) throw new Error(`'type' must be provided — aborting`)
    this.type = type;
    if (bytes) this.bytes = bytes;
  }
  get xml () { return this.#xml }
  set xml (xml) {
    if (xml instanceof XMLDocument) null;
    else if (xml instanceof Node) {
      const xml_doc = document.implementation.createDocument('', '', null);
      xml = xml_doc.append(xml_doc.importNode(xml, true));
    } else if (typeof xml === 'string' || xml instanceof String) xml = parseXML(xml);
    else throw new Error(`'xml' must be of type string or XMLDocument — aborting`);
    this.#xml = xml.cloneNode(true);
    this.#bytes = new TextEncoder().encode(serialiseXML(this.#xml));
  }
  get bytes () { return this.#bytes }
  set bytes (bytes) {
    if (bytes instanceof Uint8Array) null;
    else if (bytes instanceof ArrayBuffer) null;
    else throw new Error(`'bytes' must be of type Uint8Array or ArrayBuffer — aborting`);
    this.#bytes = new Uint8Array(bytes);
    const encoding = detect(this.#bytes)
    const string = convert(this.#bytes, { to: 'unicode', from: encoding, type: 'string' });
    this.#xml = parseXML(string);
  }
  get isXML () { return true; }
  get isBinary () { return false; }
}

export class Package {
  #parts = new Map();

  constructor (type) {
    this.type = type;
  }

  addPart (name, type, bytes) {
    if (this.#parts.has(name)) throw new Error(`Part with name '${name}' already exists — aborting`);
    let part;
    if (isXML(type)) part = new XMLPart(type, bytes);
    else part = new BinaryPart(type, bytes);
    this.#parts.set(name, part);
    return part;
  }
  addXmlPart (name, type, xml) {
    if (this.#parts.has(name)) throw new Error(`Part with name '${name}' already exists — aborting`);
    if (!isXML(type)) throw new Error(`Must have XML content type — aborting`)
    const part = new XMLPart(type);
    part.xml = xml;
    this.#parts.set(name, part);
    return part;
  }
  get (name) { return this.#parts.get(name) }
  keys () { return this.#parts.keys() }
}

export class XMap extends Map {
  constructor (...args) { super(...args); }
  add (key, value) {
    if (this.has(key)) throw new Error(`Key '${key}' already set — aborting`);
    this.set(key, value);
  }
}

export class Relationships extends Map {
  /**
   * Creates an instance of Relationships.
   * @param {XPathResult} nodeList
   * @memberof Relationships
   */
  constructor (nodeList) {
    super();
    if (! nodeList instanceof XPathResult) throw new Error(`'nodeList' must be of type XPathResult — aborting`)
    if (! nodeList.resultType === XPathResult.ORDERED_NODE_ITERATOR_TYPE && ! nodeList.resultType === XPathResult.UNORDERED_NODE_ITERATOR_TYPE) throw new Error(`'nodeList' resultType must be UNORDERED_NODE_ITERATOR_TYPE or ORDERED_NODE_ITERATOR_TYPE — aborting`)
    let node = nodeList.iterateNext();
    while (node) {
      const id = node.getAttribute('Id');
      const type = node.getAttribute('Type');
      const target = node.getAttribute('Target');
      if (this.has(id)) throw new Error(`Relationship with ID '${id}' already exists — aborting`);
      this.set(id, { type, target });
      node = nodeList.iterateNext();
    }
  }
  getTargets (type) {
    const targets = [];
    for (const [id, rel] of this) if (rel.type === type) targets.push(rel.target);
    if (targets.length < 1) return null;
    return targets;
  }
}
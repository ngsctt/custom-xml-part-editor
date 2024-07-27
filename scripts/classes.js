import { convert, detect } from './encoding';
import { isXML, parseXML } from './utils';

class BinaryPart {
  constructor (type, bytes) {
    this.type = type;
    this.bytes = bytes;
  }
  get isXML () { return false; }
  get isBinary () { return true; }
}

class XMLPart {
  constructor (type, bytes) {
    this.type = type;
    this.bytes = bytes;
    const enc = detect(bytes)
    const string = convert(bytes, { to: 'unicode', from: enc, type: 'string' });
    this.xml = parseXML(string);
  }
  get isXML () { return true; }
  get isBinary () { return false; }
}

class Document {
  parts = new Map();

  constructor (type) {
    this.type = type;
  }

  addPart (name, type, content) {
    if (this.parts.has(name)) throw new Error(`Part with name '${name}' already exists — aborting`);
    if (isXML(type)) this.parts.set(name, new XMLPart(type, content));
    else this.parts.set(name, new BinaryPart(type, content));
  }
}
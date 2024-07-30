import { isImg } from './utils.js';
import { serialiseXML } from './utils.js';
import { xml as prettifyXML } from './vkbeautify/vkbeautify.js';

export function download (file) {
  const a = document.createElement('a');
  const href = URL.createObjectURL(file);
  a.href = href;
  a.download = file.name;
  a.click();
}

/**
 *
 *
 * @export
 * @param {Package} parts
 * @param {HTMLElement} parent
 */
export function displayParts (parts, parent) {
  for (const key of [...parts.keys()].sort()) {
    const { type, bytes, xml, isXML } = parts.get(key);

    const details = document.createElement('details');
    details.classList.add('pkg-part');
    const summary = document.createElement('summary');
    const metadata = document.createElement('p');
    metadata.classList.add('pkg-metadata');
    summary.textContent = key;
    metadata.innerHTML = `content type: "${type}"`;
    details.append(summary);
    details.append(metadata);

    if (isXML) {
      const pre = document.createElement('pre');
      pre.classList.add('pkg-xml');
      const text = serialiseXML(xml);
      pre.append(prettifyXML(text));
      details.append(pre);
    }
    
    else if (isImg(type)) {
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([bytes], { type }));
      details.append(img);
    }
    
    else if (bytes) details.append(bytes.toString());
    
    parent.append(details);
  }
}

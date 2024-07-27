import { xml as prettifyXML } from './vkbeautify.js';
import { isImg } from './utils.js';
import { serialiseXML } from './utils.js';

export function download (file) {
  const a = document.createElement('a');
  const href = URL.createObjectURL(file);
  a.href = href;
  a.download = file.name;
  a.click();
}
export function displayParts (parts, parent) {
  for (const key of [...parts.keys()].sort()) {
    const { contentType, content } = parts.get(key);
    const details = document.createElement('details');
    details.classList.add('pkg-part');
    const summary = document.createElement('summary');
    const metadata = document.createElement('p');
    metadata.classList.add('pkg-metadata');
    summary.textContent = key;
    metadata.innerHTML = `content type: "${contentType}"`;
    details.append(summary);
    details.append(metadata);
    if (content instanceof XMLDocument) {
      const pre = document.createElement('pre');
      pre.classList.add('pkg-xml');
      const text = serialiseXML(content);
      pre.append(prettifyXML(text));
      details.append(pre);
    } else if (isImg(contentType)) {
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([content], { type: contentType }));
      details.append(img);
    } else if (content) details.append(content.toString());
    parent.append(details);
  }
}

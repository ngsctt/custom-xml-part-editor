import { unzip as og_unzip, zip as og_zip } from './fflate@v0.8.2.min.js';

export function unzip(data, opts) {
  return new Promise((resolve, reject) => {
    og_unzip(data, opts ?? {}, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export function zip(data, opts) {
  return new Promise((resolve, reject) => {
    og_zip(data, opts ?? {}, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}


import fs from 'fs';
import makeDir from 'make-dir';
import ndPath from 'path';
import { Transform } from 'stream';
import { promisify } from 'util';
import yauzl, { Entry } from 'yauzl';

import { ProgressCallback, ProgressData } from './index.d';

// @types/node@8.x.x appears a little wrong
type Transform2 = Transform & {
  _flush(callback: Function): void;
};

// for promisify yauzl.open
type TYauzlOpen = {
  (path: string, options: yauzl.Options): yauzl.ZipFile;
};

const yauzlOpen: TYauzlOpen = promisify(yauzl.open) as any;

function unzip(src: string, dest: string, cb?: ProgressCallback) {
  return new Promise<ProgressData>(async resolve => {
    const zip = await yauzlOpen(src, { lazyEntries: true });
    const outputDir = ndPath.parse(src).name;

    let done = 0;

    zip.on('entry', async (entry: Entry) => {
      const path = ndPath.join(dest, outputDir, entry.fileName);
      const data: ProgressData = {
        path,
        totalItems: zip.entryCount,
        completedItems: done,
        totalSize: entry.uncompressedSize,
        completedSize: 0,
        done: false
      };

      if (path.endsWith(ndPath.sep)) {
        await makeDir(path);
        done += 1;
        data.completedItems = done;
        zip.readEntry();
        return;
      }

      await makeDir(ndPath.dirname(path));

      zip.openReadStream(entry, (err, readStream) => {
        if (err || !readStream) throw err;

        const filter = new Transform() as Transform2;
        const writeStream = fs.createWriteStream(path);

        writeStream.on('close', () => {
          done += 1;
          data.completedItems = done;
          data.done = true;
          if (done === zip.entryCount) {
            if (cb) cb(data);
            resolve(data);
          }
        });

        filter._transform = (chunk, encoding, callback) => {
          data.completedSize += chunk.length;
          callback(undefined, chunk);
          if (cb) cb(data);
        };

        filter._flush = callback => {
          callback();
          zip.readEntry();
        };

        readStream.pipe(filter).pipe(writeStream);
      });
    });

    zip.readEntry();
  });
}

module.exports = async (
  src: string | string[],
  dest: string,
  cb?: ProgressCallback
) => {
  const paths = src instanceof Array ? src : [src];
  const promises = paths.map(path => unzip(path, dest, cb));
  const data = await Promise.all(promises);
  return src instanceof Array ? data : data[0];
};

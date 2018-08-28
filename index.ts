import fs from 'fs';
import makeDir from 'make-dir';
import ndPath from 'path';
import { Transform } from 'stream';
import { promisify } from 'util';
import yauzl, { Entry } from 'yauzl';

// @types/node@8.x.x appears a little wrong
export type Transform2 = Transform & {
  _flush(callback: Function): void;
};

export type TInfo = {
  path: string;
  totalCount: number;
  doneCount: number;
  byte: number;
  totalBytes: number;
  done: boolean;
};

export type TCallback = (info: TInfo) => void;

// for promisify yauzl.open
export type TYauzlOpen = {
  (path: string, options: yauzl.Options): yauzl.ZipFile;
};

const yauzlOpen: TYauzlOpen = promisify(yauzl.open) as any;

function unzip(path: string, dest: string, cb?: TCallback) {
  return new Promise<TInfo>(async resolve => {
    const zip = await yauzlOpen(path, { lazyEntries: true });
    const outputDir = ndPath.parse(path).name;

    let done = 0;

    zip.on('entry', async (entry: Entry) => {
      const path = ndPath.join(dest, outputDir, entry.fileName);
      const info: TInfo = {
        path,
        totalCount: zip.entryCount,
        doneCount: done,
        byte: 0,
        totalBytes: entry.uncompressedSize,
        done: false
      };

      if (path.endsWith('/')) {
        await makeDir(path);
        done += 1;
        info.doneCount = done;
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
          info.doneCount = done;
          info.done = true;
          if (done === zip.entryCount) {
            cb && cb(info);
            resolve(info);
          }
        });

        filter._transform = (chunk, encoding, callback) => {
          info.byte += chunk.length;
          callback(undefined, chunk);
          cb && cb(info);
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

export default (paths: string[], dest: string, cb?: TCallback) => {
  const promises = paths.map(path => unzip(path, dest, cb));
  return Promise.all(promises);
};

import ndPath from 'path';
import { some } from 'raku2-exists';

import { Options, ProgressCallback, ProgressData } from '../index.d';

import { extract } from './lib';

type Src = string | string[];

async function unzip(
  src: Src,
  dest: string,
  options: Options,
  cb: ProgressCallback
): Promise<ProgressData>;

async function unzip(
  src: Src,
  dest: string,
  options: Options
): Promise<ProgressData>;

async function unzip(
  src: Src,
  dest: string,
  cb: ProgressCallback
): Promise<ProgressData>;

async function unzip(src: Src, dest: string): Promise<ProgressData>;

async function unzip(src: Src, dest: string, ...args: any[]) {
  let options: Options | undefined;
  let cb: ProgressCallback | undefined;

  if (args.length === 2) {
    options = args[0];
    cb = args[1];
  } else if (typeof args[0] === 'object') {
    options = args[0];
  } else if (typeof args[0] === 'function') {
    cb = args[0];
  }

  const { cwd, overwrite } = { cwd: '.', overwrite: true, ...options };
  const absDest = ndPath.resolve(cwd, dest);
  const sources = src instanceof Array ? src : [src];

  const iterable = sources.map(async source => {
    const absSrc = ndPath.resolve(cwd, source);
    const { name } = ndPath.parse(source);
    const outputDir = ndPath.join(absDest, name);

    if (!overwrite && (await some(outputDir))) {
      return null;
    }

    return await extract(absSrc, outputDir, cb);
  });

  const data = await Promise.all(iterable);

  return src instanceof Array ? data : data[0];
}

module.exports = unzip;

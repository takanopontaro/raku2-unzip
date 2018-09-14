const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const del = require('del');
const fs = require('fs');
const mkdir = require('make-dir');
const path = require('path');
const { promisify } = require('util');

const unzip = require('..');
const { extract } = require('../dist/lib');

const writeFile = promisify(fs.writeFile);

chai.use(chaiAsPromised);

const assert = chai.assert;

async function touch(p) {
  await mkdir(path.dirname(p));
  await writeFile(p, '');
}

process.chdir(__dirname);

afterEach(async () => {
  await del('dest');
});

describe('lib', () => {
  it('extract', async () => {
    await extract('foo.zip', 'dest');
    assert.equal(true, fs.existsSync('dest/foo/1.txt'));
    assert.equal(true, fs.existsSync('dest/foo/a/2.txt'));
    assert.equal(true, fs.existsSync('dest/foo/a/empty-dir'));
    assert.equal(true, fs.existsSync('dest/foo/a/ディレクトリ/ファイル.txt'));
  });
});

describe('main', () => {
  it('unzip', async () => {
    await unzip(['foo.zip', 'bar.zip'], 'dest');
    assert.equal(true, fs.existsSync('dest/foo/foo/1.txt'));
    assert.equal(true, fs.existsSync('dest/bar/sample/1.txt'));
  });
});

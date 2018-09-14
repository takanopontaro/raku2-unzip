"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const make_dir_1 = __importDefault(require("make-dir"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const util_1 = require("util");
const yauzl_1 = __importDefault(require("yauzl"));
const yauzlOpen = util_1.promisify(yauzl_1.default.open);
function extract(src, dest, cb) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const zip = yield yauzlOpen(src, {
            lazyEntries: true,
            decodeStrings: false
        });
        let done = 0;
        zip.on('entry', (entry) => __awaiter(this, void 0, void 0, function* () {
            const path = path_1.default.join(dest, entry.fileName.toString());
            const data = {
                path,
                totalItems: zip.entryCount,
                completedItems: done,
                totalSize: entry.uncompressedSize,
                completedSize: 0,
                done: false
            };
            if (path.endsWith(path_1.default.sep)) {
                yield make_dir_1.default(path);
                done += 1;
                data.completedItems = done;
                zip.readEntry();
                return;
            }
            yield make_dir_1.default(path_1.default.dirname(path));
            zip.openReadStream(entry, (err, readStream) => {
                if (err || !readStream) {
                    throw err;
                }
                const filter = new stream_1.Transform();
                const writeStream = fs_1.default.createWriteStream(path);
                writeStream.on('close', () => {
                    done += 1;
                    data.completedItems = done;
                    data.done = true;
                    if (done === zip.entryCount) {
                        if (cb) {
                            cb(data);
                        }
                        resolve(data);
                    }
                });
                filter._transform = (chunk, encoding, callback) => {
                    data.completedSize += chunk.length;
                    callback(undefined, chunk);
                    if (cb) {
                        cb(data);
                    }
                };
                filter._flush = callback => {
                    callback();
                    zip.readEntry();
                };
                readStream.pipe(filter).pipe(writeStream);
            });
        }));
        zip.readEntry();
    }));
}
exports.extract = extract;

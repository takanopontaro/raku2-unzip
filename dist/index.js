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
const path_1 = __importDefault(require("path"));
const raku2_exists_1 = require("raku2-exists");
const lib_1 = require("./lib");
function unzip(src, dest, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        let options;
        let cb;
        if (args.length === 2) {
            options = args[0];
            cb = args[1];
        }
        else if (typeof args[0] === 'object') {
            options = args[0];
        }
        else if (typeof args[0] === 'function') {
            cb = args[0];
        }
        const { cwd, overwrite } = Object.assign({ cwd: '.', overwrite: true }, options);
        const absDest = path_1.default.resolve(cwd, dest);
        const sources = src instanceof Array ? src : [src];
        const iterable = sources.map((source) => __awaiter(this, void 0, void 0, function* () {
            const absSrc = path_1.default.resolve(cwd, source);
            const { name } = path_1.default.parse(source);
            const outputDir = path_1.default.join(absDest, name);
            if (!overwrite && (yield raku2_exists_1.some(outputDir))) {
                return null;
            }
            return yield lib_1.extract(absSrc, outputDir, cb);
        }));
        const data = yield Promise.all(iterable);
        return src instanceof Array ? data : data[0];
    });
}
module.exports = unzip;

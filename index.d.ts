/// <reference types="node" />
import { Transform } from 'stream';
import yauzl from 'yauzl';
export declare type Transform2 = Transform & {
    _flush(callback: Function): void;
};
export declare type TInfo = {
    path: string;
    totalCount: number;
    doneCount: number;
    byte: number;
    totalBytes: number;
    done: boolean;
};
export declare type TCallback = (info: TInfo) => void;
export declare type TYauzlOpen = {
    (path: string, options: yauzl.Options): yauzl.ZipFile;
};
declare const _default: (paths: string[], dest: string, cb?: TCallback | undefined) => Promise<TInfo[]>;
export default _default;

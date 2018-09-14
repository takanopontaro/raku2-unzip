declare function Raku2Unzip<T extends string | string[]>(
  src: T,
  dest: string,
  options: Raku2Unzip.Options,
  cb: Raku2Unzip.ProgressCallback
): T extends string
  ? Promise<Raku2Unzip.ProgressData>
  : Promise<Raku2Unzip.ProgressData[]>;

declare function Raku2Unzip<T extends string | string[]>(
  src: T,
  dest: string,
  options: Raku2Unzip.Options
): T extends string
  ? Promise<Raku2Unzip.ProgressData>
  : Promise<Raku2Unzip.ProgressData[]>;

declare function Raku2Unzip<T extends string | string[]>(
  src: T,
  dest: string,
  cb: Raku2Unzip.ProgressCallback
): T extends string
  ? Promise<Raku2Unzip.ProgressData>
  : Promise<Raku2Unzip.ProgressData[]>;

declare function Raku2Unzip<T extends string | string[]>(
  src: T,
  dest: string
): T extends string
  ? Promise<Raku2Unzip.ProgressData>
  : Promise<Raku2Unzip.ProgressData[]>;

declare namespace Raku2Unzip {
  type Options = {
    cwd?: string;
    overwrite?: boolean;
  };

  type ProgressData = {
    path: string;
    totalItems: number;
    completedItems: number;
    totalSize: number;
    completedSize: number;
    done: boolean;
  };

  type ProgressCallback = (data: ProgressData) => void;
}

export = Raku2Unzip;

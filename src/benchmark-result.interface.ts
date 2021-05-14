export enum Compression {
  brotli = "brotli",
  gzip = "gzip",
  deflate = "deflate",
  none = "none",
}

export interface IRawBenchmarkResult {
  key: string;
  rawDocumentSize: number;
  compression: Compression;
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  uploadTimeMs: number;
  downloadTimeMs: number;
}

export interface IAggregatedResult {
  mean: number;
  standardDeviation: number;
  confidence95: number;
}

export interface IBenchmarkResult {
  key: string;
  rawDocumentSize: number;
  compression: Compression;
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  uploadTimeMs: IAggregatedResult;
  downloadTimeMs: IAggregatedResult;
}

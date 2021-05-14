export enum Compression {
  brotli = "brotli",
  gzip = "gzip",
  deflate = "deflate",
}

export interface IBenchmarkResult {
  key: string;
  rawDocumentSize: number;
  compression: Compression;
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  uploadTimeMs: number;
  downloadTimeMs: number;
  rawUploadTimeMs: number;
  rawDownloadTimeMs: number;
  uploadTimeSavingPercentage: number;
  downloadTimeSavingPercentage: number;
}

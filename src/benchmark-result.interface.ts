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
  compressionTimeMs: number;
  decompressionTimeMs: number;
}

export interface IAggregatedResult {
  mean: number;
  standardDeviation: number;
  confidence95: number;
}

export interface IBenchmarkResultForCompression {
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  uploadTimeMs: IAggregatedResult;
  downloadTimeMs: IAggregatedResult;
  compressionTimeMs: IAggregatedResult;
  decompressionTimeMs: IAggregatedResult;
  totalSetValueTimeMs: IAggregatedResult;
  totalGetValueTimeMs: IAggregatedResult;
}

export interface IBenchmarkResult {
  key: string;
  rawDocumentSize: number;
  [Compression.brotli]: IBenchmarkResultForCompression;
  [Compression.none]: IBenchmarkResultForCompression;
  [Compression.gzip]: IBenchmarkResultForCompression;
  [Compression.deflate]: IBenchmarkResultForCompression;
}

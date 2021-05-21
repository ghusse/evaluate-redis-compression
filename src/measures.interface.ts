export enum Measures {
  uploadTimeMs = "uploadTimeMs",
  compressionTimeMs = "compressionTimeMs",
  serializationTimeMs = "serializationTimeMs",
  downloadTimeMs = "downloadTimeMs",
  decompressionTimeMs = "decompressionTimeMs",
  deserializationTimeMs = "deserializationTimeMs",
  totalGetValueMs = "totalGetValueMs",
  totalSetValueMs = "totalSetValueMs",
}

export interface SetMeasures<TMeasure> {
  [Measures.uploadTimeMs]: TMeasure;
  [Measures.compressionTimeMs]: TMeasure;
  [Measures.serializationTimeMs]: TMeasure;
}

export interface GetMeasures<TMeasure> {
  [Measures.downloadTimeMs]: TMeasure;
  [Measures.decompressionTimeMs]: TMeasure;
  [Measures.deserializationTimeMs]: TMeasure;
}

export type BenchmarkMeasure<TMeasure> = GetMeasures<TMeasure> &
  SetMeasures<TMeasure> & {
    [Measures.totalGetValueMs]: TMeasure;
    [Measures.totalSetValueMs]: TMeasure;
  };

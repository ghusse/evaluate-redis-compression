import { BenchmarkMeasure } from "./measures.interface";
import { Strategy } from "./strategies/strategy.interface";

export interface IRawBenchmarkResult {
  key: string;
  rawDocumentSize: number;
  strategy: Strategy;
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  measures: BenchmarkMeasure<number>;
}

export interface IAggregatedResult {
  mean: number;
  standardDeviation: number;
  confidence95: number;
}

export interface IBenchmarkResultForStrategy {
  strategy: Strategy;
  documentSizeWithCompression: number;
  dataSavingPercentage: number;
  measures: BenchmarkMeasure<IAggregatedResult>;
}

export interface IBenchmarkResult {
  key: string;
  rawDocumentSize: number;

  results: IBenchmarkResultForStrategy[];
}

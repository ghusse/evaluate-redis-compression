import { GetMeasures, SetMeasures } from "../measures.interface";

export interface StrategySetResult {
  documentSize: number;
  measures: SetMeasures<number>;
}

export interface StrategyGetResult {
  extractedDocument: Record<string, unknown>;
  measures: GetMeasures<number>;
}

export interface Strategy {
  readonly name: string;

  setValue(
    key: string,
    jsonObject: Record<string, unknown>,
    expiryMs: number
  ): Promise<StrategySetResult>;
  getValue(key: string): Promise<StrategyGetResult>;
}

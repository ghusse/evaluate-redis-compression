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
  ): Promise<StrategySetResult | undefined>;
  getValue(key: string): Promise<StrategyGetResult | undefined>;
}

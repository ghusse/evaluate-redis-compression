import { measure, measureSync } from "../measure";
import { RedisGetString, RedisSetString } from "../redis.interface";
import {
  Strategy,
  StrategyGetResult,
  StrategySetResult,
} from "./strategy.interface";

export class NoneStrategy implements Strategy {
  readonly name: string;

  constructor(
    private readonly redisStringGetAsync: RedisGetString,
    private readonly redisStringSetAsync: RedisSetString
  ) {
    this.name = "none";
  }

  async setValue(
    key: string,
    jsonObject: Record<string, unknown>,
    expiryMs: number
  ): Promise<StrategySetResult> {
    const [serialized, serializationTimeMs] = measureSync(() =>
      JSON.stringify(jsonObject)
    );

    const documentSize = Buffer.from(serialized, "utf-8").length;

    const [, uploadTimeMs] = await measure(
      async () =>
        await this.redisStringSetAsync(key, serialized, "PX", expiryMs)
    );

    return {
      documentSize,
      measures: {
        serializationTimeMs,
        compressionTimeMs: 0,
        uploadTimeMs,
      },
    };
  }

  async getValue(key: string): Promise<StrategyGetResult> {
    const [serialized, downloadTimeMs] = await measure(async () =>
      this.redisStringGetAsync(key)
    );

    if (!serialized) {
      throw new Error("Unable to retrieved the key " + key);
    }

    const [result, deserializationTimeMs] = measureSync(() =>
      JSON.parse(serialized)
    );

    return {
      extractedDocument: result,
      measures: {
        downloadTimeMs,
        decompressionTimeMs: 0,
        deserializationTimeMs,
      },
    };
  }
}

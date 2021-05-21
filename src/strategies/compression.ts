import { measure, measureSync } from "../measure";
import { RedisGetBuffer, RedisSetBuffer } from "../redis.interface";
import {
  Strategy,
  StrategyGetResult,
  StrategySetResult,
} from "./strategy.interface";

export class Compression implements Strategy {
  constructor(
    public readonly name: string,
    private readonly compress: (value: string) => Promise<Buffer>,
    private readonly decompress: (value: Buffer) => Promise<Buffer>,
    private readonly redisGetBuffer: RedisGetBuffer,
    private readonly redisSetBuffer: RedisSetBuffer
  ) {}

  async setValue(
    key: string,
    jsonObject: Record<string, unknown>,
    expiryMs: number
  ): Promise<StrategySetResult> {
    const [serialized, serializationTimeMs] = measureSync(() =>
      JSON.stringify(jsonObject)
    );

    const [compressed, compressionTimeMs] = await measure(async () =>
      this.compress(serialized)
    );

    const [, uploadTimeMs] = await measure(async () =>
      this.redisSetBuffer(key, compressed, "PX", expiryMs)
    );

    return {
      documentSize: compressed.length,
      measures: {
        compressionTimeMs,
        serializationTimeMs,
        uploadTimeMs,
      },
    };
  }

  async getValue(key: string): Promise<StrategyGetResult> {
    const [compressed, downloadTimeMs] = await measure(async () =>
      this.redisGetBuffer(key)
    );

    if (!compressed) {
      throw new Error("Unable to retrieved the key " + key);
    }

    const [serialized, decompressionTimeMs] = await measure(async () =>
      this.decompress(compressed)
    );

    const [result, deserializationTimeMs] = measureSync(() =>
      JSON.parse(serialized.toString("utf-8"))
    );

    return {
      extractedDocument: result,
      measures: {
        downloadTimeMs,
        decompressionTimeMs,
        deserializationTimeMs,
      },
    };
  }
}

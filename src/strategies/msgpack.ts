import msgpack from "msgpack";
import { measure, measureSync } from "../measure";
import { RedisGetBuffer, RedisSetBuffer } from "../redis.interface";

import {
  Strategy,
  StrategyGetResult,
  StrategySetResult,
} from "./strategy.interface";

export class MsgPack implements Strategy {
  readonly name: string;

  constructor(
    private readonly redisGetBuffer: RedisGetBuffer,
    private readonly redisSetBuffer: RedisSetBuffer
  ) {
    this.name = "msgPack";
  }

  async setValue(
    key: string,
    jsonObject: Record<string, unknown>,
    expiryMs: number
  ): Promise<StrategySetResult> {
    const [packed, serializationTimeMs] = await measureSync(
      () => msgpack.pack(jsonObject) as Buffer | false
    );

    if (!packed) {
      throw new Error("Unable to apply pack");
    }

    const [, uploadTimeMs] = await measure(async () =>
      this.redisSetBuffer(key, packed, "PX", expiryMs)
    );

    return {
      documentSize: packed.length,
      measures: {
        compressionTimeMs: 0,
        serializationTimeMs,
        uploadTimeMs,
      },
    };
  }

  async getValue(key: string): Promise<StrategyGetResult> {
    const [packed, downloadTimeMs] = await measure(async () =>
      this.redisGetBuffer(key)
    );

    if (!packed) {
      throw new Error("Unable to retrieve the key " + key);
    }

    const [extractedDocument, deserializationTimeMs] = measureSync(() =>
      msgpack.unpack(packed)
    );

    return {
      extractedDocument,
      measures: {
        decompressionTimeMs: 0,
        deserializationTimeMs,
        downloadTimeMs,
      },
    };
  }
}

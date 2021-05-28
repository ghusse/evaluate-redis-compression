import { measure, measureSync } from "../measure";
import { RedisGetBuffer, RedisSetBuffer } from "../redis.interface";

import {
  Strategy,
  StrategyGetResult,
  StrategySetResult,
} from "./strategy.interface";

export class MsgPack implements Strategy {
  readonly name: string;
  readonly msgpack;

  constructor(
    private readonly redisGetBuffer: RedisGetBuffer,
    private readonly redisSetBuffer: RedisSetBuffer
  ) {
    this.name = "msgPack";

    try {
      this.msgpack = require("msgpack");
    } catch (e) {
      // msgpack not installed
    }
  }

  async setValue(
    key: string,
    jsonObject: Record<string, unknown>,
    expiryMs: number
  ): Promise<StrategySetResult | undefined> {
    if (!this.msgpack) {
      return undefined;
    }

    const [packed, serializationTimeMs] = await measureSync(
      () => this.msgpack.pack(jsonObject) as Buffer | false
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

  async getValue(key: string): Promise<StrategyGetResult | undefined> {
    if (!this.msgpack) {
      return undefined;
    }

    const [packed, downloadTimeMs] = await measure(async () =>
      this.redisGetBuffer(key)
    );

    if (!packed) {
      throw new Error("Unable to retrieve the key " + key);
    }

    const [extractedDocument, deserializationTimeMs] = measureSync(() =>
      this.msgpack.unpack(packed)
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

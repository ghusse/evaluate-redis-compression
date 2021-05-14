import { IOptions } from "./options.interface";
import { RedisClient } from "redis";
import { promisify } from "util";
import { Compression, IBenchmarkResult } from "./benchmark-result.interface";
import { measure } from "./measure";
import {
  brotliCompress,
  brotliDecompress,
  deflate,
  gunzip,
  gzip,
  inflate,
} from "zlib";

const brotliCompressAsync = promisify(brotliCompress);
const deflateAsync = promisify(deflate);
const gzipAsync = promisify(gzip);
const brotliDecompressAsync = promisify(brotliDecompress);
const inflateAsync = promisify(inflate);
const gunzipAsync = promisify(gunzip);

const REDIS_KEY = "evaluate-redis-compression";
const EXPIRY_MS = 60_000;

function getCompressAsync(
  compression: Compression
): (value: string) => Promise<Buffer> {
  switch (compression) {
    case Compression.brotli:
      return brotliCompressAsync;
    case Compression.deflate:
      return deflateAsync;
    case Compression.gzip:
      return gzipAsync;
    default:
      throw new Error(`Unknow compression ${compression}`);
  }
}

function getDecompressAsync(
  compression: Compression
): (value: Buffer) => Promise<Buffer> {
  switch (compression) {
    case Compression.brotli:
      return brotliDecompressAsync;
    case Compression.deflate:
      return inflateAsync;
    case Compression.gzip:
      return gunzipAsync;
    default:
      throw new Error(`Unknown compression ${compression}`);
  }
}

export class Benchmark {
  private readonly redisStringKeyAsync: (pattern: string) => Promise<string[]>;
  private readonly redisStringGetAsync: (key: string) => Promise<string | null>;
  private readonly redisBufferGetAsync: (key: string) => Promise<Buffer | null>;
  private readonly redisStringSetAsync: (
    key: string,
    value: string,
    mode: string,
    duration: number
  ) => Promise<unknown>;
  private readonly redisBufferSetAsync: (
    key: string,
    value: Buffer,
    mode: string,
    duration: number
  ) => Promise<unknown>;

  constructor(
    private readonly redisClientBuffer: RedisClient,
    private readonly redisClientString: RedisClient
  ) {
    this.redisStringKeyAsync = promisify(this.redisClientString.keys).bind(
      this.redisClientString
    );
    this.redisStringGetAsync = promisify(this.redisClientString.get).bind(
      this.redisClientString
    );
    this.redisStringSetAsync = promisify(this.redisClientString.set).bind(
      this.redisClientString
    );
    this.redisBufferSetAsync = promisify(this.redisClientBuffer.set).bind(
      this.redisClientString
    ) as never;
    this.redisBufferGetAsync = promisify(this.redisClientBuffer.get).bind(
      this.redisClientBuffer
    ) as never;
  }

  async run(options: IOptions): Promise<IBenchmarkResult[]> {
    const allKeys = await this.redisStringKeyAsync(options.redisKeyPattern);

    const benchMarks = [];

    console.info(`Found ${allKeys.length} keys matching the pattern`);

    for (let i = 0; i < allKeys.length; i++) {
      const results = await this.runForKey(allKeys[i]);
      benchMarks.push(...results);
    }

    return benchMarks;
  }

  private async runForKey(key: string): Promise<IBenchmarkResult[]> {
    const compressions = Object.values(Compression);
    const results = [];

    for (let i = 0; i < compressions.length; i++) {
      const rawResult = await this.redisStringGetAsync(key);

      if (rawResult) {
        const { rawUploadTimeMs } = await this.setRawValue(rawResult);
        const { rawDownloadTimeMs } = await this.getRawValue();

        const result = await this.runForKeyAndCompression(
          key,
          compressions[i],
          rawResult,
          {
            rawUploadTimeMs,
            rawDownloadTimeMs,
          }
        );
        console.log(result);
        results.push(result);
      }
    }

    return results;
  }

  private async runForKeyAndCompression(
    key: string,
    compression: Compression,
    rawContent: string,
    rawResults: { rawUploadTimeMs: number; rawDownloadTimeMs: number }
  ): Promise<IBenchmarkResult> {
    const rawDocumentSize = Buffer.from(rawContent).length;
    const { uploadTimeMs, documentSize } = await this.setValue(
      rawContent,
      compression
    );

    const { downloadTimeMs, extractedDocument } = await this.getValue(
      compression
    );

    if (extractedDocument !== rawContent) {
      throw new Error(
        `Documents are not identical: ${key}, compression: ${compression}`
      );
    }

    return {
      key,
      ...rawResults,
      rawDocumentSize,
      documentSizeWithCompression: documentSize,
      compression,
      uploadTimeMs,
      downloadTimeMs,
      dataSavingPercentage: 100 * (1 - documentSize / rawDocumentSize),
      downloadTimeSavingPercentage:
        100 * (1 - downloadTimeMs / rawResults.rawDownloadTimeMs),
      uploadTimeSavingPercentage:
        100 * (1 - uploadTimeMs / rawResults.rawUploadTimeMs),
    };
  }

  private async setValue(
    rawContent: string,
    compression: Compression
  ): Promise<{ uploadTimeMs: number; documentSize: number }> {
    const compressAsync = getCompressAsync(compression);

    const [documentSize, uploadTimeMs] = await measure(async () => {
      const compressed = await compressAsync(rawContent);
      await this.redisBufferSetAsync(REDIS_KEY, compressed, "PX", EXPIRY_MS);

      return compressed.length;
    });
    return { uploadTimeMs, documentSize };
  }

  private async setRawValue(
    rawContent: string
  ): Promise<{ rawUploadTimeMs: number }> {
    const [, rawUploadTimeMs] = await measure(async () => {
      await this.redisStringSetAsync(REDIS_KEY, rawContent, "PX", EXPIRY_MS);
    });
    return { rawUploadTimeMs };
  }

  private async getValue(
    compression: Compression
  ): Promise<{ downloadTimeMs: number; extractedDocument: string | null }> {
    const decompressAsync = getDecompressAsync(compression);

    const [extractedDocument, downloadTimeMs] = await measure(async () => {
      const compressed = await this.redisBufferGetAsync(REDIS_KEY);
      const extractedDocument = compressed
        ? (await decompressAsync(compressed)).toString("utf-8")
        : null;

      return extractedDocument;
    });

    return { extractedDocument, downloadTimeMs };
  }

  private async getRawValue(): Promise<{ rawDownloadTimeMs: number }> {
    const [, rawDownloadTimeMs] = await measure(async () => {
      return this.redisStringGetAsync(REDIS_KEY);
    });

    return { rawDownloadTimeMs };
  }
}

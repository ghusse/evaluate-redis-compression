import { IOptions } from "./options.interface";
import { RedisClient } from "redis";
import { promisify } from "util";
import {
  Compression,
  IAggregatedResult,
  IBenchmarkResult,
  IRawBenchmarkResult,
} from "./benchmark-result.interface";
import { measure } from "./measure";
import {
  brotliCompress,
  brotliDecompress,
  deflate,
  gunzip,
  gzip,
  inflate,
} from "zlib";
import { shuffle } from "./shuffle";

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

function aggregate(values: number[]): IAggregatedResult {
  if (!values.length) {
    return {
      mean: Number.NaN,
      standardDeviation: Number.NaN,
      confidence95: Number.NaN,
    };
  }

  const mean = values.reduce((a, b) => a + b, 0);
  const standardDeviation = Math.sqrt(
    values.map((value) => Math.pow(value - mean, 2)).reduce((a, b) => a + b, 0)
  );

  return {
    mean,
    standardDeviation,
    confidence95: 1.96 * standardDeviation,
  };
}

function aggregateResults(results: IRawBenchmarkResult[]): IBenchmarkResult {
  return {
    key: results[0].key,
    compression: results[0].compression,
    dataSavingPercentage: results[0].dataSavingPercentage,
    documentSizeWithCompression: results[0].documentSizeWithCompression,
    rawDocumentSize: results[0].rawDocumentSize,
    downloadTimeMs: aggregate(results.map((result) => result.downloadTimeMs)),
    uploadTimeMs: aggregate(results.map((result) => result.uploadTimeMs)),
  };
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
  private readonly rawContentCache = new Map<string, string>();

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
    const { results, keys } = await this.measure(options);

    const aggregatedResults = keys
      .map((key) =>
        Object.values(Compression).map((compression) =>
          aggregateResults(
            results.filter(
              (result) =>
                result.key === key && result.compression === compression
            )
          )
        )
      )
      .flat();

    return aggregatedResults;
  }

  private async measure(
    options: IOptions
  ): Promise<{ results: IRawBenchmarkResult[]; keys: string[] }> {
    const allKeys = await this.redisStringKeyAsync(options.redisKeyPattern);

    const benchMarks = [];

    const runs = new Array(options.runs).fill(undefined);

    console.info(`Found ${allKeys.length} keys matching the pattern`);

    const selectedKeys = shuffle(allKeys).slice(0, options.limit);

    console.info(
      `Running ${options.runs} runs on ${selectedKeys.length} keys and all algorithm`
    );

    const runDefinitions: Array<{ compression: Compression; key: string }> =
      shuffle(
        selectedKeys
          .map((key) =>
            Object.values(Compression)
              .map((compression) =>
                runs.map(() => ({
                  compression,
                  key,
                }))
              )
              .flat()
          )
          .flat()
          .map(({ compression, key }) => ({ compression, key }))
      );

    for (let i = 0; i < runDefinitions.length; i++) {
      console.info(`Running measure ${i + 1}/${runDefinitions.length}`);

      const definition = runDefinitions[i];
      const rawContent = await this.getRawContent(definition.key);

      const result = await this.runForKeyAndCompression(
        definition.key,
        definition.compression,
        rawContent
      );
      benchMarks.push(result);
    }

    return { results: benchMarks, keys: selectedKeys };
  }

  private async getRawContent(key: string): Promise<string> {
    if (this.rawContentCache.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.rawContentCache.get(key)!;
    }

    const rawResult = await this.redisStringGetAsync(key);

    if (rawResult === null) {
      throw new Error(`Key not found ${key}`);
    }

    this.rawContentCache.set(key, rawResult);

    return rawResult;
  }

  private async runForKeyAndCompression(
    key: string,
    compression: Compression,
    rawContent: string
  ): Promise<IRawBenchmarkResult> {
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
      rawDocumentSize,
      documentSizeWithCompression: documentSize,
      compression,
      uploadTimeMs,
      downloadTimeMs,
      dataSavingPercentage: 100 * (1 - documentSize / rawDocumentSize),
    };
  }

  private async setValue(
    rawContent: string,
    compression: Compression
  ): Promise<{ uploadTimeMs: number; documentSize: number }> {
    if (compression === Compression.none) {
      return this.setRawValue(rawContent);
    }
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
  ): Promise<{ uploadTimeMs: number; documentSize: number }> {
    const documentSize = Buffer.from(rawContent, "utf-8").length;

    const [, uploadTimeMs] = await measure(async () => {
      await this.redisStringSetAsync(REDIS_KEY, rawContent, "PX", EXPIRY_MS);
    });
    return { uploadTimeMs, documentSize };
  }

  private async getValue(
    compression: Compression
  ): Promise<{ downloadTimeMs: number; extractedDocument: string | null }> {
    if (compression === Compression.none) {
      return this.getRawValue();
    }
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

  private async getRawValue(): Promise<{
    downloadTimeMs: number;
    extractedDocument: string | null;
  }> {
    const [extractedDocument, downloadTimeMs] = await measure(async () => {
      return this.redisStringGetAsync(REDIS_KEY);
    });

    return { downloadTimeMs, extractedDocument };
  }
}

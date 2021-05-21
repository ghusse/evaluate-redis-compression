import { RedisClient } from "redis";
import { promisify } from "util";
import {
  brotliCompress,
  brotliDecompress,
  deflate,
  gunzip,
  gzip,
  inflate,
  constants,
} from "zlib";
import { Compression } from "./strategies/compression";
import { MsgPack } from "./strategies/msgpack";
import { NoneStrategy } from "./strategies/none";
import { Strategy } from "./strategies/strategy.interface";

const brotliCompressAsync = promisify(brotliCompress);
const deflateAsync = promisify(deflate);
const gzipAsync = promisify(gzip);
const brotliDecompressAsync = promisify(brotliDecompress);
const inflateAsync = promisify(inflate);
const gunzipAsync = promisify(gunzip);

function brotliCompressLevel(level: number) {
  return (value: string) =>
    brotliCompressAsync(value, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: level,
      },
    });
}

function gzipCompressLevel(level: number) {
  return (value: string) => gzipAsync(value, { level });
}

function deflateCompressLevel(level: number) {
  return (value: string) => deflateAsync(value, { level });
}

const MIN_GZIP_COMPRESSION_LEVEL = -1;
const MAX_GZIP_COMPRESSION_LEVEL = 9;
const MIN_DEFLATE_COMPRESSION_LEVEL = -1;
const MAX_DEFLATE_COMPRESSION_LEVEL = 9;

export class StrategiesGenerator {
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

  generateStrategies(): Strategy[] {
    return [
      new NoneStrategy(this.redisStringGetAsync, this.redisStringSetAsync),
      new MsgPack(this.redisBufferGetAsync, this.redisBufferSetAsync),
      ...new Array(MAX_GZIP_COMPRESSION_LEVEL - MIN_GZIP_COMPRESSION_LEVEL + 1)
        .fill(undefined)
        .map((_, index) => index + MIN_GZIP_COMPRESSION_LEVEL)
        .map(
          (compressionLevel) =>
            new Compression(
              `gzip${compressionLevel}`,
              gzipCompressLevel(compressionLevel),
              gunzipAsync,
              this.redisBufferGetAsync,
              this.redisBufferSetAsync
            )
        ),
      ...new Array(
        MAX_DEFLATE_COMPRESSION_LEVEL - MIN_DEFLATE_COMPRESSION_LEVEL + 1
      )
        .fill(undefined)
        .map((_, index) => index + MIN_DEFLATE_COMPRESSION_LEVEL)
        .map(
          (compressionLevel) =>
            new Compression(
              `deflate${compressionLevel}`,
              deflateCompressLevel(compressionLevel),
              inflateAsync,
              this.redisBufferGetAsync,
              this.redisBufferSetAsync
            )
        ),
      ...new Array(
        constants.BROTLI_MAX_QUALITY - constants.BROTLI_MIN_QUALITY + 1
      )
        .fill(undefined)
        .map((_, index) => index + constants.BROTLI_MIN_QUALITY)
        .map(
          (compressionLevel) =>
            new Compression(
              `brotli${compressionLevel}`,
              brotliCompressLevel(compressionLevel),
              brotliDecompressAsync,
              this.redisBufferGetAsync,
              this.redisBufferSetAsync
            )
        ),
    ];
  }
}

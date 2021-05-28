import { IOptions } from "./options.interface";
import { RedisClient } from "redis";
import { promisify } from "util";
import {
  IAggregatedResult,
  IBenchmarkResult,
  IBenchmarkResultForStrategy,
  IRawBenchmarkResult,
} from "./benchmark-result.interface";

import { shuffle } from "./shuffle";
import { StrategiesGenerator } from "./strategies-generator";
import { Strategy } from "./strategies/strategy.interface";
import assert from "assert";
import { Measures, BenchmarkMeasure } from "./measures.interface";

const REDIS_KEY = "evaluate-redis-compression";
const EXPIRY_MS = 60_000;

type JsonDocument = {
  document: Record<string, unknown>;
  size: number;
};

function aggregate(values: number[]): IAggregatedResult {
  if (!values.length) {
    return {
      mean: Number.NaN,
      standardDeviation: Number.NaN,
      confidence95: Number.NaN,
    };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const standardDeviation = Math.sqrt(
    values
      .map((value) => Math.pow(value - mean, 2))
      .reduce((a, b) => a + b, 0) / values.length
  );

  return {
    mean,
    standardDeviation,
    confidence95: 1.96 * standardDeviation,
  };
}

function aggregateForStrategy(
  strategy: Strategy,
  results: IRawBenchmarkResult[]
): IBenchmarkResultForStrategy {
  if (!results.length) {
    return { strategy };
  }

  return {
    strategy,
    dataSavingPercentage: results[0].dataSavingPercentage,
    documentSizeWithCompression: results[0].documentSizeWithCompression,
    measures: Object.values(Measures).reduce(
      (allMeasures, measureKey) => ({
        ...allMeasures,
        [measureKey]: aggregate(
          results.map((result) => result.measures[measureKey] as number)
        ),
      }),
      {}
    ) as BenchmarkMeasure<IAggregatedResult>,
  };
}

function aggregateResults(
  strategies: Strategy[],
  results: IRawBenchmarkResult[]
): IBenchmarkResult {
  return {
    key: results[0].key,
    rawDocumentSize: results[0].rawDocumentSize,
    results: strategies.map((strategy) =>
      aggregateForStrategy(
        strategy,
        results.filter((result) => result.strategy === strategy)
      )
    ),
  };
}

export class Benchmark {
  private readonly redisStringKeyAsync: (pattern: string) => Promise<string[]>;

  private readonly redisStringGetAsync: (key: string) => Promise<string | null>;

  private readonly rawContentCache = new Map<
    string,
    { document: Record<string, unknown>; size: number }
  >();

  constructor(
    private readonly redisClientString: RedisClient,
    private readonly strategiesGenerator: StrategiesGenerator
  ) {
    this.redisStringKeyAsync = promisify(this.redisClientString.keys).bind(
      this.redisClientString
    );
    this.redisStringGetAsync = promisify(this.redisClientString.get).bind(
      this.redisClientString
    );
  }

  async run(options: IOptions): Promise<IBenchmarkResult[]> {
    const strategies = this.strategiesGenerator.generateStrategies();

    const { results, keys } = await this.measure(strategies, options);

    const aggregatedResults = keys.map((key) =>
      aggregateResults(
        strategies,
        results.filter((result) => result.key === key)
      )
    );

    return aggregatedResults;
  }

  private async measure(
    strategies: Strategy[],
    options: IOptions
  ): Promise<{ results: IRawBenchmarkResult[]; keys: string[] }> {
    const allKeys = await this.redisStringKeyAsync(options.redisKeyPattern);

    const benchMarks: IRawBenchmarkResult[] = [];

    const runs = new Array(options.runs).fill(undefined);

    console.info(`Found ${allKeys.length} keys matching the pattern`);

    const selectedKeys = shuffle(allKeys).slice(0, options.limit);

    console.info(
      `Running ${options.runs} runs on ${selectedKeys.length} keys and all algorithm`
    );

    const runDefinitions: Array<{ strategy: Strategy; key: string }> = shuffle(
      selectedKeys
        .map((key) =>
          strategies
            .map((strategy) =>
              runs.map(() => ({
                strategy,
                key,
              }))
            )
            .flat()
        )
        .flat()
        .map(({ strategy, key }) => ({ strategy, key }))
    );

    for (let i = 0; i < runDefinitions.length; i++) {
      console.info(`Running measure ${i + 1}/${runDefinitions.length}`);

      const definition = runDefinitions[i];
      const jsonDocument = await this.getJsonDocument(definition.key);

      const result = await this.runForKeyAndStrategy(
        definition.key,
        definition.strategy,
        jsonDocument
      );

      if (result) {
        benchMarks.push(result);
      }
    }

    return { results: benchMarks, keys: selectedKeys };
  }

  private async getJsonDocument(key: string): Promise<JsonDocument> {
    if (this.rawContentCache.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.rawContentCache.get(key)!;
    }

    const rawResult = await this.redisStringGetAsync(key);

    if (rawResult === null) {
      throw new Error(`Key not found ${key}`);
    }

    const document = JSON.parse(rawResult) as Record<string, unknown>;
    const entry = { document, size: Buffer.from(rawResult, "utf-8").length };

    this.rawContentCache.set(key, entry);

    return entry;
  }

  private async runForKeyAndStrategy(
    key: string,
    strategy: Strategy,
    json: JsonDocument
  ): Promise<IRawBenchmarkResult | undefined> {
    // const rawDocumentSize = Buffer.from(rawContent).length;
    const setResult = await strategy.setValue(
      REDIS_KEY,
      json.document,
      EXPIRY_MS
    );

    const getResult = await strategy.getValue(REDIS_KEY);

    if (!getResult || !setResult) {
      return undefined;
    }

    assert.deepStrictEqual(
      getResult.extractedDocument,
      json.document,
      `Documents are not identical for key ${key} and strategy ${strategy.name}`
    );

    return {
      key,
      strategy,
      rawDocumentSize: json.size,
      documentSizeWithCompression: setResult.documentSize,
      dataSavingPercentage: 100 * (1 - setResult.documentSize / json.size),
      measures: {
        ...getResult.measures,
        ...setResult.measures,
        totalGetValueMs:
          getResult.measures[Measures.downloadTimeMs] +
          getResult.measures[Measures.decompressionTimeMs] +
          getResult.measures[Measures.deserializationTimeMs],
        totalSetValueMs:
          setResult.measures[Measures.serializationTimeMs] +
          setResult.measures[Measures.compressionTimeMs] +
          setResult.measures[Measures.uploadTimeMs],
      },
    };
  }
}

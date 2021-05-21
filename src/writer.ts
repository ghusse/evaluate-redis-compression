import stringify from "csv-stringify";
import { writeFile } from "fs";
import { promisify } from "util";
import { IBenchmarkResult } from "./benchmark-result.interface";
import { Measures } from "./measures.interface";
import { IOptions } from "./options.interface";

const stringifyAsync = promisify(stringify) as (
  input: stringify.Input,
  options?: stringify.Options
) => Promise<string>;

const writeFileAsync = promisify(writeFile);

function upperFirst(name: string): string {
  return `${name[0].toUpperCase()}${name.slice(1)}`;
}

export async function write(
  benchmarks: IBenchmarkResult[],
  options: IOptions
): Promise<void> {
  const lines = benchmarks.map((benchmark) => {
    const compressionResults: Record<string, number> = Object.values(
      benchmark.results
    )
      .map((benchmark) => ({
        [`${benchmark.strategy.name}DocSize`]:
          benchmark.documentSizeWithCompression,
        [`${benchmark.strategy.name}SizeSaving`]:
          benchmark.dataSavingPercentage,
        ...Object.values(Measures)
          .map((measure) => ({
            [`${benchmark.strategy.name}${upperFirst(measure)}Mean`]:
              benchmark.measures[measure].mean,
            [`${benchmark.strategy.name}${upperFirst(measure)}Std`]:
              benchmark.measures[measure].standardDeviation,
            [`${benchmark.strategy.name}${upperFirst(measure)}95`]:
              benchmark.measures[measure].confidence95,
          }))
          .reduce((agg, measures) => ({ ...agg, ...measures })),
      }))
      .reduce((accumulator, value) => ({ ...accumulator, ...value }), {});

    return {
      key: benchmark.key,
      rawDocumentSize: benchmark.rawDocumentSize,
      ...compressionResults,
    };
  });

  const csv = await stringifyAsync(lines, {
    header: true,
  });

  if (options.out) {
    await writeFileAsync(options.out, csv, {
      encoding: "utf-8",
      flag: "w",
    });
    console.info(`Result written in ${options.out}`);
  } else {
    console.info(csv);
  }
}

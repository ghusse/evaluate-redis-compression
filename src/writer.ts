import stringify from "csv-stringify";
import { writeFile } from "fs";
import { promisify } from "util";
import { Compression, IBenchmarkResult } from "./benchmark-result.interface";
import { IOptions } from "./options.interface";

const stringifyAsync = promisify(stringify) as (
  input: stringify.Input,
  options?: stringify.Options
) => Promise<string>;

const writeFileAsync = promisify(writeFile);

export async function write(
  benchmarks: IBenchmarkResult[],
  options: IOptions
): Promise<void> {
  const lines = benchmarks.map((b) => {
    const compressionResults = Object.values(Compression)
      .map((compression) => ({
        [`${compression}DocSize`]: b[compression].documentSizeWithCompression,
        [`${compression}SizeSaving`]: b[compression].dataSavingPercentage,
        [`${compression}UploadMean`]: b[compression].uploadTimeMs.mean,
        [`${compression}UploadStd`]:
          b[compression].uploadTimeMs.standardDeviation,
        [`${compression}Upload95`]: b[compression].uploadTimeMs.confidence95,
        [`${compression}DownloadMean`]: b[compression].downloadTimeMs.mean,
        [`${compression}DownloadStd`]:
          b[compression].downloadTimeMs.standardDeviation,
        [`${compression}Download95`]:
          b[compression].downloadTimeMs.confidence95,
      }))
      .reduce((accumulator, value) => ({ ...accumulator, ...value }), {});

    return {
      key: b.key,
      rawDocumentSize: b.rawDocumentSize,
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

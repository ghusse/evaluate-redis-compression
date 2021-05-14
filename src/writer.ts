import stringify from "csv-stringify";
import { writeFile } from "fs";
import { promisify } from "util";
import { IBenchmarkResult } from "./benchmark-result.interface";
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
  const lines = benchmarks.map((b) => ({
    key: b.key,
    rawDocumentSize: b.rawDocumentSize,
    compression: b.compression,
    documentSizeWithCompression: b.documentSizeWithCompression,
    dataSavingPercentage: b.dataSavingPercentage,
    uploadTimeMs: b.uploadTimeMs.mean,
    uploadTimeMsStandardDev: b.uploadTimeMs.standardDeviation,
    uploadTimeMsConfidence95: b.uploadTimeMs.confidence95,
    downloadTimeMs: b.downloadTimeMs.mean,
    downloadTimeMsStandardDev: b.downloadTimeMs.standardDeviation,
    downloadTimeMsConfidence95: b.downloadTimeMs.confidence95,
  }));
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

#!/usr/bin/env npx ts-node

import { Command } from "commander";
import packageJson from "../package.json";
import { IOptions } from "./options.interface";
import { Benchmark } from "./benchmark";
import { createClient } from "redis";
import { write } from "./writer";
import { StrategiesGenerator } from "./strategies-generator";

const program = new Command();

program
  .version(packageJson.version)
  .requiredOption("--redisUrl <string>", "Redis connection url")
  .requiredOption(
    "--redisKeyPattern <string>",
    "Redis key pattern to retrieve data from"
  )
  .option(
    "--runs <number>",
    "number of times each key must be tested",
    (value: string): number => {
      const parsed = +value;
      if (isNaN(parsed) || parsed <= 0 || Math.round(parsed) !== parsed) {
        throw new Error(`Runs must be a positive integer`);
      }
      return parsed;
    },
    30
  )
  .option(
    "--limit <number>",
    "max number of keys to use (randomly chosen)",
    (value: string): number => {
      const parsed = +value;
      if (isNaN(parsed) || parsed <= 0 || Math.round(parsed) !== parsed) {
        throw new Error(`Runs must be a positive integer`);
      }
      return parsed;
    },
    10
  )
  .option(
    "--out <string>",
    "csv file path where to write the result, default is in the console"
  )
  .action(async (options: IOptions) => {
    try {
      const redisClientBuffer = createClient(options.redisUrl, {
        return_buffers: true,
      });

      const redisClientString = createClient(options.redisUrl, {
        return_buffers: false,
      });

      const strategiesCreator = new StrategiesGenerator(
        redisClientBuffer,
        redisClientString
      );

      try {
        const benchmark = new Benchmark(redisClientString, strategiesCreator);

        const results = await benchmark.run(options);
        await write(results, options);
      } finally {
        redisClientBuffer.end(true);
        redisClientString.end(true);
      }
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

#!/usr/bin/env npx ts-node

import { Command } from "commander";
import packageJson from "../package.json";
import { IOptions } from "./options.interface";
import { Benchmark } from "./benchmark";
import { createClient } from "redis";

const program = new Command();

program
  .version(packageJson.version)
  .requiredOption("--redisUrl <string>", "Redis connection url")
  .requiredOption(
    "--redisKeyPattern <string>",
    "Redis key pattern to retrieve data from"
  )
  .action(async (options: IOptions) => {
    try {
      const redisClientBuffer = createClient(options.redisUrl, {
        return_buffers: true,
      });

      const redisClientString = createClient(options.redisUrl, {
        return_buffers: false,
      });

      try {
        const benchmark = new Benchmark(redisClientBuffer, redisClientString);

        await benchmark.run(options);
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

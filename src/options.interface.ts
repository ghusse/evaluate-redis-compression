export interface IOptions {
  redisUrl: string;
  redisKeyPattern: string;
  runs: number;
  out?: string;
  limit?: number;
}

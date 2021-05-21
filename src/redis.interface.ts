export type RedisSetBuffer = (
  key: string,
  value: Buffer,
  mode: string,
  duration: number
) => Promise<unknown>;

export type RedisSetString = (
  key: string,
  value: string,
  mode: string,
  duration: number
) => Promise<unknown>;

export type RedisGetString = (key: string) => Promise<string | null>;
export type RedisGetBuffer = (key: string) => Promise<Buffer | null>;

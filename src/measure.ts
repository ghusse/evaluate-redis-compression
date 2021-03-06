import { performance } from "perf_hooks";

export async function measure<T>(
  measured: () => Promise<T>
): Promise<[T, number]> {
  const before = performance.now();

  const result: T = await measured();

  const after = performance.now();

  return [result, after - before];
}

export function measureSync<T>(measured: () => T): [T, number] {
  const before = performance.now();

  const result: T = measured();

  const after = performance.now();

  return [result, after - before];
}

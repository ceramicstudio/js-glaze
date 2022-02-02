import type { StreamRef } from '@ceramicnetwork/streamid'

/** @internal */
export function streamIDToString(id: StreamRef | string): string {
  return typeof id === 'string' ? id : id.toString()
}

/** @internal */
export function applyMap<
  M extends Record<string, unknown>,
  V extends M[keyof M] = M[keyof M],
  R = unknown
>(inputs: M, callFunc: (input: V) => R): Record<keyof M, R> {
  return Object.entries(inputs).reduce((acc, [key, value]) => {
    acc[key as keyof M] = callFunc(value as V)
    return acc
  }, {} as Record<keyof M, R>)
}

/** @internal */
export async function promiseMap<
  M extends Record<string, unknown>,
  V extends M[keyof M] = M[keyof M],
  R = unknown
>(inputs: M, callFunc: (input: V) => Promise<R>): Promise<Record<keyof M, R>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const results = await Promise.all(Object.values(inputs).map((value) => callFunc(value as any)))
  return Object.keys(inputs).reduce((acc, key, i) => {
    acc[key as keyof M] = results[i]
    return acc
  }, {} as Record<keyof M, R>)
}

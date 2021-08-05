import { isAbsolute, dirname, resolve } from 'path'
import { ensureDir, readJSON, writeJSON } from 'fs-extra'

export function resolvePath(value: string): string {
  return isAbsolute(value) ? value : resolve(process.cwd(), value)
}

export async function read<T = any>(file: string): Promise<T> {
  return (await readJSON(resolvePath(file))) as T
}

export async function write(file: string, data: unknown): Promise<void> {
  const path = resolvePath(file)
  await ensureDir(dirname(path))
  await writeJSON(path, data)
}

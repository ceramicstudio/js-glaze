import { isAbsolute, dirname, resolve } from 'node:path'
import fs from 'fs-extra'

export function resolvePath(value: string): string {
  return isAbsolute(value) ? value : resolve(process.cwd(), value)
}

export async function read<T = any>(file: string): Promise<T> {
  return (await fs.readJSON(resolvePath(file))) as T
}

export async function write(file: string, data: unknown): Promise<void> {
  const path = resolvePath(file)
  await fs.ensureDir(dirname(path))
  await fs.writeJSON(path, data)
}

import type { byUser } from '@/core/constants'
import Path from 'path'
import db from './db'

/**
 * Run a function as sync
 * This will block the thread until the function is done
 * @param fn function to run
 * @returns the result
 */
export function runAsSync<T extends Promise<unknown>>(
  fn: () => T
): Awaited<T> {
  let done = false
  let result: Awaited<T> | null = null

  setTimeout(async () => {
    result = await fn()
    done = true
  })

  while (!done);
  return result as Awaited<T>
}

export function toSyncFunction<
  T extends (...args: any[]) => Promise<any>
>(fn: T): (...args: Parameters<T>) => Awaited<ReturnType<T>> {
  return (...args: Parameters<T>) => runAsSync(() => fn(...args))
}

export function hasPerm(perm: number, mode: number, by: byUser) {
  const modeStr = mode.toString(8).padStart(3, '0')
  const user = Number(modeStr[by])
  return (perm & user) === user
}
export function hash(str: string): string {
  let hash = 0
  str = String(str).padStart(6, '0')
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return (hash >>> 0).toString(16).slice(0, 6)
}

export async function getIndexID(
  path: string
): Promise<number | undefined> {
  const resolved = Path.parse(path)
  const index = await db.index
    .where({ name: resolved.name, dir: resolved.dir })
    .first()

  return index?.key ?? undefined
}

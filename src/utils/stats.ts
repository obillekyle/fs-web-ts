import db from './db'
import type { FsStats, FsPerm, FsIndex, Callback } from './types'
import { getIndexID, runAsSync } from './utils'
import Path from 'path'

export class Stats {
  private key: number
  private stat: FsStats | undefined
  private perm: FsPerm | undefined

  constructor(key: number) {
    this.key = key
    runAsSync(this.getStats.bind(this))
  }

  static async from(path: string) {
    const index = await getIndexID(path)

    if (!index) {
      throw new Error('Not found')
    }

    return new Stats(index)
  }

  private async getStats() {
    const item = await db.stats.get(this.key)
    const perm = await db.perm.get(this.key)

    if (!item || !perm) {
      throw new Error('Item not found')
    }

    this.stat = item
    this.perm = perm
  }

  get size() {
    return this.stat?.size ?? 0
  }

  get atime() {
    return this.stat?.atime ?? new Date(0)
  }

  get mtime() {
    return this.stat?.mtime ?? new Date(0)
  }

  get ctime() {
    return this.stat?.ctime ?? new Date(0)
  }

  get birthtime() {
    return this.stat?.birthtime ?? new Date(0)
  }

  isFile() {
    return this.stat?.type === 'file'
  }

  isDirectory() {
    return this.stat?.type === 'folder'
  }

  isSymbolicLink() {
    return this.stat?.type === 'symlink'
  }

  isBlockDevice() {
    return false
  }

  isCharacterDevice() {
    return false
  }

  isFIFO() {
    return false
  }

  get atimeMs() {
    return this.atime.getTime()
  }

  get mtimeMs() {
    return this.mtime.getTime()
  }

  get ctimeMs() {
    return this.ctime.getTime()
  }

  get birthtimeMs() {
    return this.birthtime.getTime()
  }

  get uid() {
    return this.perm?.uid ?? 0
  }

  get gid() {
    return this.perm?.gid ?? 0
  }

  get mode() {
    return this.perm?.mode ?? 0
  }
}

export class BigIntStats {
  private key: number
  private stat: FsStats | undefined
  private perm: FsPerm | undefined

  constructor(key: number) {
    this.key = key
    runAsSync(this.getStats.bind(this))
  }

  static async from(path: string) {
    const index = await getIndexID(path)

    if (!index) {
      throw new Error('Not found')
    }

    return new Stats(index)
  }

  private async getStats() {
    const item = await db.stats.get(this.key)
    const perm = await db.perm.get(this.key)

    if (!item || !perm) {
      throw new Error('Item not found')
    }

    this.stat = item
    this.perm = perm
  }

  get size() {
    return BigInt(this.stat?.size ?? 0)
  }

  get atime() {
    return this.stat?.atime ?? new Date()
  }

  get mtime() {
    return this.stat?.mtime ?? new Date()
  }

  get ctime() {
    return this.stat?.ctime ?? new Date()
  }

  get birthtime() {
    return this.stat?.birthtime ?? new Date()
  }

  get type() {
    return this.stat?.type ?? 'file'
  }

  isFile() {
    return this.type === 'file'
  }

  isDirectory() {
    return this.type === 'folder'
  }

  isSymbolicLink() {
    return this.type === 'symlink'
  }

  isBlockDevice() {
    return false
  }

  isCharacterDevice() {
    return false
  }

  isFIFO() {
    return false
  }

  get atimeMs() {
    return BigInt(this.atime.getTime())
  }

  get mtimeMs() {
    return BigInt(this.mtime.getTime())
  }

  get ctimeMs() {
    return BigInt(this.ctime.getTime())
  }

  get birthtimeMs() {
    return BigInt(this.birthtime.getTime())
  }

  get uid() {
    return this.perm?.uid ?? 0
  }

  get gid() {
    return this.perm?.gid ?? 0
  }

  get mode() {
    return this.perm?.mode ?? 0
  }
}

export interface StatsFsBase<T> {
  /** Type of file system. */
  type: T
  /**  Optimal transfer block size. */
  bsize: T
  /**  Total data blocks in file system. */
  blocks: T
  /** Free blocks in file system. */
  bfree: T
  /** Available blocks for unprivileged users */
  bavail: T
  /** Total file nodes in file system. */
  files: T
  /** Free file nodes in file system. */
  ffree: T
}

// idk man
export class StatsFs implements StatsFsBase<number> {
  get type() {
    return 0
  }

  get bsize() {
    return 1024
  }

  get blocks() {
    return Number.MAX_SAFE_INTEGER
  }

  get bfree() {
    return Number.MAX_SAFE_INTEGER
  }

  get bavail() {
    return Number.MAX_SAFE_INTEGER
  }

  get files() {
    return runAsSync(async () => {
      return await db.stats.count()
    })
  }

  get ffree() {
    return Number.MAX_SAFE_INTEGER
  }
}

export class BigIntStatsFs implements StatsFsBase<BigInt> {
  get type() {
    return BigInt(0)
  }

  get bsize() {
    return BigInt(1024)
  }

  get blocks() {
    return BigInt(Number.MAX_SAFE_INTEGER)
  }

  get bfree() {
    return BigInt(Number.MAX_SAFE_INTEGER)
  }

  get bavail() {
    return BigInt(Number.MAX_SAFE_INTEGER)
  }

  get files() {
    return runAsSync(async () => {
      return BigInt(await db.stats.count())
    })
  }

  get ffree() {
    return BigInt(Number.MAX_SAFE_INTEGER)
  }
}

export class Dirent {
  private key: number
  private item: FsIndex | undefined
  private stat: Stats | undefined

  constructor(key: number) {
    this.key = key
    runAsSync(this.getDirent.bind(this))
  }

  private async getDirent() {
    this.stat = new Stats(this.key)
    this.item = await db.index.get(this.key)
  }

  static async from(path: string) {
    const index = await getIndexID(path)
    if (!index) {
      throw new Error('Not found')
    }

    return new Dirent(index)
  }

  isFile() {
    return !!this.stat?.isFile()
  }

  isDirectory() {
    return !!this.stat?.isDirectory()
  }

  isBlockDevice() {
    return false
  }

  isCharacterDevice() {
    return false
  }

  isSymbolicLink() {
    return this.stat?.isSymbolicLink()
  }

  isFIFO() {
    return false
  }

  get name() {
    return this.item?.name ?? ''
  }

  get parentPath() {
    return this.item?.dir ?? '/'
  }

  get path() {
    return Path.join(this.parentPath, this.name)
  }
}

export class Dir implements AsyncIterable<Dirent> {
  private key: number
  private items: number[] = []
  private current: AsyncIterableIterator<Dirent> | undefined
  private item: FsIndex | undefined

  constructor(key: number) {
    this.key = key
    runAsSync(this.getDir.bind(this))
  }

  static async from(path: string) {
    const index = await getIndexID(path)
    if (!index) {
      throw new Error('Not found')
    }

    return new Dir(index)
  }

  private async getDir() {
    if (!new Stats(this.key).isDirectory()) {
      throw new Error('Not a directory')
    }

    this.item = await db.index.get(this.key)
  }

  close(): Promise<void>
  close(cb: Callback<[err?: any]>): void
  close(cb?: Callback<[err?: any]>) {
    this.items = []
    this.current = undefined
    return cb ? cb() : new Promise<void>(() => {})
  }

  closeSync(): void {
    this.items = []
    this.current = undefined
  }

  read(): Promise<Dirent | null>
  read(cb: Callback<[err: any, dirEnt: Dirent | null]>): void
  read(cb?: Callback<[err: any, dirEnt: Dirent | null]>) {
    if (this.current) {
      return this.current.next().then((result) => {
        if (result.done) {
          return cb
            ? cb(null, null)
            : new Promise((resolve) => resolve(null))
        }

        return cb
          ? cb(null, result.value)
          : new Promise((resolve) => resolve(result.value))
      })
    }

    this.current = this[Symbol.asyncIterator]()
    return this.current.next().then((result) => {
      if (result.done) {
        return cb
          ? cb(null, null)
          : new Promise((resolve) => resolve(null))
      }
    })
  }

  readSync() {
    return runAsSync(() => this.read())
  }

  async *[Symbol.asyncIterator]() {
    const items = await db.index
      .where('dir')
      .equals(Path.join(this.item!.dir, this.item!.name))
      .toArray()

    this.items = items.map((item) => item.key!)

    for (const item of this.items) {
      yield new Dirent(item)
    }
  }
}

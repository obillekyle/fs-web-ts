import promises from '@/promises'
import db from '@/utils/db'
import { FileHandle } from '@/utils/fileHandle'
import { getIndexID, hasPerm, runAsSync } from '@/utils/utils'
import type { Buffer } from 'buffer'
import {
  BigIntStats,
  BigIntStatsFs,
  Dir,
  Dirent,
  Stats,
  StatsFs
} from '../utils/stats'
import type { Callback, FSStatOptions, TimeLike } from '../utils/types'
import { byUser } from './constants'

export function access(
  path: string,
  mode?: number,
  callback?: Callback<[err?: any]>
): void
export function access(
  path: string,
  callback?: Callback<[err: any]>
): void
export function access(
  path: string,
  mode?: number | Callback<[err: any]>,
  callback?: Callback
) {
  if (typeof mode === 'function') {
    callback = mode
    mode = undefined
  }

  setTimeout(async () => {
    try {
      const index = await Stats.from(path)

      if (!index) {
        throw new Error('Not found')
      }

      if (hasPerm(mode ?? 7, index.mode, byUser.Owner)) {
        callback?.(null)
      } else {
        callback?.(new Error('Permission denied'))
      }
    } catch (err) {
      callback?.(err)
    }
  })
}

export function rename(
  oldPath: string,
  newPath: string,
  callback: Callback
) {
  setTimeout(async () => {
    try {
      await promises.rename(oldPath, newPath)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function renameSync(oldPath: string, newPath: string) {
  runAsSync(() => promises.rename(oldPath, newPath))
}

export function truncate(
  path: string,
  len: number | undefined,
  callback: Callback<[err: any]>
): void {
  setTimeout(async () => {
    try {
      const handle = await FileHandle.from(path)

      handle.truncate(len)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function truncateSync(path: string, len?: number) {
  runAsSync(async () => (await FileHandle.from(path)).truncate(len))
}

export function ftruncate(
  fd: number,
  len: number,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await new FileHandle(fd).truncate(len)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function ftruncateSync(fd: number, len: number) {
  runAsSync(() => new FileHandle(fd).truncate(len))
}

export function chown(
  path: string,
  uid: number,
  gid: number,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await promises.chown(path, uid, gid)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function chownSync(path: string, uid: number, gid: number) {
  runAsSync(() => promises.chown(path, uid, gid))
}

export function fchown(
  fd: number,
  uid: number,
  gid: number,
  callback: Callback
) {
  setTimeout(async () => {
    try {
      await new FileHandle(fd).chown(uid, gid)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function fchownSync(fd: number, uid: number, gid: number) {
  runAsSync(() => new FileHandle(fd).chown(uid, gid))
}

export function chmod(
  path: string,
  mode: number,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await promises.chmod(path, mode)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function chmodSync(path: string, mode: number) {
  runAsSync(() => promises.chmod(path, mode))
}

export function fchmod(
  fd: number,
  mode: number,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await new FileHandle(fd).chmod(mode)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function fchmodSync(fd: number, mode: number) {
  runAsSync(() => new FileHandle(fd).chmod(mode))
}

//@ts-expect-error
export function stat(
  path: string,
  callback: Callback<[err: any, stats: Stats]>
): void
export function stat(
  path: string,
  options: { bigint?: false | undefined },
  callback: Callback<[err: any, stats: Stats]>
): void
export function stat(
  path: string,
  options: { bigint: true },
  callback: Callback<[err: any, stats: BigIntStats]>
): void
export function stat(
  path: string,
  options: { bigint?: boolean } | Callback,
  callback: Callback<[err: any, stats: Stats | BigIntStats]>
) {
  if (typeof options === 'function') {
    callback = options
    options = { bigint: false }
  }

  setTimeout(async () => {
    try {
      callback(null, (await FileHandle.from(path)).stat(options as any))
    } catch (err) {
      callback(err, null as any)
    }
  })
}

// @ts-expect-error
export async function statSync(path: string): Promise<Stats>
export async function statSync(
  path: string,
  options: FSStatOptions & { bigint?: false }
): Promise<Stats>
export async function statSync(
  path: string,
  options: FSStatOptions & { bigint: true }
): Promise<BigIntStats>
export async function statSync(
  path: string,
  options?: FSStatOptions
): Promise<Stats | BigIntStats>
export function statSync(path: string, options?: FSStatOptions) {
  return runAsSync(
    async () => await promises.stat(path, options as any)
  )
}

//@ts-expect-error
export function fstat(
  fd: number,
  callback: Callback<[err: any, stats: Stats]>
): void
export function fstat(
  fd: number,
  options: { bigint?: false | undefined },
  callback: Callback<[err: any, stats: Stats]>
): void
export function fstat(
  fd: number,
  options: { bigint: true },
  callback: Callback<[err: any, stats: BigIntStats]>
): void
export function fstat(
  fd: number,
  options: { bigint?: boolean } | Callback,
  callback: Callback<[err: any, stats: Stats | BigIntStats]>
) {
  if (typeof options === 'function') {
    callback = options
    options = { bigint: false }
  }

  setTimeout(async () => {
    try {
      callback(
        null,
        options?.bigint ? new BigIntStats(fd) : new Stats(fd)
      )
    } catch (err) {
      callback(err, null as any)
    }
  })
}

export function fstatSync(fd: number): Stats
export function fstatSync(
  fd: number,
  options: FSStatOptions & { bigint?: false }
): Stats
export function fstatSync(
  fd: number,
  options: FSStatOptions & { bigint: true }
): BigIntStats
export function fstatSync(
  fd: number,
  options?: FSStatOptions
): Stats | BigIntStats
export function fstatSync(
  fd: number,
  options?: FSStatOptions
): Stats | BigIntStats {
  return options?.bigint ? new BigIntStats(fd) : new Stats(fd)
}

// @ts-expect-error
export function statfs(
  path: string,
  callback: Callback<[err: any, stats: StatsFs]>
): void
export function statfs(
  path: string,
  options: FSStatOptions & { bigint?: false },
  callback: Callback<[err: any, stats: StatsFs]>
): void
export function statfs(
  path: string,
  options: FSStatOptions & { bigint: true },
  callback: Callback<[err: any, stats: BigIntStatsFs]>
): void
export function statfs(
  path: string,
  options?: FSStatOptions,
  callback?: Callback<[err: any, stats: StatsFs | BigIntStatsFs]>
) {
  if (typeof options === 'function') {
    callback = options
    options = { bigint: false }
  }

  try {
    if (path !== '/') {
      throw new Error('Not implemented')
    }

    callback?.(
      null,
      options?.bigint ? new BigIntStatsFs() : new StatsFs()
    )
  } catch (err) {
    callback?.(err, null as any)
  }
}

export function statfsSync(path: string): StatsFs
export function statfsSync(
  path: string,
  options: FSStatOptions & { bigint?: false }
): StatsFs
export function statfsSync(
  path: string,
  options: FSStatOptions & { bigint: true }
): BigIntStatsFs
export function statfsSync(
  path: string,
  options?: FSStatOptions
): StatsFs | BigIntStatsFs
export function statfsSync(
  path: string,
  options?: FSStatOptions
): StatsFs | BigIntStatsFs {
  if (path !== '/') {
    throw new Error('Not implemented')
  }

  return options?.bigint ? new BigIntStatsFs() : new StatsFs()
}

export function link(
  existingPath: string,
  newPath: string,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await promises.link(existingPath, newPath)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function linkSync(existingPath: string, newPath: string) {
  return runAsSync(
    async () => await promises.link(existingPath, newPath)
  )
}

export function symlink(
  existingPath: string,
  newPath: string,
  type: 'dir' | 'file',
  callback: Callback<[err: any]>
) {
  if (type !== 'dir' && type !== 'file') {
    callback(new Error('Not implemented'))
  }

  setTimeout(async () => {
    try {
      await promises.link(existingPath, newPath)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function symlinkSync(
  existingPath: string,
  newPath: string,
  type: 'dir' | 'file'
) {
  if (type !== 'dir' && type !== 'file') {
    throw new Error('Not implemented')
  }

  return runAsSync(
    async () => await promises.link(existingPath, newPath)
  )
}

export function readlink(
  path: string,
  callback: Callback<[err: any, linkString: string]>
): void
export function readlink(
  path: string,
  options: any,
  callback: Callback<[err: any, linkString: string]>
): void
export function readlink(
  path: string,
  options: any,
  callback?: Callback<[err: any, linkString: string]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      const stat = await Stats.from(path)

      if (stat.isSymbolicLink()) {
        return await promises.realpath(path)
      }

      throw new Error('Not a symbolic link')
    } catch (err) {
      callback?.(err, null as any)
    }
  })
}

export function readlinkSync(path: string): string
export function readlinkSync(path: string, options: any): string
export function readlinkSync(path: string, options?: any) {
  return runAsSync(async () => {
    const stat = await Stats.from(path)

    if (stat.isSymbolicLink()) {
      return await promises.realpath(path)
    }

    throw new Error('Not a symbolic link')
  })
}

export function realpath(
  path: string,
  callback: Callback<[err: any, path: string]>
): void
export function realpath(
  path: string,
  options: any,
  callback: Callback<[err: any, path: string]>
): void
export function realpath(
  path: string,
  options?: any,
  callback?: Callback<[err: any, path: string]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      callback?.(null, await promises.realpath(path))
    } catch (err) {
      callback?.(err, null as any)
    }
  })
}

export function realpathSync(path: string): string
export function realpathSync(path: string, options: any): string
export function realpathSync(path: string, options?: any) {
  return runAsSync(async () => await promises.realpath(path))
}

export function unlink(
  path: string,
  callback: Callback<[err: any]>
): void {
  setTimeout(async () => {
    try {
      await promises.unlink(path)
      callback(null)
    } catch (err) {
      callback(err)
    }
  })
}

export function unlinkSync(path: string) {
  return runAsSync(async () => await promises.unlink(path))
}

export function rmdir(
  path: string,
  callback: Callback<[err: any]>
): void
export function rmdir(
  path: string,
  options: any,
  callback: Callback<[err: any]>
): void

export function rmdir(
  path: string,
  options?: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      await promises.rmdir(path, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function rmdirSync(path: string, options?: any) {
  return runAsSync(async () => await promises.rmdir(path, options))
}

export function rm(path: string, callback: Callback<[err: any]>): void
export function rm(
  path: string,
  options: any,
  callback: Callback<[err: any]>
): void

export function rm(
  path: string,
  options?: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      await promises.rm(path, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function rmSync(path: string, options?: any) {
  return runAsSync(async () => await promises.rm(path, options))
}

export function mkdir(
  path: string,
  callback: Callback<[err: any]>
): void
export function mkdir(
  path: string,
  options: any,
  callback: Callback<[err: any]>
): void
export function mkdir(
  path: string,
  options?: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      await promises.mkdir(path, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function mkdirSync(path: string, options?: any) {
  return runAsSync(async () => await promises.mkdir(path, options))
}

export function mkdtemp(
  prefix: string,
  callback: Callback<[err: any, folder: string]>
): void
export function mkdtemp(
  prefix: string,
  options: any,
  callback: Callback<[err: any, folder: string]>
): void

export function mkdtemp(
  prefix: string,
  options?: any,
  callback?: Callback<[err: any, folder: string]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      callback?.(null, await promises.mkdtemp(prefix, options))
    } catch (err) {
      callback?.(err, null as any)
    }
  })
}

export function mkdtempSync(prefix: string, options?: any) {
  return runAsSync(async () => await promises.mkdtemp(prefix, options))
}

export function readdir(
  path: string,
  callback: Callback<[err: any, files: string[]]>
): void
export function readdir(
  path: string,
  options: any,
  callback: Callback<[err: any, files: Dirent[]]>
): void
export function readdir(
  path: string,
  options: any,
  callback?: Callback<[err: any, files: Dirent[]]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      const dir = await Dir.from(path)
      const items: Dirent[] = []

      for await (const item of dir) {
        items.push(item)
      }

      callback?.(null, items)
    } catch (err) {
      callback?.(err, [])
    }
  })
}

export function readdirSync(path: string, options?: any) {
  return runAsSync(async () => {
    const dir = await Dir.from(path)
    const items: Dirent[] = []

    for await (const item of dir) {
      items.push(item)
    }

    return items
  })
}

export function close(fd: number, callback?: Callback<[err: any]>) {
  setTimeout(async () => {
    !(await db.index.get(fd))
      ? callback?.(new Error('No such file descriptor'))
      : callback?.(null)
  })
}

export function closeSync(fd: number) {
  runAsSync(async () => {
    if (!(await db.index.get(fd))) {
      throw new Error('No such file descriptor')
    }
  })
}

// @ts-expect-error
export function open(
  path: string,
  flags: string,
  callback: Callback<[err: any, fd: number]>
): void
export function open(
  path: string,
  flags: string,
  mode: number,
  callback: Callback<[err: any, fd: number]>
): void
export function open(
  path: string,
  flags: string,
  mode?: number,
  callback?: Callback<[err: any, fd: number]>
) {
  if (typeof mode === 'function') {
    callback = mode
    mode = 666
  }

  setTimeout(async () => {
    try {
      const handle = await promises.open(path, flags, mode)
      callback?.(null, handle.fd)
    } catch (err) {
      callback?.(err, -1)
    }
  })
}

export function openSync(path: string, flags: string, mode?: number) {
  return runAsSync(async () => {
    const handle = await promises.open(path, flags, mode)
    return handle.fd
  })
}

export function utimes(
  path: string,
  atime: TimeLike,
  mtime: TimeLike,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await promises.utimes(path, new Date(atime), new Date(mtime))
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function utimesSync(
  path: string,
  atime: TimeLike,
  mtime: TimeLike
) {
  return runAsSync(async () => {
    await promises.utimes(path, new Date(atime), new Date(mtime))
  })
}

export function futimes(
  fd: number,
  atime: TimeLike,
  mtime: TimeLike,
  callback: Callback<[err: any]>
) {
  setTimeout(async () => {
    try {
      await db.stats.update(fd, {
        atime: new Date(atime),
        mtime: new Date(mtime)
      })

      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function futimesSync(
  fd: number,
  atime: TimeLike,
  mtime: TimeLike
) {
  return runAsSync(async () => {
    await db.stats.update(fd, {
      atime: new Date(atime),
      mtime: new Date(mtime)
    })
  })
}

export function fsync(fd: number, callback: Callback<[err: any]>) {
  setTimeout(async () => {
    try {
      const index = await db.index.get(fd)

      if (!index) {
        throw new Error('No such file descriptor')
      }

      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function fsyncSync(fd: number) {
  runAsSync(async () => {
    const index = await db.index.get(fd)

    if (!index) {
      throw new Error('No such file descriptor')
    }
  })
}

export function write(
  fd: number,
  buffer: any,
  offset: number,
  length: number,
  position: number,
  callback: Callback<[err: any, written: number]>
) {
  throw new Error('Function not implemented.')
}

export function writeSync(
  fd: number,
  buffer: any,
  offset: number,
  length: number,
  position: number
) {
  throw new Error('Function not implemented.')
}

export function read(
  fd: number,
  buffer: any,
  offset: number,
  length: number,
  position: number,
  callback: Callback<[err: any, bytesRead: number]>
) {
  throw new Error('Function not implemented.')
}

export function readSync(
  fd: number,
  buffer: any,
  offset: number,
  length: number,
  position: number
) {
  throw new Error('Function not implemented.')
}

export function readFile(
  file: string | number | FileHandle,
  callback: Callback<[err: any, data: Buffer]>
): void
export function readFile(
  file: string | number | FileHandle,
  options: any,
  callback: Callback<[err: any, data: Buffer]>
): void
export function readFile(
  file: string | number | FileHandle,
  options: any,
  callback?: Callback<[err: any, data: Buffer]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      callback?.(null, await promises.readFile(file, options))
    } catch (err) {
      callback?.(err, null as any)
    }
  })
}

export function readFileSync(
  file: string | number | FileHandle,
  options?: any
): Buffer {
  return runAsSync(async () => {
    return await promises.readFile(file, options)
  })
}

export function writeFile(
  file: string | number | FileHandle,
  data: any,
  callback: Callback<[err: any]>
): void
export function writeFile(
  file: string | number | FileHandle,
  data: any,
  options: any,
  callback: Callback<[err: any]>
): void
export function writeFile(
  file: string | number | FileHandle,
  data: any,
  options?: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      await promises.writeFile(file, data, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function writeFileSync(
  file: string | number | FileHandle,
  data: any,
  options?: any
) {
  return runAsSync(async () => {
    await promises.writeFile(file, data, options)
  })
}

export function appendFile(
  file: string | number | FileHandle,
  data: any,
  callback: Callback<[err: any]>
): void
export function appendFile(
  file: string | number | FileHandle,
  data: any,
  options: any,
  callback: Callback<[err: any]>
): void
export function appendFile(
  file: string | number | FileHandle,
  data: any,
  options: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  setTimeout(async () => {
    try {
      await promises.appendFile(file, data, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function appendFileSync(
  file: string | number | FileHandle,
  data: any,
  options?: any
) {
  return runAsSync(async () => {
    await promises.appendFile(file, data, options)
  })
}

export interface WatchFileOptions {
  bigint?: boolean | undefined
  interval?: number | undefined
  persistent?: boolean | undefined
}

export type StatListener<T> = Callback<[curr: T, prev: T]>

// @ts-expect-error
export function watchFile(
  fileName: string,
  listener: StatListener<Stats>
): void
export function watchFile(
  fileName: string,
  options:
    | (WatchFileOptions & {
        bigint?: false | undefined
      })
    | undefined,
  listener: StatListener<Stats>
): void

export function watchFile(
  fileName: string,
  options:
    | (WatchFileOptions & {
        bigint: true
      })
    | undefined,
  listener: StatListener<BigIntStats>
): void

export function watchFile(
  fileName: string,
  options: WatchFileOptions | undefined,
  listener: StatListener<Stats | BigIntStats>
) {
  throw new Error('Function not implemented.')
}

export function unwatchFile(
  filename: string,
  listener?: StatListener<Stats>
): void
export function unwatchFile(
  filename: string,
  listener?: StatListener<BigIntStats>
): void
export function unwatchFile(
  filename: string,
  listener?: StatListener<Stats> | StatListener<BigIntStats>
) {
  throw new Error('Function not implemented.')
}

export function watch(fileName: string, options: any, listener: any) {
  throw new Error('Not Implemented')
}

export function unwatch(fileName: string, listener?: any) {
  throw new Error('Not Implemented')
}

export function exists(
  path: string,
  callback: Callback<[exists: boolean]>
) {
  setTimeout(async () => {
    const id = await getIndexID(path)
    callback(id !== undefined)
  })
}

export function existsSync(path: string): boolean {
  return runAsSync(async () => {
    const id = await getIndexID(path)
    return id !== undefined
  })
}

export function copyFile(
  src: string,
  dest: string,
  callback: Callback
): void

export function copyFile(
  src: string,
  dest: string,
  mode: number,
  callback: Callback
): void

export function copyFile(
  src: string,
  dest: string,
  mode: number | Callback,
  callback?: Callback
) {
  if (typeof mode === 'function') {
    callback = mode
    mode = 666
  }

  setTimeout(async () => {
    try {
      await promises.copyFile(src, dest, mode)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function copyFileSync(src: string, dest: string, mode?: number) {
  return runAsSync(async () => {
    await promises.copyFile(src, dest, mode)
  })
}

export function writev() {
  throw new Error('Not Implemented')
}

export function writevSync() {
  throw new Error('Not Implemented')
}
export function readv() {
  throw new Error('Not Implemented')
}

export function readvSync() {
  throw new Error('Not Implemented')
}

export async function openAsBlob(path: string, options: any) {
  const handle = await FileHandle.from(path)
  return (await db.store.get(handle.fd))!.data
}

export function opendir(
  path: string,
  cb: Callback<[err: any, dir: Dir]>
): void
export function opendir(
  path: string,
  options: any,
  cb: Callback<[err: any, dir: Dir]>
): void
export function opendir(
  path: string,
  options: any,
  cb?: Callback<[err: any, dir: Dir]>
) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  setTimeout(async () => {
    try {
      const dir = await promises.opendir(path, options)
      cb?.(null, dir)
    } catch (err) {
      cb?.(err, null as any)
    }
  })
}

export function opendirSync(path: string, options?: any) {
  return runAsSync(async () => {
    const dir = await promises.opendir(path, options)
    return dir
  })
}

export function cp(
  source: string,
  destination: string,
  callback: Callback<[err: any]>
): void
export function cp(
  source: string,
  destination: string,
  options: any,
  callback: Callback<[err: any]>
): void
export function cp(
  source: string,
  destination: string,
  options: any,
  callback?: Callback<[err: any]>
) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  setTimeout(async () => {
    try {
      await promises.cp(source, destination, options)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  })
}

export function cpSync(
  source: string,
  destination: string,
  options?: any
) {
  return runAsSync(async () => {
    await promises.cp(source, destination, options)
  })
}

export { default as promises } from '../promises'

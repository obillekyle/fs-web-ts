import { byUser } from '@/core/constants'
import { toBlob } from '@/utils/data'
import db from '@/utils/db'
import { FileHandle, getHandle } from '@/utils/fileHandle'
import {
  Stats,
  BigIntStats,
  BigIntStatsFs,
  Dir,
  StatsFs
} from '@/utils/stats'
import type { FSStatOptions } from '@/utils/types'
import { getIndexID, hasPerm, hash } from '@/utils/utils'
import Path from 'path'

export async function access(path: string, mode: number = 7) {
  const index = await getIndexID(path)
  const perm = await db.perm.get(index!)
  const modeNum = perm?.mode ?? 0
  return hasPerm(mode, modeNum, byUser.Owner)
}

export async function copyFile(
  src: string,
  dest: string,
  mode: number = 666
) {
  await writeFile(dest, await readFile(src), { mode })
}

export async function open(
  path: string,
  flags?: string | number,
  mode?: number
): Promise<FileHandle> {
  let index = await getIndexID(path)

  if (!index) {
    const parsed = Path.parse(path)
    index = await db.index.put({
      name: parsed.base,
      dir: parsed.dir
    })

    await db.perm.add({
      key: index,
      mode: mode ?? 666,
      gid: 0,
      uid: 0
    })

    await db.stats.add({
      key: index,
      size: 0,
      type: 'file',
      mtime: new Date(),
      atime: new Date(),
      ctime: new Date(),
      birthtime: new Date()
    })

    await db.store.add({
      key: index,
      data: new Blob()
    })
  }

  const handle = new FileHandle(index)
  const stat = handle.stat()

  if (hasPerm(6, stat.mode, byUser.Owner)) return handle
  throw new Error('Permission denied')
}

export async function rename(oldPath: string, newPath: string) {
  if (oldPath === newPath) return
  if (oldPath === '/' || newPath === '/') {
    throw new Error('Invalid path')
  }

  const oldIndex = Path.parse(oldPath)
  const newIndex = Path.parse(newPath)
  const index = await getIndexID(oldPath)

  if (!index) {
    throw new Error('Not found')
  }

  if (await getIndexID(newPath)) {
    throw new Error('Path already exists')
  }

  const stat = new Stats(index)
  await mkdir(newIndex.dir, { recursive: true })

  await db.index.update(index, {
    dir: newIndex.dir,
    name: newIndex.base
  })

  if (stat.isDirectory()) {
    const items = await db.index
      .filter((item) => {
        return (
          item.dir === oldPath ||
          (item.dir.startsWith(oldPath) &&
            item.dir[oldPath.length] === '/')
        )
      })
      .toArray()

    await db.index.bulkUpdate(
      items.map((item) => {
        return {
          key: item.key!,
          changes: {
            dir: item.dir.replace(oldPath, newPath)
          }
        }
      })
    )
  }
}

type MakeDirectoryOptions = {
  recursive?: boolean
  mode?: number
}

export async function truncate(path: string, len?: number) {
  const index = await getIndexID(path)
  const handle = new FileHandle(index!)
  await handle.truncate(len)
}

export async function rmdir(path: string, options?: any) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('Not a file or directory')
  }

  if (path === '/') {
    throw new Error('Cannot remove root')
  }

  const dir = new Dir(index)

  for await (const item of dir) {
    const index = (await getIndexID(item.path))!

    if (item.isSymbolicLink()) {
      await db.index.delete(index)
      await db.stats.delete(index)
      await db.links.delete(index)
      await db.perm.delete(index)
    }

    if (item.isDirectory()) {
      await rmdir(item.path)
    }

    if (item.isFile()) {
      await db.index.delete(index)
      await db.stats.delete(index)
      await db.perm.delete(index)
      await db.store.delete(index)
    }
  }

  await db.index.delete(index)
  await db.stats.delete(index)
  await db.perm.delete(index)
}

export async function rm(path: string, options?: any) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('No such file or directory')
  }

  const stats = new Stats(index)

  if (!hasPerm(6, stats.mode, byUser.Owner)) {
    throw new Error('Permission denied')
  }

  if (stats.isDirectory()) {
    const items = await db.index.where('dir').equals(path).count()
    if (items > 0) {
      throw new Error('Directory not empty')
    }
  }

  if (stats.isFile()) {
    await db.store.delete(index)
  }

  if (stats.isSymbolicLink()) {
    await db.links.delete(index)
  }

  await db.index.delete(index)
  await db.stats.delete(index)
  await db.perm.delete(index)
}

// @ts-expect-error
export async function mkdir(
  path: string,
  options?: MakeDirectoryOptions
): Promise<void>
export async function mkdir(
  path: string,
  options?: MakeDirectoryOptions & { recursive?: false | undefined }
): Promise<void>
export async function mkdir(
  path: string,
  options: MakeDirectoryOptions & { recursive: true }
): Promise<string | undefined>
export async function mkdir(
  path: string,
  options?: MakeDirectoryOptions
): Promise<string | undefined> {
  if (await getIndexID(path)) {
    throw new Error('Path already exists')
  }

  const parsed = Path.parse(path)
  const recursive = options?.recursive ?? false

  if (recursive) {
    if (parsed.dir !== '/') {
      access(parsed.dir, 2)
    }

    if (!(await getIndexID(parsed.dir))) {
      await mkdir(parsed.dir, { recursive: true })
    }
  }

  if (parsed.dir !== '/') {
    const index = await getIndexID(parsed.dir)

    if (!index || !new Stats(index).isDirectory()) {
      throw new Error('Path is not a directory')
    }
  }

  const index = await db.index.add({
    name: parsed.base,
    dir: parsed.dir
  })
  await db.perm.add({
    key: index,
    mode: options?.mode || 777,
    gid: 0,
    uid: 0
  })
  await db.stats.add({
    key: index,
    size: 0,
    mtime: new Date(),
    atime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
    type: 'folder'
  })

  if (recursive) {
    return path
  }
}

export async function stat(path: string): Promise<Stats>
export async function stat(
  path: string,
  options: FSStatOptions & { bigint?: false }
): Promise<Stats>
export async function stat(
  path: string,
  options: FSStatOptions & { bigint: true }
): Promise<BigIntStats>
export async function stat(
  path: string,
  options?: FSStatOptions
): Promise<Stats | BigIntStats> {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('Index not found')
  }

  return options?.bigint ? new BigIntStats(index) : new Stats(index)
}

export async function statfs(path: string): Promise<StatsFs>
export async function statfs(
  path: string,
  options: FSStatOptions & { bigint?: false }
): Promise<StatsFs>
export async function statfs(
  path: string,
  options: FSStatOptions & { bigint: true }
): Promise<BigIntStatsFs>
export async function statfs(
  path: string,
  options?: FSStatOptions
): Promise<StatsFs | BigIntStatsFs> {
  if (!path || path === '/') {
    return options?.bigint ? new BigIntStatsFs() : new StatsFs()
  }

  throw new Error('Not implemented')
}

export async function link(existingPath: string, newPath: string) {
  const index = await getIndexID(existingPath)

  if (!index) {
    throw new Error('No such file or directory')
  }

  if (await getIndexID(newPath)) {
    throw new Error('File exists')
  }

  const parsed = Path.parse(newPath)

  const id = await db.index.add({
    name: parsed.base,
    dir: parsed.dir
  })

  await db.perm.add({
    key: id,
    mode: 777,
    gid: 0,
    uid: 0
  })

  await db.stats.add({
    key: id,
    size: 0,
    mtime: new Date(),
    atime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
    type: 'symlink'
  })
}

export async function unlink(path: string) {
  const item = await getIndexID(path)

  if (!item) {
    throw new Error('No such file or directory')
  }

  const stat = new Stats(item)

  if (stat.isSymbolicLink()) {
    await db.index.delete(item)
    await db.stats.delete(item)
    await db.perm.delete(item)
  } else {
    throw new Error('Not a symbolic link')
  }
}

export async function chmod(path: string, mode: number) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('No such file or directory')
  }

  await db.perm.update(index, { mode })
}

export async function chown(path: string, uid: number, gid: number) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('No such file or directory')
  }

  await db.perm.update(index, { uid, gid })
}

export async function utimes(path: string, atime: Date, mtime: Date) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('No such file or directory')
  }

  await db.stats.update(index, { atime, mtime })
}

export async function realpath(path: string) {
  const index = await getIndexID(path)

  if (!index) {
    throw new Error('No such file or directory')
  }
  const item = await db.index.get(index)
  const stat = new Stats(index)

  if (!item) {
    throw new Error('Item not found')
  }

  if (stat.isSymbolicLink()) {
    const symlink = await db.links.get(index)

    if (!symlink) {
      throw new Error('Symlink not found')
    }

    const target = await db.index.get(symlink)

    if (!target) {
      throw new Error('Target not found')
    }

    return Path.join(target.dir, target.name)
  }

  return Path.join(item.dir, item.name)
}

export async function mkdtemp(prefix: string, options?: any) {
  const hashed = hash(prefix)
  const folderName = hashed.startsWith('/')
    ? hashed
    : Path.join('/tmp', hashed)

  if (await getIndexID(folderName)) {
    return mkdtemp(prefix, options)
  }

  const parsed = Path.parse(folderName)
  if (!(await getIndexID(parsed.dir))) {
    if (parsed.dir === '/tmp') {
      await mkdir(parsed.dir, { recursive: true })
    } else {
      throw new Error('Parent directory does not exist')
    }
  }

  await mkdir(folderName)
  return folderName
}

export async function writeFile(
  file: string | number | FileHandle,
  data: any,
  options?: any
) {
  data = await toBlob(data)
  const handle = await getHandle(file, true)
  await handle.writeFile(data, options)
  await handle.close()
}

export async function appendFile(
  file: string | number | FileHandle,
  data: any,
  options?: any
) {
  data = await toBlob(data)
  const handle = await getHandle(file, true)
  await handle.appendFile(data, options)
  await handle.close()
}

export async function readFile(
  file: string | number | FileHandle,
  options?: any
) {
  const handle = await getHandle(file)
  const data = await handle.readFile(options)
  await handle.close()
  return data
}

export async function opendir(path: string, options: any) {
  return await Dir.from(path)
}

export async function watch(fileName: string, options?: any) {
  throw new Error('Not implemented')
}

export async function cp(source: string, dest: string, options?: any) {
  const toParse = Path.parse(dest)

  const from = await Stats.from(source)
  const toParent = await Stats.from(toParse.dir)

  if (!toParent.isDirectory()) {
    throw new Error("Destination's parent must be a directory")
  }

  if (from.isDirectory()) {
    await mkdir(dest, { recursive: true })
    const dir = await Dir.from(source)
    for await (const item of dir) {
      await cp(item.path, Path.join(dest, item.name), options)
    }
  } else if (from.isSymbolicLink()) {
    const linkTo = await realpath(source)
    await link(linkTo, dest)
  } else if (from.isFile()) {
    await writeFile(dest, await readFile(source))
  } else {
    throw new Error('Unsupported index type')
  }
}

export default {
  access,
  copyFile,
  open,
  rename,
  rmdir,
  rm,
  mkdir,
  stat,
  statfs,
  link,
  unlink,
  chmod,
  chown,
  utimes,
  realpath,
  mkdtemp,
  writeFile,
  appendFile,
  readFile,
  opendir,
  watch,
  cp
}

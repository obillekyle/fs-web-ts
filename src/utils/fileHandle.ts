import { byUser } from '@/core/constants'
import { BlobToBuffer, toArrayBuffer, toBlob } from './data'
import db from './db'
import { BigIntStats, Stats } from './stats'
import type { FsIndex, TimeLike } from './types'
import { getIndexID, hasPerm, runAsSync, validPath } from './utils'
import { open } from '@/promises'

export class FileHandle {
  readonly fd: number
  private _file: FsIndex | undefined
  private _stat: Stats | undefined

  constructor(key: number) {
    this.fd = key
    runAsSync(this.getFile.bind(this))
  }

  static async from(path: string) {
    const index = await getIndexID(path)

    if (!index) {
      throw new Error('Not found')
    }

    return new FileHandle(index)
  }

  private async getFile() {
    this._file = await db.index.get(this.fd)
    this._stat = new Stats(this.fd)

    if (!this._stat.isFile()) {
      throw new Error('File not found')
    }
  }

  private hasPerm(perm: number) {
    return hasPerm(perm, this._stat?.mode || 0, byUser.Owner)
  }

  async appendFile(data: any, _options?: any) {
    if (this.hasPerm(2)) {
      const oldData = (await db.store.get(this.fd))!.data
      const blob = await toBlob(data)

      await db.stats.update(this.fd, {
        size: oldData.size + blob.size,
        mtime: new Date()
      })

      await db.store.update(this.fd, {
        data: new Blob([oldData, blob], { type: oldData.type })
      })

      return
    }
    throw new Error('Permission denied')
  }

  async chown(uid: number, gid: number) {
    await db.perm.update(this.fd, {
      uid,
      gid
    })
  }

  async chmod(mode: number) {
    await db.perm.update(this.fd, {
      mode
    })
  }

  createReadStream(_options: any): ReadableStream {
    if (this.hasPerm(4)) {
      return runAsSync(async () => {
        const item = await db.store.get(this.fd)
        if (!item) {
          throw new Error('Item not found')
        }
        return item.data.stream()
      })
    }
    throw new Error('Permission denied')
  }

  // TODO: Implement writing using
  createWriteStream(_options: any): WritableStream {
    throw new Error('Function not implemented.')
  }

  async dataSync() {}
  async sync() {}
  async read<T extends ArrayBufferView>(
    buffer: T,
    offset: number | null,
    length: number | null,
    position: number | null
  ): Promise<ArrayBufferView> {
    const ab = await toArrayBuffer(buffer)
    return new DataView(
      ab.slice(position || 0).slice(offset ?? 0, length ?? undefined)
    )
  }

  async readFile(_options?: any) {
    const item = await db.store.get(this.fd)

    if (!item) {
      throw new Error('Item not found')
    }

    return BlobToBuffer(item.data)
  }

  readLines(): unknown {
    throw new Error('Function not implemented.')
  }

  stat(options: { bigint: true }): BigIntStats
  stat(options?: { bigint?: false }): Stats
  stat(options?: { bigint?: boolean }): BigIntStats | Stats {
    if (options?.bigint) {
      return new BigIntStats(this.fd)
    }
    return new Stats(this.fd)
  }

  async truncate(len?: number) {
    const item = await db.store.get(this.fd)

    if (!item) {
      throw new Error('Item not found')
    }

    await db.store.update(this.fd, {
      data: item.data.slice(0, len)
    })
  }

  async utimes(atime: TimeLike, mtime: TimeLike) {
    await db.stats.update(this.fd, {
      atime: new Date(atime),
      mtime: new Date(mtime)
    })
  }

  async writeFile(data: any, _options?: any) {
    const blob = await toBlob(data)

    await db.store.update(this.fd, {
      data: blob
    })
  }

  // TODO: Implement offset writing
  async write(buffer: any, position?: number, encoding?: string) {
    throw new Error('Function not implemented.')
  }

  async writev(buffers: any, position?: number) {
    throw new Error('Function not implemented.')
  }

  async readv(buffers: any, position?: number) {
    throw new Error('Function not implemented.')
  }

  async close() {
    return
  }
}

export async function getHandle(
  file: string | number | FileHandle,
  createIfMissing: boolean = false
) {
  if (typeof file === 'string') {
    validPath(file)
    return createIfMissing
      ? await open(file, 'w+')
      : await FileHandle.from(file)
  } else if (typeof file === 'number') {
    return new FileHandle(file)
  } else {
    return file
  }
}

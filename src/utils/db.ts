import Dexie from 'dexie'
import type { Dexie as DexieType } from 'dexie'
import type { FsPerm, FsIndex, FsStore, FsStats } from './types'

class FileStore extends Dexie {
  index!: DexieType.Table<FsIndex, number>
  store!: DexieType.Table<FsStore, number>
  stats!: DexieType.Table<FsStats, number>
  perm!: DexieType.Table<FsPerm, number>
  links!: DexieType.Table<number, number>

  constructor() {
    super('files')
    this.version(1).stores({
      index: '++key, dir, name',
      store: 'key, data',
      perm: 'key',
      stats: 'key'
    })

    this.index.put(
      {
        name: '',
        dir: '/',
        key: 0
      },
      0
    )

    this.stats.put(
      {
        key: 0,
        size: 0,
        type: 'folder',
        mtime: new Date(),
        atime: new Date(),
        ctime: new Date(),
        birthtime: new Date()
      },
      0
    )

    this.perm.put(
      {
        key: 0,
        mode: 777,
        uid: 0,
        gid: 0
      },
      0
    )
  }
}

export default new FileStore()

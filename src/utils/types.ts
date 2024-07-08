export interface FsIndex {
  key?: number
  name: string
  dir: string
}

export interface FsStats {
  key: number
  size: number
  atime: Date
  mtime: Date
  ctime: Date
  birthtime: Date
  type: 'file' | 'folder' | 'symlink'
}

export interface Stats extends FsStats {
  isFile(): boolean
  isDirectory(): boolean
  isSymbolicLink(): boolean
  size: number
}

export interface FsSymlink {
  key: number
  of: number
}

export interface FsStore {
  key: number
  data: File | Blob
}

export interface FsPerm {
  key: number
  uid: number
  gid: number
  mode: number
}

export enum constants {
  F_OK = 0,
  R_OK = 4,
  W_OK = 2,
  X_OK = 1
}

export type FSStatOptions = { bigint: boolean }

export type Callback<T extends any[] = unknown[]> = (...args: T) => void
export interface FsFileReadResult<T> {
  bytesRead: number
  buffer: T
}

export type TimeLike = Date | string | number

declare module 'path' {
  import { PurePath } from 'node:path'

  export * from 'node:path'

  export class Path extends PurePath {
    constructor(path: string | Buffer | URL, ...paths: string[]): void
    readonly root: string
    readonly dir: string
    readonly base: string
    readonly ext: string
    readonly name: string
    readonly stem: string
  }

  export function resolve(...pathSegments: string[]): string
  export function normalize(path: string): string
  export function isAbsolute(path: string): boolean
  export function join(...paths: string[]): string
  export function relative(from: string, to: string): string
  export function parse(path: string): import('node:path').ParsedPath
  export function format(
    pathObject: import('node:path').ParsedPath
  ): string
  export function format(pathObject: {
    root?: string | undefined
    dir?: string | undefined
    base?: string | undefined
    ext?: string | undefined
    name?: string | undefined
  }): string
  export function sep(): string
  export function delimiter(): string
  export function win32(): PlatformPath
  export function posix(): PlatformPath

  interface PlatformPath {
    sep: string
    delimiter: string
    resolve(...pathSegments: string[]): string
    normalize(path: string): string
    isAbsolute(path: string): boolean
    join(...paths: string[]): string
    relative(from: string, to: string): string
    parse(path: string): import('node:path').ParsedPath
    format(pathObject: import('node:path').ParsedPath): string
    format(pathObject: {
      root?: string | undefined
      dir?: string | undefined
      base?: string | undefined
      ext?: string | undefined
      name?: string | undefined
    }): string
  }
}

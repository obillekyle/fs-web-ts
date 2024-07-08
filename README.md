# fs-web-ts

### A crappy implementation of `node:fs` for the web using IndexDB wrapped by `dexie`.

> [!CAUTION]  
> This is not a production-ready implementation of `node:fs` for the web. It's probably slow and has full of bugs. Please use it at your own risk.

## Progress

> [!NOTE]  
> All of these are made from scratch and only based on `node:fs`'s documentation. This code is not fully tested. If you find any bugs please let me know.

- ### `class FileHandle`

  - [x] `readonly fd`
  - [x] `static async from()`
  - [x] `async getFile()`
  - [x] `async appendFile()`
  - [x] `async chown()`
  - [x] `async chmod()`
  - [x] `async writeFile()`
  - [ ] `createReadStream()`
  - [ ] `createWriteStream()`
  - [ ] `async dataSync()`
  - [ ] `async sync()`
  - [x] `async readFile()`
  - [ ] `async readLines()`
  - [x] `async stat()`
  - [x] `async truncate()`
  - [x] `async utimes()`
  - [x] `async writeFile()`
  - [x] `async close()`
  - [ ] `async write()`
  - [ ] `async writev()`
  - [ ] `async readv()`

- ### `class Stats | BigIntStats`

  - [x] `static async from()`
  - [x] `isFile()`
  - [x] `isDirectory()`
  - [x] `isSymbolicLink()`
  - [ ] `isBlockDevice()`
  - [ ] `isCharacterDevice()`
  - [ ] `isFIFO()`
  - [x] `readonly size`
  - [x] `readonly atime`
  - [x] `readonly mtime`
  - [x] `readonly ctime`
  - [x] `readonly birthtime`
  - [x] `readonly atimeMs`
  - [x] `readonly mtimeMs`
  - [x] `readonly ctimeMs`
  - [x] `readonly birthtimeMs`
  - [x] `readonly uid`,
  - [x] `readonly gid`,
  - [x] `readonly mode`

- ### `class StatsFs | BigIntStatsFs`

  - [x] `static async from()`
  - [x] `readonly type`
  - [x] `readonly bsize`
  - [x] `readonly blocks`
  - [x] `readonly bfree`
  - [x] `readonly bavail`
  - [x] `readonly files`
  - [x] `readonly ffree`

- ### `class Dir`

  - [x] `static async from()`
  - [x] `close()`
  - [x] `closeSync()`
  - [x] `async close()`
  - [x] `read()`
  - [x] `readSync()`
  - [x] `async read()`
  - [x] `async Symbol.asyncIterator()`

- ### `class Dirent`

  - [x] `static async from()`
  - [ ] `isBlockDevice()`
  - [ ] `isCharacterDevice()`
  - [ ] `isFIFO()`
  - [x] `isFile()`
  - [x] `isDirectory()`
  - [x] `isSymbolicLink()`
  - [x] `readonly name`
  - [x] `readonly parentPath`
  - [x] `readonly path`

- ### `fs/core`

  - [x] `access()`
  - [x] `rename()`
  - [x] `truncate()`
  - [x] `ftruncate()`
  - [x] `chown()`
  - [ ] `lchown()`
  - [x] `fchown()`
  - [x] `chmod()`
  - [ ] `lchmod()`
  - [x] `fchmod()`
  - [x] `stat()`
  - [ ] `lstat()`
  - [x] `fstat()`
  - [x] `statfs()`
  - [x] `link()`
  - [x] `symlink()`
  - [x] `readlink()`
  - [x] `realpath()`
  - [x] `unlink()`
  - [x] `rmdir()`
  - [x] `rm()`
  - [x] `mkdir()`
  - [x] `mkdtemp()`
  - [x] `readdir()`
  - [x] `close()`
  - [x] `open()`
  - [x] `utimes()`
  - [x] `futimes()`
  - [x] `fsync()`
  - [ ] `write()`
  - [ ] `read()`
  - [x] `readFile()`
  - [x] `writeFile()`
  - [x] `appendFile()`
  - [ ] `watchFile()`
  - [ ] `watch()`
  - [ ] `unwatch()`
  - [ ] `unwatchFile()`
  - [x] `copyFile()`
  - [x] `opendir()`
  - [x] `exists()`
  - [ ] `cp()`
  - [x] `renameSync()`
  - [x] `truncateSync()`
  - [x] `ftruncateSync()`
  - [x] `chownSync()`
  - [x] `fchownSync()`
  - [x] `chmodSync()`
  - [x] `fchmodSync()`
  - [x] `statSync()`
  - [ ] `lstatSync()`
  - [ ] `lchmodSync()`
  - [ ] `lchownSync()`
  - [x] `fstatSync()`
  - [x] `statfsSync()`
  - [x] `linkSync()`
  - [x] `symlinkSync()`
  - [x] `readlinkSync()`
  - [x] `realpathSync()`
  - [x] `unlinkSync()`
  - [x] `rmdirSync()`
  - [x] `rmSync()`
  - [x] `mkdirSync()`
  - [x] `mkdtempSync()`
  - [x] `readdirSync()`
  - [x] `closeSync()`
  - [x] `openSync()`
  - [x] `utimesSync()`
  - [x] `futimesSync()`
  - [x] `fsyncSync()`
  - [ ] `writeSync()`
  - [ ] `readSync()`
  - [x] `readFileSync()`
  - [x] `writeFileSync()`
  - [x] `appendFileSync()`
  - [x] `existsSync()`
  - [x] `copyFileSync()`
  - [x] `opendirSync()`
  - [ ] `cpSync()`
  - [x] `async openAsBlob()`

- ### `fs/promises`
  - [x] `async access()`
  - [x] `async copyFile()`
  - [x] `async open()`
  - [x] `async rename()`
  - [x] `async rmdir()`
  - [x] `async rm()`
  - [x] `async mkdir()`
  - [x] `async stat()`
  - [ ] `async lstat()`
  - [x] `async statfs()`
  - [x] `async link()`
  - [x] `async unlink()`
  - [x] `async chmod()`
  - [x] `async chown()`
  - [x] `async utimes()`
  - [x] `async realpath()`
  - [x] `async mkdtemp()`
  - [x] `async writeFile()`
  - [x] `async appendFile()`
  - [x] `async readFile()`
  - [x] `async opendir()`
  - [x] `async watch()`
  - [x] `async cp()`

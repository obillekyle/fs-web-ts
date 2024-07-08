import * as fs from './core'
import { Buffer } from 'buffer'

declare global {
  interface Window {
    fs: typeof fs
    Buffer: typeof Buffer
  }
}

window.fs = fs
window.Buffer = Buffer

export * from './core'
export default fs

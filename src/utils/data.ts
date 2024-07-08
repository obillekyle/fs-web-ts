import { Buffer } from 'buffer'
import { toSyncFunction } from './utils'

export function BlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer()
}

export async function BlobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await BlobToArrayBuffer(blob)
  return new Uint8Array(arrayBuffer)
}

export async function BlobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await BlobToArrayBuffer(blob)
  return Buffer.from(arrayBuffer)
}

export async function BlobToString(blob: Blob): Promise<string> {
  return await blob.text()
}

export function BufferToBlob(buffer: Buffer): Blob {
  return new Blob([buffer])
}

export function StringToBlob(string: string): Blob {
  return new Blob([string], { type: 'text/plain' })
}

export function ArrayBufferToBlob(ab: ArrayBuffer): Blob {
  return new Blob([ab])
}

export function Uint8ArrayToBlob(uint8: Uint8Array): Blob {
  return new Blob([uint8])
}

export async function ReadableStreamToBlob(stream: ReadableStream): Promise<Blob> {
  const reader = stream.getReader()
  const chunks: BlobPart[] = []
  return new Promise((resolve) => {
    async function read() {
      const { done, value } = await reader.read()
      if (done) {
        resolve(new Blob(chunks))
      } else {
        chunks.push(value)
        read()
      }
    }
    read()
  })
}

export const BlobToArrayBufferSync = toSyncFunction(BlobToArrayBuffer)
export const BlobToUint8ArraySync = toSyncFunction(BlobToUint8Array)
export const BlobToBufferSync = toSyncFunction(BlobToBuffer)
export const BlobToStringSync = toSyncFunction(BlobToString)
export const ReadableStreamToBlobSync = toSyncFunction(ReadableStreamToBlob)

export async function toBlob(data: any): Promise<Blob> {
  if (data instanceof Blob) {
    return data
  }

  if (data instanceof Uint8Array) {
    return Uint8ArrayToBlob(data)
  }

  if (data instanceof ArrayBuffer) {
    return ArrayBufferToBlob(data)
  }

  if (data instanceof Buffer) {
    return BufferToBlob(data)
  }

  if (data instanceof ReadableStream) {
    return await ReadableStreamToBlob(data)
  }

  return StringToBlob(JSON.stringify(data))
}

export async function toArrayBuffer(data: any): Promise<ArrayBuffer> {
  if (data instanceof Uint8Array) {
    data = Uint8ArrayToBlob(data)
  }

  if (data instanceof ReadableStream) {
    data = await ReadableStreamToBlob(data)
  }

  if (typeof data === 'string') {
    data = StringToBlob(data)
  }

  if (data instanceof ArrayBuffer) {
    return data
  }

  if (data instanceof Buffer) {
    return BufferToBlob(data).arrayBuffer()
  }

  return BlobToArrayBuffer(data)
}

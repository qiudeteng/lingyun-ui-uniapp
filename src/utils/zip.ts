import { atob2 } from './base64'
import pakoLib from './pako'

type PakoInflate = {
  inflate: (data: Uint8Array, opts?: { to?: string }) => string | Uint8Array
}

const pako = pakoLib as PakoInflate

/** 对齐 ../mobile/utils/zip.js：服务端 zip 字段为 gzip+base64 */
export function phpDecompress(data: string): unknown {
  const resData = atob2(data)
  const binDataArray = new Uint8Array(resData.split('').map((ch: string) => ch.charCodeAt(0)))
  const resStr = pako.inflate(binDataArray, { to: 'string' }) as string
  try {
    return JSON.parse(resStr)
  } catch {
    return resStr
  }
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

class InvalidCharacterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCharacterError'
    Object.setPrototypeOf(this, InvalidCharacterError.prototype)
  }
}

export { InvalidCharacterError }

/** Latin1 字符串 → Base64 */
export function btoa2(input: string): string {
  const data = String(input)
  let o1 = 0
  let o2 = 0
  let o3 = 0
  let bits = 0
  let i = 0
  let acc = ''

  while (i < data.length) {
    o1 = data.charCodeAt(i++)
    o2 = data.charCodeAt(i++)
    o3 = data.charCodeAt(i++)

    if (o1 > 128 || o2 > 128 || o3 > 128) {
      throw new InvalidCharacterError(
        "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.",
      )
    }

    bits = (o1 << 16) | (o2 << 8) | o3
    acc +=
      chars.charAt((bits >> 18) & 0x3f) +
      chars.charAt((bits >> 12) & 0x3f) +
      chars.charAt((bits >> 6) & 0x3f) +
      chars.charAt(bits & 0x3f)
  }

  switch (data.length % 3) {
    case 0:
      return acc
    case 1:
      return acc.slice(0, -2) + '=='
    case 2:
      return acc.slice(0, -1) + '='
    default:
      return acc
  }
}

/** Base64 → Latin1 字符串（对齐旧项目 atob2，供 gzip 解压） */
export function atob2(input: string): string {
  const str = String(input).replace(/[=]+$/, '')

  if (str.length % 4 === 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.")
  }

  let bc = 0
  let bs = 0
  let buffer: string | number = 0
  let idx = 0
  let output = ''

  while ((buffer = str.charAt(idx++))) {
    buffer = chars.indexOf(buffer as string)
    if (~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)) {
      output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
    }
  }

  return output
}

type NodeBufferInstance = Uint8Array & {
  toString: (encoding: string) => string
}

type NodeBuffer = {
  from: (input: string | Uint8Array, encoding?: string) => NodeBufferInstance
}

function nodeBuffer(): NodeBuffer | undefined {
  return (globalThis as { Buffer?: NodeBuffer }).Buffer
}

export function base64Encode(input: string | Uint8Array): string {
  const BufferImpl = nodeBuffer()
  if (typeof input === 'string') {
    if (BufferImpl) {
      return BufferImpl.from(input, 'utf8').toString('base64')
    }
    if (typeof btoa !== 'undefined') {
      return btoa(input)
    }
    return btoa2(input)
  }
  if (BufferImpl) {
    return BufferImpl.from(input).toString('base64')
  }
  const binary = String.fromCharCode(...Array.from(input))
  if (typeof btoa !== 'undefined') {
    return btoa(binary)
  }
  return btoa2(binary)
}

export function base64Decode(input: string): string {
  const BufferImpl = nodeBuffer()
  if (BufferImpl) {
    return BufferImpl.from(input, 'base64').toString('utf8')
  }
  if (typeof atob !== 'undefined') {
    return atob(input)
  }
  return atob2(input)
}

export function base64DecodeToBytes(input: string): Uint8Array {
  const BufferImpl = nodeBuffer()
  if (BufferImpl) {
    return new Uint8Array(BufferImpl.from(input, 'base64'))
  }
  const binaryString = typeof atob !== 'undefined' ? atob(input) : atob2(input)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * UTF-8 字符串转 base64。
 * 小程序没有 btoa，这里统一实现一份，Web / App / 小程序行为一致。
 */
export function lingyunUtf8ToBase64(input: string): string {
  const bytes: number[] = []
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1)
      const cp = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00)
      i += 1
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      )
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      )
    }
  }
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : -1
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : -1
    out += B64_CHARS[b0 >> 2]
    out += B64_CHARS[((b0 & 3) << 4) | (b1 >= 0 ? b1 >> 4 : 0)]
    out += b1 >= 0 ? B64_CHARS[((b1 & 15) << 2) | (b2 >= 0 ? b2 >> 6 : 0)] : '='
    out += b2 >= 0 ? B64_CHARS[b2 & 63] : '='
  }
  return out
}

/** SVG 文本节点 / 属性值转义 */
export function lingyunEscapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** SVG 字符串转 data URL，可直接给 <image src> 使用 */
export function lingyunSvgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${lingyunUtf8ToBase64(svg)}`
}

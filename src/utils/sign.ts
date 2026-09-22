import { md5 } from './md5'

type SignPayload = Record<string, unknown>

/** 对齐 ../mobile/utils/sign.js：字段按 key 排序后 MD5 */
export function getSign(data: SignPayload): string {
  const sorted: Record<string, string | number | boolean> = {}
  Object.keys(data)
    .sort()
    .forEach((key) => {
      const value = data[key]
      if (value === null || value === undefined) return
      if (typeof value === 'object') {
        sorted[key] = JSON.stringify(value)
      } else {
        sorted[key] = value as string | number | boolean
      }
    })
  const queryString = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join('&')
  return md5(queryString)
}

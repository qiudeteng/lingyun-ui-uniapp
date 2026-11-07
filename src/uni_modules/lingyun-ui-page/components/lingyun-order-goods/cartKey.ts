/** 规格 / 属性组合的购物车行 key 生成与解析。
 *  商品 key、规格 key 中不要包含 `::`；属性分组 / 选项 key 中不要包含 `=`。 */
import type {
  LingyunOrderAttributeGroup,
  LingyunOrderCartAttribute,
  LingyunOrderGoods,
  LingyunOrderSpec,
} from './types'

const LINE_SEP = '::'
const OPTION_SEP = '+'
const GROUP_SEP = '='

/** 无规格 / 属性时就是商品 key；有规格 / 属性时生成稳定的组合 key。
 *  optionTokens 形如 `groupKey=optionKey`，按分组顺序排列。 */
export function buildLineKey(
  itemKey: string,
  specKey = '',
  optionTokens: string[] = [],
): string {
  const options = optionTokens.filter(Boolean)
  if (!specKey && !options.length) return itemKey
  return [itemKey, specKey, options.join(OPTION_SEP)].join(LINE_SEP)
}

export interface ParsedLineKey {
  itemKey: string
  specKey: string
  optionTokens: string[]
}

export function parseLineKey(key: string): ParsedLineKey {
  const parts = String(key == null ? '' : key).split(LINE_SEP)
  if (parts.length <= 1) {
    return { itemKey: parts[0] || '', specKey: '', optionTokens: [] }
  }
  if (parts.length === 2) {
    return { itemKey: parts[0] || '', specKey: parts[1] || '', optionTokens: [] }
  }
  return {
    itemKey: parts[0] || '',
    specKey: parts[1] || '',
    optionTokens: (parts.slice(2).join(LINE_SEP) || '')
      .split(OPTION_SEP)
      .filter(Boolean),
  }
}

export function findSpec(
  item: LingyunOrderGoods | null | undefined,
  specKey: string,
): LingyunOrderSpec | undefined {
  if (!item || !specKey) return undefined
  return (item.specs || []).find((spec) => spec.key === specKey)
}

/** 库存：undefined / null / 空串表示不限；非法值按不限处理；0 保留 */
export function finiteStock(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const stock = Number(value)
  return Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : null
}

/** 按分组顺序把 `groupKey=optionKey[*数量]` token 还原成购物车行上的属性快照。
 *  兼容只有 optionKey 的旧行：去所有分组里找第一个匹配项。 */
export function attributesOf(
  item: LingyunOrderGoods | null | undefined,
  optionTokens: string[],
): LingyunOrderCartAttribute[] {
  if (!item || !optionTokens.length) return []
  const groups = item.attributeGroups || []
  const result: LingyunOrderCartAttribute[] = []
  optionTokens.forEach((token) => {
    const index = token.indexOf(GROUP_SEP)
    const groupKey = index >= 0 ? token.slice(0, index) : ''
    let optionKey = index >= 0 ? token.slice(index + 1) : token
    let quantity = 1
    const star = optionKey.lastIndexOf('*')
    if (star >= 0) {
      const parsed = Math.floor(Number(optionKey.slice(star + 1)))
      if (Number.isFinite(parsed) && parsed > 0) quantity = parsed
      optionKey = optionKey.slice(0, star)
    }
    const candidates = groupKey
      ? groups.filter((group) => group.key === groupKey)
      : groups
    for (const group of candidates) {
      const option = (group.options || []).find((entry) => entry.key === optionKey)
      if (option) {
        result.push({
          groupKey: group.key,
          groupTitle: group.title,
          optionKey: option.key,
          optionText: option.text,
          quantity,
          optionImage: option.image || '',
        })
        break
      }
    }
  })
  return result
}

/** 分组最多选几个；1 为单选 */
export function groupMax(group: LingyunOrderAttributeGroup): number {
  const max = Number(group.max)
  return Number.isFinite(max) && max > 0 ? Math.floor(max) : 1
}

/** 当前选择是否满足分组要求：至少选 1 个，且数量合计不超过 max */
export function groupSelectionValid(
  group: LingyunOrderAttributeGroup,
  selected: Record<string, number> | undefined,
): boolean {
  const total = Object.keys(selected || {}).reduce((sum, key) => {
    const quantity = Math.floor(Number(selected && selected[key]))
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
  }, 0)
  if (group.required && total < 1) return false
  return total <= groupMax(group)
}

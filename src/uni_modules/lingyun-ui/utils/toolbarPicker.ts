import { reactive } from 'vue'

const STORAGE_KEY = 'lingyun-toolbar-picker'

/** 顶栏副标题选择器的一项。业务自己决定 value / label，例如把门店 id 和店名传进来。 */
export interface LingyunToolbarPickerOption {
  value: string | number
  label: string
}

export interface LingyunToolbarPickerConfig {
  /** 可选项。只在数据变化时再传，换页不要重新查询。 */
  options?: LingyunToolbarPickerOption[]
  /** 当前值。不传则保留上一次的值。 */
  value?: string | number | null
  /** 弹出选择器的标题 */
  title?: string
  /** 还没有当前项时，副标题上的文案 */
  placeholder?: string
  /** 选择器里是否显示搜索 */
  searchable?: boolean
  searchPlaceholder?: string
  /** 选中后通知使用方。组件不请求数据，只改自己记住的当前值。 */
  onChange?: (value: string | number, option: LingyunToolbarPickerOption) => void
}

interface LingyunToolbarPickerSnapshot {
  options: LingyunToolbarPickerOption[]
  value: string | number | null
  title: string
  placeholder: string
  searchable: boolean
  searchPlaceholder: string
}

function isOption(value: unknown): value is LingyunToolbarPickerOption {
  if (!value || typeof value !== 'object') return false
  const item = value as LingyunToolbarPickerOption
  const okValue = typeof item.value === 'string' || typeof item.value === 'number'
  return okValue && typeof item.label === 'string'
}

function readSnapshot(): LingyunToolbarPickerSnapshot | null {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY) as unknown
    if (!raw || typeof raw !== 'object') return null
    const saved = raw as Partial<LingyunToolbarPickerSnapshot>
    if (!Array.isArray(saved.options) || !saved.options.every(isOption)) return null
    const value = saved.value
    const okValue = value == null || typeof value === 'string' || typeof value === 'number'
    if (!okValue) return null
    return {
      options: saved.options,
      value: value ?? null,
      title: typeof saved.title === 'string' ? saved.title : '',
      placeholder: typeof saved.placeholder === 'string' ? saved.placeholder : '请选择',
      searchable: saved.searchable !== false,
      searchPlaceholder:
        typeof saved.searchPlaceholder === 'string' ? saved.searchPlaceholder : '搜索',
    }
  } catch {
    return null
  }
}

function writeSnapshot(): void {
  try {
    const snapshot: LingyunToolbarPickerSnapshot = {
      options: lingyunToolbarPicker.options.slice(),
      value: lingyunToolbarPicker.value,
      title: lingyunToolbarPicker.title,
      placeholder: lingyunToolbarPicker.placeholder,
      searchable: lingyunToolbarPicker.searchable,
      searchPlaceholder: lingyunToolbarPicker.searchPlaceholder,
    }
    uni.setStorageSync(STORAGE_KEY, snapshot)
  } catch {
    /* 存储失败时内存里的名单仍然可用 */
  }
}

const cached = readSnapshot()

/**
 * 全站一份。选项和当前值记在这里，并写入本地存储。
 * 冷启动先读上次的名单；页面只负责开和关。回调不进缓存。
 */
export const lingyunToolbarPicker = reactive({
  /** 总开关。顶栏还要自己把 subtitlePicker 设为 true 才会显示。 */
  enabled: true,
  options: cached?.options.slice() ?? ([] as LingyunToolbarPickerOption[]),
  value: cached?.value ?? null,
  title: cached?.title ?? '',
  placeholder: cached?.placeholder ?? '请选择',
  searchable: cached?.searchable ?? true,
  searchPlaceholder: cached?.searchPlaceholder ?? '搜索',
})

let onChange: LingyunToolbarPickerConfig['onChange'] | null = null
let emptyPromptOpen = false

function matchedOption(value: string | number | null): LingyunToolbarPickerOption | undefined {
  if (value == null || value === '') return undefined
  return lingyunToolbarPicker.options.find((item) => String(item.value) === String(value))
}

/**
 * 只给「正在显示选择器」的页面用。
 * 有选项且当前值为空或对不上时，改成第一项并通知 onChange。
 * 没有选项时不改已记下的值，交给页面提示并返回。
 */
export function syncLingyunToolbarPickerSelection():
  | { empty: true }
  | { empty: false; value: string | number; option: LingyunToolbarPickerOption } {
  const options = lingyunToolbarPicker.options
  if (!options.length) return { empty: true }
  const hit = matchedOption(lingyunToolbarPicker.value)
  if (hit) return { empty: false, value: hit.value, option: hit }
  const first = options[0]
  lingyunToolbarPicker.value = first.value
  writeSnapshot()
  onChange?.(first.value, first)
  return { empty: false, value: first.value, option: first }
}

/**
 * 正在显示选择器、但名单是空的：提示一次并返回上一页。
 * 已经在提示时不重复弹。名单恢复后可以再次提示。
 */
export function notifyLingyunToolbarPickerEmpty(): void {
  if (lingyunToolbarPicker.options.length > 0) {
    emptyPromptOpen = false
    return
  }
  if (emptyPromptOpen) return
  emptyPromptOpen = true
  try {
    uni.showModal({
      title: '提示',
      content: '没有可选项',
      showCancel: false,
      success() {
        emptyPromptOpen = false
        try {
          const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
          if (pages.length > 1) uni.navigateBack({ delta: 1 })
        } catch {
          /* 已经是第一页时留在当前页 */
        }
      },
      fail() {
        emptyPromptOpen = false
      },
    })
  } catch {
    emptyPromptOpen = false
  }
}

/** 写入选项和当前值。不传的字段保持原样，避免换页时把已经准备好的名单清掉。 */
export function setLingyunToolbarPicker(config: LingyunToolbarPickerConfig): void {
  if (config.options) lingyunToolbarPicker.options = config.options.slice()
  if ('value' in config) lingyunToolbarPicker.value = config.value ?? null
  if (config.title != null) lingyunToolbarPicker.title = config.title
  if (config.placeholder != null) lingyunToolbarPicker.placeholder = config.placeholder
  if (config.searchable != null) lingyunToolbarPicker.searchable = !!config.searchable
  if (config.searchPlaceholder != null) {
    lingyunToolbarPicker.searchPlaceholder = config.searchPlaceholder
  }
  if (config.onChange) onChange = config.onChange
  const dirty =
    !!config.options ||
    'value' in config ||
    config.title != null ||
    config.placeholder != null ||
    config.searchable != null ||
    config.searchPlaceholder != null
  if (dirty) writeSnapshot()
}

/** 全部已打开的顶栏一起关或开。关了恢复副标题；名单和当前值都还在。单个顶栏默认不显示。 */
export function setLingyunToolbarPickerEnabled(enabled: boolean): void {
  lingyunToolbarPicker.enabled = !!enabled
}

/** 只改当前值，不换名单。 */
export function setLingyunToolbarPickerValue(value: string | number | null): void {
  lingyunToolbarPicker.value = value
  writeSnapshot()
}

/** 按选中下标提交。下标对不上时不改当前值。 */
export function commitLingyunToolbarPicker(index: number): void {
  const option = lingyunToolbarPicker.options[index]
  if (!option) return
  lingyunToolbarPicker.value = option.value
  writeSnapshot()
  onChange?.(option.value, option)
}

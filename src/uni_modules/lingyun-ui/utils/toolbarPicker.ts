import { reactive } from 'vue'

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

/**
 * 全站一份。选项和当前值记在这里，页面只负责开和关。
 * 顶栏读取这份状态，开启后画在副标题位置。
 */
export const lingyunToolbarPicker = reactive({
  /** 总开关。顶栏还要自己把 subtitlePicker 设为 true 才会显示。 */
  enabled: true,
  options: [] as LingyunToolbarPickerOption[],
  value: null as string | number | null,
  title: '',
  placeholder: '请选择',
  searchable: true,
  searchPlaceholder: '搜索',
})

let onChange: LingyunToolbarPickerConfig['onChange'] | null = null

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
}

/** 全部已打开的顶栏一起关或开。关了恢复副标题；名单和当前值都还在。单个顶栏默认不显示。 */
export function setLingyunToolbarPickerEnabled(enabled: boolean): void {
  lingyunToolbarPicker.enabled = !!enabled
}

/** 只改当前值，不换名单。 */
export function setLingyunToolbarPickerValue(value: string | number | null): void {
  lingyunToolbarPicker.value = value
}

/** 按选中下标提交。下标对不上时不改当前值。 */
export function commitLingyunToolbarPicker(index: number): void {
  const option = lingyunToolbarPicker.options[index]
  if (!option) return
  lingyunToolbarPicker.value = option.value
  onChange?.(option.value, option)
}

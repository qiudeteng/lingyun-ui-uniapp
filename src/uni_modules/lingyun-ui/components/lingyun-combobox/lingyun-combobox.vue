<template>
  <lingyun-popover
    v-model:show="visible"
    placement="bottom"
    :show-arrow="false"
    :width="dropdownWidth"
    :mask="true"
    :mask-transparent="true"
    :mask-closable="true"
    :z-index="zIndex"
    :bottom-inset="keyboardHeight"
    trigger-block
  >
    <template #trigger>
      <view
        class="lingyun-combobox__trigger"
        :class="{
          'lingyun-combobox__trigger--open': visible,
          'lingyun-combobox__trigger--disabled': disabled,
          'lingyun-combobox__trigger--readonly': readonly,
        }"
        :hover-class="
          disabled || readonly ? 'none' : 'lingyun-combobox__trigger--hover'
        "
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        :aria-expanded="visible ? 'true' : 'false'"
        @click="toggle"
      >
        <view class="lingyun-combobox__body">
          <text v-if="label" class="lingyun-combobox__label">{{ label }}</text>
          <text
            class="lingyun-combobox__value"
            :class="{ 'lingyun-combobox__value--placeholder': !hasValue }"
          >
            {{ hasValue ? displayText : placeholder }}
          </text>
        </view>

        <view
          v-if="clearable && hasValue && !disabled && !readonly"
          class="lingyun-combobox__clear"
          role="button"
          aria-label="清除"
          @click.stop="clear"
        >
          <lingyun-icon type="clear" :size="16" color="tertiary" />
        </view>

        <lingyun-icon
          class="lingyun-combobox__arrow"
          :class="{ 'lingyun-combobox__arrow--open': visible }"
          type="bottom"
          :size="16"
          color="tertiary"
        />
      </view>
    </template>

    <view class="lingyun-combobox__panel" @click.stop>
      <view v-if="showSearch" class="lingyun-combobox__search">
        <lingyun-icon type="search" :size="16" color="tertiary" />
        <input
          class="lingyun-combobox__input"
          :value="query"
          :focus="searchFocus"
          :placeholder="searchPlaceholder"
          placeholder-class="lingyun-combobox__placeholder"
          confirm-type="search"
          :adjust-position="false"
          @input="onSearchInput"
          @confirm="onSearchConfirm"
          @keyboardheightchange="onFieldKeyboardHeightChange"
        />
        <view
          v-if="query"
          class="lingyun-combobox__search-clear"
          role="button"
          aria-label="清除搜索"
          @click.stop="clearQuery"
        >
          <lingyun-icon type="closeempty" :size="14" color="tertiary" />
        </view>
      </view>

      <scroll-view
        class="lingyun-combobox__list"
        scroll-y
        :style="{ height: `${listHeight}px` }"
      >
        <view
          v-for="item in filteredItems"
          :key="String(item.value)"
          class="lingyun-combobox__option"
          :class="{
            'lingyun-combobox__option--selected': isSame(item.value, modelValue),
            'lingyun-combobox__option--disabled': item.disabled,
          }"
          :hover-class="item.disabled ? 'none' : 'lingyun-combobox__option--hover'"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="option"
          :aria-selected="isSame(item.value, modelValue) ? 'true' : 'false'"
          @click.stop="select(item)"
        >
          <view class="lingyun-combobox__option-body">
            <text class="lingyun-combobox__option-label">{{ item.label }}</text>
            <text v-if="item.description" class="lingyun-combobox__option-desc">
              {{ item.description }}
            </text>
          </view>
          <lingyun-icon
            v-if="isSame(item.value, modelValue)"
            type="checkmarkempty"
            :size="16"
            color="primary"
          />
        </view>

        <view v-if="!filteredItems.length" class="lingyun-combobox__empty">
          {{ emptyText }}
        </view>
      </scroll-view>
    </view>
  </lingyun-popover>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type {
  LingyunComboboxChangePayload,
  LingyunComboboxItem,
  LingyunComboboxValue,
} from './types'

type SearchEvent = {
  detail?: { value?: unknown }
  target?: { value?: unknown } | null
}

/**
 * lingyun-combobox
 * @description 可搜索选择：字段触发 + Popover 搜索列表
 * @see design/COMBOBOX.md
 */
defineOptions({
  name: 'LingyunCombobox',
})

const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<LingyunComboboxValue>,
    default: null,
  },
  items: {
    type: Array as PropType<LingyunComboboxItem[]>,
    default: () => [],
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  searchPlaceholder: { type: String, default: '搜索' },
  emptyText: { type: String, default: '没有匹配项' },
  showSearch: { type: Boolean, default: true },
  clearable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  dropdownWidth: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
  },
  maxHeight: { type: Number, default: 240 },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1250 },
})

const emit = defineEmits(['update:modelValue', 'change', 'open', 'close', 'search'])

const visible = ref(false)
const query = ref('')
const keyboardHeight = ref(0)
const searchFocus = ref(false)
const focusTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function isSame(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return a === b
  return String(a) === String(b)
}

const normalizedItems = computed((): LingyunComboboxItem[] => {
  const list = Array.isArray(props.items) ? props.items : []
  return list.map((item) => ({
    label: String(item?.label ?? item?.value ?? ''),
    value: item?.value ?? '',
    description: item?.description ? String(item.description) : '',
    disabled: item?.disabled === true,
  }))
})

const selectedItem = computed((): LingyunComboboxItem | null => {
  return (
    normalizedItems.value.find((item) =>
      isSame(item.value, props.modelValue),
    ) || null
  )
})

const hasValue = computed((): boolean => {
  return (
    selectedItem.value != null ||
    (props.modelValue != null && props.modelValue !== '')
  )
})

const displayText = computed((): string => {
  if (selectedItem.value) return selectedItem.value.label
  return props.modelValue == null ? '' : String(props.modelValue)
})

const filteredItems = computed((): LingyunComboboxItem[] => {
  const keyword = String(query.value || '').trim().toLowerCase()
  if (!keyword) return normalizedItems.value
  return normalizedItems.value.filter((item) => {
    return (
      item.label.toLowerCase().includes(keyword) ||
      (item.description || '').toLowerCase().includes(keyword)
    )
  })
})

const listHeight = computed((): number => {
  const max = Math.max(80, Number(props.maxHeight) || 240)
  /* 键盘抬起时缩短列表，配合 Popover bottomInset 保证不被键盘覆盖 */
  const effectiveMax =
    keyboardHeight.value > 0 ? Math.min(max, 160) : max
  const rowHeight = 56
  const height = filteredItems.value.length
    ? filteredItems.value.length * rowHeight + 8
    : 64
  return Math.min(effectiveMax, height)
})

function toggle(): void {
  if (props.disabled || props.readonly) return
  visible.value = !visible.value
}

function open(): void {
  if (props.disabled || props.readonly) return
  visible.value = true
}

function close(): void {
  visible.value = false
}

function select(item: LingyunComboboxItem): void {
  if (item.disabled) return
  const payload: LingyunComboboxChangePayload = {
    value: item.value,
    item,
  }
  emit('update:modelValue', item.value)
  emit('change', payload)
  visible.value = false
}

function clear(): void {
  if (props.disabled || props.readonly) return
  emit('update:modelValue', null)
  emit('change', { value: null, item: null })
  visible.value = false
}

function onSearchInput(event: InputEvent): void {
  const rawEvent = event as unknown as SearchEvent
  const detail = rawEvent?.detail
  const target = rawEvent?.target
  const value =
    detail && detail.value != null
      ? detail.value
      : target && target.value != null
        ? target.value
        : ''
  query.value = String(value)
  emit('search', query.value)
}

function onSearchConfirm(): void {
  if (filteredItems.value.length) select(filteredItems.value[0])
}

function onFieldKeyboardHeightChange(event: { detail?: { height?: number } }): void {
  const height = Number(event?.detail?.height)
  keyboardHeight.value =
    Number.isFinite(height) && height > 0 ? Math.round(height) : 0
}

function clearQuery(): void {
  query.value = ''
}

watch(visible, (value: boolean) => {
  if (value) {
    query.value = ''
    searchFocus.value = false
    emit('open')
    if (focusTimer.value) clearTimeout(focusTimer.value)
    let delay = 80
    // #ifdef MP-WEIXIN
    /* Popover 在 root-portal 内挂载，稍等展开后再聚焦才能拉起键盘 */
    delay = 260
    // #endif
    focusTimer.value = setTimeout(() => {
      focusTimer.value = null
      if (visible.value) searchFocus.value = true
    }, delay)
    return
  }
  if (focusTimer.value) {
    clearTimeout(focusTimer.value)
    focusTimer.value = null
  }
  searchFocus.value = false
  query.value = ''
  keyboardHeight.value = 0
  emit('close')
})

watch(
  () => props.disabled,
  (value: boolean) => {
    if (value) visible.value = false
  },
)

onBeforeUnmount(() => {
  if (focusTimer.value) {
    clearTimeout(focusTimer.value)
    focusTimer.value = null
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-combobox__trigger {
  width: 100%;
  box-sizing: border-box;
  min-height: 52px;
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-combobox__trigger--open {
  box-shadow: inset 0 0 0 1px var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-combobox__trigger--hover {
  opacity: 0.84;
}

.lingyun-combobox__trigger--disabled,
.lingyun-combobox__trigger--readonly {
  opacity: 0.5;
  pointer-events: none;
}

.lingyun-combobox__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lingyun-combobox__label {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-combobox__value {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-combobox__value--placeholder {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-combobox__clear {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.lingyun-combobox__arrow {
  flex: 0 0 auto;
  transition: transform 0.22s ease;
}

.lingyun-combobox__arrow--open {
  transform: rotate(180deg);
}

.lingyun-combobox__panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lingyun-combobox__search {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  box-sizing: border-box;
  border-radius: 10px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-combobox__input {
  flex: 1;
  min-width: 0;
  height: 36px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-combobox__placeholder {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-combobox__search-clear {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.lingyun-combobox__list {
  width: 100%;
}

.lingyun-combobox__option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 52px;
  padding: 8px 10px;
  box-sizing: border-box;
  border-radius: 10px;
}

.lingyun-combobox__option--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-combobox__option--selected {
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.14));
}

.lingyun-combobox__option--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.lingyun-combobox__option-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lingyun-combobox__option-label {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-combobox__option-desc {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-combobox__empty {
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}
</style>

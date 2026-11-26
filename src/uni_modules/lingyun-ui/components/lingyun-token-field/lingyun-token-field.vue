<template>
  <view class="lingyun-token-field" :class="rootClass">
    <text v-if="label" class="lingyun-token-field__label">{{ label }}</text>

    <view
      class="lingyun-token-field__field"
      :class="{
        'lingyun-token-field__field--focused': focused && !disabled && !readonly,
        'lingyun-token-field__field--disabled': disabled,
        'lingyun-token-field__field--readonly': readonly,
      }"
      @click="focusInput"
    >
      <view
        v-for="(token, index) in tokens"
        :key="`${token}-${index}`"
        class="lingyun-token-field__token"
      >
        <text class="lingyun-token-field__token-text">{{ token }}</text>
        <view
          v-if="!disabled && !readonly"
          class="lingyun-token-field__token-remove"
          role="button"
          :aria-label="`移除 ${token}`"
          @click.stop="removeToken(index)"
        >
          <lingyun-icon type="closeempty" :size="12" color="secondary" />
        </view>
      </view>

      <input
        v-if="!readonly"
        class="lingyun-token-field__input"
        :value="inputValue"
        :placeholder="tokens.length ? '' : placeholder"
        placeholder-class="lingyun-token-field__placeholder"
        :disabled="disabled"
        :focus="focused"
        :maxlength="inputMaxlength"
        confirm-type="done"
        @input="onInput"
        @confirm="onConfirm"
        @focus="onFocus"
        @blur="onBlur"
      />

      <text
        v-if="showCount && max > 0"
        class="lingyun-token-field__count"
      >
        {{ tokens.length }}/{{ max }}
      </text>
    </view>

    <view
      v-if="suggestionVisible"
      class="lingyun-token-field__suggestions"
    >
      <view
        v-for="item in suggestionItems"
        :key="item"
        class="lingyun-token-field__suggestion"
        role="button"
        @mousedown="onSuggestionPointerDown"
        @touchstart="onSuggestionPointerDown"
        @click="selectSuggestion(item)"
      >
        <text class="lingyun-token-field__suggestion-text">{{ item }}</text>
        <lingyun-icon type="plusempty" :size="14" color="tertiary" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunTokenFieldAddPayload,
  LingyunTokenFieldChangePayload,
  LingyunTokenFieldInvalidPayload,
  LingyunTokenFieldRemovePayload,
} from './types'

type InputEventLike = {
  detail?: { value?: unknown }
  target?: { value?: unknown } | null
}

/**
 * lingyun-token-field
 * @description 多选标签输入：回车 / 分隔符添加、建议、去重、上限
 * @see design/TOKEN_FIELDS.md
 */
defineOptions({
  name: 'LingyunTokenField',
})

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '输入后按回车添加' },
  max: { type: Number, default: 0 },
  suggestions: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  allowCustom: { type: Boolean, default: true },
  allowDuplicate: { type: Boolean, default: false },
  addOnBlur: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  inputMaxlength: { type: Number, default: 40 },
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'add',
  'remove',
  'invalid',
  'focus',
  'blur',
])

const inputValue = ref('')
const focused = ref(false)
const selectingSuggestion = ref(false)
const blurTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})
const tokens = computed((): string[] => {
  return (Array.isArray(props.modelValue) ? props.modelValue : [])
    .map((token) => String(token == null ? '' : token))
    .filter((token) => token.length > 0)
})
const resolvedMax = computed((): number => {
  const value = Math.floor(Number(props.max))
  return Number.isFinite(value) && value > 0 ? value : 0
})
const atMax = computed((): boolean => {
  return resolvedMax.value > 0 && tokens.value.length >= resolvedMax.value
})
const suggestionItems = computed((): string[] => {
  if (props.disabled || props.readonly || atMax.value) return []
  const query = inputValue.value.trim().toLowerCase()
  const selected = new Set(tokens.value)
  const seen = new Set<string>()
  return (Array.isArray(props.suggestions) ? props.suggestions : [])
    .map((item) => String(item == null ? '' : item).trim())
    .filter((item) => {
      if (!item || selected.has(item) || seen.has(item)) return false
      if (query && !item.toLowerCase().includes(query)) return false
      seen.add(item)
      return true
    })
    .slice(0, 6)
})
const suggestionVisible = computed((): boolean => {
  return focused.value && suggestionItems.value.length > 0
})

function emitInvalid(value: string, reason: 'duplicate' | 'max' | 'custom'): void {
  const payload: LingyunTokenFieldInvalidPayload = { value, reason }
  emit('invalid', payload)
}

function addToken(raw: string): boolean {
  if (props.disabled || props.readonly) return false
  const token = String(raw == null ? '' : raw).trim()
  if (!token) return false
  if (atMax.value) {
    emitInvalid(token, 'max')
    return false
  }
  if (!props.allowDuplicate && tokens.value.includes(token)) {
    inputValue.value = ''
    emitInvalid(token, 'duplicate')
    return false
  }
  if (
    !props.allowCustom &&
    !props.suggestions.map((item) => String(item)).includes(token)
  ) {
    emitInvalid(token, 'custom')
    return false
  }
  const next = tokens.value.concat(token)
  inputValue.value = ''
  emit('update:modelValue', next)
  const change: LingyunTokenFieldChangePayload = { tokens: next }
  emit('change', change)
  const payload: LingyunTokenFieldAddPayload = { token, tokens: next }
  emit('add', payload)
  return true
}

function scheduleBlur(): void {
  if (blurTimer.value) clearTimeout(blurTimer.value)
  blurTimer.value = setTimeout(() => {
    blurTimer.value = null
    selectingSuggestion.value = false
    focused.value = false
  }, 160)
}

function focusInput(): void {
  if (props.disabled || props.readonly) return
  focused.value = true
}

function onFocus(): void {
  focused.value = true
  emit('focus')
}

function onBlur(): void {
  if (selectingSuggestion.value) {
    scheduleBlur()
    return
  }
  focused.value = false
  if (props.addOnBlur && inputValue.value.trim()) {
    addToken(inputValue.value)
  }
  emit('blur')
}

function onSuggestionPointerDown(): void {
  selectingSuggestion.value = true
  if (blurTimer.value) {
    clearTimeout(blurTimer.value)
    blurTimer.value = null
  }
}

function onInput(event: InputEvent): void {
  const rawEvent = event as unknown as InputEventLike
  const detail = rawEvent?.detail
  const target = rawEvent?.target
  const value =
    detail && detail.value != null
      ? detail.value
      : target && target.value != null
        ? target.value
        : ''
  const raw = String(value)
  if (/[,，]/.test(raw)) {
    raw.split(/[,，]/).forEach((part) => {
      if (part.trim()) addToken(part)
    })
    inputValue.value = ''
    return
  }
  inputValue.value = raw
}

function onConfirm(): void {
  if (inputValue.value.trim()) {
    addToken(inputValue.value)
    return
  }
  if (suggestionItems.value.length) {
    addToken(suggestionItems.value[0])
  }
}

function selectSuggestion(value: string): void {
  addToken(value)
  selectingSuggestion.value = false
  if (blurTimer.value) {
    clearTimeout(blurTimer.value)
    blurTimer.value = null
  }
  focused.value = false
}

function removeToken(index: number): void {
  if (props.disabled || props.readonly) return
  const nextTokens = tokens.value.slice()
  const token = nextTokens[index]
  if (token == null) return
  nextTokens.splice(index, 1)
  emit('update:modelValue', nextTokens)
  const change: LingyunTokenFieldChangePayload = { tokens: nextTokens }
  emit('change', change)
  const payload: LingyunTokenFieldRemovePayload = {
    token,
    index,
    tokens: nextTokens,
  }
  emit('remove', payload)
}

function clear(): void {
  if (props.disabled || props.readonly) return
  emit('update:modelValue', [])
  const change: LingyunTokenFieldChangePayload = { tokens: [] }
  emit('change', change)
}

onBeforeUnmount(() => {
  if (blurTimer.value) {
    clearTimeout(blurTimer.value)
    blurTimer.value = null
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-token-field {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-token-field__label {
  display: block;
  padding: 0 2px 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-token-field__field {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 12px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-token-field__field--focused {
  box-shadow: inset 0 0 0 1px var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-token-field__field--disabled,
.lingyun-token-field__field--readonly {
  opacity: 0.5;
}

.lingyun-token-field__token {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  height: 28px;
  padding: 0 4px 0 8px;
  box-sizing: border-box;
  border-radius: 14px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-token-field__token-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-token-field__token-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.lingyun-token-field__input {
  flex: 1;
  min-width: 90px;
  height: 32px;
  margin: 0;
  padding: 0 2px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-token-field__placeholder {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-token-field__count {
  flex: 0 0 auto;
  padding: 0 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-token-field__suggestions {
  margin-top: 6px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-token-field__suggestion {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
}

.lingyun-token-field__suggestion:not(:last-child) {
  box-shadow: inset 0 -0.5px 0 var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-token-field__suggestion-text {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

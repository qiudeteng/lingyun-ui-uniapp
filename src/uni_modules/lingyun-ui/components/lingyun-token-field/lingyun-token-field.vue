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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
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
export default defineComponent({
  name: 'LingyunTokenField',
  emits: [
    'update:modelValue',
    'change',
    'add',
    'remove',
    'invalid',
    'focus',
    'blur',
  ],
  props: {
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
  },
  data(): {
    inputValue: string
    focused: boolean
    selectingSuggestion: boolean
    blurTimer: ReturnType<typeof setTimeout> | null
  } {
    return {
      inputValue: '',
      focused: false,
      selectingSuggestion: false,
      blurTimer: null,
    }
  },
  beforeUnmount() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer)
      this.blurTimer = null
    }
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    tokens(): string[] {
      return (Array.isArray(this.modelValue) ? this.modelValue : [])
        .map((token) => String(token == null ? '' : token))
        .filter((token) => token.length > 0)
    },
    resolvedMax(): number {
      const value = Math.floor(Number(this.max))
      return Number.isFinite(value) && value > 0 ? value : 0
    },
    atMax(): boolean {
      return this.resolvedMax > 0 && this.tokens.length >= this.resolvedMax
    },
    suggestionItems(): string[] {
      if (this.disabled || this.readonly || this.atMax) return []
      const query = this.inputValue.trim().toLowerCase()
      const selected = new Set(this.tokens)
      const seen = new Set<string>()
      return (Array.isArray(this.suggestions) ? this.suggestions : [])
        .map((item) => String(item == null ? '' : item).trim())
        .filter((item) => {
          if (!item || selected.has(item) || seen.has(item)) return false
          if (query && !item.toLowerCase().includes(query)) return false
          seen.add(item)
          return true
        })
        .slice(0, 6)
    },
    suggestionVisible(): boolean {
      return this.focused && this.suggestionItems.length > 0
    },
  },
  methods: {
    focusInput(): void {
      if (this.disabled || this.readonly) return
      this.focused = true
    },
    onFocus(): void {
      this.focused = true
      this.$emit('focus')
    },
    onBlur(): void {
      if (this.selectingSuggestion) {
        this.scheduleBlur()
        return
      }
      this.focused = false
      if (this.addOnBlur && this.inputValue.trim()) {
        this.addToken(this.inputValue)
      }
      this.$emit('blur')
    },
    onSuggestionPointerDown(): void {
      this.selectingSuggestion = true
      if (this.blurTimer) {
        clearTimeout(this.blurTimer)
        this.blurTimer = null
      }
    },
    scheduleBlur(): void {
      if (this.blurTimer) clearTimeout(this.blurTimer)
      this.blurTimer = setTimeout(() => {
        this.blurTimer = null
        this.selectingSuggestion = false
        this.focused = false
      }, 160)
    },
    onInput(event: InputEvent): void {
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
          if (part.trim()) this.addToken(part)
        })
        this.inputValue = ''
        return
      }
      this.inputValue = raw
    },
    onConfirm(): void {
      if (this.inputValue.trim()) {
        this.addToken(this.inputValue)
        return
      }
      if (this.suggestionItems.length) {
        this.addToken(this.suggestionItems[0])
      }
    },
    selectSuggestion(value: string): void {
      this.addToken(value)
      this.selectingSuggestion = false
      if (this.blurTimer) {
        clearTimeout(this.blurTimer)
        this.blurTimer = null
      }
      this.focused = false
    },
    addToken(raw: string): boolean {
      if (this.disabled || this.readonly) return false
      const token = String(raw == null ? '' : raw).trim()
      if (!token) return false
      if (this.atMax) {
        this.emitInvalid(token, 'max')
        return false
      }
      if (!this.allowDuplicate && this.tokens.includes(token)) {
        this.inputValue = ''
        this.emitInvalid(token, 'duplicate')
        return false
      }
      if (
        !this.allowCustom &&
        !this.suggestions.map((item) => String(item)).includes(token)
      ) {
        this.emitInvalid(token, 'custom')
        return false
      }
      const next = this.tokens.concat(token)
      this.inputValue = ''
      this.$emit('update:modelValue', next)
      const change: LingyunTokenFieldChangePayload = { tokens: next }
      this.$emit('change', change)
      const payload: LingyunTokenFieldAddPayload = { token, tokens: next }
      this.$emit('add', payload)
      return true
    },
    removeToken(index: number): void {
      if (this.disabled || this.readonly) return
      const tokens = this.tokens.slice()
      const token = tokens[index]
      if (token == null) return
      tokens.splice(index, 1)
      this.$emit('update:modelValue', tokens)
      const change: LingyunTokenFieldChangePayload = { tokens }
      this.$emit('change', change)
      const payload: LingyunTokenFieldRemovePayload = {
        token,
        index,
        tokens,
      }
      this.$emit('remove', payload)
    },
    clear(): void {
      if (this.disabled || this.readonly) return
      this.$emit('update:modelValue', [])
      const change: LingyunTokenFieldChangePayload = { tokens: [] }
      this.$emit('change', change)
    },
    emitInvalid(value: string, reason: 'duplicate' | 'max' | 'custom'): void {
      const payload: LingyunTokenFieldInvalidPayload = { value, reason }
      this.$emit('invalid', payload)
    },
  },
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

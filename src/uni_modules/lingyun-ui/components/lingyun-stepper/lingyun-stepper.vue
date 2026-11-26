<template>
  <view class="lingyun-stepper-host" :class="{ 'lingyun-stepper-host--disabled': disabled }">
    <text v-if="leftTextClipped" class="lingyun-stepper__side-text">{{ leftTextClipped }}</text>
    <view
      class="lingyun-stepper"
      :class="{
        'lingyun-stepper--disabled': disabled,
        'lingyun-stepper--large': isLarge,
      }"
    >
      <view
        class="lingyun-stepper__btn"
        :class="{ 'lingyun-stepper__btn--disabled': atMin }"
        hover-class="lingyun-stepper__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onStep(-1)"
      >
        <text class="lingyun-stepper__mark">−</text>
      </view>
      <view class="lingyun-stepper__div" />
      <input
        v-if="showValue"
        class="lingyun-stepper__value"
        type="number"
        :style="valueStyle"
        :value="draft"
        :disabled="disabled"
        confirm-type="done"
        @input="onDraft"
        @focus="onFocus"
        @blur="commitDraft"
        @confirm="commitDraft"
      />
      <view v-if="showValue" class="lingyun-stepper__div" />
      <view
        class="lingyun-stepper__btn"
        :class="{ 'lingyun-stepper__btn--disabled': atMax }"
        hover-class="lingyun-stepper__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onStep(1)"
      >
        <text class="lingyun-stepper__mark">+</text>
      </view>
    </view>
    <text v-if="rightTextClipped" class="lingyun-stepper__side-text">{{ rightTextClipped }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type PropType } from 'vue'

/**
 * lingyun-stepper
 * @see design/SWITCHES.md
 */

type StepperFieldEvent = {
  detail?: { value?: string | number }
  target?: { value?: string | number } | null
}

/** 左右说明文字最多 4 个字（按 Unicode 码点截断，避免拆开 emoji） */
function clipSideText(value: unknown): string {
  const text = String(value == null ? '' : value).trim()
  return Array.from(text).slice(0, 4).join('')
}

defineOptions({
  name: 'LingyunStepper',
})

const props = defineProps({
  modelValue: { type: Number as PropType<number | undefined>, default: undefined },
  value: { type: Number as PropType<number | undefined>, default: undefined },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  /** 在 − / + 之间展示可编辑的当前值 */
  showValue: { type: Boolean, default: false },
  /** 步进器左侧灰色说明文字，最多 4 个字 */
  leftText: { type: String, default: '' },
  /** 步进器右侧灰色说明文字，最多 4 个字 */
  rightText: { type: String, default: '' },
  /** 尺寸：default 30 高；large 38 高，按钮更宽，适合真机大点击区 */
  size: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change'])

const draft = ref('')
const editing = ref(false)

const current = computed((): number => {
  if (props.modelValue !== undefined && props.modelValue !== null) return Number(props.modelValue)
  if (props.value !== undefined && props.value !== null) return Number(props.value)
  return 0
})

const atMin = computed((): boolean => props.disabled || current.value <= props.min)

const atMax = computed((): boolean => props.disabled || current.value >= props.max)

const leftTextClipped = computed((): string => clipSideText(props.leftText))

const rightTextClipped = computed((): string => clipSideText(props.rightText))

const isLarge = computed((): boolean => props.size === 'large')

function format(n: number): string {
  const value = Number(n)
  if (!Number.isFinite(value)) return ''
  const step = Number(props.step) || 1
  const digits = (String(step).split('.')[1] || '').length
  return digits ? String(Number(value.toFixed(Math.min(8, digits)))) : String(value)
}

const valueStyle = computed((): { width: string } => {
  const text = editing.value ? String(draft.value) : format(current.value)
  const len = Math.max(1, text.length)
  /* 15px 数字约 8.3px/位，留 ~1.7px/位余量 + 12px 内边距，按位数自适应 */
  return { width: `${Math.max(36, Math.ceil(len * 10 + 12))}px` }
})

function emitValue(next: number): void {
  editing.value = false
  draft.value = format(next)
  if (next === current.value) return
  emit('update:modelValue', next)
  emit('update:value', next)
  emit('change', next)
}

function onStep(dir: number): void {
  if (props.disabled) return
  const next = current.value + dir * (Number(props.step) || 1)
  const clamped = Math.min(props.max, Math.max(props.min, next))
  if (clamped === current.value) {
    editing.value = false
    draft.value = format(current.value)
    return
  }
  emitValue(clamped)
}

function onFocus(): void {
  editing.value = true
}

function readEventValue(event?: StepperFieldEvent | null): string | null {
  if (!event) return null
  const detail = event.detail
  if (detail && detail.value != null) return String(detail.value)
  const target = event.target
  if (target && target.value != null) return String(target.value)
  return null
}

function onDraft(event?: unknown): void {
  const value = readEventValue(event as StepperFieldEvent)
  draft.value = value == null ? '' : value
}

function commitDraft(event?: unknown): void {
  const typed = readEventValue(event as StepperFieldEvent)
  if (typed != null) draft.value = typed
  editing.value = false
  const raw = String(draft.value).trim()
  const parsed = Number(raw)
  if (raw === '' || !Number.isFinite(parsed)) {
    draft.value = format(current.value)
    return
  }
  const step = Number(props.step) || 1
  const min = Number(props.min)
  const max = Number(props.max)
  let next = parsed
  if (step > 0) {
    const snapped = min + Math.round((parsed - min) / step) * step
    const digits = (String(step).split('.')[1] || '').length
    next = digits ? Number(snapped.toFixed(Math.min(8, digits))) : snapped
  }
  next = Math.min(max, Math.max(min, next))
  emitValue(next)
}

watch(
  current,
  (val: number) => {
    if (!editing.value) draft.value = format(val)
  },
  { immediate: true },
)
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 外层只负责左右说明文字与控件对齐；控件自身仍是 .lingyun-stepper */
.lingyun-stepper-host {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.lingyun-stepper__side-text {
  flex-shrink: 0;
  font-size: 15px;
  line-height: 20px;
  white-space: nowrap;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-stepper-host--disabled .lingyun-stepper__side-text {
  opacity: 0.45;
}

.lingyun-stepper {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  height: 30px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-stepper--disabled {
  opacity: 0.45;
}

/* 大号：真机大点击区 */
.lingyun-stepper--large {
  height: 38px;
  border-radius: 10px;
}

.lingyun-stepper--large .lingyun-stepper__btn {
  width: 46px;
}

.lingyun-stepper--large .lingyun-stepper__mark {
  font-size: 21px;
  line-height: 24px;
}

.lingyun-stepper--large .lingyun-stepper__div {
  margin: 8px 0;
}

.lingyun-stepper--large .lingyun-stepper__value {
  height: 38px;
  min-height: 38px;
  font-size: 17px;
  line-height: 38px;
}

.lingyun-stepper__btn {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-stepper__btn--hover {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-stepper__btn--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.lingyun-stepper__mark {
  font-size: 18px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-stepper__div {
  width: 1px;
  margin: 6px 0;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-stepper__value {
  flex-shrink: 0;
  height: 30px;
  min-height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
  text-align: center;
  font-size: 15px;
  line-height: 30px;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* #ifdef H5 */
.lingyun-stepper__value {
  appearance: textfield;
}

.lingyun-stepper__value::-webkit-outer-spin-button,
.lingyun-stepper__value::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
/* #endif */
</style>

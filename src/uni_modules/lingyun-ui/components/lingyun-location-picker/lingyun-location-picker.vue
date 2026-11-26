<template>
  <view
    class="lingyun-location-picker"
    :class="[rootClass, { 'lingyun-location-picker--disabled': disabled }]"
  >
    <view
      class="lingyun-location-picker__row"
      :hover-class="hoverClass"
      :hover-start-time="20"
      :hover-stay-time="70"
      role="button"
      :aria-disabled="disabled ? 'true' : 'false'"
      @click="open"
    >
      <view v-if="showIcon" class="lingyun-location-picker__icon">
        <lingyun-icon :type="icon" :size="20" color="primary" />
      </view>

      <view class="lingyun-location-picker__body">
        <text class="lingyun-location-picker__label">{{ label }}</text>
        <text
          class="lingyun-location-picker__value"
          :class="{ 'lingyun-location-picker__value--placeholder': !hasValue }"
        >
          {{ hasValue ? displayName : placeholder }}
        </text>
        <text
          v-if="hasValue && displayAddress"
          class="lingyun-location-picker__address"
        >
          {{ displayAddress }}
        </text>
        <text
          v-if="hasValue && showCoordinate"
          class="lingyun-location-picker__coord"
        >
          {{ coordinateText }}
        </text>
      </view>

      <lingyun-icon
        v-if="!readonly"
        type="right"
        :size="18"
        color="tertiary"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunLocation,
  LingyunLocationErrorPayload,
} from './types'

interface LocationResultLike {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
}

/**
 * lingyun-location-picker
 * @description 位置选择：小程序 / App 走 uni.chooseLocation，H5 使用内置地图并注入腾讯 Key
 * @see design/LOCATION_PICKER.md
 */
defineOptions({
  name: 'LingyunLocationPicker',
})

const props = defineProps({
  modelValue: {
    type: Object as PropType<LingyunLocation | null>,
    default: null,
  },
  label: { type: String, default: '选择位置' },
  placeholder: { type: String, default: '请选择门店或收货地址' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  showIcon: { type: Boolean, default: true },
  icon: { type: String, default: 'location-filled' },
  showCoordinate: { type: Boolean, default: false },
  showErrorToast: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'change', 'open', 'cancel', 'error'])

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})

const hasValue = computed((): boolean => {
  const value = props.modelValue
  return !!value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))
})

const displayName = computed((): string => {
  const value = props.modelValue
  if (!value) return ''
  return String(value.name || value.address || '').trim()
})

const displayAddress = computed((): string => {
  const value = props.modelValue
  if (!value) return ''
  const name = String(value.name || '').trim()
  const address = String(value.address || '').trim()
  if (!address) return ''
  return address === name ? '' : address
})

const coordinateText = computed((): string => {
  const value = props.modelValue
  if (!value) return ''
  const latitude = Number(value.latitude)
  const longitude = Number(value.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return ''
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
})

const hoverClass = computed((): string => {
  return props.disabled || props.readonly
    ? 'none'
    : 'lingyun-location-picker__row--hover'
})

function fail(message: string): void {
  if (props.showErrorToast && message) {
    uni.showToast({ title: message, icon: 'none' })
  }
  const payload: LingyunLocationErrorPayload = { message }
  emit('error', payload)
}

function errorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const raw = error as { errMsg?: unknown; message?: unknown }
    if (raw.errMsg != null) return String(raw.errMsg)
    if (raw.message != null) return String(raw.message)
  }
  return ''
}

function handleFail(error: unknown): void {
  const message = errorMessage(error)
  if (/cancel/i.test(message)) {
    emit('cancel')
    return
  }
  fail(message || '选择位置失败')
}

function handleSuccess(result: LocationResultLike): void {
  const latitude = Number(result && result.latitude)
  const longitude = Number(result && result.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    fail('未获取到位置坐标')
    return
  }
  const name = String((result && result.name) || '').trim()
  const address = String((result && result.address) || '').trim()
  const location: LingyunLocation = {
    name: name || address || '已选择位置',
    address: address || name,
    latitude,
    longitude,
  }
  emit('update:modelValue', location)
  emit('change', location)
}

function ensureH5MapKey(): boolean {
  // #ifdef H5
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  if (!key) {
    fail('未配置腾讯地图 Key，请在 .env.local 设置 VITE_TENCENT_MAP_KEY')
    return false
  }
  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      __uniConfig?: Record<string, unknown>
    }
    if (!win.__uniConfig) win.__uniConfig = {}
    win.__uniConfig.qqMapKey = key
  }
  // #endif
  return true
}

function open(): void {
  if (props.disabled || props.readonly) return
  // #ifdef H5
  if (!ensureH5MapKey()) return
  // #endif
  emit('open')

  const options: Record<string, unknown> = {
    success: (result: LocationResultLike) => handleSuccess(result),
    fail: (error: unknown) => handleFail(error),
  }
  const value = props.modelValue
  if (value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))) {
    options.latitude = Number(value.latitude)
    options.longitude = Number(value.longitude)
  }

  try {
    ;(
      uni as typeof uni & {
        chooseLocation: (options: Record<string, unknown>) => void
      }
    ).chooseLocation(options)
  } catch (error) {
    handleFail(error)
  }
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-location-picker {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-location-picker__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  box-sizing: border-box;
  min-height: 64px;
  border-radius: 16px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-location-picker__row--hover {
  opacity: 0.72;
}

.lingyun-location-picker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.lingyun-location-picker__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.14));
}

.lingyun-location-picker__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lingyun-location-picker__label {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-location-picker__value {
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-location-picker__value--placeholder {
  font-weight: 400;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-location-picker__address {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-location-picker__coord {
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}
</style>

<template>
  <view class="lingyun-form-item" :class="rootClass">
    <view
      v-if="!isFirstChild"
      class="lingyun-form-item__divider"
    />
    <view class="lingyun-form-item__row" :class="rowClass">
      <view v-if="showLabel" class="lingyun-form-item__label-wrap">
        <text v-if="required" class="lingyun-form-item__star">*</text>
        <text class="lingyun-form-item__label">{{ label }}</text>
      </view>
      <view class="lingyun-form-item__control">
        <slot />
      </view>
    </view>
    <view v-if="resolvedError" class="lingyun-form-item__error">
      <text class="lingyun-form-item__error-text">{{ resolvedError }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { inject, provide } from 'vue'

type LingyunFormLike = {
  fieldErrors?: Record<string, string>
  registerField?: (name: string, item: unknown) => void
  unregisterField?: (name: string) => void
  validateField?: (name: string) => Promise<unknown>
}

type LingyunFormGroupLike = {
  firstChildAppend: boolean
}

/**
 * lingyun-form-item
 * @see design/FORMS.md
 */
defineOptions({
  name: 'LingyunFormItem',
})

const props = defineProps({
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  layout: { type: String, default: 'row' },
})

const lingyunForm = inject<LingyunFormLike | null>('lingyunForm', null)
const lingyunFormGroup = inject<LingyunFormGroupLike | null>('lingyunFormGroup', null)

const isFirstChild = ref(true)

const layoutKey = computed((): string => {
  return props.layout === 'stack' ? 'stack' : 'row'
})

const showLabel = computed((): boolean => {
  return !!props.label
})

const formError = computed((): string => {
  const form = lingyunForm as LingyunFormLike | null | undefined
  if (!form || !props.name) return ''
  const map = form.fieldErrors || {}
  return map[props.name] || ''
})

const resolvedError = computed((): string => {
  if (props.error) return props.error
  return formError.value
})

const rootClass = computed((): string[] => {
  return [
    `lingyun-form-item--${layoutKey.value}`,
    resolvedError.value ? 'lingyun-form-item--error' : '',
  ].filter(Boolean)
})

const rowClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-form-item__row--stack': layoutKey.value === 'stack',
  }
})

const itemState = reactive({
  /** 供子控件判断：stack 时 cell 输入通栏左对齐 */
  get isStackLayout(): boolean {
    return props.layout === 'stack'
  },
  /** 供外部 / 控件侧触发单字段校验 */
  validate(): Promise<unknown> {
    const form = lingyunForm as LingyunFormLike | null | undefined
    if (form && props.name && typeof form.validateField === 'function') {
      return form.validateField(props.name)
    }
    return Promise.resolve()
  },
})

provide('lingyunFormItem', itemState)

const group = lingyunFormGroup as LingyunFormGroupLike | null | undefined
if (!group) {
  isFirstChild.value = true
} else if (!group.firstChildAppend) {
  group.firstChildAppend = true
  isFirstChild.value = true
} else {
  isFirstChild.value = false
}
const form = lingyunForm as LingyunFormLike | null | undefined
if (form && props.name && typeof form.registerField === 'function') {
  form.registerField(props.name, itemState)
}

onBeforeUnmount(() => {
  const formRef = lingyunForm as LingyunFormLike | null | undefined
  if (formRef && props.name && typeof formRef.unregisterField === 'function') {
    formRef.unregisterField(props.name)
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-form-item {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  background-color: transparent;
}

.lingyun-form-item__divider {
  position: absolute;
  left: 16px;
  right: 0;
  top: 0;
  z-index: 1;
  height: 1px;
  transform: scaleY(0.5);
  transform-origin: 0 0;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
  pointer-events: none;
}

.lingyun-form-item__row {
  min-height: 52px;
  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.lingyun-form-item__row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.lingyun-form-item__label-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  max-width: 42%;
}

.lingyun-form-item__row--stack .lingyun-form-item__label-wrap {
  max-width: 100%;
}

.lingyun-form-item__star {
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-form-item__label {
  font-size: 17px;
  font-weight: 400;
  line-height: 24px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-form-item__control {
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
}

.lingyun-form-item__row--stack .lingyun-form-item__control {
  /* stack 为 column：勿保留 flex:1 1 0（主轴 basis=0 压高度） */
  flex: none;
  width: 100%;
  min-width: 0;
  align-self: stretch;
  /* 关键：勿用 flex 包自定义组件——宿主高度撑不开内部原生 textarea，表现为 cell 多行空白 */
  display: block;
}

.lingyun-form-item__error {
  padding: 0 16px 10px;
  box-sizing: border-box;
}

.lingyun-form-item__error-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-error, #{$lingyun-error});
}
</style>

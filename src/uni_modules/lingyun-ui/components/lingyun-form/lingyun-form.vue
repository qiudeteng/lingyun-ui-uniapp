<template>
  <view class="lingyun-form" :class="{ 'lingyun-form--inset': inset }">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { provide } from 'vue'

type FormModel = Record<string, unknown>

type FormRule = {
  required?: boolean
  message?: string
  pattern?: RegExp | string
  validator?: (value: unknown, model: FormModel) => unknown
}

type FormRules = Record<string, FormRule[]>

/**
 * lingyun-form
 * Grouped 表单壳：model + 精简 rules；provide 给 form-item
 * @see design/FORMS.md
 */
defineOptions({
  name: 'LingyunForm',
})

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  rules: {
    type: Object,
    default: () => ({}),
  },
  inset: {
    type: Boolean,
    default: true,
  },
})

const formState = reactive({
  fieldErrors: {} as Record<string, string>,
  fields: {} as Record<string, object>,
  registerField(name: string, item: object) {
    if (!name) return
    this.fields[name] = item
  },
  unregisterField(name: string) {
    if (!name) return
    if (this.fields[name]) delete this.fields[name]
  },
  getFieldValue(name: string): unknown {
    if (!name || !props.model) return undefined
    return (props.model as FormModel)[name]
  },
  getFieldError(name: string) {
    if (!name) return ''
    return this.fieldErrors[name] || ''
  },
  setFieldError(name: string, message: unknown) {
    if (!name) return
    if (!message) {
      if (this.fieldErrors[name]) {
        const next = { ...this.fieldErrors }
        delete next[name]
        this.fieldErrors = next
      }
      return
    }
    this.fieldErrors = { ...this.fieldErrors, [name]: String(message) }
  },
  clearValidate(name?: string) {
    if (name) {
      this.setFieldError(name, '')
      return
    }
    this.fieldErrors = {}
  },
  isEmpty(value: unknown) {
    if (value === undefined || value === null) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    return false
  },
  runRules(name: string, value: unknown) {
    const rules = props.rules as FormRules | undefined
    const list = (rules && rules[name]) || []
    if (!Array.isArray(list) || !list.length) return ''
    for (let i = 0; i < list.length; i += 1) {
      const rule = list[i]
      if (!rule) continue
      if (rule.required && this.isEmpty(value)) {
        return rule.message || '必填项'
      }
      if (rule.pattern && !this.isEmpty(value)) {
        try {
          const re = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
          if (!re.test(String(value))) return rule.message || '格式不正确'
        } catch {
          /* ignore bad pattern */
        }
      }
      if (typeof rule.validator === 'function') {
        const res = rule.validator(value, props.model as FormModel)
        if (res === false) return rule.message || '校验失败'
        if (typeof res === 'string' && res) return res
      }
    }
    return ''
  },
  validateField(name: string) {
    if (!name) return Promise.resolve()
    const value = this.getFieldValue(name)
    const msg = this.runRules(name, value)
    this.setFieldError(name, msg)
    if (msg) {
      return Promise.reject({ name, message: msg })
    }
    return Promise.resolve(value)
  },
  validate() {
    const names = Object.keys(props.rules || {})
    const registered = Object.keys(this.fields || {})
    const all = Array.from(new Set([...names, ...registered]))
    const errors: Record<string, string> = {}
    all.forEach((name) => {
      const msg = this.runRules(name, this.getFieldValue(name))
      if (msg) errors[name] = msg
    })
    this.fieldErrors = { ...errors }
    if (Object.keys(errors).length) {
      return Promise.reject({ errors })
    }
    return Promise.resolve(props.model)
  },
})

provide('lingyunForm', formState)

/*
 * <script setup> 下父组件通过 ref 只能访问 defineExpose 暴露的内容；
 * 这里包一层箭头函数，保证 reactive 对象方法里的 this 仍指向 formState。
 */
defineExpose({
  clearValidate: (name?: string) => formState.clearValidate(name),
  validate: () => formState.validate(),
  validateField: (name: string) => formState.validateField(name),
  getFieldValue: (name: string) => formState.getFieldValue(name),
  getFieldError: (name: string) => formState.getFieldError(name),
  setFieldError: (name: string, message: unknown) =>
    formState.setFieldError(name, message),
})
</script>

<style lang="scss">
.lingyun-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
}

.lingyun-form--inset {
  padding: 0 16px;
}
</style>

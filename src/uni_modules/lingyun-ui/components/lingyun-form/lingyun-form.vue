<template>
  <view class="lingyun-form" :class="{ 'lingyun-form--inset': inset }">
    <slot />
  </view>
</template>

<script>
/**
 * lingyun-form
 * Grouped 表单壳：model + 精简 rules；provide 给 form-item
 * @see design/FORMS.md
 */
export default {
  name: 'LingyunForm',
  props: {
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
  },
  data() {
    return {
      fieldErrors: {},
      fields: {},
    }
  },
  provide() {
    return {
      lingyunForm: this,
    }
  },
  methods: {
    registerField(name, item) {
      if (!name) return
      this.fields[name] = item
    },
    unregisterField(name) {
      if (!name) return
      if (this.fields[name]) delete this.fields[name]
    },
    getFieldValue(name) {
      if (!name || !this.model) return undefined
      return this.model[name]
    },
    getFieldError(name) {
      if (!name) return ''
      return this.fieldErrors[name] || ''
    },
    setFieldError(name, message) {
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
    clearValidate(name) {
      if (name) {
        this.setFieldError(name, '')
        return
      }
      this.fieldErrors = {}
    },
    isEmpty(value) {
      if (value === undefined || value === null) return true
      if (typeof value === 'string') return value.trim() === ''
      if (Array.isArray(value)) return value.length === 0
      return false
    },
    runRules(name, value) {
      const list = (this.rules && this.rules[name]) || []
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
          const res = rule.validator(value, this.model)
          if (res === false) return rule.message || '校验失败'
          if (typeof res === 'string' && res) return res
        }
      }
      return ''
    },
    validateField(name) {
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
      const names = Object.keys(this.rules || {})
      const registered = Object.keys(this.fields || {})
      const all = Array.from(new Set([...names, ...registered]))
      const errors = {}
      all.forEach((name) => {
        const msg = this.runRules(name, this.getFieldValue(name))
        if (msg) errors[name] = msg
      })
      this.fieldErrors = { ...errors }
      if (Object.keys(errors).length) {
        return Promise.reject({ errors })
      }
      return Promise.resolve(this.model)
    },
  },
}
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

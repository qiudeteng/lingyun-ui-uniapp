<template>
  <lingyun-app-page title="Forms">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Forms</text>
        <text class="hero__desc">lingyun-form · form-group · form-item</text>
      </view>

      <lingyun-form ref="formRef" :model="form" :rules="rules">
        <lingyun-form-group title="资料" footer="表单内控件自动 cell：无独立胶囊，对齐 Sketch Grouped Text Field。">
          <lingyun-form-item name="name" label="姓名" required>
            <lingyun-text-field v-model="form.name" placeholder="请输入姓名" :clearable="true" />
          </lingyun-form-item>
          <lingyun-form-item name="phone" label="手机" required>
            <lingyun-text-field
              v-model="form.phone"
              type="number"
              placeholder="11 位手机号"
              :clearable="true"
            />
          </lingyun-form-item>
          <lingyun-form-item name="city" label="城市">
            <lingyun-picker v-model="form.cityIdx" :range="cities" placeholder="请选择" />
          </lingyun-form-item>
          <lingyun-form-item name="notify" label="通知">
            <lingyun-switch v-model="form.notify" />
          </lingyun-form-item>
        </lingyun-form-group>

        <lingyun-form-group title="备注">
          <lingyun-form-item name="bio" label="简介" layout="stack">
            <lingyun-text-field
              v-model="form.bio"
              multiline
              :rows="3"
              placeholder="选填"
            />
          </lingyun-form-item>
        </lingyun-form-group>
      </lingyun-form>

      <view class="actions">
        <lingyun-button variant="borderedProminent" block text="校验并提交" @click="onSubmit" />
        <lingyun-button variant="bordered" block text="清除校验" @click="onClear" />
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  const formRef = ref<{
    validate: () => Promise<unknown>
    clearValidate: (name?: string) => void
  } | null>(null)

  const form = reactive({
    name: '',
    phone: '',
    cityIdx: 0,
    notify: true,
    bio: '',
  })

  const cities = ['上海', '北京', '广州', '深圳']

  const rules = {
    name: [{ required: true, message: '请填写姓名' }],
    phone: [
      { required: true, message: '请填写手机号' },
      { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
    ],
  }

  async function onSubmit(): Promise<void> {
    const formApi = formRef.value
    if (!formApi) return
    try {
      await formApi.validate()
      uni.showToast({
        title: '校验通过',
        icon: 'none',
      })
    } catch (err) {
      const payload = err as { errors?: Record<string, string> }
      const first = payload && payload.errors ? Object.values(payload.errors)[0] : '请检查表单'
      uni.showToast({
        title: String(first || '请检查表单'),
        icon: 'none',
      })
    }
  }

  function onClear(): void {
    formRef.value?.clearValidate()
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 16px 0;
    box-sizing: border-box;
  }
</style>

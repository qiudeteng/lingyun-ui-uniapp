<template>
  <lingyun-app-page title="登录" :show-back="false" :show-nav="false">
    <view class="lingyun-login">
      <view class="lingyun-login__hero">
        <image
          v-if="logo"
          class="lingyun-login__logo"
          :src="logo"
          mode="aspectFill"
        />
        <text class="lingyun-login__title">请登录{{ enterpriseName }}</text>
        <text class="lingyun-login__hint">{{ hint }}</text>
      </view>

      <view v-if="booting" class="lingyun-login__boot">
        <lingyun-activity-indicator size="large" />
      </view>

      <view v-else class="lingyun-login__form">
        <lingyun-form-group>
          <lingyun-form-item label="账号">
            <lingyun-text-field
              v-model="form.username"
              placeholder="请输入手机号码或邮箱"
              :clearable="true"
            />
          </lingyun-form-item>
          <lingyun-form-item label="密码">
            <lingyun-text-field
              v-model="form.password"
              placeholder="请输入密码"
              secure
            />
          </lingyun-form-item>
        </lingyun-form-group>

        <view class="lingyun-login__agree">
          <lingyun-checkbox v-model="agreed">
            <text class="lingyun-login__agree-text">
              我已阅读并同意
              <text class="lingyun-login__link" @click.stop="onPolicy('user')">《用户服务协议》</text>
              和
              <text class="lingyun-login__link" @click.stop="onPolicy('privacy')">《隐私政策》</text>
            </text>
          </lingyun-checkbox>
        </view>

        <lingyun-button
          variant="borderedProminent"
          block
          :text="submitText"
          @click="onSubmit"
        />
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  withDefaults(
    defineProps<{
      /** 企业 logo，空则不显示 */
      logo?: string
      /** 拼在「请登录」后面 */
      enterpriseName?: string
      hint?: string
      /** 静默登录中，只显示转圈 */
      booting?: boolean
      submitText?: string
    }>(),
    {
      logo: '',
      enterpriseName: '',
      hint: '内部管理使用，不提供注册功能',
      booting: false,
      submitText: '立即登录',
    },
  )

  const emit = defineEmits<{
    submit: [payload: { username: string; password: string }]
    policy: [type: 'user' | 'privacy']
  }>()

  const agreed = ref(false)
  const form = reactive({
    username: '',
    password: '',
  })

  function onPolicy(type: 'user' | 'privacy'): void {
    emit('policy', type)
  }

  function onSubmit(): void {
    const username = form.username.trim()
    const password = form.password
    if (!username) {
      uni.showLingyunToast({ text: '请输入用户名', type: 'error' })
      return
    }
    if (!password) {
      uni.showLingyunToast({ text: '请输入密码', type: 'error' })
      return
    }
    if (password.length < 6) {
      uni.showLingyunToast({ text: '密码长度需不少于6位', type: 'error' })
      return
    }
    if (!agreed.value) {
      uni.showLingyunToast({ text: '请先阅读并同意协议', type: 'error' })
      return
    }
    emit('submit', { username, password })
  }
</script>

<style lang="scss">
  @import '../../../lingyun-ui/styles/variables.scss';

  .lingyun-login {
    box-sizing: border-box;
    min-height: 100%;
    padding: 24px 16px 40px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  }

  .lingyun-login__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0 20px;
  }

  .lingyun-login__logo {
    width: 72px;
    height: 72px;
    border-radius: 16px;
    margin-bottom: 16px;
    background-color: var(--lingyun-fill, #{$lingyun-fill});
  }

  .lingyun-login__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  .lingyun-login__hint {
    margin-top: 8px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  .lingyun-login__boot {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }

  .lingyun-login__agree {
    margin: 16px 4px 20px;
  }

  .lingyun-login__agree-text {
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  .lingyun-login__link {
    color: var(--lingyun-primary, #{$lingyun-primary});
  }
</style>

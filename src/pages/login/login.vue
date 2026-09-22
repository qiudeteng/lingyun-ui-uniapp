<template>
  <lingyun-app-page title="登录" :show-back="false" :show-nav="false">
    <view class="login" :class="themeStore.rootClass">
      <view class="login__hero">
        <image
          v-if="logo"
          class="login__logo"
          :src="logo"
          mode="aspectFill"
        />
        <text class="login__title">请登录{{ enterpriseName }}</text>
        <text class="login__hint">内部管理使用，不提供注册功能</text>
      </view>

      <view v-if="booting" class="login__boot">
        <lingyun-activity-indicator size="large" />
      </view>

      <view v-else class="login__form">
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

        <view class="login__agree">
          <lingyun-checkbox v-model="agreed">
            <text class="login__agree-text">
              我已阅读并同意
              <text class="login__link" @click.stop="openPolicy('user')">《用户服务协议》</text>
              和
              <text class="login__link" @click.stop="openPolicy('privacy')">《隐私政策》</text>
            </text>
          </lingyun-checkbox>
        </view>

        <lingyun-button
          variant="borderedProminent"
          block
          text="立即登录"
          @click="onSubmit"
        />
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useAuthStore } from '@/stores/auth'
  import { useThemeStore } from '@/stores/theme'
  import { appConfig } from '@/config'
  import { getBackUrl } from '@/utils/auth'

  const themeStore = useThemeStore()
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const booting = ref(false)
  const agreed = ref(false)
  const form = reactive({
    username: '',
    password: '',
  })

  const logo = computed(() => appStore.enterprise?.enterprise_logo || '')
  const enterpriseName = computed(() => appStore.enterprise?.enterprise_name || '')

  function goBack(): void {
    let backUrl = getBackUrl()
    if (!backUrl) {
      backUrl = appConfig.homePath
    } else if (!backUrl.startsWith('/')) {
      backUrl = `/${backUrl}`
    }
    uni.reLaunch({
      url: backUrl,
      fail: () => {
        uni.reLaunch({ url: appConfig.homePath })
      },
    })
  }

  function openPolicy(type: 'user' | 'privacy'): void {
    const url =
      type === 'user' ? '/pages/login/user-agreement' : '/pages/login/privacy-policy'
    uni.navigateTo({ url })
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
    authStore.login({ username, password }, (ok) => {
      if (ok) goBack()
    })
  }

  onMounted(() => {
    if (!appStore.enterprise) {
      appStore.getEnterprise()
    }
    if (authStore.isLogin) {
      goBack()
      return
    }
    /* #ifdef MP-WEIXIN */
    booting.value = true
    authStore.loginByCode((ok) => {
      booting.value = false
      if (ok) goBack()
    })
    /* #endif */
  })
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .login {
    box-sizing: border-box;
    min-height: 100%;
    padding: 24px 16px 40px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  }

  .login__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0 20px;
  }

  .login__logo {
    width: 72px;
    height: 72px;
    border-radius: 16px;
    margin-bottom: 16px;
    background-color: var(--lingyun-fill, #{$lingyun-fill});
  }

  .login__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  .login__hint {
    margin-top: 8px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  .login__boot {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }

  .login__agree {
    margin: 16px 4px 20px;
  }

  .login__agree-text {
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  .login__link {
    color: var(--lingyun-primary, #{$lingyun-primary});
  }
</style>

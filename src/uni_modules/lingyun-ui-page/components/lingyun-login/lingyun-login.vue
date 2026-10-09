<template>
  <lingyun-app-page title="登录" :show-back="false" :show-nav="false">
    <view class="lingyun-login">
      <view class="lingyun-login__hero">
        <view v-if="logo" class="lingyun-login__logo">
          <lingyun-image :src="logo" size="md" radius="xl" />
        </view>
        <text v-if="enterpriseName" class="lingyun-login__title">{{ enterpriseName }}</text>
        <text class="lingyun-login__hint">{{ hint }}</text>
      </view>

      <view v-if="booting" class="lingyun-login__column lingyun-login__boot">
        <lingyun-activity-indicator size="large" />
      </view>

      <view v-else class="lingyun-login__column lingyun-login__form">
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
        <text v-if="copyright" class="lingyun-login__copyright">{{ copyright }}</text>
      </view>
    </view>

    <lingyun-sheets
      v-model:show="policyOpen"
      :title="policyTitle"
      detent="large"
    >
      <view class="lingyun-login__policy">
        <template v-for="block in policyBlocks" :key="block.heading">
          <text class="lingyun-login__policy-h">{{ block.heading }}</text>
          <text class="lingyun-login__policy-p">{{ block.body }}</text>
        </template>
      </view>
    </lingyun-sheets>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'

  withDefaults(
    defineProps<{
      /** 企业 logo，空则不显示 */
      logo?: string
      /** 标题，显示企业名称 */
      enterpriseName?: string
      hint?: string
      /** 静默登录中，只显示转圈 */
      booting?: boolean
      submitText?: string
      /** 登录按钮下方的版权水印，空则不显示 */
      copyright?: string
    }>(),
    {
      logo: '',
      enterpriseName: '',
      hint: '内部管理使用，不提供注册功能',
      booting: false,
      submitText: '立即登录',
      copyright: '',
    },
  )

  const emit = defineEmits<{
    submit: [payload: { username: string; password: string }]
    policy: [type: 'user' | 'privacy']
  }>()

  type PolicyType = 'user' | 'privacy'

  const POLICIES: Record<PolicyType, { title: string; blocks: { heading: string; body: string }[] }> = {
    user: {
      title: '用户服务协议',
      blocks: [
        { heading: '一、协议范围', body: '欢迎使用本产品，使用前请仔细阅读并充分理解本协议各条款。您使用本产品即表示您同意本协议。' },
        { heading: '二、服务内容', body: '本公司为您提供软件服务，包含但不限于账户管理、数据统计及相关增值服务。' },
        { heading: '三、用户义务', body: '您应保证提供的信息真实、合法；不得利用本产品从事违法活动。' },
        { heading: '四、知识产权', body: '本产品及相关内容的知识产权归本公司所有，未经许可不得复制或传播。' },
        { heading: '五、其他', body: '本协议与您在使用过程中产生的其他约定具有同等法律效力。本公司保留对本协议条款的解释权。' },
      ],
    },
    privacy: {
      title: '隐私政策',
      blocks: [
        { heading: '一、我们收集的信息', body: '为提供服务，我们可能收集您的账号、设备及使用记录等信息。' },
        { heading: '二、信息使用', body: '信息仅用于身份验证、安全保障及改善产品体验，不会对外出售。' },
        { heading: '三、信息保护', body: '我们采取合理技术与管理措施保护您的信息安全。' },
        { heading: '四、您的权利', body: '您可查询、更正或删除个人信息，也可联系我们行使相关权利。' },
      ],
    },
  }

  const agreed = ref(false)
  const policyOpen = ref(false)
  const policyType = ref<PolicyType>('user')
  const form = reactive({
    username: '',
    password: '',
  })

  const policyTitle = computed(() => POLICIES[policyType.value].title)
  const policyBlocks = computed(() => POLICIES[policyType.value].blocks)

  function onPolicy(type: PolicyType): void {
    policyType.value = type
    policyOpen.value = true
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

  /* iPad 竖屏等宽屏：登录块在顶栏以下的整屏里垂直居中。手机保持靠上。 */
  @media (min-width: 690px) and (min-height: 700px) {
    .lingyun-login {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  .lingyun-login__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0 20px;
  }

  .lingyun-login__logo {
    margin-bottom: 16px;
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

  .lingyun-login__column {
    width: 100%;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }

  .lingyun-login__boot {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }

  .lingyun-login__policy {
    padding: 8px 16px 0;
  }

  .lingyun-login__policy-h {
    display: block;
    margin-top: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  .lingyun-login__policy-p {
    display: block;
    margin-top: 8px;
    font-size: 15px;
    line-height: 22px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
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

  .lingyun-login__copyright {
    display: block;
    margin-top: 28px;
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  }
</style>

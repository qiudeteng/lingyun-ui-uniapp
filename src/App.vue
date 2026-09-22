<script setup lang="ts">
  import { onLaunch, onShow, onThemeChange } from '@dcloudio/uni-app'
  import { useThemeStore } from '@/stores/theme'
  import { useAppStore } from '@/stores/app'
  import { useAuthStore } from '@/stores/auth'
  import { useUserStore } from '@/stores/user'

  const themeStore = useThemeStore()

  onLaunch(() => {
    themeStore.init()
    const appStore = useAppStore()
    const authStore = useAuthStore()
    const userStore = useUserStore()
    appStore.getEnterprise()
    if (authStore.isLogin) {
      userStore.refreshData()
    }
  })

  /* 每次进前台再刷一次窗体色（小程序页栈切换后可能丢） */
  onShow(() => {
    themeStore.apply()
  })

  /**
   * 官方暗黑：manifest darkmode:true 后系统切换会触发
   * @see https://uniapp.dcloud.net.cn/tutorial/darkmode.html#darkmode
   */
  onThemeChange(() => {
    themeStore.syncFromSystem()
  })
</script>

<style lang="scss">
  /* 先主题覆盖，再工具类（!default token 才会吃到主题色） */
  @import '@/uni_modules/lingyun-ui/styles/theme.scss';
  @import '@/uni_modules/lingyun-ui/styles/index.scss';

  page {
    /* 与 lingyun-app-page 一致：Grouped Primary，暗黑下与列表卡面分离 */
    background-color: var(--lingyun-bg-grouped-primary, $lingyun-bg-grouped-primary);
    color: var(--lingyun-label, $lingyun-main-color);
  }

  button::after {
    border: none;
  }
</style>

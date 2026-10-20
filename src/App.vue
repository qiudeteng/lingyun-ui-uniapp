<script setup lang="ts">
  import { onLaunch, onShow, onThemeChange } from '@dcloudio/uni-app'
  import { refreshLingyunScreen } from '@/uni_modules/lingyun-ui/utils/screen'
  import { useThemeStore } from '@/stores/theme'

  const themeStore = useThemeStore()

  onLaunch(() => {
    refreshLingyunScreen()
    themeStore.init()
  })

  /* 每次进前台再刷一次窗体色（小程序页栈切换后可能丢） */
  onShow(() => {
    refreshLingyunScreen()
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

  /*
   * 演示页内容根节点：背景铺满整屏，同时让出左侧导航安全区。
   * 微信 WXSS 对插槽首子选择器和 calc(var(...)) 不稳定，这里用 .page 类和固定宽度。
   */
  .lingyun-app-page--nav .page {
    width: auto;
    margin-left: -220px;
    padding-left: 220px !important;
    box-sizing: border-box;
  }

  .lingyun-app-page--nav.lingyun-app-page--nav-rail .page {
    margin-left: -84px;
    padding-left: 84px !important;
  }

  button::after {
    border: none;
  }
</style>

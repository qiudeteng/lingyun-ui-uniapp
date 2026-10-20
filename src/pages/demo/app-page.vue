<template>
  <lingyun-app-page
    title="App Page"
    :nav-mode="navMode"
    :auto-bottom-inset="autoBottomInset"
    @duo-search="toastDuo('搜索')"
    @duo-overflow="toastDuo('更多')"
  >
    <view class="page">
      <view class="hero">
        <text class="hero__title">数据驱动页面壳</text>
        <text class="hero__desc">一份 tabs 配置同时驱动手机底部 Tab 与宽屏左侧导航</text>
      </view>

      <lingyun-list header="当前环境" header-type="nested">
        <lingyun-list-item title="窗口宽度" :detail="`${windowWidth}px`" />
        <lingyun-list-item title="屏幕档" :detail="screenLabel" />
        <lingyun-list-item title="导航形态" :detail="navLabel" />
      </lingyun-list>

      <lingyun-section title="全局一级导航" hint="setLingyunPageConfig">
        <view class="row">
          <text class="row__label">启用 tabs</text>
          <lingyun-switch v-model="tabsEnabled" />
        </view>
        <text class="hint">
          开启后底部 Tab 与左侧导航共用同一组数据；关闭后恢复组件目录。
        </text>
      </lingyun-section>

      <lingyun-section title="布局模式" hint="app-page nav-mode">
        <lingyun-segmented-control v-model="navMode" :items="navModeItems" />
        <text class="hint">auto 时窄屏底部 Tab、宽屏左侧导航。</text>
      </lingyun-section>

      <lingyun-section title="设备模拟" hint="仅 H5 预览；真机由设备识别方法注入">
        <lingyun-segmented-control v-model="deviceMode" :items="deviceModeItems" />
        <text class="hint">内屏：顶部 Duo Toolbar + 底部 Duo Tab；外屏/内屏横屏：右侧全高栏；半折显示 40px 折痕安全带。</text>
      </lingyun-section>

      <lingyun-section title="本页覆盖" hint="pages['pages/demo/app-page']">
        <view class="row">
          <text class="row__label">隐藏底部 Tab</text>
          <lingyun-switch v-model="hideTabbar" />
        </view>
        <view class="row">
          <text class="row__label">隐藏左侧导航</text>
          <lingyun-switch v-model="hideNav" />
        </view>
        <view class="row">
          <text class="row__label">自动底部留白</text>
          <lingyun-switch v-model="autoBottomInset" />
        </view>
      </lingyun-section>

      <lingyun-section title="长内容" hint="滚动到底检查 Tab 栏是否遮挡">
        <view v-for="index in 24" :key="index" class="line">
          <text class="line__index">{{ index }}</text>
          <text class="line__text">用于验证页面滚动与底部留白</text>
        </view>
      </lingyun-section>
    </view>

    <template #duo-tools>
      <view class="duo-tool">
        <lingyun-icon type="compose" :size="22" color="label" />
      </view>
      <view class="duo-tool">
        <lingyun-icon type="camera" :size="22" color="label" />
      </view>
      <view class="duo-tool">
        <lingyun-icon type="more" :size="22" color="label" />
      </view>
    </template>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import {
    getLingyunLayoutOverride,
    getLingyunPageConfig,
    getLingyunPageOverride,
    lingyun,
    resetLingyunPageConfig,
    resolveLingyunPageLayout,
    setLingyunLayoutOverride,
    setLingyunPageConfig,
    showLingyunToast,
    type LingyunDuoPose,
    type LingyunPageTab,
  } from '@/uni_modules/lingyun-ui'

  const PAGE_PATH = 'pages/demo/app-page'

  const SAMPLE_TABS: LingyunPageTab[] = [
    { key: 'app-page', text: '页面壳', icon: 'home', url: '/pages/demo/app-page' },
    { key: 'buttons', text: '按钮', icon: 'star', url: '/pages/demo/buttons' },
    { key: 'lists', text: '列表', icon: 'list', url: '/pages/demo/lists' },
    { key: 'alerts', text: '弹窗', icon: 'info', url: '/pages/demo/alerts', badge: 2 },
    { key: 'charts', text: '图表', icon: 'bars', url: '/pages/demo/charts/column' },
  ]

  const navModeItems = [
    { key: 'auto', text: '自动' },
    { key: 'tabbar', text: 'Tab' },
    { key: 'sidebar', text: '侧栏' },
    { key: 'none', text: '无' },
  ]

  const deviceModeItems = [
    { key: 'default', text: '默认' },
    { key: 'duo-inner', text: '内屏' },
    { key: 'duo-folded', text: '内屏半折' },
    { key: 'duo-outer-portrait', text: '外屏竖' },
    { key: 'duo-outer-landscape', text: '外屏横' },
    { key: 'duo-inner-landscape', text: '内屏横' },
  ]

  const navMode = ref('auto')
  const autoBottomInset = ref(true)
  const windowWidth = ref(0)
  const POSE_BY_MODE: Record<string, LingyunDuoPose> = {
    'duo-inner': 'inner-portrait',
    'duo-folded': 'inner-portrait-folded',
    'duo-outer-portrait': 'outer-portrait',
    'duo-outer-landscape': 'outer-landscape',
    'duo-inner-landscape': 'inner-landscape',
  }
  const existingOverride = getLingyunLayoutOverride()
  const deviceMode = ref(
    Object.keys(POSE_BY_MODE).find(
      (mode) => POSE_BY_MODE[mode] === existingOverride?.duoPose,
    ) || 'default',
  )

  watch(
    deviceMode,
    (mode) => {
      const pose = POSE_BY_MODE[mode]
      if (pose) {
        setLingyunLayoutOverride({ formFactor: 'duo', duoPose: pose })
      } else {
        setLingyunLayoutOverride(null)
      }
    },
    { immediate: true },
  )

  function toastDuo(text: string): void {
    showLingyunToast({ text })
  }

  const pageOverride = computed(() => getLingyunPageOverride(PAGE_PATH))

  const tabsEnabled = computed({
    get: () => (getLingyunPageConfig().tabs || []).length > 0,
    set: (enabled: boolean) => {
      if (enabled) {
        setLingyunPageConfig({
          tabs: SAMPLE_TABS,
          sidebarTitle: '演示导航',
          layout: { navMode: 'auto' },
        })
      } else {
        resetLingyunPageConfig()
      }
    },
  })

  const hideTabbar = computed({
    get: () => !!pageOverride.value?.hideTabbar,
    set: (hidden: boolean) => {
      setLingyunPageConfig({ pages: { [PAGE_PATH]: { hideTabbar: hidden } } })
    },
  })

  const hideNav = computed({
    get: () => !!pageOverride.value?.hideNav,
    set: (hidden: boolean) => {
      setLingyunPageConfig({ pages: { [PAGE_PATH]: { hideNav: hidden } } })
    },
  })

  function readWidth(): number {
    try {
      const info =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
      return Number(info.windowWidth) || 0
    } catch {
      return 0
    }
  }

  function syncWidth(): void {
    windowWidth.value = readWidth()
  }

  const layout = computed(() => {
    const pose = POSE_BY_MODE[deviceMode.value]
    return resolveLingyunPageLayout({
      width: windowWidth.value,
      config: getLingyunPageConfig(),
      pageOverride: getLingyunPageOverride(PAGE_PATH),
      showNav: true,
      showTabbar: 'auto',
      navMode: navMode.value,
      safeArea: true,
      formFactor: pose ? 'duo' : undefined,
      duoPose: pose,
    })
  })

  const navLabel = computed(() => {
    if (layout.value.navMode === 'tabbar') return '底部 Tab'
    if (layout.value.navMode === 'sidebar') {
      return layout.value.navSide === 'right' ? '右侧导航' : '左侧导航'
    }
    return '无导航'
  })

  const screenLabel = computed(() => {
    if (lingyun.screen === 'pc') return 'PC'
    if (lingyun.screen === 'pad') return '平板'
    if (lingyun.screen === 'phone') return '手机'
    return '未知'
  })

  onMounted(() => {
    syncWidth()
    try {
      uni.onWindowResize?.(syncWidth)
    } catch {
      /* 端不支持 */
    }
    // #ifdef H5
    if (typeof window !== 'undefined') window.addEventListener('resize', syncWidth)
    // #endif
  })

  onUnmounted(() => {
    try {
      uni.offWindowResize?.(syncWidth)
    } catch {
      /* 端不支持 */
    }
    // #ifdef H5
    if (typeof window !== 'undefined') window.removeEventListener('resize', syncWidth)
    // #endif
  })
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 24px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
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
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    padding: 0 16px;
  }

  .row__label {
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hint {
    display: block;
    padding: 8px 16px 12px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .duo-tool {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .line {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 44px;
    padding: 0 16px;
    border-bottom: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.29));
  }

  .line__index {
    width: 28px;
    font-size: 15px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .line__text {
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>

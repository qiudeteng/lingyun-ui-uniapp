<template>
  <lingyun-app-page
    class="demo-app-page"
    title="App Page"
    :nav-mode="navMode"
    :auto-bottom-inset="autoBottomInset"
    :show-back="showBack"
    @duo-search="toastDuo('搜索')"
    @duo-overflow="toastDuo('更多')"
  >
    <view class="page">
      <view class="hero">
        <text class="hero__title">数据驱动页面壳</text>
        <text class="hero__desc">一份 tabs 配置驱动手机底部 Tab、宽屏左侧导航与 Duo 右侧栏</text>
      </view>

      <lingyun-list header="当前环境" header-type="nested">
        <lingyun-list-item title="窗口宽度" :detail="`${windowWidth}px`" />
        <lingyun-list-item title="屏幕档" :detail="screenLabel" />
        <lingyun-list-item title="导航形态" :detail="navLabel" />
        <lingyun-list-item title="页面背景" detail="壳根节点或内容根节点" />
      </lingyun-list>

      <lingyun-section title="全局一级导航" hint="setLingyunPageConfig">
        <view class="row">
          <text class="row__label">启用 tabs</text>
          <lingyun-switch v-model="tabsEnabled" />
        </view>
        <text class="hint">
          开启后底部 Tab、宽屏左侧导航与 Duo 右侧栏共用同一组数据。只有一级 Tab 根页会显示导航；当前页是子页面，所以这里只显示返回和 duo-tools。
        </text>
      </lingyun-section>

      <lingyun-section title="布局模式" hint="app-page nav-mode">
        <lingyun-segmented-control v-model="navMode" :items="navModeItems" />
        <text class="hint">auto 时窄屏底部 Tab、宽屏左侧导航、Duo 右侧栏。</text>
      </lingyun-section>

      <lingyun-section title="设备模拟" hint="仅 H5 预览；真机由设备识别方法注入">
        <lingyun-segmented-control v-model="deviceMode" :items="deviceModeItems" />
        <text class="hint">内屏：顶部 Duo Toolbar + 底部 Duo Tab；外屏/内屏横屏：右侧全高栏，duo-tools 在栏顶，Tab 只在根页显示；半折显示 40px 折痕安全带。</text>
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
        <view class="row">
          <text class="row__label">显示返回按钮</text>
          <lingyun-switch v-model="showBack" />
        </view>
      </lingyun-section>

      <lingyun-section title="长内容" hint="滚动到底检查 Tab 栏是否遮挡">
        <view v-for="index in 24" :key="index" class="line">
          <text class="line__index">{{ index }}</text>
          <text class="line__text">用于验证页面滚动与底部留白</text>
        </view>
      </lingyun-section>
    </view>

    <template #split-detail>
      <view class="split-detail">
        <text class="split-detail__title">详情 / 辅助</text>
        <text class="split-detail__text">右侧由页面的 split-detail 插槽提供。</text>
      </view>
    </template>

    <template #duo-tools>
      <view
        class="duo-tool"
        hover-class="duo-tool--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Compose"
        @click="toastDuo('撰写')"
      >
        <lingyun-icon type="compose" :size="22" color="label" />
      </view>
      <view
        class="duo-tool"
        hover-class="duo-tool--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Camera"
        @click="toastDuo('相机')"
      >
        <lingyun-icon type="camera" :size="22" color="label" />
      </view>
      <view
        class="duo-tool"
        hover-class="duo-tool--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="More"
        @click="toastDuo('更多')"
      >
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
    resolveLingyunFormFactor,
    resolveLingyunPageLayout,
    setLingyunLayoutOverride,
    setLingyunPageConfig,
    showLingyunToast,
    type LingyunDuoPose,
  } from '@/uni_modules/lingyun-ui'
  import { DEMO_PAGE_TABS } from '@/config/pageTabs'

  const PAGE_PATH = 'pages/demo/app-page'

  const SAMPLE_TABS = DEMO_PAGE_TABS

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
    { key: 'duo-inner-landscape-folded', text: '内屏横半折' },
  ]

  const navMode = ref('auto')
  const autoBottomInset = ref(true)
  const showBack = ref(true)
  const windowWidth = ref(0)
  const POSE_BY_MODE: Record<string, LingyunDuoPose> = {
    'duo-inner': 'inner-portrait',
    'duo-folded': 'inner-portrait-folded',
    'duo-outer-portrait': 'outer-portrait',
    'duo-outer-landscape': 'outer-landscape',
    'duo-inner-landscape': 'inner-landscape',
    'duo-inner-landscape-folded': 'inner-landscape-folded',
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
          workspaceUrl: '/pages/demo/workbench',
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
    const simulatedPose = POSE_BY_MODE[deviceMode.value]
    /* 默认档跟随真实设备识别，避免 Duo 姿态下仍显示“底部 Tab” */
    const native = resolveLingyunFormFactor(lingyun)
    const pose = simulatedPose || (deviceMode.value === 'default' ? native.duoPose : '')
    const formFactor = pose
      ? 'duo'
      : deviceMode.value === 'default'
        ? native.formFactor
        : undefined
    return resolveLingyunPageLayout({
      width: windowWidth.value,
      config: getLingyunPageConfig(),
      pageOverride: getLingyunPageOverride(PAGE_PATH),
      showNav: true,
      showTabbar: 'auto',
      navMode: navMode.value,
      safeArea: true,
      formFactor,
      duoPose: pose,
    })
  })

  const navLabel = computed(() => {
    if (layout.value.splitView) return 'Split View'
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
  /* 页面背景由全局 --lingyun-page-background 统一提供 */
  .page {
    box-sizing: border-box;
    padding-bottom: 24px;
    min-height: 100%;
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
    border-radius: 50%;
  }

  .duo-tool--hover {
    transform: scale(0.92);
  }

  .split-detail {
    box-sizing: border-box;
    padding: 24px 20px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .split-detail__title {
    display: block;
    font-size: 20px;
    line-height: 26px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .split-detail__text {
    display: block;
    margin-top: 8px;
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
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

<template>
  <lingyun-app-page title="接入">
    <view class="page">
      <view class="hero">
        <text class="hero__title">接入</text>
        <text class="hero__desc">挂载 Pinia 与组件库，用页面壳包住业务页</text>
      </view>

      <lingyun-section title="1. 安装到应用">
        <view class="code">
          <text
            v-for="(line, index) in installCode"
            :key="index"
            class="code__line"
          >{{ line }}</text>
        </view>
        <text class="note">先挂 Pinia，再挂组件库。顺序不能反，否则 Toast / HUD 没有状态。</text>
      </lingyun-section>

      <lingyun-section title="2. 页面壳">
        <view class="code">
          <text
            v-for="(line, index) in pageShellCode"
            :key="index"
            class="code__line"
          >{{ line }}</text>
        </view>
        <text class="note">
          页面壳负责顶栏、滚动玻璃、宽屏导航，以及 Toast / HUD 的宿主。有输入框的页面不要关闭页面级滚动。
        </text>
      </lingyun-section>

      <lingyun-section title="3. 宽屏与一级 Tab">
        <text class="note">
          窗口宽度达到 690 时，同一份 tabs 配置改为左侧导航；配置了 children 的一级 Tab 在手机 / Duo 上进入固定工作台。页面壳会根据窗口宽度、设备形态和页面覆盖自动选择布局。
        </text>
      </lingyun-section>

      <lingyun-section title="继续" is-last>
        <lingyun-list>
          <lingyun-list-item
            title="页面壳"
            note="数据驱动页面壳与设备模拟"
            accessory="disclosure"
            @click="openPage('/pages/demo/app-page')"
          />
          <lingyun-list-item
            title="屏幕"
            note="窗口档、系统、折叠与硬件"
            accessory="disclosure"
            @click="openPage('/pages/demo/screen')"
          />
          <lingyun-list-item
            title="反馈"
            note="Toast、HUD 与 Alert"
            accessory="disclosure"
            @click="openPage('/pages/demo/toasts')"
          />
        </lingyun-list>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { resolveLingyunPageUrl } from '@/router/pageNav'

  /*
   * 尖括号和跨行的大括号不能直接写在 WXML 文本节点里，
   * 否则小程序编译会当成标签或未闭合表达式。代码示例统一放在脚本里渲染。
   */
  const installCode = [
    "import { createSSRApp } from 'vue'",
    "import App from './App.vue'",
    "import { createPinia } from 'pinia'",
    "import { lingyunUi } from",
    "  '@/uni_modules/lingyun-ui'",
    '',
    'export function createApp() {',
    '  const app = createSSRApp(App)',
    '  app.use(createPinia())',
    '  app.use(lingyunUi)',
    '  return { app }',
    '}',
  ]

  const pageShellCode = [
    '<lingyun-app-page',
    '  title="首页"',
    '  :show-back="false">',
    '  <view>正文</view>',
    '</lingyun-app-page>',
  ]

  function openPage(url: string): void {
    const next = resolveLingyunPageUrl(url)
    if (!next) return
    uni.navigateTo({
      url: next,
      fail: () => uni.redirectTo({ url: next }),
    })
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
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

  .note {
    display: block;
    margin: 12px 20px 4px;
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .code {
    margin: 12px 20px 0;
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .code__line {
    display: block;
    font-family: Menlo, Consolas, 'Courier New', monospace;
    font-size: 12px;
    line-height: 19px;
    color: var(--lingyun-label, #1c1c1e);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>

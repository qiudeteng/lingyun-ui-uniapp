<template>
  <lingyun-app-page
    :title="pageTitle"
    :show-back="false"
    :show-toolbar="!pageHostState.hideToolbar"
    :body-scroll="hostedView?.bodyScroll ?? true"
    :page-scroll="hostedView?.pageScroll ?? true"
  >
    <app-page-view-host v-if="pageHostState.path" />
    <view v-if="showHome" class="directory">
      <lingyun-section
        v-for="(section, index) in homeGroups"
        :key="section.key"
        :title="section.title"
        :is-last="index === homeGroups.length - 1"
      >
        <lingyun-list>
          <lingyun-list-item
            v-for="item in section.items"
            :key="item.url"
            :title="item.text || ''"
            :note="item.note || ''"
            accessory="disclosure"
            @click="go(item.url || '')"
          />
        </lingyun-list>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { getLingyunDemoHomeGroups } from '@/config/pageTabs'
  import { resolveLingyunPageUrl } from '@/router/pageNav'
  import {
    clearLingyunPageHost,
    openLingyunHostedPage,
    pageHostState,
    setLingyunPageHost,
  } from '@/router/pageHost'
  import { getLingyunPageView } from '@/router/pageViews'
  import {
    buildLingyunPageTabWorkspaceUrl,
    findLingyunPageTab,
    isLingyunWorkspacePath,
    setLingyunWorkspaceTabKey,
    useLingyunWorkspaceTabKey,
  } from '@/uni_modules/lingyun-ui/utils/pageConfig'

  /** 首页与 Tab / 工作台共用同一份 DEMO_PAGE_TABS；这里按 Tab 分组拍平展示 */
  const homeGroups = computed(() => getLingyunDemoHomeGroups())
  const hostedView = computed(() => getLingyunPageView(pageHostState.path))
  const showHome = computed(() => !pageHostState.path)
  const workspaceKey = useLingyunWorkspaceTabKey()
  const pageTitle = computed(() => {
    if (isLingyunWorkspacePath(pageHostState.path)) {
      const tab = findLingyunPageTab(workspaceKey.value)
      if (tab) return tab.text
    }
    return hostedView.value?.title || '首页'
  })

  /* 刷新型直达：首页 ?tab=<key> 直接恢复对应工作台/页面，不额外压栈 */
  onLoad((query?: Record<string, string | undefined>) => {
    const key = String(query?.tab || '')
    if (!key) {
      clearLingyunPageHost()
      return
    }
    const tab = findLingyunPageTab(key)
    if (!tab) return
    setLingyunWorkspaceTabKey(tab.key)
    const target =
      Array.isArray(tab.children) && tab.children.length
        ? buildLingyunPageTabWorkspaceUrl(tab)
        : tab.url
    if (target) setLingyunPageHost(target)
  })

  function go(url: string): void {
    if (openLingyunHostedPage(url, url)) return
    const next = resolveLingyunPageUrl(url)
    if (!next) return
    if (openLingyunHostedPage(next, url)) return
    uni.navigateTo({ url: next })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  /*
   * 目录页自己的滚动内容。勿用通用 .page：宽屏宿主里会命中被托管的页面；
   * 背景交给 lingyun-app-page，页面滚动首子已有 min-height: 100vh。
   */
  .directory {
    box-sizing: border-box;
    padding: 0 0 40px;
  }
</style>

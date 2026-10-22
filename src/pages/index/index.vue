<template>
  <lingyun-app-page
    :title="pageTitle"
    :show-back="false"
    :body-scroll="hostedView?.bodyScroll ?? true"
    :page-scroll="hostedView?.pageScroll ?? true"
  >
    <app-page-view-host v-if="pageHostState.path" />
    <view v-if="showHome" class="page">
      <lingyun-list header="开发" header-type="nested">
        <lingyun-list-item
          title="组件 Demo"
          note="凌云UI 控件演示"
          accessory="disclosure"
          @click="go('/pages/demo/demo')"
        />
      </lingyun-list>
      <lingyun-list
        v-for="section in sections"
        :key="section.title"
        :header="section.title"
        header-type="nested"
      >
        <lingyun-list-item
          v-for="item in section.items"
          :key="item.url"
          :title="item.title"
          :note="item.note"
          accessory="disclosure"
          @click="go(item.url)"
        />
      </lingyun-list>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { getLingyunPageNavSections, resolveLingyunPageUrl } from '@/router/pageNav'
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

  const sections = computed(() => getLingyunPageNavSections())
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

  .page {
    padding: 0 0 40px;
    box-sizing: border-box;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }
</style>

<template>
  <lingyun-app-page
    :title="hostedView?.title || '首页'"
    :show-back="false"
    :body-scroll="hostedView?.bodyScroll ?? true"
    :page-scroll="hostedView?.pageScroll ?? true"
  >
    <!-- #ifdef MP-WEIXIN -->
    <app-page-view-host v-if="pageHostState.path" />
    <!-- #endif -->
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
  import { getLingyunPageNavSections, resolveLingyunPageUrl } from '@/router/pageNav'
  import { openLingyunHostedPage, pageHostState } from '@/router/pageHost'
  import { getLingyunPageView } from '@/router/pageViews'

  const sections = computed(() => getLingyunPageNavSections())
  const hostedView = computed(() => getLingyunPageView(pageHostState.path))
  const showHome = computed(() => !pageHostState.path)

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

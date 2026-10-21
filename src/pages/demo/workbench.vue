<template>
  <lingyun-app-page title="工作台" :show-back="false">
    <view class="page">
      <view class="hero">
        <text class="hero__title">{{ tabText }}</text>
        <text class="hero__desc">选择一个功能进入</text>
      </view>

      <lingyun-grid
        v-if="gridItems.length"
        :column="3"
        :items="gridItems"
        @change="onGridChange"
      />

      <lingyun-empty
        v-else
        title="暂无二级菜单"
        description="当前一级 Tab 还没有配置 children"
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import {
    findLingyunPageTab,
    getLingyunPageConfig,
    getLingyunWorkspaceTabKey,
    setLingyunWorkspaceTabKey,
    useLingyunWorkspaceTabKey,
  } from '@/uni_modules/lingyun-ui/utils/pageConfig'
  import { normalizeLingyunPagePath } from '@/uni_modules/lingyun-ui/utils/pageNavAdapter'
  import type { LingyunPageTabChild } from '@/uni_modules/lingyun-ui/utils/pageLayout'
  import { resolveLingyunPageUrl } from '@/router/pageNav'

  const tabKey = ref('')

  const tab = computed(() => findLingyunPageTab(tabKey.value))
  const tabText = computed(() => tab.value?.text || '工作台')
  const children = computed<LingyunPageTabChild[]>(() => tab.value?.children || [])

  const gridItems = computed(() =>
    children.value.map((child) => ({
      icon: child.icon || 'circle',
      text: child.text,
      info:
        child.badge && typeof child.badge === 'object'
          ? child.badge.text
          : (child.badge as string | number | boolean | undefined),
    })),
  )

  function syncTabKey(key: string): void {
    const wanted = String(key || '')
    const current = wanted ? findLingyunPageTab(wanted) : null
    const fallback =
      current ||
      (getLingyunPageConfig().tabs || []).find(
        (entry) => Array.isArray(entry.children) && entry.children.length > 0,
      ) ||
      null
    if (!fallback) return
    tabKey.value = fallback.key
    setLingyunWorkspaceTabKey(fallback.key)
  }

  onLoad((query?: Record<string, string | undefined>) => {
    syncTabKey(String(query?.tab || '') || getLingyunWorkspaceTabKey())
  })

  onShow(() => {
    if (tabKey.value) setLingyunWorkspaceTabKey(tabKey.value)
  })

  /* 宿主内嵌切到另一个带 children 的 Tab 时页面不重建，跟着全局 key 换内容 */
  watch(useLingyunWorkspaceTabKey(), (key) => {
    if (!key || key === tabKey.value) return
    const next = findLingyunPageTab(key)
    if (next && next.children && next.children.length) tabKey.value = next.key
  })

  function onGridChange(event: { detail?: { index?: number } }): void {
    const index = Number(event?.detail?.index)
    if (!Number.isFinite(index)) return
    const child = children.value[index]
    if (child) openChild(child)
  }

  function openChild(child: LingyunPageTabChild): void {
    const path = normalizeLingyunPagePath(child.url)
    if (!path) return
    const next = resolveLingyunPageUrl(child.url)
    if (!next) return
    /* 工作台是 Tab 落地页，子项作为详情压栈，顶部返回可回到工作台 */
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
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
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
</style>

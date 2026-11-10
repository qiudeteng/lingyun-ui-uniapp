<template>
  <lingyun-app-page :title="tabText" :show-back="false">
    <view class="page">
      <view :key="tabKey" class="workbench-body">
        <view class="hero">
          <text class="hero__title">{{ tabText }}</text>
          <text class="hero__desc">选择一个功能进入</text>
        </view>

        <view v-if="groups.length" class="workbench-groups">
          <view
            v-for="(group, index) in groups"
            :key="group.key"
            class="workbench-group"
          >
            <lingyun-group-header
              v-if="group.title"
              :title="group.title"
              type="nested"
            />
            <lingyun-section
              :is-last="index === groups.length - 1"
              :margin="group.title ? '0 12px 0' : undefined"
            >
              <lingyun-grid
                background="transparent"
                :column="4"
                :items="gridItems(group.items)"
                @change="onGridChange(group, $event)"
              />
            </lingyun-section>
          </view>
        </view>

        <lingyun-empty
          v-else
          title="暂无二级菜单"
          description="当前一级 Tab 还没有配置 children"
        />
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'

  defineProps<{ embedded?: boolean }>()
  import {
    findLingyunPageTab,
    getLingyunPageConfig,
    getLingyunWorkspaceTabKey,
    setLingyunWorkspaceTabKey,
    syncLingyunWorkspaceUrl,
    useLingyunWorkspaceTabKey,
  } from '@/uni_modules/lingyun-ui/utils/pageConfig'
  import { getLingyunDemoTabGroups, type LingyunDemoNavGroup } from '@/config/pageTabs'
  import { normalizeLingyunPagePath } from '@/uni_modules/lingyun-ui/utils/pageNavAdapter'
  import type { LingyunPageTabChild } from '@/uni_modules/lingyun-ui/utils/pageLayout'
  import { resolveLingyunPageUrl } from '@/router/pageNav'

  const tabKey = ref('')

  /* 从长分组切到短分组时回到顶部，避免停在上一个 Tab 的滚动位置 */
  watch(tabKey, () => {
    nextTick(() => {
      uni.pageScrollTo({ scrollTop: 0, duration: 0 })
    })
  })

  const tab = computed(() => findLingyunPageTab(tabKey.value))
  const tabText = computed(() => tab.value?.text || '工作台')

  /** 与首页共用同一份 Tab 分组数据 */
  const groups = computed<LingyunDemoNavGroup[]>(() =>
    tab.value ? getLingyunDemoTabGroups(tab.value) : [],
  )

  function gridItems(items: LingyunPageTabChild[]) {
    return items.map((child) => ({
      icon: child.icon || 'circle',
      text: child.text,
      info:
        child.badge && typeof child.badge === 'object'
          ? child.badge.text
          : (child.badge as string | number | boolean | undefined),
    }))
  }

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
    syncLingyunWorkspaceUrl(fallback.key)
  }

  onLoad((query?: Record<string, string | undefined>) => {
    syncTabKey(String(query?.tab || '') || getLingyunWorkspaceTabKey())
  })

  /*
   * 宿主页内嵌时组件晚于页面 onLoad 挂载，onLoad 不一定会再触发；
   * 此时直接用全局 key 初始化，避免工作台是空白。
   */
  onMounted(() => {
    if (tabKey.value) return
    syncTabKey(getLingyunWorkspaceTabKey())
  })

  onShow(() => {
    if (!tabKey.value) return
    setLingyunWorkspaceTabKey(tabKey.value)
    /* onLoad 时路由可能还没落定，这里再同步一次地址与 options */
    syncLingyunWorkspaceUrl(tabKey.value)
  })

  /* 宿主内嵌切到另一个带 children 的 Tab 时页面不重建，跟着全局 key 换内容 */
  watch(useLingyunWorkspaceTabKey(), (key) => {
    if (!key || key === tabKey.value) return
    const next = findLingyunPageTab(key)
    if (next && next.children && next.children.length) {
      tabKey.value = next.key
      syncLingyunWorkspaceUrl(next.key)
    }
  })

  function onGridChange(
    group: LingyunDemoNavGroup,
    event: { detail?: { index?: number } },
  ): void {
    const index = Number(event?.detail?.index)
    if (!Number.isFinite(index)) return
    const child = group.items[index]
    if (child) openChild(child)
  }

  function openChild(child: LingyunPageTabChild): void {
    const url = child.url
    if (!url) return
    const path = normalizeLingyunPagePath(url)
    if (!path) return
    const next = resolveLingyunPageUrl(url)
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
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  /* 页内切换只换内容，背景与 Tab 栏保持不动 */
  .workbench-body {
    animation: workbench-enter 0.2s ease both;
  }

  @keyframes workbench-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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

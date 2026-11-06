<template>
  <lingyun-app-page
    ref="pageRef"
    title="Search"
    searchable
    search-placeholder="搜索订单"
    v-model:searching="searching"
    v-model:search-value="keyword"
    @search-open="onSearchOpen"
    @search-cancel="onSearchCancel"
    @search-input="onSearchInput"
    @search="onSearch"
  >
    <view class="page">
      <view class="hero">
        <text class="hero__title">Toolbar Search</text>
        <text class="hero__desc">app-page 顶部搜索 · 输入框替换标题 · 原按钮变取消</text>
      </view>

      <lingyun-section title="搜索状态" :hint="searching ? '搜索模式' : '普通模式'">
        <text class="hint">
          点击右上角独立分组的搜索按钮，左侧返回 / 标题和右侧其他按钮隐藏，输入框出现；原搜索按钮变成取消按钮。
        </text>
        <text class="hint hint--strong">当前关键词：{{ keyword || '—' }}</text>
        <text class="hint hint--last">最近事件：{{ lastEvent || '—' }}</text>
        <lingyun-button
          class="open-button"
          variant="bordered"
          text="通过 ref 打开搜索"
          block
          @click="openByMethod"
        />
      </lingyun-section>

      <lingyun-section v-if="searching" title="搜索专用内容" hint="页面自行渲染" is-last>
        <text class="hint">搜索模式打开时，页面可以只展示搜索相关的组件和结果。</text>
        <lingyun-list>
          <lingyun-list-item
            v-for="item in filtered"
            :key="item.title"
            :title="item.title"
            :note="item.note"
            :detail="item.status"
          />
          <lingyun-list-item v-if="!filtered.length" title="没有匹配结果" note="换个关键词试试" />
        </lingyun-list>
      </lingyun-section>

      <lingyun-section v-else title="全部订单" hint="普通模式" is-last>
        <lingyun-list>
          <lingyun-list-item
            v-for="item in orders"
            :key="item.title"
            :title="item.title"
            :note="item.note"
            :detail="item.status"
          />
        </lingyun-list>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const pageRef = ref<{ openSearch: () => void; closeSearch: (cancel?: boolean) => void } | null>(
    null,
  )
  const searching = ref(false)
  const keyword = ref('')
  const lastEvent = ref('')

  const orders = [
    { title: '订单 A-1024', note: '今天 09:42 更新', status: '进行中' },
    { title: '订单 A-1023', note: '昨天 18:10 更新', status: '已完成' },
    { title: '订单 A-1022', note: '本周一 11:26 更新', status: '待处理' },
    { title: '订单 B-2048', note: '本周一 09:15 更新', status: '进行中' },
  ]

  const filtered = computed(() => {
    const text = keyword.value.trim().toLowerCase()
    if (!text) return orders
    return orders.filter(
      (item) =>
        item.title.toLowerCase().includes(text) || item.status.toLowerCase().includes(text),
    )
  })

  function onSearchOpen(): void {
    lastEvent.value = `search-open · ${keyword.value || '空'}`
  }

  function onSearchCancel(value?: string): void {
    lastEvent.value = `search-cancel · ${value || '空'}`
  }

  function onSearchInput(value: string): void {
    lastEvent.value = `search-input · ${value || '空'}`
  }

  function onSearch(value: string): void {
    lastEvent.value = `search · ${value || '空'}`
    uni.showToast({ title: value ? `搜索：${value}` : '搜索空关键词', icon: 'none' })
  }

  function openByMethod(): void {
    pageRef.value?.openSearch()
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
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
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .hint {
    display: block;
    font-size: 13px;
    line-height: 19px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .hint--strong {
    margin-top: 10px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hint--last {
    margin-top: 4px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .open-button {
    margin-top: 16px;
  }
</style>

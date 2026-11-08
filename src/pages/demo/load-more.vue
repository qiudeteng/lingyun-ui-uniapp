<template>
  <lingyun-app-page title="Load More">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Load More</lingyun-text>
        <lingyun-text type="subtitle" block>
          长列表底部加载 · 更多 / 加载中 / 没有更多 / 失败重试
        </lingyun-text>
      </view>

      <lingyun-section title="手动加载" hint="status · load">
        <template #extra>
          <lingyun-button
            variant="borderless"
            size="small"
            text="重置"
            @click="resetManual"
          />
        </template>
        <view class="items">
          <view v-for="item in items" :key="item" class="item">
            {{ item }}
          </view>
        </view>
        <lingyun-load-more :status="status" @load="loadMore" />
      </lingyun-section>

      <lingyun-section title="自动加载" hint="auto · 触底自动触发">
        <template #extra>
          <lingyun-button
            variant="borderless"
            size="small"
            text="重置"
            @click="resetAuto"
          />
        </template>
        <view class="items">
          <view v-for="item in autoItems" :key="item" class="item">
            {{ item }}
          </view>
        </view>
        <lingyun-load-more :status="autoStatus" auto @load="loadMoreAuto" />
      </lingyun-section>

      <lingyun-section title="状态预览" hint="more · loading · nomore · error">
        <lingyun-load-more status="more" />
        <lingyun-load-more status="loading" />
        <lingyun-load-more status="nomore" />
        <lingyun-load-more status="error" />
      </lingyun-section>

      <lingyun-section
        v-if="lastAction"
        title="最近操作"
        :hint="lastAction"
        is-last
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  LingyunLoadMorePayload,
  LingyunLoadMoreStatus,
} from '@/uni_modules/lingyun-ui/components/lingyun-load-more/types'

const PAGE_SIZE = 4
const allItems = Array.from({ length: 12 }, (_, index) => `配送任务 #${String(index + 1).padStart(3, '0')}`)
const allAutoItems = Array.from({ length: 8 }, (_, index) => `自动加载记录 #${index + 1}`)

const items = ref(allItems.slice(0, PAGE_SIZE))
const status = ref<LingyunLoadMoreStatus>('more')
const autoItems = ref(allAutoItems.slice(0, PAGE_SIZE))
const autoStatus = ref<LingyunLoadMoreStatus>('more')
const lastAction = ref('')

function loadMore(payload: LingyunLoadMorePayload) {
  if (status.value !== 'more' && status.value !== 'error') return
  status.value = 'loading'
  lastAction.value = payload.source === 'auto' ? '自动加载下一页' : '手动加载下一页'
  setTimeout(() => {
    const next = allItems.slice(0, items.value.length + PAGE_SIZE)
    items.value = next
    status.value = next.length >= allItems.length ? 'nomore' : 'more'
  }, 700)
}

function loadMoreAuto(payload: LingyunLoadMorePayload) {
  if (autoStatus.value !== 'more' && autoStatus.value !== 'error') return
  autoStatus.value = 'loading'
  lastAction.value = payload.source === 'auto' ? '自动加载下一页（触底）' : '手动加载下一页'
  setTimeout(() => {
    const next = allAutoItems.slice(0, autoItems.value.length + PAGE_SIZE)
    autoItems.value = next
    autoStatus.value = next.length >= allAutoItems.length ? 'nomore' : 'more'
  }, 700)
}

function resetManual() {
  items.value = allItems.slice(0, PAGE_SIZE)
  status.value = 'more'
}

function resetAuto() {
  autoItems.value = allAutoItems.slice(0, PAGE_SIZE)
  autoStatus.value = 'more'
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
    var(--lingyun-bg-grouped, #f2f2f7);
}

.hero {
  padding: 8px 4px 15px;
}

.items {
  padding-bottom: 4px;
}

.item {
  padding: 13px 4px;
  box-sizing: border-box;
  border-bottom: 0.5px solid var(--lingyun-separator, rgba(0, 0, 0, 0.12));
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #000000);
}

.item:last-child {
  border-bottom: none;
}
</style>

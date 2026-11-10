<template>
  <lingyun-app-page title="Tabs" :page-scroll="false">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Tabs</lingyun-text>
        <lingyun-text type="subtitle" block>
          顶部可滚动 Tab View · underline / pill / sticky
        </lingyun-text>
      </view>

      <lingyun-section title="Underline" hint="默认 · 自动滚入">
        <lingyun-tabs v-model="current" :items="tabs">
          <template #default="{ activeKey }">
            <view class="panel">
              <lingyun-text type="subtitle" block emphasized>
                {{ labelOf(tabs, activeKey) }}
              </lingyun-text>
              <lingyun-text type="caption" color="secondary" block>
                内容由业务通过 scoped slot 渲染，可配合 v-if 或 swiper。
              </lingyun-text>
            </view>
          </template>
        </lingyun-tabs>
      </lingyun-section>

      <lingyun-section title="Pill · 可滚动" hint="12 个分类 · 初始第 6 个">
        <lingyun-tabs v-model="pillCurrent" :items="pillTabs" variant="pill">
          <template #default="{ activeKey }">
            <view class="panel">
              <lingyun-text type="subtitle" block emphasized>
                {{ labelOf(pillTabs, activeKey) }}
              </lingyun-text>
              <lingyun-text type="caption" color="secondary" block>
                Tab 溢出时横向滚动，激活项会自动滚入可视区。
              </lingyun-text>
            </view>
          </template>
        </lingyun-tabs>
      </lingyun-section>

      <lingyun-section title="居中对齐" hint="align=center">
        <lingyun-tabs
          v-model="centerCurrent"
          :items="centerTabs"
          align="center"
        />
      </lingyun-section>

      <view class="sticky-wrap">
        <lingyun-tabs
          v-model="stickyCurrent"
          :items="stickyTabs"
          sticky
          :sticky-top="60"
        >
          <template #default="{ activeKey }">
            <view class="panel">
              <lingyun-text type="subtitle" block emphasized>
                {{ labelOf(stickyTabs, activeKey) }}
              </lingyun-text>
              <lingyun-text type="caption" color="secondary" block>
                向下滚动，Tabs 会吸顶并显示玻璃背景。
              </lingyun-text>
            </view>

            <view class="long-content">
              <lingyun-text
                v-for="item in fillers"
                :key="item"
                type="body"
                block
                class="filler"
              >
                滚动内容 {{ item }}：用于展示 sticky Tabs 的吸顶效果。
              </lingyun-text>
            </view>
          </template>
        </lingyun-tabs>
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LingyunTabItem } from '@/uni_modules/lingyun-ui/components/lingyun-tabs/types'

const tabs: LingyunTabItem[] = [
  { key: 'all', text: '全部', icon: 'list' },
  { key: 'pending', text: '待处理', badge: 3 },
  { key: 'done', text: '已完成' },
  { key: 'canceled', text: '已取消', disabled: true },
]

const pillTabs: LingyunTabItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    key: `c-${index + 1}`,
    text: `分类 ${index + 1}`,
    ...(index === 2 ? { badge: 2 } : {}),
  }),
)

const centerTabs: LingyunTabItem[] = [
  { key: 'day', text: '日' },
  { key: 'week', text: '周' },
  { key: 'month', text: '月' },
]

const stickyTabs: LingyunTabItem[] = [
  { key: 'overview', text: '概览' },
  { key: 'detail', text: '明细' },
  { key: 'logs', text: '日志' },
]

const fillers = Array.from({ length: 20 }, (_, index) => index + 1)

const current = ref('all')
const pillCurrent = ref('c-6')
const centerCurrent = ref('week')
const stickyCurrent = ref('overview')

function labelOf(items: LingyunTabItem[], key: string): string {
  return items.find((item) => item.key === key)?.text || '—'
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

.panel {
  padding: 12px 0 4px;
}

.sticky-wrap {
  margin-top: 12px;
}

.long-content {
  padding: 16px 20px 60px;
}

.filler {
  margin-bottom: 16px;
}
</style>

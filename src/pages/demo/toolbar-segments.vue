<template>
  <lingyun-app-page
    title="Segments"
    :segments="segments"
    v-model:segment-value="segment"
    @segment-click="onSegmentClick"
    @segment-change="onSegmentChange"
  >
    <view class="page">
      <view class="hero">
        <text class="hero__title">Toolbar Segments</text>
        <text class="hero__desc">顶栏下方分段控制 · 数据配置 · click / change</text>
      </view>

      <lingyun-section title="分段状态" :hint="currentLabel">
        <text class="hint">
          分段控制由 app-page 的 segments 数据配置，显示在顶部 toolbar 下方；切换时同时发 segment-click 和 segment-change。
        </text>
        <text class="hint hint--last">最近事件：{{ lastEvent || '—' }}</text>
      </lingyun-section>

      <lingyun-section title="当前分组" hint="示例内容" is-last>
        <view class="panel">
          <text class="panel__value">{{ currentLabel }}</text>
          <text class="panel__note">这里可以根据分段 key 渲染不同列表。</text>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  type SegmentKey = 'all' | 'active' | 'done'
  type SegmentPayload = { value?: string | number; item?: { key?: string } }

  const segments = [
    { key: 'all', text: '全部' },
    { key: 'active', text: '进行中' },
    { key: 'done', text: '已完成' },
  ]
  const segment = ref<SegmentKey>('all')
  const lastEvent = ref('')

  const labels: Record<SegmentKey, string> = {
    all: '全部',
    active: '进行中',
    done: '已完成',
  }
  const currentLabel = computed(() => labels[segment.value] || '—')

  function onSegmentClick(payload: SegmentPayload): void {
    lastEvent.value = `segment-click · ${payload?.value ?? '—'}`
  }

  function onSegmentChange(payload: SegmentPayload): void {
    lastEvent.value = `segment-change · ${payload?.value ?? '—'}`
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

  .hint--last {
    margin-top: 8px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .panel {
    padding: 24px 16px;
    border-radius: 12px;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
  }

  .panel__value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .panel__note {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>

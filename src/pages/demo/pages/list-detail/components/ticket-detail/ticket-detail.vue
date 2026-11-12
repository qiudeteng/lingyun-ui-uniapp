<template>
  <view v-if="ticket.id" class="ticket-detail">
    <view class="ticket-detail__hero">
      <view class="ticket-detail__head">
        <text class="ticket-detail__title">{{ ticket.title }}</text>
        <text class="ticket-detail__status" :class="`ticket-detail__status--${ticket.status}`">
          {{ statusText }}
        </text>
      </view>
      <text class="ticket-detail__meta">
        {{ ticket.customer }} · {{ ticket.assignee }} · {{ ticket.priority }}优先级
      </text>
    </view>

    <lingyun-section title="工单信息" :is-last="false">
      <lingyun-list>
        <lingyun-list-item title="客户" :detail="ticket.customer" />
        <lingyun-list-item title="负责人" :detail="ticket.assignee" />
        <lingyun-list-item title="优先级" :detail="ticket.priority" />
        <lingyun-list-item title="创建时间" :detail="ticket.createdAt" />
        <lingyun-list-item title="更新时间" :detail="ticket.updatedAt" />
        <lingyun-list-item title="服务地址" :note="ticket.address" />
      </lingyun-list>
    </lingyun-section>

    <lingyun-section title="问题描述" :is-last="!timelineItems.length">
      <text class="ticket-detail__body">{{ ticket.description }}</text>
    </lingyun-section>

    <lingyun-section v-if="timelineItems.length" title="处理记录" is-last>
      <view class="ticket-detail__timeline">
        <lingyun-timeline :items="timelineItems" />
      </view>
    </lingyun-section>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    LIST_DETAIL_STATUS_TEXT,
    type ListDetailTicket,
  } from '../../listDetailDemo'
  import type { LingyunTimelineItem } from '@/uni_modules/lingyun-ui/components/lingyun-timeline/types'

  /*
   * 小程序里 props 可能比模板晚一步到达；uni-app 编译出的渲染数据会先读 ticket.title，
   * 所以必须给 ticket 一个默认对象，不能只在 WXML 上写 v-if。
   */
  const props = withDefaults(defineProps<{ ticket: ListDetailTicket }>(), {
    ticket: () =>
      ({
        id: '',
        title: '',
        customer: '',
        status: 'open',
        priority: '低',
        assignee: '',
        createdAt: '',
        updatedAt: '',
        address: '',
        description: '',
        logs: [],
      }) as ListDetailTicket,
  })

  const statusText = computed(() => LIST_DETAIL_STATUS_TEXT[props.ticket.status] || '—')

  /** 最新一条日志高亮，其余按普通节点展示 */
  const timelineItems = computed<LingyunTimelineItem[]>(() =>
    props.ticket.logs.map((log, index) => ({
      key: `${log.time}-${index}`,
      time: log.time,
      title: log.text,
      status: index === 0 ? 'active' : 'default',
    })),
  )
</script>

<style lang="scss">
  .ticket-detail {
    box-sizing: border-box;
    padding: 8px 0 32px;
  }

  .ticket-detail__hero {
    padding: 12px 16px 8px;
  }

  .ticket-detail__head {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }

  .ticket-detail__title {
    flex: 1;
    min-width: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: -0.4px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .ticket-detail__status {
    flex-shrink: 0;
    padding-top: 4px;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .ticket-detail__status--open {
    color: var(--lingyun-warning, #ff8d28);
  }

  .ticket-detail__status--doing {
    color: var(--lingyun-primary, #0a84ff);
  }

  .ticket-detail__status--done {
    color: var(--lingyun-success, #34c759);
  }

  .ticket-detail__meta {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .ticket-detail__body {
    display: block;
    padding: 14px 16px 16px;
    font-size: 15px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .ticket-detail__timeline {
    box-sizing: border-box;
    padding: 8px 16px 16px;
  }
</style>

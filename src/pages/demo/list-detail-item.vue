<template>
  <lingyun-app-page title="工单详情" :show-back="true">
    <view class="page">
      <ticket-detail v-if="ticket" :ticket="ticket" />
      <view v-else class="empty">
        <lingyun-empty
          title="工单不存在"
          description="返回列表重新选择一条工单。"
          action-placement="bottom"
        >
          <template #action>
            <lingyun-button variant="bordered" block text="返回列表" @click="goBack" />
          </template>
        </lingyun-empty>
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import TicketDetail from '@/components/ticket-detail/ticket-detail.vue'
  import { findListDetailTicket, type ListDetailTicket } from './listDetailDemo'

  const ticket = ref<ListDetailTicket | null>(null)

  onLoad((query?: Record<string, string | undefined>) => {
    ticket.value = findListDetailTicket(String(query?.id || ''))
  })

  function goBack(): void {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
      return
    }
    uni.redirectTo({ url: '/pages/demo/list-detail' })
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    padding-bottom: 40px;
  }

  .empty {
    padding: 40px 16px 0;
  }
</style>

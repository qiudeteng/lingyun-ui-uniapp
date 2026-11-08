<template>
  <lingyun-app-page title="Timeline">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Timeline</lingyun-text>
        <lingyun-text type="subtitle" block>
          纵向时间线 · 订单轨迹 / 操作日志 · 状态与图标
        </lingyun-text>
      </view>

      <lingyun-section title="订单轨迹" hint="time · description · status">
        <lingyun-timeline :items="orderTrace" />
      </lingyun-section>

      <lingyun-section title="审批日志" hint="success / active / warning / error">
        <lingyun-timeline :items="approvalLog" />
      </lingyun-section>

      <lingyun-section title="可点击" hint="clickable · item-click">
        <lingyun-timeline
          :items="orderTrace"
          clickable
          @item-click="onItemClick"
        />
      </lingyun-section>

      <lingyun-section title="空态" hint="items=[]">
        <lingyun-timeline :items="[]" empty-text="暂无物流记录" />
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
  LingyunTimelineClickPayload,
  LingyunTimelineItem,
} from '@/uni_modules/lingyun-ui/components/lingyun-timeline/types'

const orderTrace = ref<LingyunTimelineItem[]>([
  {
    key: 'create',
    title: '订单已提交',
    time: '今天 10:24',
    description: '八喜经典冰淇淋蛋糕 · 6 寸',
    status: 'success',
    icon: 'checkmarkempty',
  },
  {
    key: 'pay',
    title: '支付成功',
    time: '今天 10:25',
    description: '微信支付 ¥228.00',
    status: 'success',
    icon: 'checkmarkempty',
  },
  {
    key: 'make',
    title: '门店制作中',
    time: '今天 10:40',
    description: '裱花师已接单，预计 20 分钟完成',
    status: 'active',
    icon: 'compose',
  },
  {
    key: 'deliver',
    title: '等待骑手取货',
    time: '预计 11:10',
    description: '骑手到店后会更新配送进度',
  },
])

const approvalLog = ref<LingyunTimelineItem[]>([
  {
    key: 'submit',
    title: '门店提交用印申请',
    time: '09:12',
    description: '申请人：酒仙桥店 · 李店长',
    status: 'success',
  },
  {
    key: 'review',
    title: '区域经理审核中',
    time: '09:30',
    description: '核对活动内容与用印范围',
    status: 'active',
    color: '#6155f5',
  },
  {
    key: 'finance',
    title: '财务复核待处理',
    time: '10:05',
    description: '预算与发票信息需要二次确认',
    status: 'warning',
  },
  {
    key: 'archive',
    title: '归档失败',
    time: '10:20',
    description: '合同编号重复，请修改后重试',
    status: 'error',
    icon: 'closeempty',
  },
])

const lastAction = ref('')

function onItemClick(payload: LingyunTimelineClickPayload) {
  lastAction.value = `点击「${payload.item.title}」`
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
</style>

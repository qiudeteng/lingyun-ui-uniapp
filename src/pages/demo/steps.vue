<template>
  <lingyun-app-page title="Steps">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Steps</lingyun-text>
        <lingyun-text type="subtitle" block>
          流程步骤条 · 横向 / 纵向 · 完成 / 进行中 / 等待 / 错误
        </lingyun-text>
      </view>

      <lingyun-section title="横向步骤" hint="clickable · v-model">
        <lingyun-steps
          ref="stepsRef"
          v-model="current"
          :items="steps"
          clickable
          @change="onChange"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            当前：{{ currentTitle }}
          </lingyun-text>
          <view class="actions">
            <lingyun-button
              variant="glass"
              size="small"
              text="上一步"
              @click="stepsRef?.prev()"
            />
            <lingyun-button
              variant="borderedProminent"
              size="small"
              text="下一步"
              @click="stepsRef?.next()"
            />
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="纵向步骤" hint="direction=vertical · description">
        <lingyun-steps
          v-model="verticalCurrent"
          direction="vertical"
          :items="verticalSteps"
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="错误与禁用" hint="status=error · disabled">
        <lingyun-steps
          v-model="errorCurrent"
          :items="errorSteps"
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="自定义主题色" hint="accentColor=#34c759">
        <lingyun-steps
          v-model="greenCurrent"
          accent-color="#34c759"
          :items="steps"
          clickable
          @change="onChange"
        />
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
import { computed, ref } from 'vue'
import type {
  LingyunStepItem,
  LingyunStepsChangePayload,
} from '@/uni_modules/lingyun-ui/components/lingyun-steps/types'

const steps = ref<LingyunStepItem[]>([
  { key: 'order', title: '提交订单', description: '选择商品与配送时间' },
  { key: 'produce', title: '门店制作', description: '裱花与打包' },
  { key: 'deliver', title: '骑手配送', description: '预计 30 分钟送达' },
  { key: 'done', title: '完成签收', description: '确认收货并评价' },
])
const verticalSteps = ref<LingyunStepItem[]>([
  { key: 'submit', title: '提交审批', description: '门店店长提交用印申请' },
  { key: 'review', title: '区域审核', description: '区域经理核对活动内容' },
  { key: 'finance', title: '财务复核', description: '核对预算与发票信息' },
  { key: 'archive', title: '归档完成', description: '合同编号回写业务系统' },
])
const errorSteps = ref<LingyunStepItem[]>([
  { key: 'create', title: '创建订单', status: 'finish' },
  { key: 'pay', title: '支付失败', status: 'error' },
  { key: 'ship', title: '等待发货' },
  { key: 'finish', title: '不可跳过', disabled: true },
])

const current = ref('produce')
const verticalCurrent = ref('review')
const errorCurrent = ref('pay')
const greenCurrent = ref('deliver')
const lastAction = ref('')
const stepsRef = ref<{ next: () => void; prev: () => void } | null>(null)

const currentTitle = computed(
  () => steps.value.find((item) => item.key === current.value)?.title || '—',
)

function onChange(payload: LingyunStepsChangePayload) {
  lastAction.value = `切换到「${payload.item.title}」`
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
  padding: 24px 20px 8px;
}

.result {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
</style>

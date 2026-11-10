<template>
  <lingyun-app-page title="Calendar">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Calendar</lingyun-text>
        <lingyun-text type="subtitle" block>
          日历 · 单选 / 范围 · 标记与禁用日期
        </lingyun-text>
      </view>

      <lingyun-section title="单选日期" hint="v-model · marks · disabledDates">
        <lingyun-calendar
          v-model="date"
          :marks="marks"
          :disabled-dates="disabledDates"
          :min="minDate"
          :max="maxDate"
          show-lunar
          @change="onChange"
          @month-change="onMonthChange"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            已选：{{ date || '未选择' }}
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="日期范围" hint="mode=range · v-model: string[]">
        <lingyun-calendar
          v-model="range"
          mode="range"
          :marks="marks"
          :min="minDate"
          :max="maxDate"
          @change="onChange"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            区间：{{ rangeText }}
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="周一开始" hint="weekStartsOn=1">
        <lingyun-calendar
          v-model="weekStartDate"
          :week-starts-on="1"
          :min="minDate"
          :max="maxDate"
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
  LingyunCalendarChangePayload,
  LingyunCalendarMark,
  LingyunCalendarMonthPayload,
} from '@/uni_modules/lingyun-ui/components/lingyun-calendar/types'

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function offset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

const minDate = offset(0)
const maxDate = offset(90)
const date = ref(offset(2))
const weekStartDate = ref(offset(3))
const range = ref<string[]>([offset(3), offset(7)])
const marks = ref<LingyunCalendarMark[]>([
  { date: offset(2), badge: '促', dot: 'orange' },
  { date: offset(5), badge: '休', dot: 'green' },
  { date: offset(8), dot: 'red' },
])
const disabledDates = ref<string[]>([offset(10), offset(11)])
const lastAction = ref('')

const rangeText = computed(() =>
  range.value.length === 2 ? `${range.value[0]} ~ ${range.value[1]}` : range.value[0] || '未选择',
)

function onChange(payload: LingyunCalendarChangePayload) {
  lastAction.value = `选择：${payload.start}${payload.end && payload.end !== payload.start ? ` ~ ${payload.end}` : ''}`
}

function onMonthChange(payload: LingyunCalendarMonthPayload) {
  lastAction.value = `切换到 ${payload.title}`
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

.result {
  padding-top: 10px;
}
</style>

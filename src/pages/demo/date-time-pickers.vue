<template>
  <lingyun-app-page title="Date & Time">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Date & Time</text>
        <text class="hero__desc">
          date / daterange / week / month / year · lunar · marks · time / datetime · start·end · hour12 · wheels · form-item
        </text>
      </view>

      <lingyun-section title="Date · Compact 日历" :hint="day">
        <lingyun-picker v-model="day" mode="date" title="日期" />
      </lingyun-section>

      <lingyun-section title="DateRange · 日期区间" :hint="rangePickHint">
        <lingyun-picker
          v-model="dateRange"
          mode="daterange"
          title="区间"
          placeholder="选择起止日期"
        />
      </lingyun-section>

      <lingyun-section title="Week · 选择一周" :hint="weekPickHint">
        <lingyun-picker
          v-model="weekRange"
          mode="week"
          title="周"
          placeholder="选择一周"
        />
      </lingyun-section>

      <lingyun-section title="Date · 农历" :hint="lunarDay">
        <lingyun-picker v-model="lunarDay" mode="date" title="农历" lunar />
      </lingyun-section>

      <lingyun-section title="Date · 标记 / 红点" :hint="markedDay">
        <lingyun-picker
          v-model="markedDay"
          mode="date"
          title="日程"
          lunar
          :marks="dayMarks"
        />
      </lingyun-section>

      <lingyun-section title="Date · 选择月份" :hint="monthOnly">
        <lingyun-picker v-model="monthOnly" mode="date" fields="month" title="月份" />
      </lingyun-section>

      <lingyun-section title="Date · 选择年份" :hint="yearOnly">
        <lingyun-picker v-model="yearOnly" mode="date" fields="year" title="年份" />
      </lingyun-section>

      <lingyun-section title="Date · 占位 / 禁用" :hint="emptyDay || '未选'">
        <view class="stack">
          <lingyun-picker
            v-model="emptyDay"
            mode="date"
            title="可选日期"
            placeholder="请选择日期"
          />
          <lingyun-picker
            v-model="disabledDay"
            mode="date"
            title="禁用"
            disabled
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Date · 边界 start / end" :hint="boundHint">
        <lingyun-picker
          v-model="boundDay"
          mode="date"
          title="本月内"
          :start="monthStart"
          :end="monthEnd"
        />
      </lingyun-section>

      <lingyun-section title="起止日期" :hint="rangeHint">
        <view class="stack">
          <lingyun-picker
            v-model="rangeStart"
            mode="date"
            title="开始"
            :end="rangeEnd"
          />
          <lingyun-picker
            v-model="rangeEnd"
            mode="date"
            title="结束"
            :start="rangeStart"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Time · 24 小时" :hint="time24">
        <lingyun-picker v-model="time24" mode="time" title="时间" />
      </lingyun-section>

      <lingyun-section title="Time · 12 小时 + AM/PM" :hint="time12">
        <lingyun-picker v-model="time12" mode="time" title="时间" hour12 />
      </lingyun-section>

      <lingyun-section title="Time · 分钟步进" :hint="`interval=${timeStepInterval} → ${timeStep}`">
        <view class="stack">
          <lingyun-picker
            v-model="timeStep"
            mode="time"
            title="每 15 分"
            :minute-interval="15"
          />
          <lingyun-picker
            v-model="timeStep5"
            mode="time"
            title="每 5 分"
            :minute-interval="5"
            hour12
          />
        </view>
      </lingyun-section>

      <lingyun-section title="DateTime · 日历 + 时间" :hint="when24">
        <lingyun-picker v-model="when24" mode="datetime" title="日期时间" />
      </lingyun-section>

      <lingyun-section title="DateTime · hour12" :hint="when12">
        <lingyun-picker v-model="when12" mode="datetime" title="约会" hour12 />
      </lingyun-section>

      <lingyun-section title="起止日期时间" :hint="whenRangeHint">
        <view class="stack">
          <lingyun-picker
            v-model="whenStart"
            mode="datetime"
            title="开始"
            :end="whenEndDate"
            hour12
          />
          <lingyun-picker
            v-model="whenEnd"
            mode="datetime"
            title="结束"
            :start="whenStartDate"
            hour12
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Date · 旧滚轮 wheels" :hint="dayWheels">
        <view class="stack">
          <lingyun-picker
            v-model="dayWheels"
            mode="date"
            picker-style="wheels"
            title="年月日"
          />
          <lingyun-picker
            v-model="monthWheels"
            mode="date"
            picker-style="wheels"
            fields="month"
            title="年月"
          />
          <lingyun-picker
            v-model="yearWheels"
            mode="date"
            picker-style="wheels"
            fields="year"
            title="年"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="文案 · 取消 / 完成" :hint="customLabelDay" is-last>
        <lingyun-picker
          v-model="customLabelDay"
          mode="date"
          title="出发日"
          cancel-text="Close"
          confirm-text="Done"
        />
      </lingyun-section>

      <lingyun-form :model="form">
        <lingyun-form-group title="Form-item · cell 嵌入" footer="form-item 内自动 variant=cell，勿再包 lingyun-section。">
          <lingyun-form-item name="meetDay" label="会议日">
            <lingyun-picker v-model="form.meetDay" mode="date" placeholder="选择日期" />
          </lingyun-form-item>
          <lingyun-form-item name="meetTime" label="开始时间">
            <lingyun-picker v-model="form.meetTime" mode="time" hour12 placeholder="选择时间" />
          </lingyun-form-item>
          <lingyun-form-item name="deadline" label="截止">
            <lingyun-picker
              v-model="form.deadline"
              mode="datetime"
              placeholder="选择日期时间"
            />
          </lingyun-form-item>
        </lingyun-form-group>
      </lingyun-form>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'

  function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n)
  }

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const monthStart = `${y}-${pad2(m)}-01`
  const monthEnd = `${y}-${pad2(m)}-${pad2(new Date(y, m, 0).getDate())}`

  const day = ref('2026-09-17')
  const dateRange = ref(['2026-09-10', '2026-09-17'])
  const rangePickHint = computed(() => {
    const v = dateRange.value
    if (!Array.isArray(v) || !v.length) return '未选'
    if (v.length < 2 || !v[1]) return String(v[0])
    return `${v[0]} → ${v[1]}`
  })
  const weekRange = ref(['2026-09-13', '2026-09-19'])
  const weekPickHint = computed(() => {
    const v = weekRange.value
    if (!Array.isArray(v) || v.length < 2) return '未选'
    return `${v[0]} → ${v[1]}`
  })
  const lunarDay = ref('2026-09-17')
  const markedDay = ref('2026-09-17')
  const dayMarks = [
    { date: '2026-09-07', dot: true },
    { date: '2026-09-13', dot: 'green' },
    { date: '2026-09-16', dot: 'green' },
    { date: '2026-09-20', badge: '班', dot: 'orange' },
    { date: '2026-09-23', dot: 'orange' },
    { date: '2026-09-25', badge: '休', dot: 'orange' },
    { date: '2026-09-26', badge: '休', dot: 'orange' },
    { date: '2026-09-27', badge: '休', dot: 'orange' },
  ]
  const monthOnly = ref('2026-09')
  const yearOnly = ref('2026')
  const emptyDay = ref('')
  const disabledDay = ref('2026-09-17')
  const boundDay = ref(`${y}-${pad2(m)}-${pad2(Math.min(17, new Date(y, m, 0).getDate()))}`)
  const boundHint = computed(() => `${monthStart} ~ ${monthEnd} · ${boundDay.value}`)

  const rangeStart = ref('2026-09-10')
  const rangeEnd = ref('2026-09-17')
  const rangeHint = computed(() => `${rangeStart.value} → ${rangeEnd.value}`)
  watch(rangeStart, (v) => {
    if (v && rangeEnd.value && v > rangeEnd.value) rangeEnd.value = v
  })
  watch(rangeEnd, (v) => {
    if (v && rangeStart.value && v < rangeStart.value) rangeStart.value = v
  })

  const time24 = ref('09:30')
  const time12 = ref('20:00')
  const timeStep = ref('09:00')
  const timeStep5 = ref('09:15')
  const timeStepInterval = 15

  const when24 = ref('2026-09-17 14:30')
  const when12 = ref('2026-09-17 20:00')

  const whenStart = ref('2026-09-17 09:00')
  const whenEnd = ref('2026-09-17 18:00')
  const whenStartDate = computed(() => whenStart.value.slice(0, 10))
  const whenEndDate = computed(() => whenEnd.value.slice(0, 10))
  const whenRangeHint = computed(() => `${whenStart.value} → ${whenEnd.value}`)
  watch(whenStart, (v) => {
    if (v && whenEnd.value && v > whenEnd.value) whenEnd.value = v
  })
  watch(whenEnd, (v) => {
    if (v && whenStart.value && v < whenStart.value) whenStart.value = v
  })

  const dayWheels = ref('2026-09-17')
  const monthWheels = ref('2026-09')
  const yearWheels = ref('2026')
  const customLabelDay = ref('2026-10-01')

  const form = reactive({
    meetDay: '2026-09-20',
    meetTime: '10:00',
    deadline: '2026-09-30 18:00',
  })
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
      var(--lingyun-bg-grouped-primary, #f2f2f7);
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

  .stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>

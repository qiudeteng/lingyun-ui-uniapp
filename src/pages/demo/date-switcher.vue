<template>
  <lingyun-app-page title="Date Switcher" :show-tabbar="false">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Date Switcher</text>
        <text class="hero__desc">lingyun-date-switcher · 底部日期切换条</text>
      </view>

      <lingyun-section title="模式" :hint="`mode = ${mode}`">
        <text class="hint">
          底部日期条右侧的圆形按钮显示当前模式（天 / 周 / 月 / 年 / 自），点击弹出菜单切换，通过 v-model:mode 回传。
        </text>
      </lingyun-section>

      <lingyun-section title="模式按钮" hint="showModeSwitch / modes">
        <view class="row">
          <text class="row__label">显示模式按钮</text>
          <lingyun-switch v-model="showModeSwitch" />
        </view>
        <view v-for="item in modeToggleItems" :key="item.key" class="row">
          <text class="row__label">{{ item.text }}</text>
          <lingyun-switch v-model="modeFlags[item.key]" />
        </view>
        <text class="hint">关闭某个模式后，右侧菜单不再出现；全部关闭时按钮自动隐藏。</text>
      </lingyun-section>

      <lingyun-section title="范围限制" :hint="limitLabel">
        <lingyun-picker
          v-model="limitIndex"
          mode="selector"
          title="范围限制"
          :range="limitOptions"
          range-key="text"
        />
        <text class="hint">超出范围后底部条的上一段 / 下一段按钮会自动禁用。</text>
      </lingyun-section>

      <lingyun-section title="当前值" :hint="`mode = ${mode}`">
        <lingyun-list>
          <lingyun-list-item title="选择值" :detail="selectedValue || valueText" />
          <lingyun-list-item title="区间" :detail="rangeText" />
          <lingyun-list-item title="最近一次 change" :detail="lastChange" />
        </lingyun-list>
      </lingyun-section>

      <lingyun-section title="change 返回" hint="JSON">
        <text class="json">{{ lastChangeJson }}</text>
      </lingyun-section>

      <lingyun-section title="交互" hint="中间点击弹出日期选择器" is-last>
        <text class="hint">
          点击左右按钮切换上一段 / 下一段；点击中间区域会打开内置日期选择器（天 / 周 / 月 / 年 / 日期段）。
          固定条使用 tabbar 同款玻璃胶囊，底部已预留 Home Indicator。
        </text>
      </lingyun-section>
    </view>

    <lingyun-date-switcher
      v-model:mode="mode"
      :show-mode-switch="showModeSwitch"
      :modes="availableModes"
      :limit="limit"
      :model-value="currentValue"
      @update:model-value="onValue"
      @change="onChange"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type {
    LingyunDateSwitcherChange,
    LingyunDateSwitcherLimit,
    LingyunDateSwitcherMode,
    LingyunDateSwitcherRange,
    LingyunDateSwitcherValue,
  } from '@/uni_modules/lingyun-ui'

  const mode = ref<LingyunDateSwitcherMode>('week')
  const dateValue = ref('2026-11-06')
  const weekValue = ref('2026-11-02')
  const monthValue = ref('2026-11-01')
  const yearValue = ref('2026-01-01')
  const rangeValue = ref<LingyunDateSwitcherRange>(['2026-10-26', '2026-11-01'])
  const showModeSwitch = ref(true)
  const modeFlags = reactive<Record<LingyunDateSwitcherMode, boolean>>({
    date: true,
    week: true,
    month: true,
    year: true,
    range: true,
  })
  const modeToggleItems: { key: LingyunDateSwitcherMode; text: string }[] = [
    { key: 'date', text: '天' },
    { key: 'week', text: '周' },
    { key: 'month', text: '月' },
    { key: 'year', text: '年' },
    { key: 'range', text: '自定义日期段' },
  ]
  const modeOrder: LingyunDateSwitcherMode[] = ['date', 'week', 'month', 'year', 'range']
  const availableModes = computed(() => modeOrder.filter((key) => modeFlags[key]))

  watch(availableModes, (list) => {
    if (list.length && list.indexOf(mode.value) < 0) mode.value = list[0]
  })
  const selectedValue = ref('')
  const lastChange = ref('—')
  const lastChangeJson = ref('{}')

  const limitOptions: { text: string; value: LingyunDateSwitcherLimit | '' }[] = [
    { text: '不限制', value: '' },
    { text: '今天之前（含今天）', value: 'past' },
    { text: '今天之后（含今天）', value: 'future' },
    { text: '本周内', value: 'thisWeek' },
    { text: '本周之前', value: 'beforeThisWeek' },
    { text: '本周之后', value: 'afterThisWeek' },
    { text: '本月内', value: 'thisMonth' },
    { text: '本月之前', value: 'beforeThisMonth' },
    { text: '本月之后', value: 'afterThisMonth' },
  ]
  const limitIndex = ref(0)
  const limit = computed<LingyunDateSwitcherLimit | ''>(
    () => (limitOptions[limitIndex.value] || limitOptions[0]).value,
  )
  const limitLabel = computed(
    () => (limitOptions[limitIndex.value] || limitOptions[0]).text,
  )

  /** 与 change.value 保持一致：week=YYYY-WW、month=YYYY-MM、range=YYYY-MM-DD - YYYY-MM-DD */
  function isoWeekText(dateText: string): string {
    const date = new Date(`${dateText}T12:00:00`)
    const thursday = new Date(date)
    const offset = (thursday.getDay() + 6) % 7
    thursday.setDate(thursday.getDate() - offset + 3)
    const isoYear = thursday.getFullYear()
    const first = new Date(isoYear, 0, 4, 12)
    const firstOffset = (first.getDay() + 6) % 7
    first.setDate(first.getDate() - firstOffset + 3)
    const week = 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * 86400000))
    return `${isoYear}-${String(week).padStart(2, '0')}`
  }

  const valueText = computed(() => {
    if (mode.value === 'range') return `${rangeValue.value[0]} - ${rangeValue.value[1]}`
    if (mode.value === 'week') return isoWeekText(weekValue.value)
    if (mode.value === 'month') return monthValue.value.slice(0, 7)
    if (mode.value === 'year') return yearValue.value.slice(0, 4)
    return dateValue.value
  })

  const rangeText = computed(() => {
    if (mode.value === 'range') return `${rangeValue.value[0]} 至 ${rangeValue.value[1]}`
    if (mode.value === 'week') {
      const start = new Date(`${weekValue.value}T12:00:00`)
      const day = start.getDay()
      const offset = (day + 6) % 7
      const monday = new Date(start)
      monday.setDate(start.getDate() - offset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return `${fmt(monday)} 至 ${fmt(sunday)}`
    }
    if (mode.value === 'month') {
      const start = new Date(`${monthValue.value}T12:00:00`)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 12)
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return `${fmt(start)} 至 ${fmt(end)}`
    }
    if (mode.value === 'year') {
      const year = yearValue.value.slice(0, 4)
      return `${year}-01-01 至 ${year}-12-31`
    }
    return dateValue.value
  })

  const currentValue = computed<LingyunDateSwitcherValue>(() => {
    if (mode.value === 'range') return rangeValue.value
    if (mode.value === 'week') return weekValue.value
    if (mode.value === 'month') return monthValue.value
    if (mode.value === 'year') return yearValue.value
    return dateValue.value
  })

  function onValue(value: LingyunDateSwitcherValue): void {
    if (mode.value === 'range') {
      if (Array.isArray(value)) {
        rangeValue.value = [String(value[0] || ''), String(value[1] || '')]
      }
      return
    }
    if (typeof value !== 'string') return
    if (mode.value === 'week') weekValue.value = value
    else if (mode.value === 'month') monthValue.value = value
    else if (mode.value === 'year') yearValue.value = value
    else dateValue.value = value
  }

  function onChange(payload: LingyunDateSwitcherChange): void {
    /* 选择值直接用 change 返回的 value，不在 demo 里二次推导 */
    selectedValue.value = payload.value
    lastChange.value = `${payload.type} · ${payload.range}`
    lastChangeJson.value = JSON.stringify(payload, null, 2)
  }

</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 140px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
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

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    padding: 0 16px;
  }

  .row__label {
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hint {
    display: block;
    padding: 8px 16px 12px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .json {
    display: block;
    margin: 0 16px 12px;
    padding: 12px 14px;
    box-sizing: border-box;
    border-radius: 14px;
    background: var(--lingyun-fill-tertiary, #e9e9ee);
    color: var(--lingyun-label-secondary, #6a6a6a);
    font-size: 12px;
    line-height: 18px;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>

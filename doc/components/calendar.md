# lingyun-calendar

独立日历：单选 / 日期范围、月份切换、今天、标记与禁用日期。用于配送日期、促销日历、生产排期。

规范见 [`design/CALENDAR.md`](../../design/CALENDAR.md)。

## 示例

```vue
<lingyun-calendar
  v-model="date"
  :marks="[
    { date: '2026-11-10', badge: '促', dot: 'orange' },
    { date: '2026-11-12', badge: '休', dot: 'green' },
  ]"
  :disabled-dates="['2026-11-15']"
  min="2026-11-01"
  max="2027-02-01"
  show-lunar
  @change="onChange"
/>
```

范围：

```vue
<lingyun-calendar v-model="range" mode="range" @change="onChange" />
```

```ts
const range = ref<string[]>(['2026-11-10', '2026-11-14'])
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 单选 `YYYY-MM-DD`；范围 `[start, end]`（允许只有 start） | `''` |
| `mode` | `single` / `range` | `single` |
| `month` | 受控视图月份 `YYYY-MM`；不传时跟随值 / 今天 | `''` |
| `min` | 最小可选日期 | `''` |
| `max` | 最大可选日期 | `''` |
| `weekStartsOn` | 每周首日，0=周日 … 6=周六 | 0 |
| `marks` | 标记：`{ date, badge?, badgeText?, dot?: true / red / orange / green }` | `[]` |
| `disabledDates` | 额外禁用日期 `YYYY-MM-DD[]` | `[]` |
| `showLunar` | 日期下方显示农历 / 节气 | false |
| `showTodayButton` | 头部显示「今天」 | true |
| `todayText` | 今天按钮文案 | 今天 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 日期 / 范围变化 |
| `change` | 参数 `{ value, start, end }` |
| `month-change` | 切换月份，参数 `{ year, month, title }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `prevMonth()` | 上个月 |
| `nextMonth()` | 下个月 |
| `goToday()` | 跳到今天所在月 |
| `select(value)` | 以程序方式选择日期 / 范围 |

## 说明

- 固定 42 格；首尾用相邻月真实日期补齐并灰显不可点，跨月请先翻月。
- 范围模式第一次点击回写 `[start]`，第二次回写 `[start, end]`；终点早于起点会自动交换。
- `marks` 有值时日期进入紧凑布局（角标 / 圆点 / 农历）。
- 日期单元格复用 `lingyun-picker-cal-day`，选中 / 今天 / 禁用样式与日期选择器一致。
- 内容层标准卡片，不铺 Liquid Glass。

# 日期选择器

日期、区间、周、时间和日期时间都用 `lingyun-picker`，用 `mode` 区分。默认是日历；时间是滚轮。演示页：`/pages/demo/date-time-pickers`。

普通列表见 [选择器](./picker.md)。

## 示例

```vue
<lingyun-picker v-model="day" mode="date" title="日期" />
<lingyun-picker v-model="span" mode="daterange" title="区间" placeholder="选择起止日期" />
<lingyun-picker v-model="week" mode="week" title="周" />
<lingyun-picker v-model="month" mode="date" fields="month" title="月份" />
<lingyun-picker v-model="year" mode="date" fields="year" title="年份" />
<lingyun-picker v-model="time" mode="time" title="时间" />
<lingyun-picker v-model="when" mode="datetime" title="日期时间" />
```

农历、标记和 12 小时制：

```vue
<lingyun-picker v-model="day" mode="date" title="农历" lunar />
<lingyun-picker
  v-model="day"
  mode="date"
  title="日程"
  :marks="[
    { date: '2026-09-20', badge: '班', dot: 'orange' },
    { date: '2026-09-25', badge: '休', dot: true },
  ]"
/>
<lingyun-picker v-model="time" mode="time" title="时间" hour12 :minute-interval="15" />
```

限制可选范围。`start`、`end` 用 `YYYY-MM-DD`：

```vue
<lingyun-picker v-model="day" mode="date" title="本月内" :start="monthStart" :end="monthEnd" />
```

需要旧的年月日滚轮时，把 `picker-style` 设为 `wheels`。`daterange` 和 `week` 只有日历。

```vue
<lingyun-picker v-model="day" mode="date" picker-style="wheels" title="年月日" />
```

放进 `lingyun-form-item` 后自动变成行内，不要再包一层 `lingyun-section`。

```vue
<lingyun-form-item name="meetDay" label="会议日">
  <lingyun-picker v-model="form.meetDay" mode="date" placeholder="选择日期" />
</lingyun-form-item>
```

## 值

| `mode` | `v-model` |
| --- | --- |
| `date` | `YYYY-MM-DD`。`fields="month"` 为 `YYYY-MM`，`fields="year"` 为 `YYYY` |
| `daterange` | `[start, end]`，都是 `YYYY-MM-DD`。同一天可以选 |
| `week` | `[weekStart, weekEnd]`。默认周日到周六 |
| `time` | `HH:mm`。开了 `hour12` 也按 24 小时存 |
| `datetime` | `YYYY-MM-DD HH:mm` |

区间：先点开始日，再点结束日。结束早于开始时会对调。再点一次重新选开始。中间日期浅蓝，起止是选中圆。

周：点任意一天，选中它所在的一整周。再点另一周则换成那一周。`weekStartsOn` 从 `0`（周日）到 `6`（周六）。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` / `value` | 见上表 | — |
| `mode` | `date` / `daterange` / `week` / `time` / `datetime` | — |
| `pickerStyle` | `auto`：日期类用日历，时间用滚轮。可强制 `calendar` 或 `wheels` | auto |
| `fields` | `date` 的粒度：`day` / `month` / `year` | day |
| `start` / `end` | 可选边界，`YYYY-MM-DD`。界外不可点 | '' |
| `weekStartsOn` | `week` 的周起始，`0`–`6` | 0 |
| `lunar` | 日格数字下显示农历 | false |
| `marks` | `{ date, badge?, dot? }[]`。`badge` 是右上角小字；`dot` 为 `true` / `red` / `orange` / `green`，`true` 为红点 | [] |
| `hour12` | `time` / `datetime` 用 12 小时和 AM/PM | false |
| `minuteInterval` | 分钟步进：`1` / `5` / `10` / `15` / `30`。其它值按 1 | 1 |
| `title` | 弹层标题 | '' |
| `placeholder` | 未选时的文字 | 请选择 |
| `disabled` | 禁用 | false |
| `cancelText` / `confirmText` | 弹层按钮 | 取消 / 完成 |
| `variant` | `auto`：在 form-item 内为行内，否则为独立胶囊 | auto |

日历里的单日格子是内部组件 `lingyun-picker-cal-day`，不要在页面里单独使用。它必须单独放在 `lingyun-picker-cal-day/lingyun-picker-cal-day.vue`。微信 easycom 只认「目录名 = 文件名」，嵌进 `lingyun-picker` 目录后小程序会找不到这一格。

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` / `update:value` | 点完成后写入 |
| `change` | `{ value }`，与上面的值相同 |
| `cancel` | 取消或关闭，不改当前值 |

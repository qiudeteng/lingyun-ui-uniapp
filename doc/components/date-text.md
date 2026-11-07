# lingyun-date-text

日期显示组件。按传入日期自动显示「今天 / 昨天 / 明天」，今年显示 `MM-DD`，跨年显示 `YYYY-MM-DD`；时间可配置显示到天、时、分、秒。只负责格式化，字体默认继承父级。

## 示例

```vue
<lingyun-date-text :value="order.createdAt" precision="minute" />
<!-- 今天 14:30 / 11-06 14:30 / 2025-11-06 14:30 -->

<lingyun-date-text :value="date" precision="day" type="subheadline" color="secondary" bold />
```

## 规则

- 今天 / 昨天 / 明天：显示相对文案；`precision` 大于 `day` 时追加时间，如「今天 14:30」。
- 同年其它日期：`MM-DD`；跨年：`YYYY-MM-DD`。
- `precision="day"` 只显示日期；`hour` 追加 `HH`；`minute` 追加 `HH:mm`；`second` 追加 `HH:mm:ss`。
- 日期按本地时区展示。纯日期字符串按本地零点解析，不会因 UTC 跨天。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | 日期：`Date`、毫秒时间戳（10 位按秒）、`YYYY-MM-DD`、`YYYY/MM/DD`、带 `HH:mm(:ss)` 的日期字符串、其它 `Date.parse` 可识别的字符串 | — |
| `precision` | `day` / `hour` / `minute` / `second` | day |
| `now` | 当前时间，默认取组件渲染时的 `new Date()`；测试或需要固定展示时传入 | — |
| `todayText` | 今天的文案 | 今天 |
| `yesterdayText` | 昨天的文案 | 昨天 |
| `tomorrowText` | 明天的文案 | 明天 |
| `separator` | 日期与时间的连接符 | 空格 |
| `fallback` | 解析失败时的文案 | '' |
| `type` | `lingyun-text` 字阶：`largeTitle` / `title1` / `title2` / `title3` / `headline` / `body` / `callout` / `subheadline` / `footnote` / `caption1` / `caption2` | body |
| `color` | 语义色（`label` / `secondary` / `tertiary` / `primary` / `link` / `success` / `warning` / `error` / `white`）或任意 CSS 颜色；空时跟随 `type` 默认色 | '' |
| `bold` | 是否加粗（对应 `lingyun-text` 的 emphasized） | false |
| `block` | 是否块级展示 | false |

## 工具函数

组件内部使用、也单独导出的格式化函数：

```ts
import { formatLingyunDate, parseLingyunDate } from '@/uni_modules/lingyun-ui'

formatLingyunDate('2026-11-06 14:30:00', {
  precision: 'minute',
  now: '2026-11-06 12:00:00',
})
// 今天 14:30

parseLingyunDate('2026-11-06 14:30:00') // Date | null
```

`formatLingyunDate(value, options)` 的 `options` 与组件属性同名：`precision` / `now` / `todayText` / `yesterdayText` / `tomorrowText` / `separator` / `fallback`。

## 注意

- 组件不会在跨过零点时自动刷新「今天 / 昨天 / 明天」；页面重新渲染时会重新计算，需要长时间停留可传入响应式的 `now`。
- 日期字符串没有时区信息时按本地时间处理；带 `Z` 或时区偏移的 ISO 字符串按 `Date` 解析后转本地展示。
- 纯日期字符串没有时间，`precision` 大于 `day` 时时间按 `00:00` 补齐；只需要日期用 `precision="day"`。

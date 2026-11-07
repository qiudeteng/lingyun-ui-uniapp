# Date Text 规范（lingyun-date-text）

> 日期显示组件。只做格式化与文本呈现，不强制字号、颜色；字体默认继承父级。
> 尺寸一律 `px`（1pt = 1px），暗黑/浅色跟随主题。

## 1. 显示规则

| 条件 | 日期部分 | 示例（precision=minute） |
| --- | --- | --- |
| 今天 | 今天 | 今天 14:30 |
| 昨天 | 昨天 | 昨天 09:05 |
| 明天 | 明天 | 明天 08:00 |
| 同年其它日期 | `MM-DD` | 11-06 14:30 |
| 跨年 | `YYYY-MM-DD` | 2025-11-06 14:30 |

- 日期按本地时区展示；纯日期字符串按本地零点解析，避免 UTC 跨天。
- 今天 / 昨天 / 明天按日历日判断，不按 24 小时差。
- 相对文案可通过 `todayText` / `yesterdayText` / `tomorrowText` 覆盖；空串则回退到日期。

## 2. 精度

`precision` 控制时间显示到哪一级，日期部分不变：

| precision | 时间部分 | 示例 |
| --- | --- | --- |
| `day` | 不显示 | 今天 / 11-06 / 2025-11-06 |
| `hour` | `HH` | 今天 14 |
| `minute` | `HH:mm` | 今天 14:30 |
| `second` | `HH:mm:ss` | 今天 14:30:08 |

日期与时间之间默认空格，可用 `separator` 修改。

## 3. 样式

字号、颜色、加粗与 [`TEXTS.md`](./TEXTS.md) 的 `lingyun-text` 完全一致，不开放任意数字字号：

- `type`：内置字阶 `largeTitle` / `title1` / `title2` / `title3` / `headline` / `body` / `callout` / `subheadline` / `footnote` / `caption1` / `caption2`，默认 `body`。
- `color`：语义色 `label` / `secondary` / `tertiary` / `primary` / `link` / `success` / `warning` / `error` / `white`，或任意 CSS 颜色；空时跟随 `type` 默认色。
- `bold`：对应 `lingyun-text` 的 emphasized。
- `block`：块级展示；默认行内。
- 组件是行内 `<text>`，可放在列表行、详情字段、卡片说明中。

## 4. API

```vue
<lingyun-date-text :value="order.createdAt" precision="minute" />
<lingyun-date-text :value="date" precision="day" type="subheadline" color="secondary" bold />
```

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | Date / 毫秒时间戳（10 位按秒）/ 日期字符串 | — |
| `precision` | day / hour / minute / second | day |
| `now` | 当前时间，测试或固定展示时传入 | 渲染时 new Date() |
| `todayText` / `yesterdayText` / `tomorrowText` | 相对文案 | 今天 / 昨天 / 明天 |
| `separator` | 日期与时间连接符 | 空格 |
| `fallback` | 解析失败文案 | '' |
| `type` / `color` / `bold` / `block` | 内置字阶 / 语义色 / 加粗 / 块级 | body / 继承 / false / false |

## 5. 自检

- [ ] 今天、昨天、明天显示相对文案；跨年显示四位年份。
- [ ] `precision` 从 day 到 second 逐级只增加时间单位，不丢日期。
- [ ] 纯日期字符串在 UTC+8 与 UTC-5 下都显示同一天。
- [ ] 字号只使用 `type` 内置字阶；设置 color/bold/block 时只影响自身。

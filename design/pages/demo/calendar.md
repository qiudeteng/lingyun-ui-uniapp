# Calendar Demo

对应页面：`src/pages/demo/calendar.vue`

## 区块

1. `hero`：标题 Calendar + 说明「日历 · 单选 / 范围 · 标记与禁用日期」。
2. `单选日期`：`v-model` + `marks` + `disabledDates` + `min` / `max` + `showLunar`，显示已选日期。
3. `日期范围`：`mode="range"`、`v-model: string[]`，两次点击完成区间；显示区间文案。
4. `周一开始`：`weekStartsOn=1`，演示周首日切换。
5. `最近操作`：显示选择区间或月份切换结果。

## 规范

- 组件规格见 [`CALENDAR.md`](../../CALENDAR.md)。
- 演示日期相对今天生成，避免过期；标记 / 禁用日期只用于示例。

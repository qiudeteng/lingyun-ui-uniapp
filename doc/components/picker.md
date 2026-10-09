# lingyun-picker

选择器。这里是普通列表。日期、区间、周、时间和日期时间见 [日期选择器](./date-picker.md)。

## 示例

```vue
<lingyun-picker v-model="idx" :range="['上海', '北京']" title="城市" />
<lingyun-picker v-model="idx" :range="cities" range-key="name" title="城市" show-search />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前下标 | — |
| `mode` | 列表用 `selector` | selector |
| `range` | 选项。字符串数组，或对象数组 | — |
| `rangeKey` | 选项是对象时，显示哪个字段 | '' |
| `title` | 弹层标题 | '' |
| `placeholder` | 未选时的文字 | 请选择 |
| `disabled` | 禁用 | false |
| `showSearch` | 滚轮下方按名称过滤 | false |
| `searchPlaceholder` | 搜索框占位 | 搜索 |
| `cancelText` / `confirmText` | 弹层按钮 | 取消 / 完成 |
| `variant` | 在 form-item 内自动变成行内 | auto |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` / `update:value` | 确认后的下标 |
| `change` | `{ value }` |
| `cancel` | 取消，不改当前值 |

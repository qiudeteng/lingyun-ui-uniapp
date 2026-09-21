# lingyun-picker

选择器。`mode` 决定是普通列表、日期、时间还是日期时间。

## 示例

```vue
<lingyun-picker v-model="idx" :range="['上海', '北京']" title="城市" />
<lingyun-picker v-model="day" mode="date" title="日期" />
<lingyun-picker v-model="when" mode="datetime" title="日期时间" />
<lingyun-picker v-model="time" mode="time" title="时间" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 列表为下标；日期时间为对应值 | — |
| `mode` | `selector` / `date` / `time` / `datetime` | selector |
| `range` | 普通列表的选项 | — |
| `rangeKey` | 选项是对象时，显示哪个字段 | — |
| `title` | 弹层标题 | '' |
| `placeholder` | 未选时的文字 | — |
| `start / end` | 日期范围 | — |
| `disabled` | 禁用 | false |
| `variant` | 在 form-item 内自动变成行内 | auto |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 确认选择 |

日历中的单日格子是内部组件，不要单独使用。

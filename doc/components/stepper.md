# lingyun-stepper

加减数字。

## 示例

```vue
<lingyun-stepper v-model="n" :min="0" :max="10" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前值 | — |
| `min / max / step` | 最小、最大、步长 | 0 / 10 / 1 |
| `disabled` | 禁用 | false |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 数值变化 |

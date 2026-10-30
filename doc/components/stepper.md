# lingyun-stepper

加减数字。

## 示例

```vue
<lingyun-stepper v-model="n" :min="0" :max="10" show-value />
<lingyun-stepper v-model="n" :min="0" :max="99" left-text="购买数量" right-text="件" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前值 | — |
| `min / max / step` | 最小、最大、步长 | 0 / 10 / 1 |
| `disabled` | 禁用 | false |
| `showValue` | 在 − / + 之间展示当前值，可直接改数字 | false |
| `leftText` | 控件左侧灰色说明文字，最多 4 个字 | '' |
| `rightText` | 控件右侧灰色说明文字，最多 4 个字 | '' |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 数值变化 |

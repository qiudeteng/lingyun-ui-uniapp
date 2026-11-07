# lingyun-stepper

加减数字。

## 示例

```vue
<lingyun-stepper v-model="n" :min="0" :max="10" show-value />
<lingyun-stepper v-model="n" :min="0" :max="99" left-text="购买数量" right-text="件" />
<lingyun-stepper v-model="n" :min="0" :max="99" size="large" show-value />
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
| `size` | `default` 为 30 高；`large` 为 38 高、按钮 46 宽、17 号数值，适合真机大点击区 | default |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 数值变化 |

数值框宽度会随数字位数自动调整，保证多位数字完整显示；不要给 `.lingyun-stepper__value` 再设固定宽度，容器需要能换行或留出空间。

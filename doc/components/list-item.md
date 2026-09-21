# lingyun-list-item

列表中的一行。右侧可以是文字、箭头、开关、步进器或滑条。

## 示例

```vue
<lingyun-list-item title="标题" note="副标题" />
<lingyun-list-item title="详情" detail="内容" accessory="disclosure" @click="open" />
<lingyun-list-item title="开关" accessory="toggle" v-model:switch-checked="on" />
<lingyun-list-item title="数量" accessory="stepper" v-model:stepper-value="n" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 主标题 | — |
| `note / subtitle` | 副标题 | — |
| `detail` | 右侧文字 | — |
| `thumb` | 左侧图片 | — |
| `accessory` | `disclosure` 箭头、`toggle` 开关、`stepper`、`slider` | — |
| `clickable` | 整行可点 | — |
| `disabled` | 禁用 | false |
| `switchChecked` | 开关值，配 `accessory="toggle"` | — |
| `stepperValue / stepperMin / stepperMax` | 步进器 | — |
| `sliderValue` | 滑条值，配 `accessory="slider"` | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点击行 |
| `update:switchChecked` | 开关变化 |
| `update:stepperValue` | 步进变化 |
| `update:sliderValue` | 滑条变化 |

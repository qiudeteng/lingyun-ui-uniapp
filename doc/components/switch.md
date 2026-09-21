# lingyun-switch

开关。

## 示例

```vue
<lingyun-switch v-model="on" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue / checked` | 是否打开 | — |
| `disabled` | 禁用 | false |
| `color` | 打开时的颜色。空则用系统蓝 | '' |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

# lingyun-checkbox

单个勾选。一组选项用 `lingyun-data-checkbox`。

## 示例

```vue
<lingyun-checkbox v-model="agree" label="同意协议" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue / checked` | 是否勾选 | — |
| `label` | 文案 | '' |
| `disabled` | 禁用 | false |
| `color` | 勾选色 | '' |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 勾选变化 |

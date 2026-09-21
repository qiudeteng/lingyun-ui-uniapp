# lingyun-chip

可切换选中态的胶囊，适合筛选。

## 示例

```vue
<lingyun-chip v-model="on" text="仅看未读" />
<lingyun-chip text="不可点" disabled />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 文案 | '' |
| `modelValue / selected` | 是否选中 | — |
| `selectable` | 能否切换 | true |
| `disabled` | 禁用 | false |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中变化 |

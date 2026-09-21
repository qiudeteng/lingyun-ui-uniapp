# lingyun-data-checkbox

用数组数据生成多选。`v-model` 是选中值的数组。

## 示例

```vue
<lingyun-data-checkbox
  v-model="picked"
  :localdata="[
    { text: '到店', value: 'store' },
    { text: '外卖', value: 'takeout' },
  ]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 选中值数组 | — |
| `localdata` | 选项 | [] |
| `map` | 字段映射 `{ text, value, disabled }` | text/value/disabled |
| `min / max` | 最少 / 最多选几个 | — |
| `disabled` | 整组禁用 | false |
| `emptyText` | 没有数据时的文案 | 暂无数据 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选择变化 |

# lingyun-data-radio

用数组数据生成单选。

## 示例

```vue
<lingyun-data-radio
  v-model="pay"
  :localdata="[
    { text: '微信', value: 'wx' },
    { text: '现金', value: 'cash' },
  ]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前值 | — |
| `localdata` | 选项 | [] |
| `map` | 字段映射 | text/value/disabled |
| `disabled` | 整组禁用 | false |
| `emptyText` | 空数据文案 | 暂无数据 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

# lingyun-data-picker

多级数据选择，例如省市区。`v-model` 是每一级 value 组成的数组。

## 示例

```vue
<lingyun-data-picker
  v-model="region"
  title="地区"
  :localdata="[
    { text: '上海', value: 'sh', children: [{ text: '静安', value: 'ja' }] },
  ]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 各级 value 数组 | — |
| `localdata` | 树：`{ text, value, children }` | [] |
| `title` | 弹层标题 | '' |
| `placeholder` | 未选文案 | 请选择 |
| `separator` | 展示时的分隔符 |  /  |
| `disabled` | 禁用 | false |
| `variant` | 在 form-item 内为行内 | auto |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 确认 |

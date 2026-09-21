# lingyun-radio

必须放在 `lingyun-radio-group` 里。一组数据驱动的选项用 `lingyun-data-radio`。

## 示例

```vue
<lingyun-radio-group v-model="city">
  <lingyun-radio value="sh" label="上海" />
  <lingyun-radio value="bj" label="北京" />
</lingyun-radio-group>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `value` | 这一项的值 | 必填 |
| `label` | 文案 | '' |
| `disabled` | 禁用 | false |
| `color` | 选中色 | '' |

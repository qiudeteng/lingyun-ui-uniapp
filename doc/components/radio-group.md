# lingyun-radio-group

包住若干 `lingyun-radio`，`v-model` 是当前选中的 `value`。

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
| `modelValue` | 当前值 | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

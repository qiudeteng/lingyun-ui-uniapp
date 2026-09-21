# lingyun-page-control

轮播下方的圆点。`v-model` 为当前下标。

## 示例

```vue
<lingyun-page-control v-model="index" :count="5" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue / current` | 当前下标 | — |
| `count` | 总页数 | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

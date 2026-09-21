# lingyun-refresh

下拉刷新容器。列表放在默认插槽里。`refreshing` 为 true 时保持刷新态，结束后设回 false。

## 示例

```vue
<lingyun-refresh :refreshing="loading" @refresh="load">
  <lingyun-list>
    <lingyun-list-item title="第一行" />
  </lingyun-list>
</lingyun-refresh>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `refreshing` | 是否正在刷新 | false |
| `enabled` | 允许下拉 | true |
| `threshold` | 触发距离 | 45 |
| `height` | 容器高度 | 100% |
## 事件

| 事件 | 说明 |
| --- | --- |
| `refresh` | 下拉超过阈值 |

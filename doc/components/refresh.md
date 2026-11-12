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

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/refresh.vue -->

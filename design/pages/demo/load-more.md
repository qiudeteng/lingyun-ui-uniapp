# Load More Demo

对应页面：`src/pages/demo/load-more.vue`

## 区块

1. `hero`：标题 Load More + 说明「长列表底部加载 · 更多 / 加载中 / 没有更多 / 失败重试」。
2. `手动加载`：12 条记录分 3 页，点击底部加载更多，演示 loading → more / nomore；支持重置。
3. `自动加载`：开启 `auto`，滚动到底部附近自动加载；演示 `source: 'auto'`。
4. `状态预览`：四种状态的静态示例。
5. `最近操作`：显示手动 / 自动加载来源。

## 规范

- 组件规格见 [`LOAD_MORE.md`](../../LOAD_MORE.md)。
- 页面用 setTimeout 模拟请求，不承载组件内部逻辑。

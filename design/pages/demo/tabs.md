# Tabs Demo

对应页面：`src/pages/demo/tabs.vue`

## 区块

1. `hero`：标题 Tabs + 说明「顶部可滚动 Tab View · underline / pill / sticky」。
2. `Underline`：默认形态；含 icon、badge、禁用项；内容由 scoped slot 渲染。
3. `Pill · 可滚动`：12 个分类，初始第 6 个；演示溢出滚动与自动滚入。
4. `居中对齐`：3 个 Tab，`align="center"`。
5. `Sticky`：`page-scroll=false` 的内层 scroll-view；长内容放在 Tabs 默认插槽内，`stickyTop=60` 避开顶栏。

## 规范

- 组件规格见 [`TABS.md`](../../TABS.md)。
- sticky 的内容必须放在组件默认插槽内，否则包含块过短，无法持续吸顶。
- `stickyTop` 传固定顶栏高度；组件未传时会读取 `lingyun-app-page` 的顶部 inset。

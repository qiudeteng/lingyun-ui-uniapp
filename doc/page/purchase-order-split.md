# 订货单列表与详情 Demo

演示页面：`/pages/demo/purchase-order-split`  
设计说明：`design/pages/demo/purchase-order-split.md`

订货单的「列表 + 详情」左右分栏示例：宽屏左侧订货单列表、右侧订货单详情，窄屏点卡片进入独立的详情页。它不是新标准页，而是 [`lingyun-split-layout`](../components/split-layout.md) + 两个标准页拆出的内容面板的组合示例。

## 结构

- **布局**：`lingyun-split-layout`，`split-at=900`、`list-width=375`。≥900 左右分栏，窄屏只渲染左栏；点卡片在窄屏 `navigateTo` 到 `/pages/demo/purchase-order-detail`，宽屏切换右侧选中项。
- **左栏**：浮动 `lingyun-toolbars`（标题「订货单」+ 条数 + 状态 Tabs）+ [`lingyun-purchase-order-list-panel`](./purchase-order-list.md)：
  - `full` 模式：卡片通宽、直角，铺满左栏；
  - `selected-key`：宽屏时高亮当前详情单，窄屏不显示选中；
  - `top-space`：由布局实测的头部高度，内容从浮动 toolbar 下方穿过。
- **右栏**：浮动 `lingyun-toolbars`（「订货单详情」+ 当前单号）+ [`lingyun-purchase-order-detail-panel`](./purchase-order-detail.md)，内层滚动、底部悬浮操作栏。
- **联动**：状态筛选直接传给列表面板；筛选后当前单不在结果里时自动选中第一条；停止筛选 / 无结果时右侧空态。
- **滚动**：两栏各自内层滚动，`scroll` 事件驱动各自工具栏玻璃进度；整页不滚动。

## 使用

直接打开 `pages/demo/purchase-order-split` 体验（建议宽屏查看分栏，预览框可切 717 宽屏 / 1280 超宽屏 / 390 手机）。

自己做类似页面时：

1. 页面壳用 `lingyun-split-layout`，左右内容放进 `list` / `detail` 插槽（插槽内容在小程序里需按约定绝对定位铺满内容容器，见 [组件文档](../components/split-layout.md)）；
2. 列表 / 详情优先复用现成的面板组件（`top-space` 直接接插槽作用域的 `topSpace`），不要在分栏里嵌套两个 `lingyun-app-page`；
3. 分栏页面模板、暗黑分层、选中态与常见坑见 [分栏页面 guide](../guide/split-pages.md)。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/purchase-order-split.vue -->
<!-- demo-source: src/pages/demo/purchaseOrderDemo.ts -->
<!-- demo-source: src/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-list/lingyun-purchase-order-list-panel.vue -->
<!-- demo-source: src/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/lingyun-purchase-order-detail-panel.vue -->

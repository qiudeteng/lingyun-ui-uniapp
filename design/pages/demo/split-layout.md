# design/pages/demo/split-layout

对应源码：`src/pages/demo/split-layout.vue`

`lingyun-split-layout` 的组件 Demo：整页就是分栏布局本身，用来在「组件 → 页面与导航 → 分栏布局」里直接体验宽屏左右分栏。

- 页面根节点就是 `lingyun-split-layout`（`split-at=900`、`list-width=375`），不再套 `lingyun-app-page`
- 左栏：浮动 `lingyun-toolbars`（标题「条目」，无副标题）+ `lingyun-list plain` 示例条目；宽屏选中行用页面底色高亮，行尾状态按进行中 / 待处理 / 已完成使用蓝 / 橙 / 绿三色，并带可点击箭头
- 左栏 toolbar 演示搜索与筛选：`searchable` 放大镜进入搜索态（输入框替换标题、取消清空关键词），右侧「筛选」按钮打开内置 `#trailing-menu` 浮层（全部 / 进行中 / 待处理 / 已完成，选完自动收起）；搜索与筛选同时生效，无结果展示 `lingyun-empty` + 重置
- 右栏：浮动 `lingyun-toolbars`（标题「条目详情」，无副标题）+ 组件说明与当前条目信息；两栏各自内层滚动、`scroll` 驱动 toolbar 玻璃；宽屏下选中项被搜索 / 筛选过滤掉时自动换第一条
- 窄屏只渲染左栏（点条目弹提示），与真实业务页一致：详情在窄屏走独立页面
- 插槽内容用组件自带的全局结构工具类（`lingyun-split-layout-pane` / `-scroll` / `-fill`）铺满内容容器（小程序 slot 内容不参与 flex 拉伸），顶部留白用作用域插槽的 `topSpace`

规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[组件文档](../../../doc/components/split-layout.md)、[分栏页面 guide](../../../doc/guide/split-pages.md)。

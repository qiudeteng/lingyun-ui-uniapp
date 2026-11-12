# design/pages/demo/pages/purchase-order-split/purchase-order-split

对应源码：`src/pages/demo/pages/purchase-order-split/purchase-order-split.vue`

订货单的「列表 + 详情」分栏 demo，也是订货单列表 / 详情两个标准页的唯一演示入口，交互与列表与详情 demo 一致：宽屏左右分栏，窄屏点卡片进入独立详情页 `purchase-order-split-item`。

- 分栏门槛 **900**：窗口 ≥ 900 左右分栏，窄屏只显示列表。布局由 [`lingyun-split-layout`](../../../../../doc/components/split-layout.md) 提供（≥ `split-at` 分栏、左栏固定 `list-width`、头部量高经 `topSpace` 交给面板），本页只写两栏内容
- 宽屏布局：左栏固定 **375px**（手机逻辑宽度），右侧详情占满剩余宽度，中间一条 0.5px 缝隙（透明、透出页面底色）；左栏列底色 grouped-secondary（浅色白 / 暗黑 `#1c1c1e`）、右侧详情 grouped-primary，由色差自然形成边线，对齐列表与详情 demo；左右各自内层滚动
- 复用标准页内容：标准页已拆成「页面壳 + 面板」——`lingyun-purchase-order-list-panel` / `lingyun-purchase-order-detail-panel`。本页左栏放列表面板、右栏放详情面板，页面壳（toolbar / 导航 / 顶部安全区）由本页自己提供，不改标准页行为；左栏列表面板使用 `full` 模式——内容区不留左右留白，卡片收成列表行：通宽、直角、行间 1px 全宽分割线，面板不再铺页面底色（列底色由 `lingyun-split-layout` 提供），铺满 375 左栏
- 选中态：列表面板传 `selectedKey`（当前详情单的 `order.key || order.number`），选中行用页面底色（`--lingyun-bg-grouped-primary`：浅色 `#f2f2f7` / 暗黑 `#000`）填充，与未选中行（沿用列底色）形成对比，和列表与详情 demo 的选中语义一致；点击卡片切换右侧详情时选中态跟随
- 统一浮动 toolbar：左栏 `lingyun-split-toolbar`（「订货单」+ 搜索按钮 + 状态分段控件：全部 / 待审核 / 进行中 / 已完成 / 已取消）、右栏（「订货单详情」），两栏均无副标题；展示样式与顶部补偿由该组件统一处理，页面不写 `lingyun-toolbars` / `title-style`
- 搜索：按订货单号与商品名（含子订货单商品）匹配，搜索由页面过滤后传给列表面板，状态筛选仍交给面板；无结果显示「没有匹配的订货单」，右栏显示「选择左侧订货单查看详情」
- 顶部占位：用 `createSelectorQuery` 量出两个浮动头部的高度，作为面板的 `topSpace`；内容从下方穿过，滚动时头部呈现玻璃
- 联动：面板的内层滚动抛 `scroll`，驱动各自 toolbar 的玻璃进度；宽屏点列表卡片切换右侧详情（切换筛选后当前单不在结果里时自动选中第一条）；状态筛选传给列表面板
- 窄屏（手机与 690–899 中屏）：页面就是一个订货单列表页（导航未停靠时 toolbar 带返回），点卡片 `uni.navigateTo` 打开 `/pages/demo/pages/purchase-order-split/purchase-order-split-item`（不进菜单，始终带返回）
- 小程序宽屏宿主：与「列表与详情」一致，本页登记为宽屏宿主视图（`pageViews.ts` + `app-page-view-host` 静态分支），点击左侧导航原地切换，不再整页打开
- 小程序高度链：面板组件宿主节点用 `lingyun-split-layout-pane`（组件提供的全局结构工具类：绝对铺满内容容器 + 纵向 flex），否则自定义组件宿主默认高度随内容、只靠面板内部的 `height: 100%` 撑不出确定高度，会随内容变高把整页顶出滚动、toolbar 跟着页面滚；面板内部 body / `scroll-view` 同样用 `flex: 1 + height: 0`
- 详情面板的事件（操作 / 商品 / 子订货单 / 复制 / 付款超时）与标准详情页一致；付款超时把当前订货单状态更新为已取消

## 列表卡片（`lingyun-purchase-order-list-panel`）

- 业务状态归类：待审核 = `pendingReview`；进行中 = 待付款 / 待发货 / 待收货 / 退款中；已完成、已取消一一对应。卡片右侧显示业务状态（待审核紫 / 进行中蓝 / 已完成绿 / 已取消灰）+ 右箭头，不显示支付、发货等细状态；切换筛选回到列表顶部。
- 标题行：左侧订货单号（14/20、600、单行截断）+ 右侧业务状态。
- 商品区：横向展示前 3 个商品缩略图（52×52、圆角 10、间距 8），更多时末尾 `+N` 胶囊；右侧「共 N 件」与总金额（17/24、700）。商品无图时用名称首字兜底。
- 底栏：上方 0.5px 分割线；左侧 `lingyun-date-text` 下单时间（今天 / 昨天 + HH:mm），多批配送追加「分 N 个包裹」；右侧小号状态操作按钮，阻止冒泡，不会打开详情。
- 示例数据：`LY202611090010` 待审核、36 个商品（列表 3 张图 +「+33」）；`LY202611090001` 多批配送「分 2 个包裹」，详情只列子订货单摘要，点子订货单进子订货单详情。
- 加载 / 空态：首次加载转圈；无结果空态；`hasMore` 时滚到底部抛 `load-more`。

规范：[`UI_SPEC.md`](../../../../UI_SPEC.md)、[`TOOLBARS.md`](../../../../TOOLBARS.md)、[`TABS.md`](../../../../TABS.md)、[`DATE_TEXT.md`](../../../../DATE_TEXT.md)、[`LISTS.md`](../../../../LISTS.md)、详情页 [`purchase-order-split-item.md`](./purchase-order-split-item.md)。

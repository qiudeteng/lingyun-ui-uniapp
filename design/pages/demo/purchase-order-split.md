# design/pages/demo/purchase-order-split

对应源码：`src/pages/demo/purchase-order-split.vue`

订货单的「列表 + 详情」分栏 demo，做法与列表与详情 demo 一致：单独做一个组合页，不改动现有的订货单列表 / 详情两个标准页。

- 分栏门槛 **900**：窗口 ≥ 900 左右分栏，窄屏只显示列表
- 宽屏布局：左栏固定 **375px**（手机逻辑宽度），右侧详情占满剩余宽度，中间一条 0.5px 缝隙（透明、透出页面底色，白色卡片与详情之间的色差自然形成边线，对齐列表与详情 demo）；左右各自内层滚动
- 复用标准页内容：标准页已拆成「页面壳 + 面板」——`lingyun-purchase-order-list-panel` / `lingyun-purchase-order-detail-panel`。本页左栏放列表面板、右栏放详情面板，页面壳（toolbar / 导航 / 顶部安全区）由本页自己提供，不改标准页行为；左栏列表面板使用 `full` 模式——内容区不留左右留白、卡片通宽直角（上下间距保留，对齐 `lingyun-section` 的 full），铺满 375 左栏
- 选中态：列表面板传 `selectedKey`（当前详情单的 `order.key || order.number`），选中卡片用页面底色（`--lingyun-bg-grouped-primary`：浅色 `#f2f2f7` / 暗黑 `#000`）填充，与未选中的 `grouped-secondary` 卡片形成对比，和列表与详情 demo 的选中语义一致；点击卡片切换右侧详情时选中态跟随
- 页面自带 toolbar：外层 `lingyun-app-page` 关闭自己的 toolbar；左右各一个非 fixed 的 `lingyun-toolbars` 浮在栏顶——左「订货单 / N 条结果」+ 状态 Tabs（全部 / 待审核 / 进行中 / 已完成 / 已取消），右「订货单详情 / 当前单号」
- 顶部占位：用 `createSelectorQuery` 量出两个浮动头部的高度，作为面板的 `topSpace`；内容从下方穿过，滚动时头部呈现玻璃
- 联动：面板的内层滚动抛 `scroll`，驱动各自 toolbar 的玻璃进度；宽屏点列表卡片切换右侧详情（切换筛选后当前单不在结果里时自动选中第一条）；状态筛选传给列表面板
- 窄屏：页面就是一个订货单列表页（自己的 toolbar 带返回），点卡片 `uni.navigateTo` 打开现有的 `/pages/demo/purchase-order-detail` 标准详情页
- 小程序宽屏宿主：本页是固定高度 + 双栏内层滚动页，注册在 `pageViews.ts` 的整页打开名单里，不进入宿主嵌入
- 小程序高度链：面板组件的宿主节点（页内 `<lingyun-purchase-order-list-panel class="po-panel">`）必须显式 `flex: 1 + height: 0`——自定义组件宿主默认高度随内容，只靠面板内部的 `height: 100%` 撑不出确定高度，会随内容变高把整页顶出滚动、toolbar 跟着页面滚；面板内部 body / `scroll-view` 同样用 `flex: 1 + height: 0`
- 详情面板的事件（操作 / 商品 / 子订货单 / 复制 / 付款超时）与标准详情页一致；付款超时把当前订货单状态更新为已取消

规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[`TOOLBARS.md`](../../TOOLBARS.md)、[`purchase-order-list.md`](./purchase-order-list.md)、[`purchase-order-detail.md`](./purchase-order-detail.md)。

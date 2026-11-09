# design/pages/demo/purchase-order-list

对应源码：`src/pages/demo/purchase-order-list.vue`（标准页：`src/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-list`）

订货单列表标准页演示，数据来自 `src/pages/demo/purchaseOrderDemo.ts`；与订货单详情共用同一批订货单数据，点卡片进入 `pages/demo/purchase-order-detail`。

- 页面壳：`lingyun-app-page`，标题「订货单列表」，开启返回；`body-scroll=false` / `page-scroll=false`，状态筛选通过 `segments` + `segmentControl="tabs"` 渲染在工具栏下方（Tabs 行 44 贴底、页面额外 8 间距、透明背景），订货单列表从工具栏下方穿过；内层滚动上报页面壳，顶栏从透明渐显 Liquid Glass。返回钮默认返回上一页（`autoBack=true`）。
- 状态筛选：工具栏数据驱动顶部 Tabs（underline，44px、15/22、底部 2px 系统蓝指示条），只有**全部 / 待审核 / 进行中 / 已完成 / 已取消** 5 项；切换后在本地按业务状态过滤并回到列表顶部。
- 业务状态归类：待审核 = `pendingReview`；进行中 = 待付款 / 待发货 / 待收货 / 退款中；已完成、已取消一一对应。卡片右侧显示业务状态（待审核紫 / 进行中蓝 / 已完成绿 / 已取消灰），不显示支付、发货等细状态。
- 订货单卡片标题行：左侧订货单号（14/20、600、单行截断）+ 右侧业务状态；不显示时间、状态提示。
- 商品区：横向展示前 3 个商品缩略图（52×52、圆角 10、间距 8），商品更多时在末尾显示 `+N` 胶囊，不纵向铺开全部商品；右侧显示「共 N 件」与总金额（17/24、700）。商品无图时用名称首字兜底。
- 底栏：上方 0.5px 分割线；左侧用 `lingyun-date-text` 显示下单时间（今天 / 昨天 + HH:mm，caption1 / tertiary），多批配送追加「分 N 个包裹」；右侧是状态操作按钮（小号），操作按钮阻止冒泡，不会打开详情。
- 大数据量示例：`LY202611090010` 为待审核订货单，包含 36 个商品，列表只展示 3 张图 + 「+33」，详情页展示全部 36 个商品。
- 多批配送示例：`LY202611090001` 为「进行中」，底栏显示「分 2 个包裹」，点卡片进入主订货单详情；主订货单页只列子订货单摘要，点子订货单再看子订货单详情（不同发货仓库）。
- 其它示例覆盖进行中（待付款 / 待发货 / 退款中）、已完成、已取消；默认操作与订货单详情一致。
- 加载 / 空态：首次加载转圈；筛选无结果显示空态；`hasMore` 时滚到底部抛 `load-more`，底部显示加载更多 / 没有更多。
- 宽屏内容最大 720px 居中；卡片圆角 20px，页面 Grouped Primary，卡片 Grouped Secondary；支持浅色 / 暗黑。
- 规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[`TABS.md`](../../TABS.md)、[`DATE_TEXT.md`](../../DATE_TEXT.md)、[`LISTS.md`](../../LISTS.md)；组件手册 `doc/page/purchase-order-list.md`。

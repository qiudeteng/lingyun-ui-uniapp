# design/pages/demo/list-detail-item

对应源码：`src/pages/demo/list-detail-item.vue`

列表 + 详情 demo 的独立详情页：单栏（手机 / iPad 竖屏）从 `/pages/demo/list-detail` 点行进入，走正常页面栈与返回。

- 路由参数：`id`（工单号），`onLoad` 时从 `listDetailDemo.ts` 取对应工单
- 页面壳：`lingyun-app-page title="工单详情" :show-back="true"`——强制显示返回；iPad 竖屏等「导航停靠」的宽屏档也不会因为 auto 规则隐藏返回
- 内容：与宽屏右侧完全一致的 [`ticket-detail`](../../components/ticket-detail/ticket-detail.md)
- 空态：参数缺失或工单不存在时 `lingyun-empty` + 「返回列表」；无上一页时 `redirectTo` 回主列表
- 宽屏直接访问该路由时仍按独立页渲染，不进入分栏

# 记录列表 Demo

演示页面：`/pages/demo/records`  
设计说明：`design/pages/demo/records.md`

完整的「列表 + 筛选 + 搜索 + 时间选择」联动示例，不是 `lingyun-ui-page` 标准页组件；它组合 `lingyun-app-page`、`lingyun-menu`、`lingyun-date-switcher`、`lingyun-list`、`lingyun-empty` 等基础组件实现。

## 结构

- 顶部工具栏：`searchable` 搜索客户 / 商品 / 单号 / 支付方式 / 备注；`segments` 切换全部 / 收入 / 支出；`trailing-buttons` 打开筛选菜单。
- 筛选菜单：全宽 `lingyun-menu`，按筛选按钮锚点定位；内部使用 `lingyun-segmented-control`、`lingyun-switch`，底部重置 / 应用。
- 底部日期条：`lingyun-date-switcher` 支持天 / 周 / 月 / 年 / 日期段，`limit="past"`。
- 记录列表：按日期分组，组头今天 / 昨天 / 月日周几，组尾显示当日收入、支出；行内显示收支图标、金额与状态。
- 搜索态：显示搜索历史，隐藏底部日期条给键盘让位；关键字为空时展示历史。
- 筛选摘要：日期、类型、状态、金额、排序、关键词胶囊；关键词可单独清除，也可整体重置。
- 分页：首屏 12 条，加载更多每次 12 条；筛选条件变化回到第一页。
- 空态：`lingyun-empty` + 「重置搜索与筛选」。

## 使用

直接打开 `pages/demo/records` 体验；页面请求、筛选条件和分页由业务路由页自行管理。组件用法见 [列表](../components/list.md)、[筛选菜单](../components/menu.md)、[日期切换器](../components/date-switcher.md)、[搜索栏](../components/search-bar.md)。

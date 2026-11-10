# 纯列表 Demo

演示页面：`/pages/demo/plain-list`  
设计说明：`design/pages/demo/plain-list.md`

整页就是一张列表：顶部搜索 + 筛选，底部日期切换条，列表全宽平铺（HIG Plain），不使用 `lingyun-section` 分组卡片。它不是 `lingyun-ui-page` 标准页组件，而是 `lingyun-app-page` + `lingyun-list plain` + `lingyun-menu` + `lingyun-date-switcher` 的组合示例。

## 结构

- 顶部工具栏：`searchable` 搜索客户 / 商品 / 单号 / 备注，输入即过滤；`trailing-buttons` 打开筛选菜单。
- 筛选菜单：全宽 `lingyun-menu`，按筛选按钮锚点定位；类型 / 状态 / 排序三组分段控件，底部重置 / 应用。
- 底部日期条：`lingyun-date-switcher` 支持天 / 周 / 月 / 年 / 日期段，`limit="past"`；进入搜索态隐藏，避免与键盘争空间。
- 列表：`lingyun-list plain` 全宽平铺，行直接铺在页面 Primary 背景上；左侧为 `thumb-size="lg"` 的 42×42 大号缩略图（picsum 商品图），无分组头、无摘要卡；右侧显示金额，状态（待结算 / 已退款）在金额下方。
- 联动：关键词、筛选与时间范围同时生效；无结果时展示 `lingyun-empty` 并可一键重置。

## 使用

直接打开 `pages/demo/plain-list` 体验。整页列表场景给 `lingyun-list` 加 `plain`，页面底色用 Primary Background；其余行内容按 [列表组件](../components/list.md) 的 `lingyun-list-item` 用法组合。

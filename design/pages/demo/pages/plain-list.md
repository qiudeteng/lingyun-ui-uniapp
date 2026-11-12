# design/pages/demo/pages/plain-list

对应源码：`src/pages/demo/pages/plain-list.vue`

整页就是一张列表的纯列表示例：顶部搜索 + 筛选，底部日期切换条，列表全宽平铺、不使用分组卡片。

- 页面底色：Primary Background（浅白 / 深黑），不铺 Grouped Primary，也不加渐变、摘要卡、胶囊等修饰
- 列表：`lingyun-list plain`，卡片底色透明、圆角 0、无左右页边；行仍用 `lingyun-list-item` 的 52 / 68 行高、16 内距与 hairline；左侧为 `thumbSize="lg"` 的 **42×42 大号缩略图**（picsum 商品图，分割线随图缩进到 74），右侧为金额，待结算 / 已退款在金额下方用 11px 状态文字（橙 / 红）
- 顶部：`lingyun-app-page` 打开 `searchable`，右上 `trailing-buttons` 提供筛选按钮；搜索为实时过滤，输入即筛
- 筛选菜单：全宽 `lingyun-menu`，锚到筛选按钮；类型 / 状态 / 排序三组 `lingyun-segmented-control`，底部重置 / 应用
- 底部：`lingyun-date-switcher` 日期切换条，默认「月」，支持天 / 周 / 月 / 年 / 日期段，`limit="past"`；搜索态隐藏给键盘让位
- 联动：关键词、筛选、时间范围三者同时生效；无匹配结果展示 `lingyun-empty`，可一键重置
- 相关规范：[`LISTS.md`](../../../LISTS.md) §2.1 Plain、[`DATE_SWITCHERS.md`](../../../DATE_SWITCHERS.md)、[`MENUS.md`](../../../MENUS.md)、[`SEARCHBARS.md`](../../../SEARCHBARS.md)

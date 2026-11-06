# design/pages/demo/toolbar-comprehensive

对应源码：`src/pages/demo/toolbar-comprehensive.vue`

综合演示顶部筛选、搜索、分段控制与底部日期切换同时存在。

- `trailing-buttons` 提供筛选按钮，点击用 `anchor` 打开全宽 `lingyun-menu`，菜单内是自定义筛选表单
- `searchable` 提供独立搜索按钮；只有输入框从右往左滑入，关闭反向，搜索/关闭按钮位置固定
- 搜索模式显示独立搜索视图：搜索历史 + 搜索结果列表，点击历史直接过滤
- `segments` 在 toolbar 下方显示分段控制，切换状态 / 结果
- 底部 `lingyun-date-switcher` 提供天 / 周 / 月 / 年 / 自定义日期段，展示当前区间
- 搜索、分段、筛选、日期同时作用于结果列表
- 相关规范：[`TOOLBARS.md`](../../../TOOLBARS.md)、[`MENUS.md`](../../../MENUS.md)、[`SEGMENTED_CONTROLS.md`](../../../SEGMENTED_CONTROLS.md)、[`DATE_SWITCHERS.md`](../../../DATE_SWITCHERS.md)

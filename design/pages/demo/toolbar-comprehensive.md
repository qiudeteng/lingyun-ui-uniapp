# design/pages/demo/toolbar-comprehensive

对应源码：`src/pages/demo/toolbar-comprehensive.vue`

综合演示顶部筛选、搜索和分段控制同时存在。

- `trailing-buttons` 提供筛选按钮，点击用 `anchor` 打开全宽 `lingyun-menu`，菜单内是自定义筛选表单
- `searchable` 提供独立搜索按钮；搜索展开时从右往左滑入，关闭反向
- `segments` 在 toolbar 下方显示分段控制，切换状态 / 结果
- 搜索、分段、筛选同时作用于结果列表
- 相关规范：[`TOOLBARS.md`](../../../TOOLBARS.md)、[`MENUS.md`](../../../MENUS.md)、[`SEGMENTED_CONTROLS.md`](../../../SEGMENTED_CONTROLS.md)

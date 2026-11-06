# design/pages/demo/filter-menu

对应源码：`src/pages/demo/filter-menu.vue`

演示 app-page 数据驱动按钮组 + 全宽 `lingyun-menu` + 默认插槽自定义筛选表单。

- 右侧按钮由 `trailing-buttons` 二维数组传入：第一组「更多」，第二组「筛选」；主题钮自动加入第一组
- 点击按钮发 `trailing-action`，参数含 `groupIndex` / `buttonIndex` / `anchor`；页面在事件里打开菜单或其他操作
- 筛选菜单用 `anchor` 锚到按钮上，`full-width`：手机铺满可用宽度（左右各 12px 安全边距），PC / PAD 上限 400px
- 菜单打开期间通过 `trailing-buttons-hidden` 隐藏按钮组，`closed` 后恢复，避免按钮从菜单边缘露出
- 菜单内容为默认插槽自定义表单：状态、时间范围、排序、只看我的、重置 / 应用；菜单只负责弹出与定位
- 选择后点「应用」收起菜单，并把条件同步到页面摘要与结果列表；「重置」只重置表单
- 相关规范：[`TOOLBARS.md`](../../../TOOLBARS.md)、[`MENUS.md`](../../../MENUS.md)

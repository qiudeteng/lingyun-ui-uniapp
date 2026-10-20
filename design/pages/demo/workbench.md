# design/pages/demo/workbench

对应源码：`src/pages/demo/workbench.vue`

固定二级菜单工作台。一级 Tab 配置了 `children` 后，底部 Tab / Duo Tab / 左侧导航点击父项都会进入这里：

- 页面从全局 `tabs` 配置里按 `?tab=<key>` 或当前工作台 key 找到父 Tab；
- 用 `lingyun-grid` 展示二级入口，点击子项进入对应页面；
- 父 Tab 在底部 Tab 与左侧护栏中保持选中；
- 页面壳继续使用 `lingyun-app-page`，不显示返回按钮。

须符合：

- [`design/TABBARS.md`](../../TABBARS.md)
- [`design/SIDEBARS.md`](../../SIDEBARS.md)
- [`design/GRID.md`](../../GRID.md)
- [`design/UI_SPEC.md`](../../UI_SPEC.md)

PC 宽屏的左侧二级菜单在护栏项上 hover 时用 `lingyun-menu` 浮层展示，不进入本页；本页主要承接窄屏、Duo 和刷新/直达。

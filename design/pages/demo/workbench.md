# design/pages/demo/workbench

对应源码：`src/pages/demo/workbench.vue`

固定二级菜单工作台。一级 Tab 配置了 `children` 后，底部 Tab / Duo Tab / 左侧导航点击父项都会进入这里：

- 页面从全局 `tabs` 配置里按 `?tab=<key>` 或当前工作台 key 找到父 Tab；
- 用 `lingyun-grid` 展示二级入口，点击子项用 `uni.navigateTo` 压栈，顶部返回可回到工作台；
- 直接深链落到子页、页面栈只有一层时，返回父 Tab 的工作台而不是首页；
- 工作台是 Tab 落地页，保留底部 Tab（手机 / Duo）；进入子页后壳的底部 Tab 隐藏，子页用返回回到工作台；
- 已经在工作台内切换一级 Tab 时只更新工作台 key、内容和 H5 地址栏，不重建页面；只有从其他页面进入工作台才走一次路由；
- 页面壳继续使用 `lingyun-app-page`，不显示返回按钮。

须符合：

- [`design/TABBARS.md`](../../TABBARS.md)
- [`design/SIDEBARS.md`](../../SIDEBARS.md)
- [`design/GRID.md`](../../GRID.md)
- [`design/UI_SPEC.md`](../../UI_SPEC.md)

宽屏左侧（Web / 小程序一致）的二级菜单在点击父项时用 `lingyun-menu` 浮层展示，不进入本页；本页主要承接窄屏、Duo 和刷新/直达。

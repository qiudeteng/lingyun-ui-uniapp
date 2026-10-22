# design/pages/guide/start

对应源码：`src/pages/guide/start.vue`

「接入」一级 Tab 的指南页，与文档站 `doc/guide/start.md` 对应：

- 安装顺序：先 `app.use(createPinia())`，再 `app.use(lingyunUi)`；
- 页面壳 `lingyun-app-page` 负责顶栏、滚动玻璃、宽屏导航与反馈宿主；
- 宽屏（≥ 690）使用同一份 `tabs` 切换左侧导航，带 `children` 的一级 Tab 在窄屏进入工作台；
- 页尾继续入口指向页面壳、屏幕和反馈演示。

须符合：

- [`design/UI_SPEC.md`](../../UI_SPEC.md)
- [`design/TEXTS.md`](../../TEXTS.md)
- [`design/LISTS.md`](../../LISTS.md)
- [`design/TOOLBARS.md`](../../TOOLBARS.md)

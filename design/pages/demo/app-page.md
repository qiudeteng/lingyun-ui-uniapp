# design/pages/demo/app-page

对应源码：`src/pages/demo/app-page.vue`

展示数据驱动页面壳：同一份 `tabs` 配置在窄屏渲染底部玻璃 Tab、宽屏渲染左侧停靠导航，并自动处理底部安全留白。1.0.31 起增加「设备模拟」：默认 / 内屏 / 内屏半折 / 外屏竖 / 外屏横 / 内屏横。内屏竖屏使用 84 高 Duo Toolbar + 95 高底部 Duo Tab；外屏与内屏横屏使用右侧 84 全高栏；半折在屏幕中心显示 40 横向折痕安全带。须符合：

- [`design/TABBARS.md`](../../TABBARS.md)
- [`design/SIDEBARS.md`](../../SIDEBARS.md)
- [`design/TOOLBARS.md`](../../TOOLBARS.md)
- [`design/UI_SPEC.md`](../../UI_SPEC.md)

页面本身只做配置演示，不新增视觉样式；Tab 与侧栏外观以组件实现为准。

# design/pages/demo/responsive

对应源码：`src/pages/demo/responsive.vue`

窄屏 / 平板 / 电脑的分组展示演示，用 `lingyun-mobile` 与 `lingyun-pc` 按 690px 断点切换内容。

- 页面壳：`lingyun-app-page`，标题「Mobile / PC」。
- 上半区：`lingyun-mobile` 显示手机说明；窗口 ≥690 时隐藏。
- 下半区：`lingyun-pc` 显示平板 / 电脑说明；窗口 <690 时隐藏。
- 内容用 `lingyun-section` 分组，说明当前断点的布局差异。
- 规范：`design/UI_SPEC.md`、`design/SIDEBARS.md`、`design/TABBARS.md`；组件手册 `doc/components/mobile.md`、`doc/components/pc.md`。

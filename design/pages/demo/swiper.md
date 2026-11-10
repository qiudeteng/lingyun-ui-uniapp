# design/pages/demo/swiper

对应源码：`src/pages/demo/swiper.vue`

图片轮播 `lingyun-swiper` 演示。

- 页面壳：`lingyun-app-page`，标题「Swiper」；内容为 Grouped Primary 背景 + 顶部渐变装饰。
- 基础轮播：4 张 4:3 图片，自动播放 3.2s、循环、内置圆点、16px 圆角；下方显示当前序号和最近一次切换 / 点击动作。
- 缩略图指示器：第二个轮播不显示内置圆点，底部 4 个 64px 高缩略图；点击缩略图写回 `current`，轮播切换同步高亮。
- 交互：`change` / `click` 事件回写说明文字；图片用 picsum seed，微信需配置 downloadFile 域名。
- 规范：`design/UI_SPEC.md`、`design/IMAGES.md`；组件手册 `doc/components/swiper.md`。

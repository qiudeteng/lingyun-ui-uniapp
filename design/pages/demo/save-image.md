# design/pages/demo/save-image

对应源码：`src/pages/demo/save-image.vue`

`lingyun-save-image` 的组件 Demo：演示按 ref 截取元素、整页保存、二维码组件 ref 导出。

- 保存指定元素：取货单卡片（`ref="cardRef"`）→ `:target="cardRef"`；一个按钮下载 PNG，另一个 `icon` 触发且 `:download="false"` 只生成 data URL
- 保存整个页面：不传 `target`，H5 截取当前页面（含整页高度与主题背景）
- 小程序：传 `lingyun-qrcode` 的 ref（组件自带 `toTempFilePath()`），导出后保存到相册
- 尺寸 / 禁用、最近一次保存结果回显
- 卡片内含图标字体与内部分割线，用来验证截图对字形、主题变量、背景色的还原

规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[组件文档](../../../doc/components/save-image.md)。

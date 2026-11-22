# design/pages/demo/copy

对应源码：`src/pages/demo/copy.vue`

`lingyun-copy` 的组件 Demo：演示默认纯图标、图标+文案、玻璃按钮、自定义图标、动态内容、颜色与禁用、自定义插槽。

- 默认纯图标：`mode="icon"`，内置复制 SVG，`variant` 默认 `plain`，颜色默认主题色 `primary`
- 纯文本：`mode="text"`，不显示图标；不传 `label` 时显示「复制」
- 图标 + 文案：传 `label`，图标在前
- 玻璃按钮：`variant="glass"` 胶囊形态
- 自定义图标：`icon` 覆盖内置 SVG，走 `lingyun-icon`
- 绑定动态内容：`lingyun-text-field` 输入 → `:text` → 点击复制；空内容抛 `error`
- 颜色 / 禁用：`color` 语义色、`disabled`
- 自定义触发器：默认插槽接管展示内容，点击仍走组件复制
- 底部「最近一次复制」回显 `copy` 事件参数

规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[组件文档](../../../doc/components/copy.md)。

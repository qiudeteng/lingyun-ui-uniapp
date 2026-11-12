# design/pages/demo/copy

对应源码：`src/pages/demo/copy.vue`

`lingyun-copy` 的组件 Demo：演示复制触发器的文字 / 图标形态、动态内容、尺寸与禁用、自定义插槽。

- 文字触发：`label` 玻璃胶囊；`variant="plain"` 纯文字（链接色）
- 图标触发：`icon="link"` 仅图标；图标 + 文案同时出现时图标在前
- 绑定动态内容：`lingyun-text-field` 输入 → `:text` → 点击复制；空内容抛 `error`
- 尺寸 / 形态：small / medium / large、plain、disabled
- 自定义触发器：默认插槽接管展示内容，点击仍走组件复制
- 底部「最近一次复制」回显 `copy` 事件参数

规范：[`UI_SPEC.md`](../../UI_SPEC.md)、[组件文档](../../../doc/components/copy.md)。

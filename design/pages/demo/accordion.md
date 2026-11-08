# Accordion Demo

对应页面：`src/pages/demo/accordion.vue`

## 区块

1. `hero`：标题 Accordion + 说明「折叠分组 · 单开 / 多开 · 自定义内容」。
2. `FAQ · 单开`：`v-model=string`，展示当前展开项。
3. `设置 · 多开 + 自定义内容`：`multiple` + `string[]`，`#content` 插槽内放文本与标签；「全部展开 / 收起」调用 `openAll` / `closeAll`。
4. `含禁用项`：禁用项不可展开。
5. `最近操作`：change 事件。

## 规范

- 组件规格见 [`ACCORDION.md`](../../ACCORDION.md)。
- 页面只负责示例数据与事件。

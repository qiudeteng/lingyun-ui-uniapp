# Token Field Demo

对应页面：`src/pages/demo/token-field.vue`

## 区块

1. `hero`：标题 Token Field + 说明「多选标签输入 · 建议 / 去重 / 上限」。
2. `标签输入`：建议项、最多 5 个、显示数量；添加 / 移除 / 校验事件。
3. `仅允许建议项`：`allowCustom=false`，自定义输入会被拒绝。
4. `只读 / 禁用`：预填标签。
5. `最近操作`：添加 / 移除 / invalid 原因。

## 规范

- 组件规格见 [`TOKEN_FIELDS.md`](../../TOKEN_FIELDS.md)。
- 页面只负责示例状态与事件。

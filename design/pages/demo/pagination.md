# Pagination Demo

对应页面：`src/pages/demo/pagination.vue`

## 区块

1. `hero`：标题 Pagination + 说明「分页 · 页码窗口 / 总数 / 简单模式 / 小尺寸」。
2. `基础分页`：126 条、每页 10 条，展示页码窗口与总数。
3. `小尺寸 · 简单模式`：`size="small"` + `simple`。
4. `隐藏单页`：`hideOnSinglePage`，数据不足一页时整块隐藏。
5. `无总数`：`showTotal=false`，只显示页码。
6. `最近操作`：显示切换后的页码与总页数。

## 规范

- 组件规格见 [`PAGINATION.md`](../../PAGINATION.md)。
- 页面只提供示例状态，分页数据由业务自行切片。

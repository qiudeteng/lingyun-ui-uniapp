# Tables Demo

> ↔ `src/pages/demo/tables.vue`  
> 组件：`lingyun-table`

## 覆盖用例

- 自适应高度：本地排序、筛选、多选、斑马纹、竖线、分页、自定义单元格
- 服务端分页：`remote` + `loading`，筛选和翻页走 `query-change`
- 固定高度 `height=240`：表体上下滚动，表头不动；左列、右列固定。点固定列时整行一起有按压反馈
- 空数据
- 放在 `lingyun-section` 里，标题在卡片外

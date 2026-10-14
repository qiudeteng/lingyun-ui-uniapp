# Tables Demo

> ↔ `src/pages/demo/tables.vue`  
> 组件：`lingyun-table`

## 覆盖用例

- 页面高度：不传 `height`，表格跟页面一样高，表体在内部滚动
- 外层高度：外层 320px，表格跟上外层；`remote` + `loading`，筛选和翻页走 `query-change`
- 固定高度 `height=240`：表体上下滚动，表头不动；左列、右列固定。点固定列时整行一起有按压反馈
- 序号列：`type: 'index'`，翻页后序号接着上一页。标题栏带刷新、选列、导出和自定义按钮
- 空数据
- 放在 `lingyun-section` 里，标题在卡片外

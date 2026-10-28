# Sections Demo

> ↔ `src/pages/demo/sections.vue`  
> 组件：`lingyun-section`

## 覆盖用例

- 内嵌 `lingyun-list`：header 以下与列表卡片一致，body 无内边距
- 内嵌 `lingyun-table`：与列表同一规则，标题在外，表格贴边
- 内嵌 `lingyun-grid`：宫格透明底，圆角交给 section；body 仍无内边距，外壳 spacing 保留
- 默认不透明分组底
- `color=glass` 玻璃
- Title / Subtitle / Hint / Extra + click
- `#icon` 插槽：直接放 `lingyun-icon`，以及用 flex 色块包一层
- 布局工具类：`lingyun-section-row` / `stack` / `matrix`
- Cover 插槽
- Actions 插槽
- `padding` / `bodyPadding` / `headerPadding` / `isFull` / `isLast`

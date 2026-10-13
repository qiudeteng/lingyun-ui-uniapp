# Tables 规范（lingyun-table）

表格是内容层，和 `lingyun-list` 共用分组卡片：Grouped Secondary、圆角 26。不要做成玻璃行，也不要画 `#DEDEDE` 灰网格。

## 结构

- 表头 44px，次级字色、字重 600。固定高度时表头在纵向滚动区外面，不跟着表体走。
- 行高 52px，默认单行省略。
- `fixed: 'left' | 'right'` 的列留在左右两侧，中间列横向滚动。左右滚动和上下滚动互相同步。
- `height` 为空：表体高度等于行数。传入像素：表体固定在这个高度里上下滚动。
- `border` 只加分割线色的竖线。`stripe` 用 Fill Quaternary 隔行。按压时白行用 Fill Tertiary，灰行用 Fill，避免和条纹同色。固定列和中间列是分开画的，按下时按行主键一起高亮。
- 默认在组件内筛选、排序、分页。`remote` 时不处理数据，查询变化抛 `query-change`（页码、每页条数、筛选、排序）。外部异步拉完后回填 `data`、`total`，请求中把 `loading` 设为真。
- 放进 `lingyun-section` 时，标题留在卡片外，表格贴边，和内嵌列表同一规则。

## 能力

| 能力 | 做法 |
|------|------|
| 排序 | 列 `sortable`。点击表头在升序、降序、不排序之间切换。`remote` 时交给 `query-change` |
| 筛选 | 列 `filters`。点 ▾ 在表头下展开选项，可多选。`remote` 时交给 `query-change` |
| 分页 | `page-size` 大于 0 时出现。`v-model:page`。`remote` 时只改页码并抛 `query-change` |
| 服务端 | `remote`。筛选、排序、翻页合成一次 `query-change`。用 `loading` 表示请求中，用 `total` 表示总条数 |
| 多选 | `selection`。勾选列固定在左。`v-model:selected-keys`。表头勾选当前页 |
| 自定义单元格 | 插槽 `#cell`，参数 `row` / `column` / `value` |

```vue
<lingyun-table
  :columns="columns"
  :data="rows"
  row-key="id"
  stripe
  border
  selection
  :page-size="5"
  :height="240"
  v-model:page="page"
  v-model:selected-keys="selected"
/>

<lingyun-table
  remote
  :loading="loading"
  :columns="columns"
  :data="pageRows"
  :total="total"
  :page-size="5"
  v-model:page="page"
  @query-change="load"
/>
```

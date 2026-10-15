# Tables 规范（lingyun-table）

表格是内容层，和 `lingyun-list` 共用分组卡片：Grouped Secondary、圆角 26。不要做成玻璃行，也不要画 `#DEDEDE` 灰网格。

## 结构

- 表头 44px，次级字色、字重 600。固定高度时表头在纵向滚动区外面，不跟着表体走。
- 行高 52px，默认单行省略。`size="compact"` 收到表头 32、行高 36，标题栏、分页、勾选和字号一起收，虚拟滚动按同一套高度切行。
- `fixed: 'left' | 'right'` 的列留在左右两侧，中间列横向滚动。左右滚动和上下滚动互相同步。
- `height` 为空：表格占满高度。外层有自己的高度时用外层高度，否则用页面高度。表体在这块区域里上下滚动，不按行数把外层撑高。传入像素时，只固定表体为这个高度。
- 行和中间列只渲染可视区域，上下左右各多留一段，避免滚动时露白。左右固定列保持常驻。窗口按块（10 行 / 240px）移动，块内滚动不重渲染。
- 小程序上表头、表尾、左右固定列、中间列和滚动条由 WXS（`table-sync.wxs`）在渲染层同一帧移动，不用原生 `scroll-view`，逻辑层只在跨块或停下时更新窗口。不要再给这些节点绑定逻辑层的 `transform`。
- 大数据：数据用普通数组或 `shallowRef`，避免每行每个字段都被包成响应式；这时改数据要整体替换数组。`#cell` 插槽在小程序上每格都会带上整行，字段多时尽量用默认文本或 `formatter`。
- 行与行之间用分割线色的横线。最后一行贴着分页或卡片底边时不画，避免叠成两道；内容比表体矮时仍画，把数据和空白分开。
- `border` 只加分割线色的竖线。`stripe` 用 Fill Quaternary 隔行。按压时白行用 Fill Tertiary，灰行用 Fill，避免和条纹同色。固定列和中间列是分开画的，按下时按行主键一起高亮。
- 默认在组件内筛选、排序、分页。`remote` 时不处理数据，查询变化抛 `query-change`（页码、每页条数、筛选、排序）。外部异步拉完后回填 `data`、`total`，请求中把 `loading` 设为真。
- 放进 `lingyun-section` 时，标题留在卡片外，表格贴边：section 去掉 body 内边距与外壳 `spacing`，和内嵌 `lingyun-list` 同一规则。玻璃 / 实色 section 里表格不再叠第二张底。

## 能力

| 能力 | 做法 |
|------|------|
| 排序 | 列 `sortable`。点击表头在升序、降序、不排序之间切换。`remote` 时交给 `query-change` |
| 筛选 | 列 `filters`。点 ▾ 在表头下展开选项，可多选。`remote` 时交给 `query-change` |
| 分页 | `page-size` 大于 0 时出现。`v-model:page`。`remote` 时只改页码并抛 `query-change` |
| 服务端 | `remote`。筛选、排序、翻页合成一次 `query-change`。用 `loading` 表示请求中，用 `total` 表示总条数 |
| 序号 | 列 `type: 'index'`。按当前页顺序从 1 编号，翻页接着数，不读行数据。不传宽度时常规 64、紧凑 48 |
| 标题栏 | `title`、`icon`。右侧 `show-refresh`、`column-picker`、`export-excel`，自定义按钮用 `#tools` |
| 多选 | `selection`。勾选列固定在左。`v-model:selected-keys`。表头勾选当前页 |
| 自定义单元格 | 插槽 `#cell`，参数 `row` / `column` / `value` |
| 紧凑 | `size="compact"`。默认 `regular` |
| 表尾 | `show-footer`。`footer-data` 每项是一行，字段名对应列 `key`，没写的列留空。表尾固定在表体下方，横向跟着表体走 |
| 分组 | `group-fields: { field, sum }`。按 `field` 列归组并插入分组行；`sum` 列自动加总。分组行有底色、字重加粗，无圆点。合计走列 `formatter` / `#cell`，与数据行一致 |

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

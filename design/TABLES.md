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
| 排序 | 列 `sortable`。点击表头在升序、降序、不排序之间切换。表头用 `lingyun-icon` 的 `up` / `down` 叠成一组，当前方向主色。`remote` 时交给 `query-change` |
| 筛选 | 列 `filterType` 或 `filters`。点表头右侧 `tune` 图标打开筛选面板（`lingyun-table-filter`；窄屏底部 Sheet，宽屏 Popover），只能筛选不能排序的列点表头也会打开。见下文「筛选」 |
| 分页 | `page-size` 大于 0 时出现。`v-model:page`。`remote` 时只改页码并抛 `query-change` |
| 服务端 | `remote`。筛选、排序、翻页合成一次 `query-change`。用 `loading` 表示请求中，用 `total` 表示总条数 |
| 加载 | `loading` 为真时，标题栏以下全部（筛选标签、表头、表体含左右固定列、表尾、分页）盖一层表格底色 60% 的蒙层，中间显示菊花，不能点也不能滚。标题栏的标题不变；右侧刷新、选列、导出变灰不可点，刷新图标自动旋转；`#tools` 插槽整体变淡并禁止点击 |
| 列宽 | 列 `width` 写了就用写的。有列没写时，表格宽度减去已写宽度的列、序号列和勾选列，剩下的平分给没写的列，每列不小于 `minWidth`（默认 120），放不下就横向滚动；都没写就平分整个宽度。`fit` 且全部写了宽度时，总宽不足按宽度比例放大占满，超出则保持原宽度横向滚动。固定列也参与分配，序号列不参与。窗口变化时重新测量并重算 |
| 序号 | 列 `type: 'index'`。按当前页顺序从 1 编号，翻页接着数，不读行数据。不传宽度时常规 64、紧凑 48 |
| 标题栏 | `title`、`icon`。右侧 `show-refresh`、`column-picker`、`export-excel`，自定义按钮用 `#tools` |
| 多选 | `selection`。勾选列固定在左。`v-model:selected-keys`。表头勾选当前页 |
| 自定义单元格 | 插槽 `#cell`，参数 `row` / `column` / `value` |
| 紧凑 | `size="compact"`。默认 `regular` |
| 表尾 | `show-footer`。`footer-data` 每项是一行，字段名对应列 `key`，没写的列留空。表尾固定在表体下方，横向跟着表体走 |
| 分组 | `group-fields: { field, sum }`。按 `field` 列归组并插入分组行；`sum` 列自动加总。分组行底色与分割线同色（Separator）、字重加粗；点分组行收起 / 展开该组明细，分组列前的箭头展开朝下、收起朝右，并抛 `group-toggle`（`{ group, collapsed }`）。收起的明细仍计入序号和本页全选，导出 Excel 不受影响，无圆点。合计走列 `formatter` / `#cell`，与数据行一致 |

## 筛选

| `filterType` | 面板 | 条件 |
|------|------|------|
| `select` | 勾选列表。选项多于 8 个时出搜索；有「全选」（搜索时只全选搜索结果）；本地模式显示每项条数 | 勾选的值，不勾选等于不筛选 |
| `number` | 比较方式 + 数字输入框 | 等于、不等于、大于、大于等于、小于、小于等于、介于 |
| `text` | 比较方式 + 文本输入框 | 包含、不包含、等于、开头是（不区分大小写） |
| `date` | 比较方式 + 日期选择（`lingyun-picker` 的 `date` / `daterange`） | 当天、不早于、不晚于、介于 |

- 配了 `filters` 就是 `select`，选项用 `filters`。`filterable: true` 或 `filterType: 'select'` 但没配 `filters` 时，从数据去重生成选项，`formatter` 用作选项文字，空值显示「（空白）」。`remote` 只看得到当前页，选项也只来自当前页，最好配 `filters`。
- 本地模式下，选项条数按「其它列筛选后」的行数计算，和 Excel 一致。
- 窗口宽小于 690（与 Sheet 的 iPad 卡片同一分界）时，面板是底部 Sheet：改动点右上 ✓ 才生效，左上 × 或点遮罩放弃。
- 窗口宽 690 及以上时，面板是 Popover（`lingyun-popover`，宽 320，圆角 14），箭头指向所点的筛选图标（或标签），并贴在面板靠图标的一端：图标在左半屏用 `arrowAlign="leading"` 向右展开，在右半屏用 `trailing` 向左展开：顶部列名，内容超高时内部滚动，底部「取消 / 确定」；点遮罩放弃。行高收紧到 44。下方放不下时翻到图标上方。
- 可排序的列面板顶部还有「不排序 / 升序 / 降序」。
- 介于时上下限填反会自动对调。数字去掉千分位逗号再比较；日期统一成 `YYYY-MM-DD`，时间戳按本地时区取日。
- 生效的筛选在标题栏下、表头上显示为一条可横滑的标签栏：点标签重新打开面板，点 × 删除这一列的条件，两个以上时末尾有「清除全部」。没有筛选时不占高度。
- 筛选一变就回到第 1 页、表体回顶。
- `query-change` / `refresh` 的载荷：`filters` 为多选（列 key → 值数组），`conditions` 为其它三种（列 key → `{ op, value, value2? }`，`op` 见 `LingyunTableFilterOp`）。`filter-change` 另带当前列的 `key`、`values`、`condition`。服务端可直接复用 `table-filter.ts` 里的 `makeFilterTest` 做同样的判断。

```ts
const columns: LingyunTableColumn[] = [
  { key: 'name', title: '菜品', sortable: true, filterType: 'text' },
  { key: 'shop', title: '门店', filterable: true },
  { key: 'count', title: '数量', align: 'right', sortable: true, filterType: 'number' },
  { key: 'date', title: '日期', sortable: true, filterType: 'date' },
]
```

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

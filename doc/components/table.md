# lingyun-table

分组卡片里的多列表格。行高、圆角和底色与列表卡片一致。

## 示例

```vue
<lingyun-table
  :columns="columns"
  :data="rows"
  row-key="id"
  stripe
  border
  selection
  :page-size="5"
  v-model:page="page"
  v-model:selected-keys="selected"
>
  <template #cell="{ column, value }">
    <lingyun-tag v-if="column.key === 'status'" :text="String(value)" />
    <text v-else>{{ value }}</text>
  </template>
</lingyun-table>
```

`height` 不传时，表格占满外层高度；外层没有高度时占满页面。表体在这块区域里滚动。传入像素时只固定表体。行和中间列只画可视区域。

放进 `lingyun-section` 时与内嵌列表同一规则：标题留在卡片外，表格贴边，section 的 body 与外壳 spacing 自动让出。

```vue
<lingyun-section title="订单" hint="标题在外，表格贴边">
  <lingyun-table :columns="columns" :data="rows" row-key="id" stripe border :height="240" />
</lingyun-section>
```

## 列

| 字段 | 说明 |
| --- | --- |
| `key` / `title` | 字段名、表头 |
| `width` | 列宽，像素。默认 120 |
| `align` | `left` / `center` / `right` |
| `fixed` | `left` / `right` / `true`（左侧） |
| `type` | `index` 时显示序号，按当前页从 1 编号，翻页接着数 |
| `sortable` | 可排序 |
| `filters` | `{ text, value }[]`，表头出现筛选 |
| `formatter` | `(value, row) => string`，没有自定义插槽时使用 |

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `columns` / `data` | 列和行 | [] |
| `row-key` | 行主键 | id |
| `height` | 表体高度。不传时占满外层或页面，传入则只固定表体 | '' |
| `stripe` / `border` | 隔行底、单元格竖线 | false |
| `selection` | 多选，勾选列固定在左 | false |
| `page-size` | 大于 0 才分页 | 0 |
| `page` | 当前页，从 1 开始 | 1 |
| `remote` | 筛选、排序、分页交给外部。查询变化抛 `query-change` | false |
| `loading` | 请求中。没数据时占住表体，有数据时盖在当前页上 | false |
| `total` | `remote` 时的总条数 | 0 |
| `empty-text` | 空态标题 | 暂无数据 |
| `title` / `icon` | 标题栏文案、图标名。有标题、图标、工具或 `#tools` 才显示 | '' |
| `show-refresh` | 标题栏刷新，抛 `refresh` | false |
| `column-picker` | 标题栏选择列，隐藏后不再参与布局 | false |
| `export-excel` | 标题栏导出当前结果为 Excel | false |

`query-change` 参数：`{ page, pageSize, filters, sortKey, sortOrder }`。服务端请求只接这一次，不要再同时用 `filter-change` 和 `page-change` 各请求一遍。

事件：`row-click`、`sort-change`、`filter-change`、`page-change`、`query-change`、`selection-change`、`refresh`、`export`。

自定义工具按钮放在 `#tools`，排在内置按钮后面。

# lingyun-grid

宫格。用来放一排快捷入口。列数、是否方形、点击回传的 `index` 和 `uni-grid` 一样。外观是分组卡片，不再画灰表格线。

子项是 `lingyun-grid-item`。不写插槽时，传 `icon` 和 `text` 就会画出图标和标题。

## 示例

```vue
<lingyun-grid :column="4" @change="onChange">
  <lingyun-grid-item
    v-for="(item, index) in items"
    :key="item.text"
    :index="index"
    :icon="item.icon"
    :text="item.text"
    :info="item.info"
  />
</lingyun-grid>
```

## 属性

| 属性 | 组件 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `column` | grid | 每行个数 | 3 |
| `square` | grid | 格子为正方形 | true |
| `show-border` | grid | 显示分割线 | false |
| `border-color` | grid | 分割线颜色 | 系统分割线 |
| `highlight` | grid | 按下变浅 | true |
| `index` | item | 点中后回传的下标 | 0 |
| `icon` | item | 图标名 | — |
| `text` | item | 标题 | — |
| `color` | item | 图标颜色 | 系统蓝 |
| `info` | item | 角标数字；`true` 为圆点 | — |

## 事件

| 事件 | 说明 |
| --- | --- |
| `change` | `{ detail: { index } }`，`index` 来自被点的子项 |

# lingyun-grid

宫格。用来放一排快捷入口。列数、是否方形、点击回传的 `index` 和 `uni-grid` 一样。外观是分组卡片，不再画灰表格线。

子项是 `lingyun-grid-item`。不写插槽时，传 `icon` 和 `text` 就会画出图标和标题。也可以传 `items`，由宫格自己生成格子。

放进 `lingyun-section` 时，宫格不再自带圆角，圆角由外面的卡片负责。单独使用仍是 26px。

## 示例

插槽：

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

数据生成。`icon-size` 是整组图标的边长，单位像素；某一项再写 `iconSize` 只改这一格。

```vue
<lingyun-grid
  background="transparent"
  :column="4"
  :icon-size="40"
  :items="[
    { icon: 'image', text: '相册', link: '/pages/demo/images' },
    { iconSrc: 'https://example.com/a.jpg', text: '图片', iconSize: 32, radius: 'lg', link: '/pages/demo/icons' },
  ]"
  @change="onChange"
/>
```

## 属性

| 属性 | 组件 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `column` | grid | 每行个数 | 3 |
| `square` | grid | 格子为正方形 | true |
| `show-border` | grid | 显示分割线 | false |
| `border-color` | grid | 分割线颜色 | 系统分割线 |
| `highlight` | grid | 按下变浅 | true |
| `background` | grid | 卡片背景。空为分组底，`transparent` 为透明 | '' |
| `icon-size` | grid / item | 图标边长，任意像素。格子或数据项再传则覆盖宫格 | 28 |
| `shape` | grid / item | 图片图标的显示形式，同 `lingyun-image`：`square` / `rounded` / `circle` | rounded |
| `radius` | grid / item | 图片图标的圆角，同 `lingyun-image`：`none` / `sm` / `md` / `lg` / `xl` / `2xl` 或像素。不传则不传给图片，用图片默认 `2xl`（26） | — |
| `items` | grid | 数组里有格子时按数据生成，不再用默认插槽。不传或空数组仍用插槽 | — |
| `index` | item | 点中后回传的下标 | 0 |
| `icon` | item | 图标名。写成图片地址时用 `lingyun-image` | — |
| `icon-src` | item | 网络或本地图片，优先于 `icon` | — |
| `text` | item | 标题 | — |
| `color` | item | 图标颜色 | 系统蓝 |
| `info` | item | 角标数字；`true` 为圆点 | — |
| `link` | item | 页面路径。有值时点击后跳转 | '' |

`items` 每一项可以带 `icon`、`iconSrc`、`iconSize`、`shape`、`radius`、`text`、`color`、`info`、`link`，含义与上表相同。字形图标不使用 `shape` 和 `radius`。

## 事件

| 事件 | 说明 |
| --- | --- |
| `change` | `{ detail: { index } }`，`index` 来自被点的子项。设置了 `link` 时，回传之后再打开该页。未注册路径进 404 |

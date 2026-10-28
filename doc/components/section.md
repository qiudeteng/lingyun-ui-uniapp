# lingyun-section

演示页和设置页用的分组卡片。标题在卡片外，内容放默认插槽。

## 示例

```vue
<lingyun-section title="样式" hint="说明">
  <view class="lingyun-section-row">
    <lingyun-button variant="glass" text="玻璃" />
  </view>
</lingyun-section>
```

标题左侧除了 `icon` 图片地址，还可以用 `#icon` 插槽放 `lingyun-icon` 或其他节点：

```vue
<lingyun-section title="筛选条件" icon-size="large" hint="#icon 插槽">
  <template #icon>
    <lingyun-icon type="bars" :size="20" color="primary" />
  </template>
</lingyun-section>
```

`#icon` 插槽占用 `icon-size` 指定的方形盒（默认 24，`small` 16，`large` 32）；自定义色块时由色块自己负责 flex 居中。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `icon` | 标题左侧的图片地址 | '' |
| `iconSize` | 图标大小：不传 24，`small` 16，`large` 32 | '' |
| `subtitle / hint / extra` | 副标题、提示、右侧额外文字 | '' |
| `isLast` | 最后一组，收掉底部间距 | false |
| `color` | 空为不透明分组底。`glass` 为玻璃。`green` / `blue` / `orange` / `yellow` / `red` 为系统色实底，标题为白色 | '' |
| `radius` | 卡片圆角，同图片：`none` / `sm` / `md` / `lg` / `xl` / `2xl`，或像素。不传为 `2xl`（26） | '' |
| `header-line` | 标题和内容之间显示横线。没有标题时不画 | false |
| `padding / margin` | 内边距、外边距 | 见默认 |

默认插槽里放 `lingyun-list` 或 `lingyun-table` 时，header 仍是分组标题，下面整块交给列表 / 表格卡片：body 自动没有内边距，外壳 `spacing` 也让出，圆角、底色与单独使用时一致。

放 `lingyun-grid` 时 body 同样没有内边距；宫格用透明底，圆角由 section 负责（`--lingyun-grid-radius: 0`），外壳 `spacing` 保留。

插槽里的 `lingyun-section-row` 是全局样式类，写在插槽节点上才能在小程序里生效。

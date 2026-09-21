# lingyun-text

按字阶显示文字。颜色走主题，不要在业务里写死一套灰。

## 示例

```vue
<lingyun-text type="title">标题</lingyun-text>
<lingyun-text type="subtitle">副标题</lingyun-text>
<lingyun-text type="body" color="primary">强调正文</lingyun-text>
<lingyun-text :lines="2">最多两行，超出省略</lingyun-text>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 文字。也可以用默认插槽 | '' |
| `type` | 字阶：`title` / `subtitle` / `body` / `caption` / `hint` | body |
| `color` | 语义色或 CSS 颜色 | '' |
| `align` | `left` / `center` / `right` | left |
| `lines` | 大于 0 时超出省略 | 0 |
| `emphasized / bold` | 加粗 | false |
| `block` | 块级 | false |
| `selectable` | 允许选择复制 | false |

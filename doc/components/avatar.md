# lingyun-avatar

头像。没有图片时显示文字（通常是名字首字）。默认圆形。显示形式和圆角幅度与图片同一套。

## 示例

```vue
<lingyun-avatar src="/static/me.jpg" size="md" />
<lingyun-avatar text="齐" size="lg" />
<lingyun-avatar text="方" size="lg" shape="square" />
<lingyun-avatar text="圆角" size="lg" shape="rounded" radius="lg" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `src` | 图片地址 | '' |
| `text` | 无图时的文字 | '' |
| `size` | `sm` 28 / `md` 40 / `lg` 64，单位 px | md |
| `shape` | 显示形式：`square` 直角、`rounded` 圆角、`circle` 圆形 | circle |
| `radius` | 圆角幅度，仅 `rounded`。`none` / `sm` / `md` / `lg` / `xl` / `2xl`（26px）或数字 px | 2xl |
| `backgroundColor` | 底色 | '' |

`md` 写在 `size` 上是尺寸，写在 `radius` 上是圆角。`square` 和 `circle` 忽略 `radius`。

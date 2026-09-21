# lingyun-page-nav

宽屏左侧目录。一般不用单独放：小程序由 `lingyun-app-page` 嵌进来，H5 在 `app.use(lingyunUi)` 时挂到 `body`。

## 示例

```vue
<lingyun-page-nav :sections="sections" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `sections` | 分组目录。每组 `{ title, items: [{ title, url, note, icon }] }` | 默认目录 |

窗口宽度小于 700 时页面壳不会显示这一列。宽度 220。

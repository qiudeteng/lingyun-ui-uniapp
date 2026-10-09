# lingyun-page-nav

宽屏左侧目录。一般不用单独放：小程序由 `lingyun-app-page` 嵌进来，H5 在 `app.use(lingyunUi)` 时挂到 `body`。

顶部默认两行：名称「凌云UI」，副标题「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。名称和右侧顶栏标题对齐，副标题挂在名称下面，栏高不变。侧栏较窄，介绍超出一行会省略。

## 示例

```vue
<lingyun-page-nav :sections="sections" />
```

业务页不要直接改这一列。头像、名称、副标题写在 `lingyun-app-page` 上，见 [页面壳](./app-page.md)。后台数据在登录后写一次：

```ts
import { setLingyunPageNavProfile, setLingyunPageNavSections } from '@/router/pageNav'

setLingyunPageNavSections(sections)
setLingyunPageNavProfile({
  avatar: user.avatar,
  name: user.name,
  subtitle: user.org,
})
```

H5 侧栏只挂一次，页面上的 `sections` 到不了它。全局菜单用 `setLingyunPageNavSections`，首页列表读的是同一份。组件演示列表是 `/pages/demo/demo`，不读这份运行时菜单。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `sections` | 分组目录。每组 `{ title, items: [{ title, url, note, icon }] }`。只影响当前这次渲染；H5 常驻侧栏请用 `setLingyunPageNavSections` | 默认目录 |
| `avatar` | 顶部头像地址。有头像插槽时不用这张图 | '' |
| `name` | 顶部名称。有名称插槽时不用这段文字 | 凌云UI |
| `subtitle` | 顶部副标题。有副标题插槽时不用这段文字。传入自定义名称且不传副标题时，不显示默认介绍 | 一套对齐 Apple Liquid Glass 的 uni-app 多端组件库 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `avatar` | 顶部头像。外框 36 圆，与名称垂直居中 |
| `name` | 顶部名称。占原来「凌云UI」那一行 |
| `subtitle` | 挂在名称下面 |

页面上请用 `lingyun-app-page` 的 `nav-avatar`、`nav-name`、`nav-subtitle`，三个可以只传一部分。

窗口宽度小于 690 时页面壳不会显示这一列。宽度 220。

# Avatars 规范（强制 · lingyun-avatar）

圆形头像：图片或文字缩写。

| 属性 | 默认 | 说明 |
|------|------|------|
| `src` | `''` | 图片地址 |
| `text` | `''` | 无图时缩写（取首字母） |
| `size` | `md` | sm=28 / md=40 / lg=64（px） |
| `backgroundColor` | 淡蓝 | 底色 |

```vue
<lingyun-avatar text="Ada Lovelace" size="lg" />
<lingyun-avatar src="/static/avatar.png" />
```

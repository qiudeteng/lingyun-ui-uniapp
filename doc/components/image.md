# lingyun-image

图片。支持圆角、圆形、懒加载和失败占位。

## 示例

```vue
<lingyun-image src="/static/a.jpg" shape="rounded" size="md" mode="cover" lazy />
<lingyun-image src="/static/a.jpg" shape="circle" size="lg" />
<lingyun-image src="/static/a.jpg" width="100%" :height="180" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `src` | 地址 | — |
| `mode` | 裁切方式，同 `image` 的 mode | — |
| `size` | 预设尺寸：`sm` / `md` / `lg` | — |
| `width / height` | 自定义宽高 | — |
| `shape` | `rounded` 等 | — |
| `circle` | 圆形 | false |
| `lazy / lazyLoad` | 懒加载 | — |
| `errorSrc / errorText` | 失败时的图或文字 | — |
| `preview` | 点击预览 | — |
| `previewUrls` | 预览列表 | — |

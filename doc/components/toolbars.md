# lingyun-toolbars

顶栏。放在 `lingyun-app-page` 里时不用再写一份；单独用在自定义布局或 Sheet 里。

## 示例

```vue
<lingyun-toolbars title="标题" @back="onBack" />
<lingyun-toolbars title-style="large" title="大标题" />
<lingyun-toolbars placement="sheet" title="Sheet" @close="onClose" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `subtitle` | 副标题 | '' |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `placement` | `standard` 或 `sheet` | standard |
| `showBack` | 返回。`auto` 按场景决定 | auto |
| `showClose` | 关闭 | auto |
| `showGrabber` | 抓手 | auto |
| `showTrailing` | 右侧按钮 | true |
| `fixed` | 固定在视口顶部。页面壳里会设为 true | false |
| `safeArea` | 加上状态栏高度 | true |
| `glassProgress` | 0 到 1，玻璃从透明到铺满 | 0 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 返回 |
| `close` | 关闭 |
| `trailing` | 右侧按钮 |

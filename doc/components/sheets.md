# lingyun-sheets

从底部升起的面板。窄屏贴底，宽屏收成居中卡片。全屏档的顶缘在页面顶栏下面，避开微信胶囊。

## 示例

```vue
<lingyun-sheets v-model:show="open" title="筛选" detent="medium">
  <view>面板内容</view>
</lingyun-sheets>

<lingyun-sheets v-model:show="full" title="详情" detent="large">
  <view>接近全屏</view>
</lingyun-sheets>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `title` | 标题 | '' |
| `detent` | `medium` 半高或 `large` 接近全屏 | medium |
| `maskClosable` | 点遮罩关闭 | true |
| `showClose` | 关闭按钮 | true |
| `showTrailing` | 右侧按钮 | false |
| `safeAreaBottom` | 底部安全区 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:show` | 开关 |
| `close` | 关闭 |

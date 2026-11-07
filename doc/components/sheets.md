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

<!-- 点遮罩不关闭：仍可用关闭钮 / Grabber 下滑收起 -->
<lingyun-sheets v-model:show="picking" title="选择" :mask-closable="false">
  <view>必须先在面板内选择或取消</view>
</lingyun-sheets>

<!-- 顶栏右侧内置按钮：icon + 最多 2 个字；只传 trailing-icon 时显示为圆钮 -->
<lingyun-sheets
  v-model:show="detail"
  title="详情"
  trailing-icon="upload"
  trailing-text="分享"
  @trailing="onShare"
>
  <view>面板内容</view>
</lingyun-sheets>

<!-- 宽屏居中卡片尺寸：仅 ≥690 生效；0 用默认上限 936×770，超出视口会被夹取 -->
<lingyun-sheets v-model:show="form" title="筛选" :width="520" :height="420">
  <view>宽屏小卡片，窄屏仍按 detent</view>
</lingyun-sheets>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `title` | 标题 | '' |
| `detent` | `medium` 半高或 `large` 接近全屏 | medium |
| `maskClosable` | 点遮罩关闭；`false` 时点遮罩抖动 + 短震动 | true |
| `showClose` | 关闭按钮 | true |
| `showTrailing` | 默认分享圆钮 | false |
| `trailingIcon` | 右侧内置按钮图标（可单独用） | '' |
| `trailingText` | 右侧内置按钮文字，最多 2 字 | '' |
| `safeAreaBottom` | 底部安全区 | true |
| `width` | 宽屏居中卡片宽度（px），夹在 `[320, 视口-64]` | 0（默认上限 936） |
| `height` | 宽屏居中卡片高度（px），夹在 `[240, 视口-64]` | 0（默认上限 770） |
| `bleedTop` | 内容从面板顶部开始、顶栏（关闭 / 标题）浮在内容上；隐藏 Grabber、body 去掉顶部内边距 | false |
| `contentFill` | body 不滚动，内容自行填满 body 高度并在内部滚动（左右分栏、内部滚动详情） | false |

`bleedTop` 适合商品详情这类头图铺满的场景：内容首屏自己做全宽（如负 margin），图片会延伸到面板顶部、关闭钮浮在图片左上角。

```vue
<lingyun-sheets v-model:show="detail" detent="large" bleed-top>
  <view class="hero">
    <image :src="image" mode="aspectFill" />
  </view>
</lingyun-sheets>
```

右侧优先级：`trailingIcon` / `trailingText` 内置按钮 > `trailing` 插槽 > `showTrailing` 默认分享圆钮；内置按钮与插槽同时设置时以内置为准。内置按钮复用 `lingyun-button`（`borderedProminent` / `medium`），仅 icon 时为蓝色圆钮。

## 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 面板内容，放在 body 滚动区 |
| `footer` | 底部操作区：固定在面板底部、不参与 body 滚动；底部安全区由组件承接 |

```vue
<lingyun-sheets v-model:show="open" title="商品详情" detent="large">
  <view>内容</view>
  <template #footer>
    <view class="footer"><lingyun-button text="加入购物车" /></view>
  </template>
</lingyun-sheets>
```

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:show` | 开关 |
| `close` | 关闭 |
| `trailing` | 右侧按钮点击 |

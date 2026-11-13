# lingyun-bottom-toolbar

底部玻璃栏。定位和材质对齐 `lingyun-goods-nav` 购物车胶囊：左右 12、底边 8 加安全区、圆角 31、`lingyun-glass-surface` 加全端模糊。栏内没有按钮、没有左右分区，默认插槽里怎么排都行。

贴底时左边让开页面左侧导航（`--lingyun-page-nav-width`）。放在页面内容最后面，组件会留出同等高度，避免最后一段被挡住。

```vue
<lingyun-bottom-toolbar>
  <view class="bar">
    <text class="bar__price">¥128.00</text>
    <lingyun-button variant="bordered" size="medium" text="暂存" @click="save" />
    <lingyun-button variant="filled" size="medium" text="提交" @click="submit" />
  </view>
</lingyun-bottom-toolbar>
```

```scss
.bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 62px;
  padding: 7px 12px 7px 16px;
  box-sizing: border-box;
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `fixed` | 贴底悬浮 | true |
| `safeArea` | 底部安全区 | true |

`fixed` 为 false 时，胶囊留在文档流里，仍保留左右 12 和底边间距。

# lingyun-section

演示页和设置页用的分组卡片。标题在卡片外，内容放默认插槽。

## 示例

```vue
<lingyun-section title="样式" hint="说明">
  <view class="lingyun-section-row">
    <lingyun-button variant="glass" text="玻璃" />
  </view>
</lingyun-section>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `subtitle / hint / extra` | 副标题、提示、右侧额外文字 | '' |
| `isLast` | 最后一组，收掉底部间距 | false |
| `glass` | 卡片用玻璃底 | true |
| `padding / margin` | 内边距、外边距 | 见默认 |

插槽里的 `lingyun-section-row` 是全局样式类，写在插槽节点上才能在小程序里生效。

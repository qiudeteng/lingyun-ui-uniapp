# lingyun-popover

锚在触发器旁边的气泡。触发器放在名为 `trigger` 的插槽里，气泡内容放默认插槽。

## 示例

```vue
<lingyun-popover v-model:show="open" placement="bottom">
  <template #trigger>
    <lingyun-button text="更多" />
  </template>
  <view>说明文字</view>
</lingyun-popover>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `placement` | 相对触发器的方向，如 `bottom` | — |
| `showArrow` | 显示箭头 | — |
| `width` | 面板宽度。0 跟触发器 | 0 |
| `arrowAlign` | 箭头 `leading` / `middle` / `trailing` | — |
| `maskClosable` | 点外面关闭 | true |
| `variant` | 外观 | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:show` | 开关 |

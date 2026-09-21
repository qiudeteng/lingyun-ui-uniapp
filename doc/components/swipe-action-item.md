# lingyun-swipe-action-item

一行左右滑出的操作。按钮放在 `leftOptions` / `rightOptions`。

## 示例

```vue
<lingyun-swipe-action-item
  :right-options="[
    { text: '标记', role: 'orange' },
    { text: '删除', role: 'destructive' },
  ]"
  @click="onSwipe"
>
  <lingyun-list-item title="订单" />
</lingyun-swipe-action-item>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `leftOptions / rightOptions` | 按钮：`{ text, role }` | [] |
| `show` | `none` / `left` / `right`，程序控制展开 | none |
| `autoClose` | 点按钮后收起 | true |
| `disabled` | 禁止滑动 | false |
| `threshold` | 触发滑动的距离 | 30 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点了某个按钮，参数里带下标和内容 |

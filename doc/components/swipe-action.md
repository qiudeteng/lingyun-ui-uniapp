# lingyun-swipe-action

包住一个或多个 `lingyun-swipe-action-item`。本身没有属性。

## 示例

```vue
<lingyun-swipe-action>
  <lingyun-swipe-action-item
    :right-options="[{ text: '删除', role: 'destructive' }]"
    @click="onSwipe"
  >
    <lingyun-list-item title="收件箱" detail="12" />
  </lingyun-swipe-action-item>
</lingyun-swipe-action>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `—` | 无 | — |

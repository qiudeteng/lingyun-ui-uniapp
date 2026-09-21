# lingyun-context-menu

长按或右键位置弹出的菜单。用组件暴露的方法在事件坐标处打开，`actions` 与菜单相同。

## 示例

```vue
<lingyun-context-menu :actions="actions" @select="onSelect">
  <view>长按这里</view>
</lingyun-context-menu>
```

长按默认插槽里的内容就会在它旁边打开菜单。也可以拿到组件实例调用 `open()`。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `actions` | 菜单行 | [] |
| `maskClosable` | 点外面关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `select` | 选中一行 |

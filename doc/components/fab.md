# lingyun-fab

悬浮按钮。点主钮展开 `content` 里的菜单，再点一项会收起。

## 示例

```vue
<lingyun-fab
  :content="[
    { icon: 'compose', text: '新建' },
    { icon: 'camera', text: '拍照' },
  ]"
  horizontal="right"
  vertical="bottom"
  @trigger="onTrigger"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `content` | 菜单项：`{ icon, text, disabled }` | [] |
| `horizontal` | `left` 或 `right` | right |
| `vertical` | `top` 或 `bottom` | bottom |
| `direction` | 菜单 `vertical` 或 `horizontal` | vertical |
| `popMenu` | 有菜单可展开 | true |
| `icon` | 主钮图标 | plusempty |
| `safeArea` | 避开底部安全区 | true |
| `closeOnSelect` | 选中后收起 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `fab-click` | 点主钮 |
| `trigger` | 点菜单项 |

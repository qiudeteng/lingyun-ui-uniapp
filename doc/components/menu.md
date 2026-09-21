# lingyun-menu

下拉菜单。`actions` 描述每一行。

## 示例

```vue
<lingyun-menu
  v-model:show="open"
  :actions="[
    { text: '编辑', icon: 'compose' },
    { text: '删除', role: 'destructive' },
  ]"
  @select="onSelect"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `actions` | 行：`{ text, icon, role, disabled }` | [] |
| `placement` | 弹出方向 | — |
| `maskClosable` | 点外面关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `select` | 选中一行 |

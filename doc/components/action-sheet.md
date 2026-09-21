# lingyun-action-sheet

底部操作列表，适合编辑或删除。危险操作把 role 设为 destructive。

## 示例

```vue
<lingyun-action-sheet
  v-model:show="open"
  title="请选择"
  :actions="[
    { text: '编辑' },
    { text: '删除', role: 'destructive' },
  ]"
  @action="onAction"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `title` | 标题 | '' |
| `message` | 标题下的说明 | '' |
| `actions` | 项：`{ text, role }` | [] |
| `showCancel` | 底部取消 | true |
| `cancelText` | 取消文案 | Cancel |
| `maskClosable` | 点遮罩关闭 | true |
| `closeOnAction` | 点一项后关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点了哪一项 |

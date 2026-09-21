# lingyun-alert

居中确认框。按钮放在 `actions` 里。

## 示例

```vue
<lingyun-alert
  v-model:show="visible"
  title="删除这张订单？"
  message="删除后不能恢复。"
  :actions="[
    { text: '取消', role: 'cancel' },
    { text: '删除', primary: true },
  ]"
  @action="onAction"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `title` | 标题 | '' |
| `message` | 正文 | '' |
| `actions` | 按钮：`{ text, role, primary }` | [] |
| `layout` | `auto` 按按钮数量横排或竖排 | auto |
| `inputs` | 可选输入行 | [] |
| `maskClosable` | 点遮罩关闭 | false |
| `closeOnAction` | 点按钮后关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点了哪个按钮 |

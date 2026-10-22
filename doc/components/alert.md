# lingyun-alert

居中确认框。两种用法：用 JS 直接弹（`uni.showLingyunAlert`），或在页面里放组件。

## JS 调用

不用放组件，页面在 `lingyun-app-page` 里就行。返回 Promise，关闭时告诉你点了哪个按钮。

```ts
await uni.showLingyunAlert('保存成功')

const res = await uni.showLingyunAlert({
  title: '删除这张订单？',
  message: '删除后不能恢复。',
  showCancel: true,
  confirmText: '删除',
})
if (res.confirm) remove()

uni.hideLingyunAlert()
```

| 选项 | 说明 | 默认值 |
| --- | --- | --- |
| `title` / `message` | 标题 / 正文。直接传字符串时是正文 | '' |
| `actions` | 按钮，同组件。不传时按下面三项生成 | — |
| `confirmText` | 确定按钮文字 | 确定 |
| `cancelText` | 取消按钮文字 | 取消 |
| `showCancel` | 带取消按钮 | false |
| `inputs` | 输入框，最多 2 个 | [] |
| `layout` / `maskClosable` | 同组件 | — |

结果：`{ confirm, cancel, index, action, values }`。`confirm` 表示点了非取消的按钮；点遮罩或调 `hideLingyunAlert` 关闭时 `cancel` 为 true、`index` 为 -1；`values` 是输入框的值。新弹一个会顶掉旧的，旧的按取消结束。

## 组件示例

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
| `inputs` | 可选输入行：`{ key, type, password, value, placeholder, maxlength, multiline, autoHeight, rows }`，最多 2 个；内部使用 `lingyun-text-field`。`multiline: true` 或 `type: 'textarea'` 为多行备注模式 | [] |
| `autoFocus` | 打开后自动聚焦第一个输入框。会等入场动画结束后再聚焦，避免键盘弹起与面板缩放同时造成占位文字抖动 | true |
| `maskClosable` | 点遮罩关闭 | false |
| `closeOnAction` | 点按钮后关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点了哪个按钮 |

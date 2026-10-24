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
| `autoFocus` | 打开后自动聚焦第一个输入框。输入弹窗不做缩放入场，等输入框挂载稳定后再聚焦（约 220ms）；键盘上推走布局位移，不做补间 | true |
| `maskClosable` | 点遮罩关闭 | false |
| `closeOnAction` | 点按钮后关闭 | true |

含输入框时，键盘上推使用**布局位移**，不对原生输入层所在容器做 `transform`，也不做位移补间；打开时等输入框挂载稳定后再聚焦。关闭时若键盘还开着，会先收起键盘，等键盘落下后再播放正常退场动画。页面请保持 `lingyun-app-page` 默认页面级滚动（`pageScroll=true`），不要把 alert 放进内层 `scroll-view`，与仓库 `design/TEXTFIELDS.md` §5 的键盘避让约束一致。
## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点了哪个按钮 |

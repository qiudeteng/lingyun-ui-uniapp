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

## 动效

打开时从触发按钮中心、原位置长出一颗 48–72px 的玻璃水滴，再拉伸成面板；点击后按钮立即隐藏，面板最终覆盖按钮原来的位置。按钮偏左时菜单左上角对齐按钮，按钮偏右时菜单右上角对齐按钮，面板向空间大的一侧展开，不会水平居中在按钮下面；圆角落定 32 并轻微回弹，约 0.46s。面板内容晚约 0.1s 淡入，H5 同时从模糊清晰化。关闭时内容先淡出，面板反向收缩并淡出；菜单几乎完全消失后按钮再淡入，不做下挂小水滴（异形融合需要画布，Web / 小程序暂不实现）。对齐 iOS 27 菜单，规范见 `design/MENUS.md` §3.1。

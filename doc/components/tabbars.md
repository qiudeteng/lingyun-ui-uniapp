# lingyun-tabbars

底部标签栏。用 `v-model` 绑定当前项的 `key`。

## 示例

```vue
<lingyun-tabbars
  v-model="current"
  :items="[
    { key: 'home', text: '首页', icon: 'home' },
    { key: 'search', role: 'search' },
    { key: 'me', text: '我的', icon: 'person' },
  ]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `items` | 项：`{ key, text, icon, badge, role }`。`role: search` 为搜索钮；`badge` 支持数字 / 文本 / `{ text, color, dot, max }` | [] |
| `modelValue` | 当前 key | — |
| `variant` | 外观 | default |
| `iconMode` | `text` 直接显示 `icon` 字形；`icon` 用 `lingyun-icon` 渲染 | text |
| `fallbackFirst` | 没有匹配项时是否把第一项当作选中；页面壳自动导航传 `false` | true |
| `safeArea` | 底部安全区。开启时整条高 99，关闭时 78 | true |
| `fixed` | 固定在底部 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换项 |
| `change` | 切换项，参数为完整 item |

在 `lingyun-app-page` 内使用时，页面壳会自动为 Tab 栏留出底部空间，并随窗口宽度在 Tab 与左侧导航之间切换。窄屏 `--fill` 断点为 **689**，与页面壳的 **690** 宽屏门槛互斥。

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
| `items` | 项：`{ key, text, icon, role }`。`role: search` 为搜索钮 | [] |
| `modelValue` | 当前 key | — |
| `variant` | 外观 | default |
| `safeArea` | 底部安全区 | true |
| `fixed` | 固定在底部 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换项 |

# Page Controls 规范（强制 · lingyun-page-control）

轮播指示点；可外控 `v-model` / `current`。

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `current` | `0` | 当前页（0-based） |
| `count` | `3` | 点数 |

事件：`change`

```vue
<lingyun-page-control v-model="i" :count="4" />
```

# lingyun-icon

图标。`type` 使用内置图标名，例如 `home`、`left`、`search`。

## 示例

```vue
<lingyun-icon type="home" :size="22" />
<lingyun-icon type="left" :size="20" color="var(--lingyun-label, #000)" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `type` | 图标名 | — |
| `size` | 边长，单位 px | — |
| `color` | 颜色。建议用主题变量 | '' |
| `customPrefix` | 自定义字体前缀 | — |

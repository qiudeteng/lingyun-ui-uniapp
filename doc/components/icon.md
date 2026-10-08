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
| `customPrefix` | 自定义字体前缀。不是 `lyicon` 时仍用 class，不走下面的字符 | lyicon |

内置图标直接画出字库里的字符，放在 1em 的方盒里，并开启 `virtualHost`。圆钮用 flex 居中这个方盒。不要再用 `::before` 画内置图标，小程序上盒模型不稳，符号会对不齐。

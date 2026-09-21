# lingyun-badge

角标。可显示数字、封顶或圆点。

## 示例

```vue
<lingyun-badge text="247" />
<lingyun-badge color="green" :text="3" />
<lingyun-badge color="orange" :text="120" :max="99" />
<lingyun-badge dot />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 数字或文字 | '' |
| `color` | `red` / `green` / `orange` / `gray` 等 | red |
| `max` | 超过后显示 `max+` | 99 |
| `dot` | 只显示圆点 | false |

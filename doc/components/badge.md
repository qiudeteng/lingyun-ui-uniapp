# lingyun-badge

角标。可显示数字、封顶或圆点。

## 示例

```vue
<lingyun-badge text="247" />
<lingyun-badge color="green" :text="3" />
<lingyun-badge color="orange" :text="120" :max="99" />
<lingyun-badge dot />
<lingyun-badge size="small" text="3" />
<lingyun-badge size="small" color="green" :text="12" />
<lingyun-badge size="small" dot />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 数字或文字 | '' |
| `color` | `red` / `green` / `orange` / `gray` 等 | red |
| `max` | 超过后显示 `max+` | 99 |
| `dot` | 只显示圆点 | false |
| `size` | `small` 小号（18px 高、11px 文案、8px 圆点）/ `medium` 默认 | medium |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/badges.vue -->

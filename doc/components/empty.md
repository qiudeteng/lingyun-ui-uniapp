# lingyun-empty

没有数据时的占位。

## 示例

```vue
<lingyun-empty variant="plain" title="没有订单" description="下拉可以刷新" />
<lingyun-empty variant="symbol" icon="info" title="没有提醒" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `description / desc` | 说明 | '' |
| `variant` | `plain` / `symbol` / `circle`。空则看有没有 icon | '' |
| `icon` | 图标名 | '' |
| `fill` | 撑满父级并垂直居中 | false |
| `actionPlacement` | 操作区 `inline` 或 `bottom` | inline |

操作按钮放默认插槽。

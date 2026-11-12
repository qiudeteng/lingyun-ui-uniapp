# lingyun-tooltip

轻量说明气泡：H5 悬停 / 点击，移动端长按 / 点击；复用 `lingyun-popover`。

规范见 [`design/TOOLTIPS.md`](../../design/TOOLTIPS.md)。

## 示例

```vue
<lingyun-tooltip text="下单后 30 分钟内可联系门店修改配送时间">
  <lingyun-button variant="glass" size="medium" text="配送说明" />
</lingyun-tooltip>
```

点击触发 / 自定义内容：

```vue
<lingyun-tooltip trigger="click" placement="bottom">
  <lingyun-tag text="点击我" />
</lingyun-tooltip>

<lingyun-tooltip placement="bottom">
  <template #default>
    <lingyun-tag text="自定义内容" />
  </template>
  <template #content>
    <text>自定义说明文字</text>
  </template>
</lingyun-tooltip>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `text` | 说明文字 | `''` |
| `placement` | `top` / `bottom` / `left` / `right` | top |
| `trigger` | `hover` / `click` | hover |
| `showArrow` | 显示箭头 | true |
| `width` | 面板宽度；0 跟随触发器 | 0 |
| `zIndex` | 层级 | 1200 |
| `showDelay` | 显示延迟 ms | 120 |
| `hideDelay` | 隐藏延迟 ms | 80 |
| `disabled` | 禁用 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `show` | 显示 |
| `hide` | 隐藏 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器 |
| `content` | 自定义气泡内容 |

## 说明

- 无遮罩、不可点遮罩关闭；只做说明，不建议放交互内容。
- H5 hover 显示 / 离开隐藏；移动端点击切换、长按显示并约 2.2s 后收起。
- `trigger="click"` 各平台点击切换。
- 触发器不强制块级；Tooltip 不阻止触发器自身点击。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/tooltip.vue -->

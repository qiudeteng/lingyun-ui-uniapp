# lingyun-copy

复制触发器：默认显示内置复制 SVG 纯图标（主题色），点击把 `text` 属性的值写入剪贴板。

## 示例

默认纯图标（推荐）：

```vue
<lingyun-copy text="LY-20261112-0001" @copy="onCopy" />
```

纯文本：

```vue
<lingyun-copy text="LY-20261112-0001" mode="text" />
<lingyun-copy text="LY-20261112-0001" mode="text" label="复制订单号" />
```

图标 + 文案：

```vue
<lingyun-copy text="LY-20261112-0001" label="复制订单号" @copy="onCopy" />
```

玻璃胶囊按钮：

```vue
<lingyun-copy text="LY-20261112-0001" label="复制" variant="glass" />
```

自定义图标（覆盖内置 SVG）：

```vue
<lingyun-copy text="https://lingyun.example/order/1" icon="link" />
```

绑定动态内容：

```vue
<lingyun-text-field v-model="content" label="要复制的内容" />
<lingyun-copy :text="content" label="复制" @copy="onCopy" @error="onError" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 要复制的文本 | `''` |
| `mode` | `icon` 纯图标（默认）· `text` 纯文本（不显示图标） | icon |
| `label` | 显示文案；与图标同时出现时图标在前；`text` 模式不传则显示「复制」 | `''` |
| `icon` | 自定义 `lingyun-icon` 名；不传则用内置复制 SVG（`text` 模式忽略） | `''` |
| `color` | 语义色（`primary` / `link` / `success`…）或任意 CSS 色 | primary |
| `size` | `small` / `medium` / `large` | small |
| `variant` | `plain` 纯图标/文字 · `glass` 玻璃胶囊按钮 | plain |
| `toast` | H5 / App 复制成功后是否 toast（微信自带系统提示，不重复） | true |
| `toastText` | 成功提示文案 | 已复制 |
| `disabled` | 禁用 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `copy` | 复制成功，参数为被复制的文本 |
| `success` | 复制成功，参数为 `uni.setClipboardData` 返回 |
| `error` | 复制失败或 `text` 为空，参数 `{ message }` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义触发器内容；传了插槽就不再渲染内置图标 / `icon` / `label` |

## 说明

- 默认是纯图标（`mode="icon"` + `variant="plain"`）；纯文本用 `mode="text"`；需要胶囊外观时再设 `variant="glass"`。
- 内置图标用 SVG mask + `currentColor`，颜色跟随 `color`（默认主题色 `primary`）。
- 微信小程序的 `wx.setClipboardData` 自带「内容已复制」系统提示，组件在 `MP-WEIXIN` 下不再叠加自己的 toast；H5 / App 由 `toast` 控制。
- `text` 为空时不写剪贴板，直接抛 `error`。
- 自定义 `icon` 走 `lingyun-icon` 字库，图标名与 `/pages/demo/icons` 一致。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/copy.vue -->

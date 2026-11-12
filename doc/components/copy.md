# lingyun-copy

复制触发器：显示文字或图标，点击把 `text` 属性的值写入剪贴板。

## 示例

文字触发：

```vue
<lingyun-copy text="LY-20261112-0001" label="复制订单号" @copy="onCopy" />
```

图标触发（只有一个图标，不带文案）：

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
| `label` | 显示文案；不传且没有 `icon` 时显示「复制」 | `''` |
| `icon` | `lingyun-icon` 图标名；与 `label` 同时存在时图标在前 | `''` |
| `size` | `small` / `medium` / `large` | small |
| `variant` | `glass` 玻璃胶囊 / `plain` 纯文字 | glass |
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
| `default` | 自定义触发器内容；传了插槽就不再渲染 `icon` / `label` |

## 说明

- 微信小程序的 `wx.setClipboardData` 自带「内容已复制」系统提示，组件在 `MP-WEIXIN` 下不再叠加自己的 toast；H5 / App 由 `toast` 控制。
- `text` 为空时不写剪贴板，直接抛 `error`。
- 走 `lingyun-icon` 字库，图标名与 `/pages/demo/icons` 一致。

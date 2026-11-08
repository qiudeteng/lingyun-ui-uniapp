# lingyun-notice-bar

非模态通知条：信息 / 成功 / 警告 / 错误，支持操作与关闭。

规范见 [`design/NOTICE_BARS.md`](../../design/NOTICE_BARS.md)。

## 示例

```vue
<lingyun-notice-bar type="info" text="今日 18:00 前下单，可安排当日配送。" />

<lingyun-notice-bar
  type="warning"
  text="配送地址有变更，请确认后再提交。"
  action-text="去修改"
  closable
  @action="onAction"
  @close="onClose"
/>
```

```vue
<lingyun-notice-bar
  type="warning"
  icon="location"
  text="当前门店距离较远，预计配送时间会延长 10–20 分钟。"
  multiline
/>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `text` | 文案 | `''` |
| `type` | `info` / `success` / `warning` / `error` / `default` | info |
| `icon` | 自定义图标名 | 按类型 |
| `showIcon` | 显示状态图标 | true |
| `closable` | 显示关闭按钮 | false |
| `actionText` | 右侧操作文案 | `''` |
| `multiline` | 允许多行 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点击右侧操作 |
| `close` | 点击关闭 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `show()` | 关闭后重新显示 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义文案内容 |
| `icon` | 自定义图标 |
| `action` | 自定义右侧操作 |

## 说明

- 内容层控件，不弹遮罩、不阻塞页面滚动。
- 默认单行省略；`multiline` 自动换行。
- 操作点击不自动关闭；关闭后组件隐藏。
- 不做跑马灯 / 自动轮播。

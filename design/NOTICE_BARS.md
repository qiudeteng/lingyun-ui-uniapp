# Notice Bar 规范（强制 · lingyun-notice-bar）

> 非模态通知条：信息 / 成功 / 警告 / 错误，支持操作与关闭。
> 内容层控件，不使用 Liquid Glass，不阻塞页面。

## 1. 结构

```text
通知条
├── 状态图标（可选）
├── 文案（默认单行省略，可多行）
├── 操作文字（可选）
└── 关闭按钮（可选）
```

- 内容层标准材质 + 语义软色背景；不弹遮罩、不抢焦点。
- 用于公告、门店提示、表单提示、订单状态提醒。

## 2. 尺寸

| 项 | 规格 |
|----|------|
| 最小高度 | 40px |
| 内边距 | 10px 12px |
| 圆角 | 12px |
| 图标 | 18px |
| 文案 | 13/18，Label；错误为 System Red |
| 操作文字 | 13/18，600，System Blue |
| 关闭按钮 | 28px 圆形点击区，16px 关闭图标 |
| 元素间距 | 8px |
| 描边 | 0.5px 语义软色描边 |

## 3. 状态色

| 类型 | 背景 | 图标 / 描边 |
|------|------|-------------|
| `info` | Primary Soft | System Blue |
| `success` | Success Soft | System Green |
| `warning` | Warning Soft | System Orange |
| `error` | Error Soft | System Red |
| `default` | Fill Tertiary | Secondary |

- 默认图标：信息 / 警告用 `info`，成功用勾选，错误用关闭；可用 `icon` 覆盖。
- 文案默认单行省略；`multiline` 时自动换行。

## 4. 交互

- `actionText` / `#action` 可点，抛 `action`，不自动关闭。
- `closable` 显示关闭钮，点击隐藏并抛 `close`；关闭后可调用 `show()` 重新显示。
- 不自动轮播、不跑马灯；需要滚动公告时由业务外层实现。
- 内容层不拦截页面滚动。

## 5. 自检

- [ ] 四种类型背景 / 图标 / 文案颜色正确
- [ ] 单行省略、多行换行正常
- [ ] 操作点击抛 `action`，关闭抛 `close`
- [ ] 自定义图标 / 内容插槽正常
- [ ] 暗黑下软色背景与文字可读
- [ ] 尺寸全部 `px`，未使用 `rpx`
- [ ] H5 与 mp-weixin 编译、运行验证

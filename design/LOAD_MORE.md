# Load More 规范（强制 · lingyun-load-more）

> 长列表底部的加载更多：更多 / 加载中 / 没有更多 / 失败重试。
> 内容层控件，不铺 Liquid Glass。

## 1. 状态

| 状态 | 表现 |
|------|------|
| `more` | 文案「加载更多」+ 向下小箭头，整行可点 |
| `loading` | 小号转圈 +「加载中…」，不可点 |
| `nomore` | 两侧 0.5px 分割线 +「没有更多了」；可关闭分割线 |
| `error` | 刷新图标 + 红色「加载失败，点击重试」，整行可点 |

## 2. 尺寸

| 项 | 规格 |
|----|------|
| 最小高度 | 48px |
| 左右内边距 | 24px |
| 文案 | 13/16，Secondary；错误 System Red |
| 分割线 | 0.5px，Separator，左右各占剩余宽度 |
| 图标 | 向下箭头 14px；刷新 16px |
| 转圈 | `lingyun-activity-indicator size="small"` |
| 按下态 | 透明度 0.6 |

## 3. 交互

- `more` / `error` 点击抛 `load({ source: 'click' })`；`loading` / `nomore` 不响应。
- `auto` 时用 `IntersectionObserver` 相对视口观察自身，进入底部 80px 触发一次 `load({ source: 'auto' })`。
- 每次状态切回 `more` 会重新观察；若仍在视口内会继续自动加载，直到宿主把状态改为 `loading` / `nomore`。
- 宿主在请求开始后应把 `status` 改为 `loading`，结束改为 `more` / `nomore` / `error`。
- `disabled` 时整体不可点、不自动加载。
- 提供 `trigger()` 方法，便于 scroll-view 触底事件手动触发。

## 4. 自检

- [ ] 四种状态文案、图标、颜色正确
- [ ] 加载中 / 没有更多不可点；更多 / 失败可点
- [ ] 自动加载只在状态为 more 时触发，且不重复触发
- [ ] 没有更多分割线可关闭
- [ ] 暗黑下文字与分割线可读
- [ ] 尺寸全部 `px`，未使用 `rpx`
- [ ] H5 与 mp-weixin 编译、运行验证

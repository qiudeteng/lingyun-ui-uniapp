# Activity Indicator 规范（强制 · lingyun-activity-indicator）

> 独立转圈加载；供 Toast loading / HUD / 页面内嵌复用。  
> 内容层控件，**非**浮层面板（浮层由 Toast/HUD 负责玻璃）。

## 权威来源

1. **HIG · Progress indicators**（Activity）  
   https://developer.apple.com/design/human-interface-guidelines/progress-indicators
2. [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md)

## 1. 形态（MVP）

| 项 | 约定 |
|----|------|
| 形态 | 环形转圈（CSS 动画；小程序可用） |
| 尺寸 | `small` 20 · `medium` 28 · `large` 36 |
| 色 | 默认 System Blue（`$lingyun-primary`）；可 `color` 覆盖 |
| 行为 | `animating` 控制转/停；停时可隐藏 |

尺寸 **1pt = 1px**。禁止 `rpx`。

## 2. API

```vue
<lingyun-activity-indicator />
<lingyun-activity-indicator size="large" :animating="loading" />
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `size` | `small` \| `medium` \| `large` | `medium` | 尺寸 |
| `color` | string | — | 覆盖描边色 |
| `animating` | boolean | `true` | 是否旋转 |
| `hidesWhenStopped` | boolean | `true` | 停止时隐藏 |

## 3. 自检

- [ ] 三档尺寸；暗黑下仍可见（蓝强调色）
- [ ] `animating=false` + `hidesWhenStopped` 正确
- [ ] 微信小程序可编译运行

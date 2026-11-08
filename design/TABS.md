# Tabs 规范（强制 · lingyun-tabs）

> 顶部可滚动 Tab View：underline / pill、滑动指示器、自动滚入、吸顶。
> Tab 栏属于**控件/导航层**，内容区属于内容层。

## 权威来源

1. [HIG · Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
2. [HIG · Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)
3. [`UI_SPEC.md`](./UI_SPEC.md) · [`TABBARS.md`](./TABBARS.md) · [`SEGMENTED_CONTROLS.md`](./SEGMENTED_CONTROLS.md)

尺寸 **1pt = 1px**，禁止 `rpx`。

## 1. 两种形态

| 形态 | 用途 | 视觉 |
|------|------|------|
| `underline`（默认） | 页面内多视图导航 | 透明栏 + 底部 2px 系统蓝滑动指示条 |
| `pill` | 分类/筛选切换 | 玻璃胶囊轨道 + 白色/玻璃选中胶囊 |

- 两种形态都支持横向滚动、自动滚入、badge、icon、禁用。
- Tab 内 badge 使用 `lingyun-badge size="small"`（18px 高 / 11px 文案）。
- 不要与底部 `lingyun-tabbars` 混用：底部负责一级导航，顶部负责页面内切换。

## 2. 尺寸

### 2.1 underline

| 项 | 规格 |
|----|------|
| 栏高 | 44px |
| Tab 高 | 44px |
| Tab 左右内边距 | 12px |
| 文字 | 15/22；激活 600 / 系统蓝，未激活 400 / Secondary |
| 指示条 | 2px，左右各内缩 12px，圆角 1px，系统蓝 |
| 切换动画 | left/width 0.24s `cubic-bezier(.32,.72,0,1)` |
| 栏背景 | 透明；底部 0.5px 分割线 |

### 2.2 pill

| 项 | 规格 |
|----|------|
| 栏高 | 44px（上下 4px + 轨道 36px） |
| 轨道 | 36px，圆角 9999，Fill Tertiary 底，左右 12px |
| 轨道内边距 | 2px |
| Tab 高 | 32px，左右 16px，圆角 9999 |
| 选中胶囊 | 32px，白色/分组卡底，圆角 9999，轻投影；首尾与轨道外缘同心（保持 2px 环边），中间 Tab 左右各内缩 2px |
| 文字 | 15/22；激活系统蓝，未激活 Secondary |
| 栏背景 | 透明；吸顶时才加玻璃 |

## 3. 滚动与吸顶

- Tab 溢出时横向滚动；激活 Tab 自动居中滚动，左右两侧保留可见 Tab，方便直接切换；首尾项受内容边界限制。
- `scrollable=false` 时不横向滚动，超出部分裁切。
- `align="center"` 在内容未溢出时居中；溢出时自然从左侧滚动。
- `sticky` 使用 `position: sticky`；吸顶时栏背景切换为 `lingyun-glass-surface`。
- **内容必须放进组件默认插槽**：sticky 的包含块是 Tabs 根节点，内容在插槽内才能持续吸顶。
- `stickyTop`：吸顶距顶部偏移（px）。组件优先使用该值；未传时读取 `lingyun-app-page` 注入的顶部 inset。页面有固定顶栏时传顶栏高度，例如 `:sticky-top="60"`。
- sticky 需要实际的滚动容器；`lingyun-app-page` 使用 `page-scroll=false` 的内层 scroll-view 时，内容放在插槽即可。

## 4. API

```ts
interface LingyunTabItem {
  key: string
  text: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `v-model` | 当前 key | — |
| `items` | Tab 列表 | `[]` |
| `variant` | `underline` / `pill` | `underline` |
| `scrollable` | 横向滚动 | `true` |
| `sticky` | 吸顶 | `false` |
| `sticky-top` | 吸顶偏移 px | app-page inset / 0 |
| `align` | `start` / `center` | `start` |
| `show-indicator` | 显示指示器/选中胶囊 | `true` |
| `safe-area` | 内容底部安全区 | `false` |
| `z-index` | 吸顶层级 | `10` |

事件：`update:modelValue` · `change({ key, item, index })`

插槽：`default`（scoped：`activeKey` / `activeItem` / `activeIndex`）· `prefix` · `suffix`

方法：`select(key)` · `scrollToKey(key)` · `refresh()`

## 5. 自检清单

- [ ] underline / pill 两种形态尺寸按本页
- [ ] 激活 Tab 自动居中滚入，左右两侧保留可见 Tab；指示器与 Tab 对齐，pill 首尾胶囊与轨道外缘同心
- [ ] 禁用、badge、icon 正常
- [ ] sticky 时内容在默认插槽内，且 `stickyTop` 避开固定顶栏
- [ ] 暗黑下文字、指示条、pill 胶囊可读
- [ ] H5 与 mp-weixin 编译、模拟器验证
- [ ] 尺寸全部 `px`，未使用 `rpx`

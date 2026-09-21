# Sidebar 规范（强制 · lingyun-sidebar）

> 对齐 [Sketch Sidebar 画板](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/C28B7233-F267-4266-849D-30DBBFBDA772/canvas#Inspect) 与 [HIG · Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)。  
> 侧栏浮在内容之上，属 **Liquid Glass 导航层**，不是整页分栏壳。

## 权威来源

1. **Sketch · Sidebar（本页）**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/C28B7233-F267-4266-849D-30DBBFBDA772/canvas#Inspect
2. **HIG · Sidebars**  
   https://developer.apple.com/design/human-interface-guidelines/sidebars
3. **Liquid Glass**  
   [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) · [`UI_SPEC.md`](./UI_SPEC.md) §6.2-A.1

---

## 1. 形态（1pt = 1px）

| 项 | 约定 |
|----|------|
| 形态 | 从 leading（默认）或 trailing 滑入的悬浮列；背后内容留出约 **56** 可窥见 |
| 宽 | `min(320, 屏宽 − 8 − 56)`，且 ≥ 240 |
| 内缩 | 顶 = 状态栏 + **8**；底 = 安全区 + **8**；贴边侧 **8** |
| 圆角 | 四角 **34** |
| 材质 | `lingyun-glass-surface` + `#fff`@**0.72** / 暗黑 `#1a1a1a`@0.7 + 全端 blur |
| 遮罩 | 与 Sheet 同：`--lingyun-mask` |
| 行 | 高 **44**；左右外边距 **8**；选中圆角 **12**；Fill `rgba(120,120,128,0.16)` |
| 图标 | **22**；与标题间距 **12** |
| 标题 | **22 / 28** semibold |
| 分组头 | **13 / 18** secondary |
| 动效 | 与 Sheet 同曲线：入场 **0.42s**、退场 **0.24s**；玻璃节点不用 `opacity` 显隐 |
| 挂载 | H5 `Teleport`→`body`；mp `root-portal`；根自挂 `theme-*` |

❌ `lingyun-sidebar` 不做：跟手拖拽关闭、与 Tab Bar 互变、把本浮层当成持久分栏。

窗口 **≥ 700** 时的持久左侧导航宽 **220**，分组实底。折叠屏内屏（如 **717×781**）因此会走出左导航、右内容。H5 上这一列挂在 `body`，只创建一次，不随页面 `redirectTo` 销毁，所以换页不闪、滚动停在原地。微信小程序没有页面外的常驻节点，同一列嵌在 `lingyun-app-page` 里，滚动位置记在内存里，新页面挂上时再写回去。窄屏不出现。点选 `redirectTo`（无转场）换页，当前路由高亮。目录与首页列表共用 `src/router/pageNav.ts`。页面可传 `:show-nav="false"` 关闭小程序这一列。顶栏 `left` 使用 `--lingyun-page-nav-width`。

---

## 2. API

```vue
<lingyun-sidebar
  v-model:show="open"
  v-model:current="key"
  title="Library"
  placement="leading"
  :sections="sections"
  @select="onSelect"
/>
```

```js
const sections = [
  {
    title: 'Library',
    items: [
      { key: 'home', label: 'Home', icon: 'home' },
      { key: 'inbox', label: 'Inbox', icon: 'email', badge: '3' },
    ],
  },
]
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `show` / `modelValue` | — | 是否打开 |
| `current` | `''` | 选中项 `key` |
| `title` | `''` | 顶标题；也可用 `#header` |
| `sections` | `[]` | `{ title?, items[] }` |
| `items` | `[]` | 无分组时的扁平行 |
| `placement` | `leading` | `leading` / `trailing` |
| `maskClosable` | `true` | 点遮罩关闭 |
| `closeOnSelect` | `true` | 选中后关闭 |
| `zIndex` | `1300` | 浮层层级 |

`items[]`：`key`、`label`、`icon`（`lingyun-icon` type）、`badge`、`disabled`。

事件：`select` → `{ key, item, index }`；`close`；`update:show` / `update:modelValue` / `update:current`。

插槽：`header`、`footer`、默认插槽（自定义正文，有插槽时仍可同时渲染 `sections`）。

---

## 3. 自检

- [ ] 玻璃按 §6.2-A.1；无 `opacity` 显隐
- [ ] Teleport / root-portal；自挂 `theme-*`
- [ ] 选中为圆角填充，不是整行实心蓝
- [ ] 浅色 / 暗黑；微信小程序可编译

# Action Sheets 规范（强制 · lingyun-action-sheet）

> `lingyun-action-sheet` **必须**按苹果 HIG Action Sheets + Liquid Glass 开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Action Sheet 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Action Sheets**（iOS 27 UI Kit）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Action%2520Sheets
2. **HIG · Action sheets**  
   https://developer.apple.com/design/human-interface-guidelines/action-sheets
3. **Liquid Glass / 浮层背景**  
   [`UI_SPEC.md`](./UI_SPEC.md) §6.2-A.1 · [`SHEETS.md`](./SHEETS.md)（动效 / 遮罩参考）

---

## 1. 形态与范围（MVP）

| 项 | 约定 |
|----|------|
| 形态 | iPhone **底部弹出**；**两组**玻璃卡片：动作组 + 独立 Cancel |
| 内容 | 可选 Title / Message；若干动作行；底部 Cancel |
| 交互 | 点动作 / Cancel / 遮罩关闭；底部滑入滑出 |
| ❌ 不做 | 跟手拖拽、iPad popover 锚定、图标行、嵌套堆叠 |

实现换算：**1pt = 1px**。❌ 禁止 `rpx`。

### 1.1 布局

| 项 | 值 |
|----|-----|
| 水平 inset | 左右各 **8** |
| 组间距（动作组 ↔ Cancel） | **8** |
| 底边距 | **8** + 安全区 |
| 组圆角 | **14** |
| 动作行高 | **57** |
| Title / Message | **13** / 行高 18 · Label Secondary · 居中 |
| 动作字号 | **20** Regular · Label / Link（默认）· System Red（destructive） |
| Cancel 字号 | **20** Semibold · Label |
| 分割线 | Separator；左右 inset **0**（通栏） |

### 1.2 材质（§6.2-A.1）

| 项 | 值 |
|----|-----|
| Mixin | `lingyun-glass-surface` + **全端** blur |
| Light 填充 | `#ffffff` @ **0.72**（对齐 Sheet） |
| Dark 填充 | `#1a1a1a` @ **0.7**（`$lingyun-glass-overlay-bg-dark`） |
| 遮罩 | Light ≈0.2；Dark ≈0.52 |
| ❌ | 玻璃节点 `opacity` 显隐；`lingyun-glass-regular` 实霜 fallback |

### 1.3 动效

- **enter**：整栈 `translate3d(0,100%,0)` + 遮罩 `opacity:0`
- **open**：滑入 `0` + 遮罩淡入；**0.42s** `cubic-bezier(0.32, 0.72, 0, 1)`
- **leave**：下滑 **0.24s**；卸载延时 ≈ 250ms
- 双 `rAF` + 短延时再切 `open`
- 尊重 `prefers-reduced-motion`

---

## 2. 行为（HIG）

- 提供明确 **Cancel**（独立卡片，底部）。
- 破坏性操作用 `destructive`（红字），并保留 Cancel。
- 默认 **可** 点遮罩关闭（`maskClosable=true`）。
- 点动作后默认关闭（可用 `closeOnAction=false` 覆盖单条）。

---

## 3. API（lingyun-action-sheet）

```vue
<lingyun-action-sheet
  v-model:show="open"
  title="Title"
  message="A message should be a short, complete sentence."
  :actions="[
    { text: 'Edit', role: 'default' },
    { text: 'Delete', role: 'destructive' },
  ]"
  cancel-text="Cancel"
  @action="onAction"
  @close="onClose"
/>
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `show` / `modelValue` | boolean | — | 显隐 |
| `title` | string | `''` | 可选标题 |
| `message` | string | `''` | 可选说明 |
| `actions` | Action[] | `[]` | 动作列表（不含 Cancel） |
| `cancelText` | string | `'Cancel'` | Cancel 文案 |
| `showCancel` | boolean | `true` | 是否显示 Cancel 卡 |
| `maskClosable` | boolean | `true` | 点遮罩关闭 |
| `closeOnAction` | boolean | `true` | 点动作后关闭 |
| `zIndex` | number | `1100` | 层级（默认高于 Sheet） |

`Action`：`{ text, role?: 'default' \| 'destructive', disabled?: boolean, key?: string, close?: boolean }`

事件：`update:show`、`update:modelValue`、`action`、`close`、`cancel`

---

## 4. 注意事项

1. 根挂 `theme-*`（小程序 styleIsolation）。
2. 面板玻璃按 §6.2-A.1；缩放/位移在外层 stack，**不对玻璃节点写 opacity**。
3. 打开时 `LINGYUN_APP_PAGE_SCROLL_LOCK`；遮罩 `touchmove.prevent`。
4. 与 `lingyun-sheets` 区分：Sheet 是内容容器；Action Sheet 是**短动作列表 + Cancel**。
5. 尺寸一律 `px`。

---

## 5. 自检

- [ ] 两组玻璃卡 + 8 inset；Cancel 独立在下
- [ ] destructive 红字；Cancel Semibold
- [ ] 滑入滑出；遮罩可关；点动作关闭
- [ ] 浅色 / 暗黑；微信小程序可编译运行
- [ ] 玻璃透底可见（非实霜）

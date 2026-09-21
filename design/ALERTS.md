# Alerts 规范（强制 · lingyun-alert）

> `lingyun-alert` **必须**按苹果官方 Alerts 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Alert 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Alerts/Light**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight
2. **Sketch · Alerts/Dark**（材质同 Regular Large，走 Dark 色板）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FDark
3. **Sketch Inspect · Default（Light）**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/0EFA1982-BC98-4765-B33C-D36DA54BD0D5#Inspect
4. **HIG · Alerts**  
   https://developer.apple.com/design/human-interface-guidelines/alerts
5. **Liquid Glass / Colors**  
   [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md)

---

## 1. Sketch 符号矩阵（已核对 · Light）

| 符号 | 尺寸 | 说明 |
|------|------|------|
| Default | **300 × 184** | 标题 + 说明 + 双钮横排 |
| Buttons Stacked | **300 × 304** | 标题 + 说明 + 三钮竖排 |
| Input Field × 1 | **300 × 255** | + 1 个输入胶囊 |
| Input Field × 2 | **300 × 307** | + 2 个输入胶囊 |
| Overlay | **200 × 200** | 遮罩符号（实现用全屏 dimming） |

### 1.1 面板（Default / Stacked / Input 共用）

| 项 | 值 |
|----|-----|
| 宽度 | **300** |
| 圆角 | **34**（Smooth Apple 60%） |
| 内边距 | **14** |
| 材质 | Liquid Glass **Regular - Large**（圆角 34） |
| 外阴影 | Light：`0 8px 48px rgba(0,0,0,0.25)`；Dark：同结构 alpha **0.45** |
| Light 填充 | `#ffffff` @ **0.72**（对齐 Sheet；全端 blur） |
| Dark 填充 | `#1a1a1a` @ **0.7**（`$lingyun-glass-overlay-bg-dark`，对齐 Sheet） |
| Dark 描边 | 浅灰 rim（≈`#a6a6a6` @ 0.45），非纯白 hairline |
| 遮罩 | Light overlay ≈0.2；Dark ≈0.52 |

> 说明：你给的 [FE073914 Inspect](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/FE073914-A7E7-4E4E-9F4D-374AE7330AA9#Inspect) 在仓库文档里对应 **Segmented Controls · Dark**；Alert 暗黑材质按 **Alerts/Dark + Regular Large** 与 iOS 27「Dark glass 更亮」对齐。

### 1.2 标题区 Title and Message

| 项 | 值 |
|----|-----|
| 内边距 | 上/左/右 **8**，底 **24** |
| 标题↔说明 gap | **10** |
| Title | **17** Semibold / 行高 22 / Label Primary |
| Description | **17** Regular / 行高 22 / Label Secondary |
| 对齐 | 水平居中 |

### 1.3 按钮

| 布局 | 尺寸 / 间距 | 角色 |
|------|-------------|------|
| 横排（Default） | 高 **48**，gap **8**，两钮均分约 **132** | Leading = **2 Secondary**；Trailing = **1 Primary** |
| 竖排（Stacked） | 高 **48**，gap **12**，宽满 **272** | 顶 = Primary；中间可 Destructive（红字）；底 = Secondary/Cancel |

按钮为 **胶囊**（非经典细分割线整行）。Primary：System Blue 底 + 白字；Secondary：Secondary Fill；Destructive：Secondary Fill + System Red 字（或 Primary 位用红底）。

### 1.4 输入

| 项 | 值 |
|----|-----|
| 字段 | **272 × 52**，圆角 Max（pill） |
| 填充 | Tertiary Fill `rgba(118,118,128,0.12)` |
| 数量 | 最多 **2**（对齐 Input Field ×1 / ×2） |
| 字段间距 | **12** |

### 换算

Sketch **1pt = 1px**。❌ 禁止 `rpx`。

---

## 2. 行为（HIG）

- 标题短而具体；说明一句完整短句。
- 按钮文案用动词；取消固定用「Cancel」语义；破坏性操作用 destructive，并提供取消。
- 横排：最可能操作在 **右侧（Trailing）**；Cancel 在左侧。
- 竖排：默认操作在 **顶部**；Cancel 在底部。
- 默认 **不** 点遮罩关闭（`maskClosable=false`）。
- 系统 `UIAlertController` 点 dimming 为**静默忽略**；本组件在不可关闭时给面板 **水平轻抖** + `vibrateShort`（语汇对齐密码框校验失败），提示须点按钮。

- 含输入框：键盘弹起时面板上移（`adjust-position=false` + `onKeyboardHeightChange` / H5 `visualViewport`），**底边贴键盘上方约 16px**（按面板高度计算 lift，勿用固定 `kb*0.58` 以免留白过大）。

### 2.1 动效（对齐系统 Alert）

| 阶段 | 遮罩 | 面板 |
|------|------|------|
| 入场 | 淡入 ~0.28s | 外层 lift `scale(1.16)→1`（**不对玻璃节点做 opacity**） |
| 退场 | 淡出 ~0.22s | 外层 lift `scale(1)→0.92` |
| 拒关（点遮罩且 `maskClosable=false`） | 不变 | 水平轻抖 ~0.42s + 短震动；减少动态时仅震动 |
| 键盘（含 inputs） | 不变 | lift：底边贴键盘上沿（约 16px）+ `scale` |
| 减少动态 | 仅短淡入淡出，无缩放 | |

> **踩坑**：玻璃面板（`__panel`）禁止用 `opacity` 做显隐。小程序上同节点 `opacity`/`backdrop-filter` 并存会导致模糊失效，看起来「完全不透」。缩放放 `__lift`，配方对齐 Sheet（`#fff`@0.72 + blur）。

---

## 3. API（lingyun-alert）

```vue
<lingyun-alert
  v-model:show="visible"
  title="A Short Title Is Best"
  message="A message should be a short, complete sentence."
  :actions="[
    { text: 'Secondary', role: 'cancel' },
    { text: 'Primary', primary: true },
  ]"
  @action="onAction"
/>

<lingyun-alert
  v-model:show="stackVisible"
  layout="stack"
  title="A Short Title Is Best"
  message="A message should be a short, complete sentence."
  :actions="[
    { text: 'Primary', primary: true },
    { text: 'Destructive', role: 'destructive' },
    { text: 'Secondary', role: 'cancel' },
  ]"
/>

<lingyun-alert
  v-model:show="inputVisible"
  title="Sign In"
  message="Enter your credentials."
  :inputs="[
    { key: 'account', placeholder: 'Placeholder', value: account },
    { key: 'password', placeholder: 'Password', password: true, value: password },
  ]"
  :actions="[
    { text: 'Cancel', role: 'cancel' },
    { text: 'Continue', primary: true },
  ]"
  @update:inputs="onInputs"
  @action="onAction"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `show` / `modelValue` | boolean | — | 显示 |
| `title` / `message` | string | `''` | 标题 / 说明 |
| `actions` | array | `[]` | `{ text, role?, primary?, key?, close? }` |
| `layout` | string | `auto` | `auto`：≥3 竖排，否则横排；可强制 `row` / `stack` |
| `inputs` | array | `[]` | 最多 2：`{ placeholder, value, type?, password?, key? }` |
| `maskClosable` | boolean | `false` | 点遮罩关闭 |
| `closeOnAction` | boolean | `true` | 点按钮后关闭 |
| `autoFocus` | boolean | `true` | 首个输入自动聚焦 |

| 事件 | 说明 |
|------|------|
| `update:show` / `update:modelValue` | 显隐 |
| `action` | `{ action, index, values, inputs }` |
| `update:inputs` / `input` | 输入变更 |
| `close` | 关闭 |

插槽：`header`、默认插槽（面板内容扩展）。

---

## 4. 自检

- [ ] 对照 [Alerts/Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight) / [Alerts/Dark](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FDark)
- [ ] 面板 300 宽、圆角 34、Glass Regular Large；暗黑为提亮霜面而非死黑实心卡
- [ ] 双钮横排 gap 8；三钮竖排 gap 12；按钮高 48 胶囊
- [ ] Primary / Secondary / Destructive 角色正确
- [ ] 输入为 Tertiary Fill 胶囊，最多 2 个
- [ ] 单位为 `px`

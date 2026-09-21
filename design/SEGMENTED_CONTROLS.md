# Segmented Controls 规范（强制 · lingyun-segmented-control）

> `lingyun-segmented-control` **必须**按苹果官方 Segmented Controls 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的分段控件专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Segmented Controls**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls
2. **Sketch · Segmented Controls/Dark/Large**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls%252FDark%252FLarge
3. **Sketch Inspect · Dark / Large / Enabled**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/FE073914-A7E7-4E4E-9F4D-374AE7330AA9#Inspect
4. **HIG · Segmented controls**  
   https://developer.apple.com/design/human-interface-guidelines/segmented-controls
5. **Liquid Glass / Colors**  
   [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md)

---

## 1. Sketch 符号矩阵（已核对）

### 1.1 Size

| Sketch | lingyun `size` | 外框（示例 5 段） |
|--------|----------------|-------------------|
| Large | `large`（默认） | **370 × 48** |
| Small | `small` | **370 × 32** |

### 1.2 轨道 Track

| 项 | 值 |
|----|-----|
| 内边距 | **2**（四周） |
| 段间距 gap | **4** |
| 圆角 | Max（胶囊） |
| Light 填充 | **Tertiary Fill** `rgba(118,118,128,0.12)` → `--lingyun-fill-tertiary` |
| Dark 填充 | **Tertiary Fill/Dark** `rgba(118,118,128,0.24)`（Sketch Inspect 已核对） |

### 1.3 段 Segment / Selected thumb

| 项 | Large | Small |
|----|-------|-------|
| 段高 | **44**（48 − 2×2） | **28**（32 − 2×2） |
| 段宽 | 等分 Fill | 等分 Fill |
| Light Selected | 白底 Elevated 胶囊（Tertiary Background） | 同左 |
| Dark Selected | Liquid Glass「5 - Selected」：提亮银霜（H5 半透明 + blur；弱端 ≈`rgba(99,99,102,0.92)`），**禁止**死黑 `#2c2c2e` 实心 | 同左 |
| 文案 | SF Pro **Semibold 600** / **≈13** / LH 18 / tracking **-0.4** | 可略小（12） |
| 选中色 | Labels Primary | 同左 |
| 未选中色 | Labels Secondary | 同左 |

实现：**1pt = 1px**。❌ 禁止 `rpx`。根节点须自挂 `theme-*`（小程序 styleIsolation）。

### 1.4 状态

- Enabled / Disabled（整控件约 **0.4** 透明度）
- Light / Dark（走主题变量）

---

## 2. 行为（HIG）

- 用于**密切相关**选项切换；主导航用 Tab Bar。
- 段数 iPhone 建议 **≤ 5**；尽量等宽、内容尺寸相近。
- 同一控件内优先**纯文案或纯图标**，勿混用。
- 选中态用滑动胶囊 thumb 表达（过渡对齐 Tab Bars 的液态弹簧），**不要**恢复旧式竖分割线。

---

## 3. API

```vue
<lingyun-segmented-control
  v-model="current"
  :items="['Day', 'Week', 'Month', 'Year']"
/>

<lingyun-segmented-control
  v-model="tab"
  size="small"
  :items="[
    { key: 'a', text: 'Item 1' },
    { key: 'b', text: 'Item 2' },
    { key: 'c', text: 'Item 3', disabled: true },
  ]"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `items` | array | `[]` | 字符串数组，或 `{ key, text?, icon?, disabled? }` |
| `modelValue` / `value` | string \| number | — | 当前选中 key |
| `size` | string | `large` | `large` \| `small` |
| `disabled` | boolean | `false` | 整组禁用 |
| `block` | boolean | `true` | 通栏等分 |

事件：`update:modelValue`、`change`。

---

## 4. 自检

- [ ] Large 48 / Small 32；pad 2 · gap 4 · 胶囊轨道
- [ ] Track = Tertiary Fill（Dark `0.24`）；thumb 为选中胶囊
- [ ] 暗黑 Selected 为提亮银霜玻璃，非 `#2c2c2e` 实心；根挂 `theme-*`
- [ ] 文案 Semibold ≈13；选中 Primary / 未选中 Secondary
- [ ] Disabled 约 0.4 透明度；尺寸为 `px`

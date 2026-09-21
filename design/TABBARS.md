# Tab Bars 规范（强制 · lingyun-tabbars）

> `lingyun-tabbars` **必须**按苹果官方 Tab Bars 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Tab Bar 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Tab Bars**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars
2. **HIG · Tab bars**  
   https://developer.apple.com/design/human-interface-guidelines/tab-bars
3. **Liquid Glass 总则**  
   [`UI_SPEC.md`](./UI_SPEC.md)

---

## 1. Sketch 符号矩阵（已核对）

### 1.1 iPhone 整条 Tab Bar

| 符号 | 尺寸 | 说明 |
|------|------|------|
| Default | **402 × 99** | 含底部安全区的整条悬浮栏 |
| Prominent Tab | **402 × 99** | 更强调选中态的变体 |
| Search Selected - Placeholder / Value | **402 × 76** | **独立组件** [`lingyun-search-bar`](./SEARCHBARS.md)，不是 Tab 选中态 |

### 1.2 iPhone 内容胶囊 / 单 Tab

| 符号 | 尺寸 | 说明 |
|------|------|------|
| Tabs Horizontal 2–5 | **346 × 62** | 主胶囊内容区高度约 **62pt** |
| Tab - Default | **72 × 54** | 未拉宽的单项 |
| Tab - Selected | **200 × 54** | 选中可更宽（标签可见） |
| Tab - Search | **54 × 54** | 胶囊内搜索符号命中区；**分离圆钮外径与胶囊同高 62pt** |

### 1.3 iPad（Regular）

| 符号 | 尺寸 |
|------|------|
| iPad bar | **510 × 44** |
| Tab-Label Selected / Unselected | **74×36** / **65×36** |
| Tab-Symbol | **52 × 36** |

无搜索：2、3 项按内容宽度居中；iPhone 上 4、5 项胶囊占满整行（左右仍留 21）。有搜索（最多 4+1）：搜索圆钮外径 62，iPhone 上两组两端对齐；其中 3+1、4+1 的左侧胶囊撑满圆钮左侧，1+1、2+1 仍按内容收窄。iPad 及以上整组居中、不拉满。

### 1.4 换算（1pt = 1px，禁止 rpx）

| 区域 | pt | px |
|------|----|-----|
| 内容胶囊高度 | 62 | 62 |
| 单项高度 | 54 | 54 |
| 搜索圆钮外径 | 62 | 62 |
| 含安全区总高 | 99 | 99 |
| 胶囊相对屏幕：上 / 左右 / 下 | 16 / 21 / 21 | 16 / 21 / 21 |
| 胶囊内边距（四边相同） | 4 | 4 |
| Tab 符号 | 25 | 25 |
| 标签 | 10 / Semibold / 字距 -0.1 | 10 |

选中胶囊是 `Fills/2 Secondary`（`rgba(120, 120, 128, 0.16)`），不是主色 Fill。未选中图标和文字用 `Labels - Liquid Glass / 1 Primary`（`#1A1A1A`）。选中只把图标改成系统蓝 `#0088FF`，文字保持主标签色。胶囊走 `lingyun-glass-control`（无 1px 白边、无面板级重投影）；不要用 `lingyun-glass-regular` 的小程序实霜。

---

## 2. 行为与分层（HIG + Liquid Glass）

- Tab Bar 属于 **Liquid Glass 控件层**，浮在内容之上，**禁止**实心不透明底冒充。
- 建议 **3–5** 个主导航项；标签短、图标优先 filled 风格（可用自定义 icon 插槽）。
- `role: 'search'` 的项应 **与主胶囊分离**（Sketch：右侧独立圆钮）。底部玻璃搜索条是独立控件，见 [`SEARCHBARS.md`](./SEARCHBARS.md)。
- 选中项：主色 + 胶囊内高亮；未选中：次级中性色。
- 切换时选中高亮按 Liquid Glass **液态透镜**：前缘快、后缘慢的双弹簧，途中按体积守恒压扁；「减少动态效果」时关闭过渡。
- 可选：滚动最小化（首版 API 预留，交互可后续加）。

---

## 3. API（lingyun-tabbars）

```vue
<lingyun-tabbars
  v-model="current"
  variant="default"
  :items="[
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'browse', text: 'Browse', icon: '◇' },
    { key: 'search', role: 'search' },
  ]"
  @change="onChange"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `items` | array | `[]` | `{ key, text?, icon?, badge?, role?: 'search' }`；`badge` 为数字/字符串，或 `{ text, color?, dot?, max? }`，内部用 `lingyun-badge` |
| `modelValue` / `value` | string\|number | — | 当前选中 `key` |
| `variant` | string | `default` | `default` \| `prominent`（Sketch Default / Prominent Tab） |
| `safeArea` | boolean | `true` | 预留 Home Indicator |
| `fixed` | boolean | `true` | 底部 fixed 悬浮 |

| 事件 | 说明 |
|------|------|
| `update:modelValue` / `update:value` | 选中变更 |
| `change` | 参数为整项 `item` |

插槽：`icon-{key}`、`search-icon`。

---

## 4. 自检

- [ ] 悬浮胶囊用 `lingyun-glass-control`，非实心底栏、非 `regular` 实霜
- [ ] 左右 21、上 16、下 21；内容高度 62
- [ ] 选中胶囊为 Fill Secondary；未选中文字 `#1A1A1A`，仅图标为系统蓝
- [ ] Search 项分离为圆形按钮
- [ ] 对照 Sketch Tab Bars 与 HIG

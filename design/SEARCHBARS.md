# Search Bars 规范（强制 · lingyun-search-bar）

> `lingyun-search-bar` **必须**按苹果官方底部玻璃搜索条开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Search Bar 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Search Selected - Placeholder**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/C46C53EC-096C-448D-94FC-AB949829C87E#Inspect
2. **HIG · Search fields**  
   https://developer.apple.com/design/human-interface-guidelines/search-fields
3. **Liquid Glass 总则**  
   [`UI_SPEC.md`](./UI_SPEC.md)

底部搜索条是 **独立控件**，不是 Tab Bar 的选中态。Tab Bar 的分离搜索圆钮见 [`TABBARS.md`](./TABBARS.md)。

---

## 1. Sketch 尺寸（已核对）

| 符号 | 尺寸 | 说明 |
|------|------|------|
| Search Selected - Placeholder / Value | **402 × 76** | 整条；padding **0 / 28 / 28 / 28** |
| Search Field | **346 × 48** | Regular Glass 胶囊 |
| Search with Focus（可选） | 286 + 12 + 48 | 字段 + 间距 + 取消圆钮 |
| Search Selected - Typing | **402 × 394** | 键盘展开面板（首版不做） |

图层：放大镜 `􀊫` · 占位/输入 `Search` · 麦克风 `􀊰`（有字时换成清除）。

### 换算（1pt = 1px，禁止 rpx）

| 区域 | pt | px |
|------|----|-----|
| 左右 / 底 padding | 28 | 28 |
| 搜索条高度 | 48 | 48 |
| 字段内边距 L / R | 11 / 10 | 11 / 10 |
| 项间距 | 4 | 4 |
| 符号 / 正文 | 17 | 17 |

---

## 2. 行为与分层

- 属于 **Liquid Glass 控件层**，默认 **固定底部** 悬浮，禁止实心底栏冒充。
- 默认始终展示（Placeholder：346 满宽），不依赖 Tab 切换才出现。
- **同一条上的状态切换**：默认 Placeholder；聚焦后过渡到 Search with Focus（字段收窄 + 取消钮从右侧滑入）；取消 / 失焦再收回。不是两套组件。
- 宽度变化必须有过渡（约 0.38s），禁止硬切造成抖动；「减少动态效果」时关闭过渡。
- Placeholder：放大镜 + 占位 + 麦克风。
- Value：有字时麦克风换成清除。
- Typing 大面板首版不做。

---

## 3. API（lingyun-search-bar）

```vue
<lingyun-search-bar
  v-model="query"
  placeholder="Search"
  @confirm="onSearch"
  @mic="onMic"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `modelValue` / `value` | string | — | 搜索文本 |
| `placeholder` | string | `Search` | 占位 |
| `fixed` | boolean | `true` | 底部 fixed；键盘弹起时随高度上推（`adjust-position=false` + keyboardheightchange） |
| `safeArea` | boolean | `true` | 预留 Home Indicator |
| `showCancel` | boolean | `true` | 是否允许聚焦后展开取消钮 |
| `cancelText` | string | `''` | 取消文案；空则为符号 |
| `focus` | boolean | `false` | 外部请求聚焦 |

| 事件 | 说明 |
|------|------|
| `update:modelValue` / `update:value` | 文本变更 |
| `input` / `confirm` | 输入 / 键盘搜索 |
| `clear` / `mic` / `cancel` | 清除 / 麦克风 / 取消（取消会清空文本） |
| `focus` / `blur` | 焦点 |

插槽：`icon`、`mic`、`cancel`。

---

## 4. 自检

- [ ] 底部悬浮玻璃胶囊，非实心底栏
- [ ] 整条接近 402×76，字段 346×48，padding 28pt
- [ ] Placeholder：放大镜 + Search + 麦克风
- [ ] 默认固定底部，不依赖点 Tab 才出现
- [ ] 默认满宽 Placeholder；聚焦过渡到取消钮，失焦收回，无硬切抖动
- [ ] 聚焦弹键盘时底栏上推，不被键盘挡住（小程序 / H5）
- [ ] 对照 Sketch Inspect 与 HIG

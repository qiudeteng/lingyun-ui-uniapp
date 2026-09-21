# Lists 规范（强制 · lingyun-list）

> `lingyun-list` / `lingyun-list-item` **必须**按苹果官方 Lists 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 List 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Lists / Grouped**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect
2. **Sketch · Lists/Light/Rows/Large**（Title + Subtitle）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/3B6E0BA0-E073-4B74-988A-B36E8EF2F5FE#Inspect
3. **HIG · Lists and tables**  
   https://developer.apple.com/design/human-interface-guidelines/lists
4. **Liquid Glass 总则**  
   [`UI_SPEC.md`](./UI_SPEC.md)

列表是 **内容层**：分组卡片用 **Grouped 标准材质**，**禁止**每一行做成独立 Liquid Glass。

---

## 1. Sketch 画板（已核对 · Grouped）

画板 **Examples/Lists/Light/Grouped**：**402 × 874**。  
页面 fill：`Primary Backgrounds Grouped / Light / Primary`。  
内容 padding：**62 / 0 / 16 / 16**（上 / 下 / 左 / 右）。

### 1.1 结构（与稿一致）

1. **Header · Extra Prominent**：大标题 + 右侧 `Action`
2. **分组卡片**（1 行）：Title + Detail
3. **Footer**（卡片外，可折两行）
4. **Header · Nested**：`Header`
5. **分组卡片**（多行）：Detail / Pop-up / Stepper / Toggle / Slider
6. **Footer**
7. **Destructive** 单独成组：居中红色按钮行

### 1.2 换算（1pt = 1px，禁止 rpx）

| 区域 | pt | px |
|------|----|-----|
| 页左右 inset | 16 | 16 |
| 分组卡片圆角 | **26** | 26 |
| 行高 Regular | **52** | 52 |
| 行高 Tall | 68 | 68 |
| 行内边距（仅水平） | 16 | 16 |
| Leading Image · base | **30** | 30 |
| Leading Image · lg | **42** | 42 |
| Image 圆角 base / lg | 7 / 10 | 7 / 10 |
| Extra Prominent 标题行 | 48 | 48 |
| Prominent 标题行 | 45 | 45 |
| Nested 标题行 | 42 | 42 |
| Footer（单行） | 32 | 32 |
| 标题 Body | 17 / 22 | 17 |
| Subtitle（`note`） | **15 / 18** | 15 |
| Detail 右侧 Subheadline | 15 / 20 | 15 |
| Extra Prominent 标题 | 20 | 20 |
| Nested 标题 | 13 | 13 |
| Footer Footnote | 13 | 13 |

---

## 2. 行为与分层

- **页面底**：Grouped Primary（浅 `#f2f2f7` / 深 `#000`）。
- **分组卡片**：Grouped Secondary（浅白 / 深 `#1c1c1e`），圆角 **26pt**（iOS 26+ insetGrouped 默认；Regular 52pt 行两端是半圆胶囊）；行与行之间 hairline，**不是**玻璃叠玻璃。
- 按下：行背景 `fills.tertiary`，立即出现，松开约 0.15s 收回。
- Trailing：`disclosure` / `popup` / `stepper` / `toggle` / `slider`。
- **Large 行**（有 Subtitle）：行高 **68pt**。`note` / `subtitle` 对应 Sketch **Subtitle**（不是右侧 Detail）：SF Pro 15 Regular、行高 18、Secondary Label、单行省略。Sketch Title↔Subtitle Stack **gap = 0**；实现取 **2px**（弱端行高偏紧时略增可读）。Title + Subtitle 在行内垂直居中。
- `role="destructive"`：独立分组、标题居中、系统红。
- **Swipe Actions**：独立组件 `lingyun-swipe-action`（见 [`SWIPE_ACTIONS.md`](./SWIPE_ACTIONS.md)），与 list-item **组合**，不内建进本组件。
- 首版不做：Index Bar、编辑 Grabber。

---

## 3. API

```vue
<lingyun-list
  header="Header"
  header-type="extraProminent"
  header-action="Action"
  footer="This is some footer text to see how well the footer symbol wraps to two lines."
  @action="onAction"
>
  <lingyun-list-item title="Title" note="Subtitle" />
  <lingyun-list-item title="Title" detail="Detail" accessory="disclosure" />
</lingyun-list>
```

| 组件 | Prop | 说明 |
|------|------|------|
| `lingyun-list` | `header` / `headerType` / `headerAction` / `footer` | 分组标题、类型、右侧操作、页脚 |
| | `inset` | 默认 `true`，左右 16pt |
| `lingyun-list-item` | `title` / `detail` / `note` | 主文 Title / 右侧 Detail / 下方 **Subtitle**（`note` 即 Sketch Subtitle，也可用 `subtitle`） |
| | `thumb` / `thumbSize` | 左侧图；默认 `auto`（有 Subtitle → **42×42**，否则 **30×30**）；可强制 `base` / `lg` |
| | `accessory` | `none` \| `disclosure` \| `popup` \| `stepper` \| `toggle` \| `slider` |
| | `role` | `default` \| `destructive` |
| | `switchChecked` / `stepperValue` / `sliderValue` | 对应 accessory 的值 |
| | `clickable` | 点击反馈 |

插槽：`header` / `header-action` / `footer`（list）；`icon` / `extra`（item）。

---

## 4. 注意事项（踩坑复盘）

> 改 `lingyun-list` / `lingyun-list-item` / Lists Demo 前先过一遍。总则另见 [`UI_SPEC.md`](./UI_SPEC.md) §6.2。

1. **Leading 两档，勿写死 30**  
   Sketch / 实现：`base` **30×30**（圆角 7）、`lg` **42×42**（圆角 10）。默认 `thumbSize=auto`：有 `note`/`subtitle` → lg，否则 base；可用 `base`/`lg` 强制。

2. **同组勿混大小图标**  
   Regular 行（52）与 Tall 行（68）夹在同一分组里，分割线 inset 与行高都不齐，观感很差。Demo / 业务按规格拆成两组（如「Icons · 30×30」与「Icons · 42×42」）。

3. **分割线 inset 随图标变**  
   `left = 行 pad 16 + 图标边长 + leading gap 16` → base **62**、lg **74**。勿再写死 `58` 一类旧值；有 Leading 时用真实分割线节点 + `--leading` / `--leading-lg`（勿依赖自定义组件 `:last-child::after`，见 UI_SPEC §6.2-C）。

4. **`note` ≠ `detail`**  
   - `note` / `subtitle` = Sketch **Subtitle**（Title 下方，Tall 68）  
   - `detail` = 右侧 Secondary 文案  
   把副标题写进 `detail` 不会变高行，也不会触发大图标。

5. **Title↔Subtitle 间距**  
   Sketch Stack **gap = 0**；弱端行高偏紧时实现取 **2px**，勿再拉大成 4/8 破坏 Large 行密度。

6. **disclosure 箭头别用过小的 uni-icons**  
   `uni-icons` `right`/`arrowright` 在 52 行里显小、显弱。用组件内 CSS 实线 chevron（对齐系统 disclosure），勿再塞小号图标凑合。

7. **`#icon` 插槽填满 leading 盒**  
   Leading 容器已定宽高与圆角；插槽根节点用 `width/height: 100%` + `border-radius: inherit`，由容器驱动尺寸。插槽里再写死 30/42 易与 `auto` 打架。

8. **列表是内容层**  
   分组卡片用 Grouped Secondary 标准材质，**禁止**每行一块 Liquid Glass（glass-on-glass）。

---

## 5. 自检

- [ ] 分组卡片是标准材质，不是每行一块玻璃
- [ ] 卡片圆角 26pt（单行两端接近半圆），不是 10 / 20pt 方角卡
- [ ] 页背景 Grouped Primary，卡片 Grouped Secondary
- [ ] Extra Prominent / Nested 标题与 Footer 在卡片外
- [ ] Trailing 与 Destructive 对齐 Sketch Grouped
- [ ] Title + Subtitle（`note`）对齐 Lists/Light/Rows/Large：15/18、Secondary Label、与 Title gap **2**（稿面 0）、行高 68pt
- [ ] Leading Image：默认随 Subtitle 自动（有 → 42 / 无 → 30）；`thumbSize` 可强制；分割线 inset 随之偏移
- [ ] 同组未混用 30 与 42；disclosure 为 CSS chevron
- [ ] 对照 Sketch Lists 与 HIG

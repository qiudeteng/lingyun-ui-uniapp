# Sheets 规范（强制 · lingyun-sheets）

> `lingyun-sheets` **必须**按苹果官方 Sheets（iPhone · Light / Dark）设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Sheet 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Sheets/Light/iPhone**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FLight%252FiPhone
2. **Sketch · Sheets/Dark/iPhone**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FDark%252FiPhone
3. **Sketch · Sheets/Light/iPad**（画板 1210×834）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/45D0EE83-6B95-426B-A7F7-786397577FFB
4. **HIG · Sheets**  
   https://developer.apple.com/design/human-interface-guidelines/sheets
5. **Liquid Glass**  
   [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) · [`UI_SPEC.md`](./UI_SPEC.md) · [`TOOLBARS.md`](./TOOLBARS.md)（Sheet 顶栏）

---

## 1. 形态与范围（MVP）

| 项 | 约定 |
|----|------|
| 形态 | 窄屏（iPhone）**底部弹出** Modal Sheet；宽屏（iPad / 桌面 H5）**居中卡片** |
| 档位 | `medium` ≈ **51.6%** 屏高的悬浮内缩卡片；`large` ≈ 屏高 − 状态栏，贴边贴底 |
| 断点 | `windowWidth ≥ 700` 视为宽屏，档位不再影响形态 |
| 交互 | prop 切换档位 + 开合动画；Grabber 区下滑超阈值关闭；点遮罩可关 |
| ❌ 不做 | 跟手拖拽换档、嵌套堆叠 |

实现换算：**1pt = 1px**。❌ 禁止 `rpx`。

### 1.1 面板 · 窄屏

| 项 | medium | large |
|----|--------|-------|
| inset | 左右 + 底部各 **8**（悬浮卡片） | **0**（贴边贴底） |
| 圆角 | **四角 34** | **顶角 38**，底角 0 |
| 材质 | `lingyun-glass-surface` + 全端 blur（对齐 Toolbar），`#fff`@**0.72** / 暗黑 `#1a1a1a`@0.7 | **纯色不透明** `--lingyun-bg-grouped-secondary`（`#FFFFFF` / `#1C1C1E`），无描边、`backdrop-filter: none` |
| 投影 | `0 18px 46px rgba(0,0,0,.25)`（暗黑 48/.45） | `0 15px 50px rgba(0,0,0,.18)` |
| 弱端 | 小程序与 Toolbar 同配方半透明 + blur；遮罩分担挡字，**不再**抬到 0.97 实霜 | 纯色无需降级 |
| 遮罩 | Light ≈0.2；Dark ≈0.48（`--lingyun-mask`） | 同左 |

### 1.2 面板 · 宽屏（Sketch Sheets/iPad）

Sketch 画板 1210×834 上面板为 **936×770**，左右各 137、上下各 32。实现按比例还原：

| 项 | 值 |
|----|----|
| 宽 | `min(936, windowWidth − 64)`，水平居中 |
| 高 | `min(770, windowHeight − 64)`，垂直居中 |
| 圆角 | **四角 32** |
| 材质 | 与 large 同：纯色不透明 `--lingyun-bg-grouped-secondary`，无描边、无投影 |
| Grabber | **不出**（宽屏卡片不可换档） |
| 顶栏 | 面板顶部内边距 **10** + 顶栏栏身 **54** |

### 1.3 Grabber + 顶栏

- Grabber：**60 × 4**、圆角 2、居中、距顶 ≈5，色 `#CFCFCF`（暗黑 `#8E8E93`）；宽屏隐藏
- 顶栏：复用 `lingyun-toolbars` `placement="sheet"`（Close + Title + Trailing）；Grabber 由 sheets 自绘，toolbars 传 `show-grabber=false` 避免双条

### 1.4 动效（对齐 iOS Sheet / Alert 相位）

- **enter**：面板下移「面板高 + 底部留白」、遮罩 `opacity:0`（起点帧，勿与 open 同值）
- **open**：面板滑入 `0` + 遮罩淡入；时长约 **0.42s**，曲线 `cubic-bezier(0.32, 0.72, 0, 1)`（系统减速弹簧）
- **leave**：反向下滑约 **0.24s** `cubic-bezier(0.4, 0, 1, 1)`；卸载延时 `LEAVE_MS` ≈ 250
- 档位切换：高度 / inset 过渡 ≈ 0.38s
- 双 `rAF` + 短延时再切 `open`，保证先画起点再过渡（H5 / 小程序）
- 尊重 `prefers-reduced-motion`（取消位移，仅极短淡入淡出）

---

## 2. API（lingyun-sheets）

```vue
<lingyun-sheets
  v-model:show="open"
  title="Title"
  detent="medium"
  :mask-closable="true"
  @close="onClose"
>
  <view>内容</view>
</lingyun-sheets>
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `show` / `modelValue` | boolean | — | 显隐 |
| `title` | string | `''` | 顶栏标题 |
| `detent` | `medium` \| `large` | `medium` | 固定档位 |
| `maskClosable` | boolean | `true` | 点遮罩关闭 |
| `showClose` | boolean | `true` | 顶栏关闭钮 |
| `showTrailing` | boolean | `false` | 顶栏 trailing |
| `safeAreaBottom` | boolean | `true` | 内容底安全区 |
| `zIndex` | number | `1000` | 层级 |

事件：`update:show`、`update:modelValue`、`close`、`update:detent`  
插槽：默认内容；`leading` / `trailing` / `title` 透传 toolbars

---

## 3. 注意事项（踩坑）

1. **根挂 `theme-*`** — 小程序 styleIsolation 下父级暗黑选不中面板（对齐 Alert）。
2. **只有 medium 是玻璃** — medium 走全端 `lingyun-glass-surface` + blur + Sketch alpha 0.72；large 与宽屏卡片是**纯色不透明**，必须显式 `backdrop-filter: none` 清掉 mixin 的模糊。
3. **屏外起点要含底部留白** — 位移写 `面板高 + 底部 inset`；只写 `100%` 会在收起后残留 8px 露头。
4. **宽屏不铺满** — `windowWidth ≥ 700` 收成居中卡片，否则 medium 在 iPad / 桌面 H5 会变成一条横带；`uni.onWindowResize` 里要重算。
5. **浮层挂载** — H5 `Teleport` → `body`，小程序 `root-portal`，否则被 `lingyun-section` 的 `overflow: hidden` 裁切。
6. **挡底层滚动 / 滑动穿透** — 打开时通过 `LINGYUN_APP_PAGE_SCROLL_LOCK` 关掉页内 `scroll-view`；H5 另锁 `body.overflow`；遮罩 / Grabber `touchmove.prevent`；面板仅 `touchmove.stop`（勿 prevent，否则掐死内容区滚动）。
7. **关闭手势只绑 Grabber 顶区** — 勿把整页 touch 当成下滑关，否则与内容滚动冲突。
8. **Grabber 只画一份** — sheets 自绘；内嵌 toolbars `show-grabber=false`。
9. **尺寸 px** — Sketch 1pt = 1px；禁止 rpx。

---

## 4. 自检

- [ ] medium 四周内缩 8 + 四角 34 玻璃；large 贴边贴底 + 顶角 38 纯色，顶缘在页面顶栏之下（状态栏 + 栏身，避开胶囊）
- [ ] 宽屏（≥700）为居中卡片：≤936×770、四角 32、纯色、无 Grabber
- [ ] Grabber 60×4；关闭钮可关；遮罩可关（maskClosable）
- [ ] 开合动画；档位切换高度过渡；收起后无残留露头
- [ ] Grabber 区下滑超阈值关闭；内容区可滚动
- [ ] section 内打开不被裁切（Teleport / root-portal）
- [ ] 浅色 / 暗黑；微信小程序可编译运行

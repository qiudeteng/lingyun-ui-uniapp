# 凌云UI 组件清单与规划

> 对照 Sketch iOS UI Kit + 本仓库已落地组件整理。  
> 状态标记：`✅ 已完成` · `⬜ 待做` · `⚠️ 已知债` · `➖ 可跳过`  
> 实现路径：`src/uni_modules/lingyun-ui/components/`；规范见 [`UI_SPEC.md`](./UI_SPEC.md)。

---

## 1. 已完成 ✅

| 状态 | 组件 | 说明 | 专章 |
|------|------|------|------|
| ✅ | `lingyun-icon` | 图标字体（基于 uniicons） | [`ICONS.md`](./ICONS.md) |
| ✅ | `lingyun-button` | Glass / Prominent 按钮 | [`BUTTONS.md`](./BUTTONS.md) |
| ✅ | `lingyun-badge` | 角标 | [`BADGES.md`](./BADGES.md) |
| ✅ | `lingyun-segmented-control` | 分段控件 | [`SEGMENTED_CONTROLS.md`](./SEGMENTED_CONTROLS.md) |
| ✅ | `lingyun-text-field` | 输入框 MVP（单行 / Secure / Multiline） | [`TEXTFIELDS.md`](./TEXTFIELDS.md) |
| ✅ | `lingyun-form` / `form-group` / `form-item` | 表单容器（Grouped 行布局 + 精简校验） | [`FORMS.md`](./FORMS.md) |
| ✅ | `lingyun-toolbars` | 顶栏 · 滚动玻璃 | [`TOOLBARS.md`](./TOOLBARS.md) |
| ✅ | `lingyun-sheets` | 底部 Sheet（medium / large） | [`SHEETS.md`](./SHEETS.md) |
| ✅ | `lingyun-action-sheet` | 底部操作列表 + Cancel | [`ACTIONSHEETS.md`](./ACTIONSHEETS.md) |
| ✅ | `lingyun-activity-view` | 分享面板 · 半高 / 全高 | [`ACTIVITY_VIEWS.md`](./ACTIVITY_VIEWS.md) |
| ✅ | `lingyun-tabbars` | 底部标签栏 | [`TABBARS.md`](./TABBARS.md) |
| ✅ | `lingyun-search-bar` | 搜索栏 | [`SEARCHBARS.md`](./SEARCHBARS.md) |
| ✅ | `lingyun-list` / `lingyun-list-item` | 分组列表；附属含 toggle / stepper / slider | [`LISTS.md`](./LISTS.md) |
| ✅ | `lingyun-swipe-action` / `lingyun-swipe-action-item` | 列表左右滑菜单 | [`SWIPE_ACTIONS.md`](./SWIPE_ACTIONS.md) |
| ✅ | `lingyun-alert` | 弹窗 | [`ALERTS.md`](./ALERTS.md) |
| ✅ | `lingyun-activity-indicator` | 转圈加载 | [`ACTIVITY_INDICATORS.md`](./ACTIVITY_INDICATORS.md) |
| ✅ | `lingyun-toast` / `lingyun-hud` | 轻提示 · 加载遮罩 | [`TOASTS.md`](./TOASTS.md) |
| ✅ | `lingyun-progress` | 线性 / 环形进度 | [`PROGRESS.md`](./PROGRESS.md) |
| ✅ | `lingyun-empty` | 空态 | [`EMPTY.md`](./EMPTY.md) |
| ✅ | `lingyun-picker` | selector / date / daterange / week / time / datetime | [`PICKERS.md`](./PICKERS.md) |
| ✅ | `lingyun-data-picker` | 数据驱动级联选择（localdata 树） | [`PICKERS.md`](./PICKERS.md) |
| ✅ | `lingyun-switch` / `lingyun-stepper` | 独立开关与步进器 | [`SWITCHES.md`](./SWITCHES.md) |
| ✅ | `lingyun-checkbox` / `lingyun-radio` / `lingyun-radio-group` | 表单单选 / 多选 | [`CHECKS.md`](./CHECKS.md) |
| ✅ | `lingyun-data-checkbox` / `lingyun-data-radio` | 数据驱动多选 / 单选（localdata） | [`CHECKS.md`](./CHECKS.md) |
| ✅ | `lingyun-slider` | 独立滑条 | [`SLIDERS.md`](./SLIDERS.md) |
| ✅ | `lingyun-tag` / `lingyun-chip` | 标签 · 筛选胶囊 | [`TAGS.md`](./TAGS.md) |
| ✅ | `lingyun-text` | 语义文本 · 字阶 / 颜色 | [`TEXTS.md`](./TEXTS.md) |
| ✅ | `lingyun-image` | 图片包装 · 懒加载 / 占位 / 圆角 | [`IMAGES.md`](./IMAGES.md) |
| ✅ | `lingyun-avatar` | 头像 | [`AVATARS.md`](./AVATARS.md) |
| ✅ | `lingyun-page-control` | 轮播指示点 | [`PAGE_CONTROLS.md`](./PAGE_CONTROLS.md) |
| ✅ | `lingyun-skeleton` | 骨架屏 | [`SKELETONS.md`](./SKELETONS.md) |
| ✅ | `lingyun-refresh` | 下拉刷新（scroll-view refresher） | [`REFRESH.md`](./REFRESH.md) |
| ✅ | `lingyun-popover` | 锚定浮层 | [`POPOVERS.md`](./POPOVERS.md) |
| ✅ | `lingyun-menu` / `lingyun-context-menu` | 弹出菜单 · 长按菜单 | [`MENUS.md`](./MENUS.md) |
| ✅ | `lingyun-sidebar` | 悬浮玻璃侧栏 | [`SIDEBARS.md`](./SIDEBARS.md) |
| ✅ | `lingyun-fab` | 悬浮按钮 · 展开菜单（对齐 uni-fab） | demo [`fab`](../src/pages/demo/fab.vue) |
| ✅ | `lingyun-goods-nav` | 商品底栏（对齐 uni-goods-nav） | [`GOODS_NAV.md`](./GOODS_NAV.md) |
| ✅ | `lingyun-grid` / `lingyun-grid-item` | 宫格（对齐 uni-grid） | [`GRID.md`](./GRID.md) |
| ✅ | `lingyun-indexed-list` | 索引列表（对齐 uni-indexed-list） | [`INDEXED_LIST.md`](./INDEXED_LIST.md) |
| ✅ | `lingyun-app-page` | 页面壳（顶栏 + 滚动 + 主题 class；宽屏左侧导航） | [`TOOLBARS.md`](./TOOLBARS.md) |
| ✅ | `lingyun-section` | Demo / 区块布局容器 | demo [`sections`](../src/pages/demo/sections.vue) |
| ✅ | `lingyun-feedback-host` | 命令式 Toast/HUD 宿主 | [`TOASTS.md`](./TOASTS.md) |
| ✅ | `lingyun-ui-charts` | 图表（独立包 · uCharts / ECharts） | [`CHARTS.md`](./CHARTS.md) |

### 底座 ✅

| 状态 | 项 | 说明 | 文档 |
|------|----|------|------|
| ✅ | System Colors | 浅色 / 暗黑语义色 | [`COLORS.md`](./COLORS.md) |
| ✅ | Liquid Glass | token + mixin（surface / regular / clear） | [`UI_SPEC.md`](./UI_SPEC.md) |
| ✅ | 外观主题 | 浅色 / 暗黑 / 跟随系统 | `src/stores/theme.ts` · `src/utils/theme.ts` |

---

## 2. P0（表单与反馈）— 已全部完成 ✅

落地顺序：Activity Indicator → Toast/HUD → Progress → Empty → Picker → Switch/Stepper。

---

## 3. P1（交互与信息展示）— 已全部完成 ✅

落地顺序：Checkbox/Radio → Slider → Tag/Chip → Avatar → Page Control → Skeleton → Refresh → Popover → Menu/Context Menu。

浮层 MVP：Popover 为锚定面板（§6.2-A.1）；Menu 为动作列表；Context Menu = 长按打开同一 Menu（无 Peek）。

---

## 4. 待做 · P2（可选 / 后置）

| 状态 | 组件 | 说明 |
|------|------|------|
| ⬜ | `lingyun-rating` | 评分 |
| ⬜ | `lingyun-gauge` | 仪表盘类（内容层控件；图表仪表盘走 `lingyun-ui-charts` type=`gauge`） |
| ⬜ | `lingyun-keyboard-toolbar` | 输入附属栏 |
| ➖ | Widgets / Notifications | 偏系统壳，小程序优先级低 |

---

## 5. 已知债（不算新组件）

| 状态 | 项 | 说明 |
|------|------|------|
| ⚠️ | 暗黑 / 玻璃真机抽检 | 各组件半透明与对比度以真机为准（持续） |
| ✅ | 分组页底色 | 暗黑页底用 Grouped Primary（`#000`），与卡面 `#1c1c1e` 拉开（首页 / app-page） |
| ✅ | Text Field / Picker cell | form-item 内自动 `variant=cell`，对齐 Sketch Grouped 行 |

---

## 6. 约定（新增组件时）

1. 先写 / 更新 `design/<NAME>.md` 专章，并挂到 [`README.md`](./README.md) · [`UI_SPEC.md`](./UI_SPEC.md) · `AGENTS.md` · `.cursor/rules/liquid-glass-ui.mdc`（按既有组件同样方式）。
2. 实现落在 `lingyun-ui/components/lingyun-<name>/`，尺寸 `px`，兼容 `mp-weixin`。
3. **浮层类（Toast / HUD / Loading / Action Sheet / Popover 等）面板背景**：一律按 [`UI_SPEC.md`](./UI_SPEC.md) **§6.2-A.1**。参考 `lingyun-sheets` / `lingyun-alert` / `lingyun-action-sheet` / `lingyun-toast` / `lingyun-hud` / `lingyun-popover`。
4. 补 demo 页 + 首页入口；更新 `lingyun-ui/readme.md` / `changelog.md`。
5. **浮层类**须：H5 `Teleport`→`body`、mp `root-portal`、根自挂 `theme-*`（见 `.cursor/rules/overlay-portal.mdc`）；勿依赖原生跟系统 DarkMode 的控件（如微信 `picker`）。
6. 完成后：本文件对应行改为 **✅**，从「待做」移入「已完成」，并补专章链接。

---

## 7. 变更记录

| 日期 | 说明 |
|------|------|
| 2026-09-22 | 新增 `lingyun-indexed-list`（索引列表 · 对齐 uni-indexed-list）；专章 `INDEXED_LIST.md` |
| 2026-09-22 | 新增 `lingyun-grid`（宫格 · 对齐 uni-grid）；专章 `GRID.md` |
| 2026-09-22 | 新增 `lingyun-goods-nav`（商品底栏 · 对齐 uni-goods-nav）；专章 `GOODS_NAV.md` |
| 2026-09-21 | `lingyun-ui-charts` 移入已完成；专章 `CHARTS.md`；系列色在包内 `config-colors.js` |
| 2026-09-18 | 新增 `lingyun-sidebar`（悬浮玻璃侧栏）；专章 `SIDEBARS.md` |
| 2026-09-18 | 新增 `lingyun-activity-view`（分享面板 · 半高 / 全高）；专章 `ACTIVITY_VIEWS.md` |
| 2026-09-17 | 新增 `lingyun-image`（懒加载 / 失败占位 / 圆角圆形 / mode）；专章 `IMAGES.md` |
| 2026-09-17 | 新增 `lingyun-icon` + Icons demo；自绘 clear/chevron/eye 等改为图标字体 |
| 2026-09-17 | 新增 Sections demo（`pages/demo/sections`） |
| 2026-09-17 | 新增 `lingyun-text`（字阶 + 语义/自定义色）；专章 `TEXTS.md` |
| 2026-09-17 | Text Field / Picker / Data Picker：`variant=cell` 嵌入 form-item，对齐 Sketch Grouped Text Field |
| 2026-09-17 | picker date/datetime 对齐 Sketch Compact 日历 + Time 行 |
| 2026-09-17 | 新增 `lingyun-form` / `form-group` / `form-item`（Grouped 表单壳） |
| 2026-09-17 | 新增 `lingyun-data-picker`（localdata 级联）；picker 弹层对齐 sheets |
| 2026-09-17 | 新增 `lingyun-data-checkbox` / `lingyun-data-radio`（localdata 数据驱动） |
| 2026-09-17 | P1 全部完成：checks / slider / tag·chip / avatar / page-control / skeleton / refresh / popover / menu·context |
| 2026-09-17 | P0 全部完成：activity / toast·hud / progress / empty / picker / switch·stepper |
| 2026-09-17 | P0 落地顺序定为：Activity → Toast/HUD → Progress → Empty → Picker → Switch/Stepper |
| 2026-09-17 | 清单统一 ✅ / ⬜ 状态列；`action-sheet` 移入已完成 |
| 2026-09-17 | 完成 `lingyun-action-sheet`；后续浮层背景统一 §6.2-A.1 |
| 2026-09-16 | 初版：盘点已完成组件，列出 P0–P2 规划 |
| 2026-09-16 | 约定：后续弹窗 / loading 等浮层背景统一走 Sheet 活玻璃（UI_SPEC §6.2-A.1） |

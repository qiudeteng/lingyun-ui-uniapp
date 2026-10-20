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
| ✅ | `lingyun-table` | 分组表格；固定列、吸顶表头、排序、筛选、分页、多选、分组收起 | [`TABLES.md`](./TABLES.md) |
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
| ✅ | `lingyun-app-page` | 页面壳（顶栏 + 滚动 + 主题 class；宽屏左侧导航，顶部可带头像 / 名称 / 副标题）。1.0.31 起 iPad/PC + 全局 tabs 使用 84 悬浮玻璃窄栏（通高留 8，页面背景透出）；全局 tabs 支持 `children` 二级菜单：PC hover 浮层、窄屏/Duo 工作台；Duo 内屏竖屏使用 Duo Toolbar + Duo Tab | [`TOOLBARS.md`](./TOOLBARS.md) · [`SIDEBARS.md`](./SIDEBARS.md) §4 · [`TABBARS.md`](./TABBARS.md) §3.1 |
| ✅ | `lingyun-duo-toolbar` | iPhone Duo 内屏竖屏顶部工具栏（84 高，左标题 / 右工具组，右上角避开状态/摄像头） | [`SIDEBARS.md`](./SIDEBARS.md) · [`TABBARS.md`](./TABBARS.md) |
| ✅ | `lingyun-duo-rail` | iPhone Duo 右侧全高栏（84 宽，工具组 / 仅图标 Tab / 搜索 / 外屏横屏溢出） | [`SIDEBARS.md`](./SIDEBARS.md) |
| ✅ | `lingyun-split-view` | iPhone Duo 内屏横屏 Split View（左主栏 456 / 折痕带 40 / 右详情 371） | [`SIDEBARS.md`](./SIDEBARS.md) |
| ✅ | `lingyun-mobile` / `lingyun-pc` | 窄屏与平板、电脑分开展示。宽度小于 690 / 达到 690 | demo [`responsive`](../src/pages/demo/responsive.vue) |
| ✅ | `lingyun-row` / `lingyun-col` | 24 分栏。间隔、偏移、对齐、五档响应式 | demo [`layout`](../src/pages/demo/layout.vue) |
| ✅ | `lingyun-section` | Demo / 区块布局容器 | demo [`sections`](../src/pages/demo/sections.vue) |
| ✅ | `lingyun-feedback-host` | 命令式 Toast/HUD 宿主 | [`TOASTS.md`](./TOASTS.md) |
| ✅ | `lingyun-ui-charts` | 图表（不支持 ECharts） | [`CHARTS.md`](./CHARTS.md) |

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
| 2026-10-20 | 凌云UI 1.0.31：新增 `formFactor` / `duoPose` 设备形态；iPad/PC + 全局 tabs 改为 84 浮动玻璃窄栏；iPhone Duo 内屏竖屏接入 84 Duo Toolbar + 95 Duo Tab（半折 40 横向折痕安全带）；外屏竖/横与内屏横屏接入右侧 84 全高栏；内屏横屏折叠/半折接入 Split View（456 / 40 / 371 + 右侧 84 返回列） |
| 2026-10-20 | 凌云UI 1.0.30：`lingyun-app-page` 支持全局 `tabs` 数据驱动，窄屏底部 Tab / 宽屏左侧导航自动切换；PC + tabs 时侧栏收窄为 84 窄栏（图标在上、文字在下），选中胶囊上下滑动；`lingyun-tabbars` 支持 `iconMode` |
| 2026-10-16 | 图表：新增地图 Demo / 文档（`type="map"`，省级简图） |
| 2026-10-15 | 凌云UI 1.0.26：Alert 支持 JS 调用 `uni.showLingyunAlert`；Popover 箭头定位重做、与面板融为一体，新增 `anchor`；表格宽屏筛选改为 Popover，分组可收起，加载遮罩覆盖整表 |
| 2026-10-15 | 图表 1.0.9：新增堆积图 `stack`（柱状原生；折线/曲线累加示例） |
| 2026-10-15 | 图表 1.0.8：新增曲线图 `curve` |
| 2026-10-15 | 图表 1.0.7：柱状图组间距与顶圆角；图例表上下布局拉满宽度 |
| 2026-10-15 | 页面 1.0.2：登录页默认隐藏顶栏（`showToolbar=false`） |
| 2026-10-15 | 凌云UI 1.0.25：表格筛选改为底部面板，支持多选、数字、文本、日期筛选；排序改用图标；列宽自动占满与 `fit` |
| 2026-10-15 | 凌云UI 1.0.23：表格支持分组 `group-fields` 自动求和 |
| 2026-10-15 | 凌云UI 1.0.22：表格支持紧凑布局 `size="compact"` |
| 2026-10-14 | 凌云UI 1.0.21：`mp-overlay-gate` 防图表 canvas 穿透浮层；分组内嵌表格贴边 |
| 2026-10-14 | 凌云UI 1.0.20：表格多端滚动与悬浮条 |
| 2026-10-13 | 凌云UI 1.0.18：新增 `lingyun-table`，分组卡片表格 |
| 2026-10-12 | 凌云UI 1.0.17：分组卡片默认不透明底；玻璃改为 `color="glass"`；内嵌列表时 header 以下与列表卡片一致 |
| 2026-10-10 | 凌云UI 1.0.16：头像支持 `shape` / `radius`，与图片同一套显示形式和圆角 |
| 2026-10-09 | 凌云UI 1.0.15：新增 `lingyun-row` / `lingyun-col`，24 分栏 |
| 2026-10-09 | 凌云UI 1.0.14：新增 `lingyun-mobile` / `lingyun-pc`，按窗口宽度 690 分窄屏与平板、电脑 |
| 2026-10-09 | 凌云UI 1.0.13：`lingyun-app-page` 可用 `showToolbar` 隐藏头部顶栏 |
| 2026-10-09 | 凌云UI 1.0.12：`lingyun-app-page` 可用 `showToolbar` 隐藏头部顶栏 |
| 2026-10-09 | 凌云UI 1.0.11：分组卡片 `headerLine` 可在标题和内容之间画横线 |
| 2026-10-09 | 凌云UI 1.0.10：宫格不传圆角时跟图片默认 `2xl`（26px） |
| 2026-10-09 | 凌云UI 1.0.9：分组卡片着色为系统色实底；卡片与图片默认圆角 `2xl`（26px）；宫格图片图标可设 `shape` / `radius` |
| 2026-10-09 | `lingyun-grid` 1.0.8：`iconSize` 按任意像素控制图标。专章 `GRID.md` |
| 2026-10-09 | `lingyun-grid` 1.0.7：微信空 `items` 仍走插槽；去掉宿主并用 flex-basis 分列宽。专章 `GRID.md` |
| 2026-09-22 | 新增 `lingyun-indexed-list`（索引列表 · 对齐 uni-indexed-list）；专章 `INDEXED_LIST.md` |
| 2026-09-22 | 新增 `lingyun-grid`（宫格 · 对齐 uni-grid）；专章 `GRID.md` |
| 2026-09-22 | 新增 `lingyun-goods-nav`（商品底栏 · 对齐 uni-goods-nav）；专章 `GOODS_NAV.md` |
| 2026-09-21 | `lingyun-ui-charts` 移入已完成；专章 `CHARTS.md`；系列色在包内 `config.ts` |
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

# 凌云UI 组件路线图

> 基线：P0/P1 已完成，约 70 个组件，图表 22 类，图片/文件上传已补齐。
> 原则：**业务价值优先** > HIG 完整性；优先复用现有底座；每个组件都必须 H5 + mp-weixin、Liquid Glass、TypeScript、`px`。
> 组件清单见 [`COMPONENTS.md`](./COMPONENTS.md)，UI 规范见 [`UI_SPEC.md`](./UI_SPEC.md)。

## 1. 现状与缺口

已覆盖：表单、反馈、导航、列表/表格、浮层、图表、上传、宽屏、Duo、主题、图片/文件处理。

缺口集中在四类：

1. **官方 P2 待做**：评分、内容层仪表盘、键盘工具栏。
2. **HIG 边缘控件**：顶部可滚动 Tabs、日历、Combobox、Token Field、Color Well、Tooltip、Banner、Accordion、分页、加载更多、Steps、Timeline。
3. **业务工作流**：签名、二维码/条码、门店/地址选择、流程步骤、订单轨迹、通知中心。
4. **数据密集/桌面**：Tree / TreeSelect、Transfer、富文本/Markdown。

## 2. 优先级总览

| 优先级 | 组件 | 业务价值 | 复用 / 依赖 | 工作量 |
|---|---|---|---|---|
| **P0 ✅** | `lingyun-tabs`（顶部可滚动 Tabs） | 极高：页面内多视图切换 | `scroll-view` + 现有图标/主题 | 中 |
| **P1 ✅** | `lingyun-signature` | 高：送货签收、门店确认 | Canvas（参考图片上传导出） | 中 |
| **P1 ✅** | `lingyun-calendar` | 高：配送日期、促销、生产排期 | 复用 `picker-cal-day` / `PICKERS` | 中高 |
| **P1 ✅** | `lingyun-steps` | 高：下单/生产/配送/审批流程 | `list` / `section` / `icon` | 低 |
| **P1 ✅** | `lingyun-timeline` | 高：订单轨迹、操作日志 | `list` / `section` / `icon` | 低 |
| P1 | `lingyun-location-picker` | 高：门店、收货地址 | `uni.chooseLocation`；H5 需地图 Key | 中 |
| **P1 ✅** | `lingyun-load-more` | 高：长列表加载更多 | `activity-indicator` | 低 |
| **P1 ✅** | `lingyun-pagination` | 中高：桌面表格/列表分页 | 从 `lingyun-table` 抽出 | 中 |
| **P1 ✅** | `lingyun-rating` | 中高：评价、满意度 | `lingyun-icon` | 低 |
| P1 | `lingyun-scan` / `lingyun-qrcode` / `lingyun-barcode` | 高：取货码、商品/批次码 | 扫码走 `uni.scanCode`；二维码需依赖或后端图片 | 中高 |
| P2 | `lingyun-tooltip` | 中：轻量说明 | 可扩展 `lingyun-popover` | 低 |
| P2 | `lingyun-banner` / `notice-bar` | 中：公告、表单提示 | `alert` 视觉，非模态 | 低 |
| P2 | `lingyun-accordion` | 中：折叠分组 | 扩展 `lingyun-list` / `section` | 低中 |
| P2 | `lingyun-combobox` | 中：可搜索选择 | `text-field` + `data-picker` | 中 |
| P2 | `lingyun-token-field` | 中：多选标签输入 | `chip` + `text-field` | 中 |
| P2 | `lingyun-color-well` | 中低：颜色配置 | 纯 UI + Canvas/色板 | 中 |
| P2 | `lingyun-keyboard-toolbar` | 中：输入附属栏 | 键盘高度 / `toolbars` | 中 |
| P2 | `lingyun-gauge` | 低中：内容层仪表盘 | Canvas（图表 gauge 已有） | 低中 |
| P3 | `lingyun-tree` / `tree-select` | 中：组织/门店/分类层级 | `checkbox` / `list` | 高 |
| P3 | `lingyun-transfer` | 中：角色/权限/门店分配 | `checkbox` / `list` | 中高 |
| P3 | Rich Text / Markdown | 中：公告、协议、知识库 | `rich-text`；Markdown 需依赖 | 中 |
| P3 | 通知中心 / 消息中心 | 中：订单状态、审批提醒 | 组合页面，不是单一控件 | 中 |
| P4 | 表单校验增强 | 高：schema / 异步 / 错误汇总 | `form` 基础 | 中 |
| P4 | 无障碍 / i18n | 持续 | 组件 + 文档 | 持续 |
| P4 | 测试 / 视觉回归 / 真机抽检 | 持续 | 无 | 持续 |

## 3. 批次计划

### 批次 1 · P0（已完成）

`lingyun-tabs`：顶部可滚动 Tabs + 内容插槽。先交付，解决页面内多视图切换。

### 批次 2 · P1（流程与确认）

`lingyun-signature`（已完成）→ `lingyun-steps`（已完成）→ `lingyun-timeline`（已完成）→ `lingyun-rating`（已完成）。

### 批次 3 · P1（时间与长列表）

`lingyun-calendar`（已完成）→ `lingyun-load-more`（已完成）→ `lingyun-pagination`（已完成）。

### 批次 4 · P1（码与位置）

`lingyun-scan` → `lingyun-qrcode` / `lingyun-barcode` → `lingyun-location-picker`。

> 批次 4 开始前需要确认：二维码生成用前端依赖还是后端图片；H5 定位/地图用哪家 Key。

### 批次 5 · P2（HIG / 表单增强）

`lingyun-tooltip` → `lingyun-banner` → `lingyun-accordion` → `lingyun-combobox` → `lingyun-token-field` → `lingyun-color-well` → `lingyun-keyboard-toolbar` → `lingyun-gauge`。

### 批次 6 · P3（数据密集）

`lingyun-tree` / `tree-select` → `lingyun-transfer` → Rich Text / Markdown → 通知中心。

### 持续 · P4（质量）

表单校验增强、无障碍、i18n、单测/视觉回归、暗黑与玻璃真机抽检。

## 4. P0 详细方案：`lingyun-tabs`（已完成）

### 4.1 定位

顶部可滚动的 Tab View：横向 Tab 栏 + 内容插槽。用于订单状态、商品分类、工作台分组等页面内切换。

### 4.2 API 草案

```ts
interface LingyunTabItem {
  key: string
  text: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

props:
  modelValue: string            // 当前 key
  items: LingyunTabItem[]
  variant: 'underline' | 'pill' // 默认 underline
  scrollable: boolean           // 默认 true；内容溢出时横向滚动
  sticky: boolean               // 默认 false；吸顶
  align: 'start' | 'center'     // 默认 start
  showIndicator: boolean        // 默认 true；滑动指示条
  safeArea: boolean             // 默认 false；底部安全区
  zIndex: number

emits:
  update:modelValue
  change({ key, item, index })

slots:
  default scoped { activeKey, activeItem, activeIndex }  // 内容由业务按 activeKey 渲染
  prefix / suffix                                        // Tab 栏两侧附加

methods:
  scrollToKey(key)
  select(key)
```

### 4.3 交互与样式

- `scroll-view scroll-x` + 行内 Tab；按激活 Tab 中心计算 `scroll-left`，让左右两侧都保留可见 Tab。
- 默认 underline：底部 2px 系统蓝滑动指示条；`pill`：玻璃胶囊选中态。
- 激活 Tab 自动居中滚动，左右两侧保留可见 Tab；禁用 Tab 不响应。
- 支持 badge、icon；文字单行省略。
- 吸顶时使用 `lingyun-glass-surface` 玻璃栏；非吸顶为内容层标准材质。
- 内容通过 scoped slot 交给业务；业务可用 `v-if` 或 `lingyun-swiper` 做切换。
- 全部 `px`，WXSS class 选择器，无 `rpx`；H5/微信一致。

### 4.4 交付物

- `src/uni_modules/lingyun-ui/components/lingyun-tabs/lingyun-tabs.vue`
- `src/pages/demo/tabs.vue` + `pages.json` / `pageNav.ts` / `pageTabs.ts`
- `design/TABS.md` + `design/pages/demo/tabs.md`
- `doc/components/tabs.md` + `doc/components/README.md` + `doc/.vuepress/config.ts`
- `design/COMPONENTS.md` 状态行、`lingyun-ui/readme.md` / `changelog.md`（发布时）

### 4.5 验收

- 3 / 10 / 20 个 Tab：溢出横向滚动、激活自动滚入、无抖动。
- underline / pill 两种形态；禁用、badge、icon。
- 吸顶/不吸顶；暗黑；安全区。
- H5 + 微信小程序编译与模拟器截图。
- `pnpm type-check`、`pnpm build:mp-weixin`。

## 5. 关键决策点

- **二维码生成**：前端 QR 依赖（需征询）还是后端返回图片。扫码本身走 `uni.scanCode`，不需要依赖。
- **H5 位置/地图**：需要地图服务 Key 与 SDK 选型；微信端可直接 `uni.chooseLocation`。
- **富文本/Markdown**：Markdown 解析需要第三方依赖；`rich-text` 可直接用，但标签能力有限。
- **键盘工具栏**：键盘高度、输入法差异需要真机验证。
- **表单校验**：是否引入 schema 校验库需要单独决策。

## 6. 交付约定

每个组件按 `AGENTS.md`：

1. 设计专章 + 设计页。
2. 组件在 `lingyun-ui/components/`，TypeScript，`px`，Liquid Glass。
3. demo 页 + 导航 + 文档 + 组件清单。
4. `pnpm type-check`、`pnpm build:mp-weixin`、H5 验收。
5. 版本与 `changelog.md` 单独发布提交。

# design/ 设计目录规则

> 本目录存放产品/UI 设计稿。  
> **两条硬规则同时生效：**  
> 1）路径必须与源码页面/组件一一对应；  
> 2）**UI 必须严格执行苹果最新 Liquid Glass（见 [`UI_SPEC.md`](./UI_SPEC.md)）**——凌云UI 全部组件与本目录设计稿均不得例外。

## 0. UI 风格（Hard · 始终遵守）

- 唯一视觉语言：**Apple Liquid Glass（液态玻璃）**
- 完整条款 → **[`UI_SPEC.md`](./UI_SPEC.md)**
- **色彩专章** → **[`COLORS.md`](./COLORS.md)**（Sketch System Colors + 语义补齐）
- **按钮专章** → **[`BUTTONS.md`](./BUTTONS.md)**（Sketch iOS 27 UI Kit Buttons）
- **图标专章** → **[`ICONS.md`](./ICONS.md)**（`lingyun-icon` 字体图标）
- **Tab Bars 专章** → **[`TABBARS.md`](./TABBARS.md)**（Sketch iOS 27 UI Kit Tab Bars）
- **Search Bars 专章** → **[`SEARCHBARS.md`](./SEARCHBARS.md)**（Sketch Search Selected - Placeholder）
- **Lists 专章** → **[`LISTS.md`](./LISTS.md)**（Sketch Lists · Grouped）
- **Swipe Actions 专章** → **[`SWIPE_ACTIONS.md`](./SWIPE_ACTIONS.md)**（Sketch Rows with Swipe Actions）
- **Alerts 专章** → **[`ALERTS.md`](./ALERTS.md)**（Sketch Alerts/Light）
- **Badges 专章** → **[`BADGES.md`](./BADGES.md)**（Sketch App Icons / Badge）
- **Segmented Controls 专章** → **[`SEGMENTED_CONTROLS.md`](./SEGMENTED_CONTROLS.md)**（Sketch Segmented Controls）
- **Toolbars 专章** → **[`TOOLBARS.md`](./TOOLBARS.md)**（Sketch Toolbars/Light/iPhone）
- **Sheets 专章** → **[`SHEETS.md`](./SHEETS.md)**（Sketch Sheets Light/Dark/iPhone）
- **Sidebar 专章** → **[`SIDEBARS.md`](./SIDEBARS.md)**（Sketch Sidebar 画板）
- **Action Sheets 专章** → **[`ACTIONSHEETS.md`](./ACTIONSHEETS.md)**（HIG Action Sheets + Liquid Glass）
- **Activity Views 专章** → **[`ACTIVITY_VIEWS.md`](./ACTIVITY_VIEWS.md)**（Sketch Activity Views · 分享面板）
- **Activity / Toast·HUD / Progress / Empty / Picker / Switch** → [`ACTIVITY_INDICATORS.md`](./ACTIVITY_INDICATORS.md) · [`TOASTS.md`](./TOASTS.md) · [`PROGRESS.md`](./PROGRESS.md) · [`EMPTY.md`](./EMPTY.md) · [`PICKERS.md`](./PICKERS.md) · [`SWITCHES.md`](./SWITCHES.md)
- **P1：Checks / Slider / Tags / Avatars / Page Control / Skeleton / Refresh / Popovers / Menus** → [`CHECKS.md`](./CHECKS.md) · [`SLIDERS.md`](./SLIDERS.md) · [`TAGS.md`](./TAGS.md) · [`AVATARS.md`](./AVATARS.md) · [`PAGE_CONTROLS.md`](./PAGE_CONTROLS.md) · [`SKELETONS.md`](./SKELETONS.md) · [`REFRESH.md`](./REFRESH.md) · [`POPOVERS.md`](./POPOVERS.md) · [`MENUS.md`](./MENUS.md)
- **Text Fields 专章** → **[`TEXTFIELDS.md`](./TEXTFIELDS.md)**（Sketch Text Field Light/Dark）
- **Text 专章** → **[`TEXTS.md`](./TEXTS.md)**（HIG Text Styles · Labels）
- **Image 专章** → **[`IMAGES.md`](./IMAGES.md)**（懒加载 · 占位 · 圆角 · mode）
- **Forms 专章** → **[`FORMS.md`](./FORMS.md)**（Grouped 表单容器）
- **组件清单与规划** → **[`COMPONENTS.md`](./COMPONENTS.md)**（已完成 / P0–P2）
- Cursor 规则：`.cursor/rules/liquid-glass-ui.mdc`（`alwaysApply: true`）
- 实现 token：`src/uni_modules/lingyun-ui/styles/setting/_system-colors.scss`、`_glass.scss`
- **尺寸单位**：Sketch **1pt = 1px**；设计标注与实现一律 `px`，❌ 禁止 `rpx`

未按 Liquid Glass 交付的设计稿 / 凌云UI 组件视为不合格。

## 1. 路径对应（Hard rule）

设计文件相对 `design/` 的路径，必须等于源码相对 `src/` 的路径（仅扩展名不同）。

| 源码 | 设计稿 |
|------|--------|
| `src/pages/<path>/<name>.vue` | `design/pages/<path>/<name>.<设计扩展名>` |
| `src/components/<path>/<name>.vue` | `design/components/<path>/<name>.<设计扩展名>` |

### 示例

| 源码 | 设计稿 |
|------|--------|
| `src/pages/index/index.vue` | `design/pages/index/index.pen` |
| `src/pages/user/profile.vue` | `design/pages/user/profile.pen` |
| `src/components/user/Avatar.vue` | `design/components/user/Avatar.pen` |

同一逻辑单元可有多个设计附属文件，但仍须落在对应目录下，并以源码文件名为前缀：

```
design/pages/index/
├── index.pen           # 主稿（与 index.vue 对应）
├── index.empty.pen     # 可选：空态等变体
└── index.md            # 可选：设计说明 / 标注
```

## 2. 目录职责

```
design/
├── README.md           # 路径规则（本文件）
├── UI_SPEC.md          # Liquid Glass UI 强制规范
├── COLORS.md           # 苹果 System Colors（Sketch）专章
├── BUTTONS.md          # 苹果官方 Buttons（Sketch）专章
├── ICONS.md            # lingyun-icon 图标字体专章
├── TABBARS.md          # 苹果官方 Tab Bars（Sketch）专章
├── SEARCHBARS.md       # 底部玻璃搜索条（Sketch Search Selected）专章
├── LISTS.md            # 分组列表（Sketch Lists · Grouped）专章
├── ALERTS.md           # 弹窗（Sketch Alerts/Light）专章
├── BADGES.md           # 角标（Sketch App Icons / Badge）专章
├── SEGMENTED_CONTROLS.md # 分段控件专章
├── TOOLBARS.md         # 顶栏工具栏（Sketch Toolbars/Light/iPhone）专章
├── SHEETS.md           # 底部 Modal Sheet（Sketch Sheets）专章
├── SIDEBARS.md         # 悬浮玻璃侧栏（Sketch Sidebar）专章
├── ACTIONSHEETS.md     # 底部操作列表（Action Sheets）专章
├── ACTIVITY_VIEWS.md   # 分享面板（Activity Views）专章
├── ACTIVITY_INDICATORS.md
├── TOASTS.md
├── PROGRESS.md
├── EMPTY.md
├── PICKERS.md
├── SWITCHES.md
├── CHECKS.md
├── SLIDERS.md
├── TAGS.md
├── AVATARS.md
├── PAGE_CONTROLS.md
├── SKELETONS.md
├── REFRESH.md
├── POPOVERS.md
├── MENUS.md
├── TEXTFIELDS.md       # 输入框（Sketch Text Fields）专章
├── TEXTS.md            # 语义文本（HIG Text Styles）专章
├── IMAGES.md           # 图片包装（懒加载 / 圆角 / mode）专章
├── FORMS.md            # 表单容器（Grouped form / item）
├── COMPONENTS.md       # 凌云UI 组件清单与规划
├── pages/              # ↔ src/pages/
└── components/         # ↔ src/components/
```

- **只**为业务页面、业务组件建设计稿。
- **不要**为 `uni_modules`、`utils`、`api`、`stores`、`router` 等建设计目录（lingyun 组件视觉以 `UI_SPEC.md` + 代码为准）。
- 源码尚无对应文件时，可先建设计目录与稿件；落地实现时路径必须对齐，不得另起一套命名。

## 3. 文件约定

- 主设计稿扩展名优先：`.pen`（Pencil）、或团队约定的其它设计格式；确定后全项目保持一致。
- 主稿文件名 = 对应 `.vue` 的主文件名（不含扩展名）。
- 设计说明、切图清单等旁路文档放在同级目录，勿堆到无关路径。
- 设计稿随仓库版本管理；大二进制若需例外，先征询后再改 `.gitignore`。
- 设计稿须体现玻璃分层、高光、模糊与圆角，禁止交付纯实心扁平目标态。

## 4. 工作流

1. **新增页面/组件**：先（或同时）在 `design/` 下按对应路径创建设计稿目录；源码落在 `src/pages` 或 `src/components` 的同相对路径。
2. **改 UI**：先打开/更新对应设计稿并对照 `UI_SPEC.md`，再改 `.vue`。
3. **重命名/移动源码**：必须同步重命名/移动设计目录与文件，保持映射不断裂。
4. **删除源码**：同步删除或归档对应设计文件，避免孤儿稿。

## 5. 红线

- ❌ 禁止偏离 Liquid Glass（见 `UI_SPEC.md`）。
- ❌ 禁止在设计标注或实现中使用 `rpx`（见 `UI_SPEC.md` §6.1）。
- ❌ 禁止把设计稿堆在 `design/` 根目录或扁平杂目录（如 `design/杂项/`、`design/new/`）。
- ❌ 禁止设计路径与源码路径不一致（例如源码在 `pages/user/`，设计却在 `design/pages/mine/`）。
- ❌ 禁止用拼音缩写、中文目录名、日期前缀等破坏映射（如 `design/pages/20260315-首页/`）。
- ❌ 禁止为 `src/uni_modules/**` 建镜像设计目录。
- ❌ 禁止改设计规则却不更新本文件、`UI_SPEC.md` 与根目录 `AGENTS.md` / `.cursor/rules/liquid-glass-ui.mdc`。

## 6. Agent / 协作者自检

- [ ] 已阅读并对照 `UI_SPEC.md` Liquid Glass 清单
- [ ] 尺寸标注为 pt/px（1pt = 1px），未使用 rpx
- [ ] 新建设计稿路径是否满足 `design/<pages|components>/…` ↔ `src/<pages|components>/…`
- [ ] 主文件名是否与对应 `.vue` 一致
- [ ] 若移动了页面/组件，设计侧是否已同步
- [ ] 未给 `uni_modules` 等非 UI 业务目录建稿

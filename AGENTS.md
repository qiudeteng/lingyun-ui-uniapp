# AGENTS.md

> 本仓库 AI agent 工作规约。动手改代码前先读本文件；提交说明另见根目录 `.cursorrules`。

## 1. 项目速览

| 项 | 值 |
|---|---|
| 类型 | uni-app（Vue 3 + TypeScript + Vite）多端应用 |
| 包管理 | pnpm |
| UI | 第三方：`src/uni_modules` 的 uni-ui；自研：`src/uni_modules/lingyun-ui`；图表引擎：`src/uni_modules/lingyun-ui-charts`（fork uCharts，独立于凌云UI 单包） |
| 设计 | `design/`（路径见 `design/README.md`；UI 强制 Liquid Glass 见 `UI_SPEC.md`；清单见 `COMPONENTS.md`；专章含 BUTTONS / … / IMAGES / **CHARTS** / **GOODS_NAV** / **GRID** / **INDEXED_LIST** / CHECKS / … + Sketch） |
| 状态 | Pinia + `pinia-plugin-persistedstate` |
| 路由 | `@meng-xi/uni-router`（`generateRouter` 由 `pages.json` 生成） |
| 请求 | `src/utils/request.ts`（`uni.request` 封装） |
| 目标端 | **微信小程序为硬门禁**；另含 H5 / 其它小程序 / App（脚本见 `package.json`） |
| TypeScript | 双安装：`@typescript/native` = TS 7；`typescript` = `@typescript/typescript6`（供 `vue-tsc`） |
| 交流语言 | 对用户用简体中文；标识符用英文 |

## 2. 工作流总则

1. **先对齐现状再改**。改前读相关文件与本规约；不要假设存在 Flutter 结构。
2. **必须兼容微信小程序**。所有自研与业务代码以 `mp-weixin` 可编译、可运行为硬门禁；不得只在 H5 验证。详见 §5、Cursor 规则 `mp-weixin-compat.mdc`。
3. **UI 始终遵守 Liquid Glass**。任何设计稿 / `lingyun-ui` 组件改动前读 `design/UI_SPEC.md`（Cursor 规则 `liquid-glass-ui.mdc` 始终加载）。
4. **小步改动**。一次只做一件事；大范围重构前先征询用户。
5. **类型检查要过**。涉及 TS / Vue 的改动结束前跑 `pnpm type-check`（必要时再跑 `pnpm type-check:native`）。
6. **路径别名**。源码用 `@/*` → `src/*`（见 `tsconfig.json`）；勿再引入已废弃的 `baseUrl`。
7. **Windows**。命令按 PowerShell 书写；路径与 shell 语法考虑 Windows。

## 3. 目录速记

```
├── index.html              # H5 入口，脚本须为 /src/main.ts
├── vite.config.ts          # vite-plugin-uni + generateRouter
├── env.d.ts                # *.vue / vite/client 类型
├── package.json
├── design/                 # 设计稿 + UI 规范（同时是 VuePress 文档站源目录）
│   ├── UI_SPEC.md / COLORS.md / BUTTONS.md / TABBARS.md / SEARCHBARS.md / LISTS.md / ALERTS.md / BADGES.md / SEGMENTED_CONTROLS.md / TOOLBARS.md / SHEETS.md / ACTIONSHEETS.md / TEXTFIELDS.md / TEXTS.md / COMPONENTS.md
│   ├── .vuepress/          # 文档站配置（非设计稿，勿按设计目录规则清理）
│   ├── pages/              # ↔ src/pages/
│   └── components/         # ↔ src/components/
├── src/
│   ├── main.ts             # createSSRApp + Pinia + router
│   ├── App.vue
│   ├── pages.json          # 页面注册（路由源）
│   ├── manifest.json       # 应用配置
│   ├── uni.scss
│   ├── uni_modules/        # 插件：uni-*（第三方）+ 凌云UI + lingyun-ui-charts
│   ├── pages/              # 页面（路径与 pages.json 一致）
│   ├── components/         # 业务组件（与 design/components 路径对应；不含 lingyun-*）
│   ├── api/                # 接口按域拆分，走 utils/request
│   ├── stores/             # Pinia store
│   ├── router/             # 路由实例与守卫
│   ├── router.config.ts    # 由 pages.json 生成，业务变更优先改 pages.json
│   └── utils/              # auth、request 等通用工具
└── AGENTS.md
```

### 3.1 凌云UI（自研组件，对齐 uni-list）

```
src/uni_modules/lingyun-ui/
├── styles/                         # 样式底座（fork uni-scss → lingyun-*）
│   ├── index.scss / variables.scss / theme.scss
│   └── setting/ …
├── package.json
├── readme.md
├── changelog.md
└── components/
    ├── lingyun-button/lingyun-button.vue
    ├── lingyun-tabbars/lingyun-tabbars.vue
    ├── lingyun-search-bar/lingyun-search-bar.vue
    ├── lingyun-list/lingyun-list.vue
    ├── lingyun-list-item/lingyun-list-item.vue
    ├── lingyun-alert/lingyun-alert.vue
 ├── lingyun-badge/lingyun-badge.vue
 ├── lingyun-segmented-control/lingyun-segmented-control.vue
 ├── lingyun-toolbars/lingyun-toolbars.vue
 ├── lingyun-sheets/lingyun-sheets.vue
 ├── lingyun-action-sheet/lingyun-action-sheet.vue
 ├── lingyun-activity-indicator/lingyun-activity-indicator.vue
 ├── lingyun-toast/lingyun-toast.vue
 ├── lingyun-hud/lingyun-hud.vue
 ├── lingyun-progress/lingyun-progress.vue
 ├── lingyun-empty/lingyun-empty.vue
 ├── lingyun-picker/lingyun-picker.vue
 ├── lingyun-switch/lingyun-switch.vue
 ├── lingyun-stepper/lingyun-stepper.vue
 ├── lingyun-text-field/lingyun-text-field.vue
 ├── lingyun-app-page/lingyun-app-page.vue
 ├── lingyun-section/lingyun-section.vue
 └── lingyun-xxx/lingyun-xxx.vue
```

- 所有 `lingyun-*` **只能**放在 `lingyun-ui/components/` 下，目录名 = 文件名。
- 组件样式统一依赖 `lingyun-ui/styles` 的 `$lingyun-*` / `$lingyun-glass-*`，并符合 `design/UI_SPEC.md`。
- 尺寸一律 **`px`**（Sketch **1pt = 1px**）。❌ 禁止 `rpx`。
- ❌ 禁止再建 `uni_modules/lingyun-xxx` 独立包；❌ 禁止放到 `src/components/`。
- 详细规范：`src/uni_modules/lingyun-ui/readme.md`、`styles/README.md`、`design/UI_SPEC.md`、`design/TABBARS.md`、`design/LISTS.md`、`design/ALERTS.md`、`design/BADGES.md`、`design/SEGMENTED_CONTROLS.md`、`design/TOOLBARS.md`、`design/SHEETS.md`、`design/ACTIONSHEETS.md`、`design/TEXTFIELDS.md`、`design/TEXTS.md`、`design/IMAGES.md`、`design/CHARTS.md`、`design/GOODS_NAV.md`、`design/GRID.md`、`design/INDEXED_LIST.md`、`.cursor/rules/liquid-glass-ui.mdc`、`.cursor/rules/mp-weixin-compat.mdc`。

## 4. 命令速查（Windows PowerShell）

```powershell
pnpm install
pnpm dev                 # H5 开发
pnpm dev:mp-weixin       # 微信小程序
pnpm build:h5
pnpm type-check          # vue-tsc（推荐日常用）
pnpm type-check:native   # TS 7 原生 tsc
pnpm docs:dev            # design/ 设计规范文档站（VuePress，:5174）
pnpm docs:build          # 文档站静态产物 → design/.vuepress/dist
```

> 文档站搜索在 dev 模式下依赖 Service Worker，仅 `localhost` 可用（局域网裸 HTTP 非安全上下文）；要在手机上验搜索请用 `docs:build` 后的产物。

## 5. 红线（Hard rules）

- ❌ **不要交付无法在微信小程序编译/运行的代码**。`mp-weixin` 为硬门禁；样式须符合 WXSS（禁止通用选择器 `*` 等），模板/API 走 uni-app 多端能力，不得只靠 H5。详见 Cursor 规则 `mp-weixin-compat.mdc`；验证用 `pnpm dev:mp-weixin` + 微信开发者工具。
- ❌ 不要手改 `node_modules`；不要提交 `node_modules`、`dist`、`unpackage`、`.env*`（见 `.gitignore`）。
- ❌ 不要在页面里散落裸 `uni.request`；统一走 `src/utils/request.ts`，接口放 `src/api/`。
- ❌ 不要绕过 Pinia 用全局可变单例做业务状态；需要持久化用官方 persist 插件约定。
- ❌ 不要只改 `router.config.ts` 却不同步 `pages.json`（生成关系以 `pages.json` 为准）。
- ❌ 不要把 `index.html` 入口改回 `/main.ts`；必须是 `/src/main.ts`。
- ❌ 不要单独把 `typescript` 升到纯 `^7` 而去掉 typescript6 别名——会弄坏 `vue-tsc`（除非用户明确要求并接受改 type-check 方案）。
- ❌ 不要用 npm 安装 `@dcloudio/uni-ui`；uni-ui 只通过 `src/uni_modules` 安装与维护。
- ❌ 不要把 `lingyun-*` 建成独立 `uni_modules` 包或放进 `src/components/`；一律进 `src/uni_modules/lingyun-ui/components/`（对齐 `uni-list`）。**例外**：图表引擎包 `lingyun-ui-charts`（fork uCharts，含 js_sdk / ECharts 运行时）。
- ❌ 不要破坏设计路径映射：`design/pages|components/...` 必须与 `src/pages|components/...` 同相对路径（详见 `design/README.md`）。
- ❌ 不要把设计稿堆在 `design/` 根目录或与源码无关的目录名下。
- ❌ 不要让 凌云UI 或设计稿偏离 Apple Liquid Glass（详见 `design/UI_SPEC.md`）。
- ❌ 不要在自研样式（`lingyun-ui`、`src/pages`、`src/components`、`src/uni.scss`）里使用 `rpx`；尺寸一律 `px`，与 Sketch **1pt = 1px**。第三方 `uni-*` 不强行改。
- ❌ **业务侧禁止新增 JavaScript**。`src/pages` / `components` / `api` / `stores` / `utils` / `router` / `config` 以及 `App.vue` / `main.ts` 必须用 TypeScript（`.ts` 或 `<script setup lang="ts">`）；从旧项目搬代码也要改写成 TS。详见 Cursor 规则 `business-typescript.mdc`。
- ❌ **不要把扩展里的 JS 改成 TS**。`src/uni_modules/`（`uni-*`、`lingyun-ui`）保持现有语言；尤其不要动第三方 `uni-*` 源码，renderjs 必须 `.js`。
- ❌ 不要引入第二套 UI / 状态 / 请求栈，除非用户明确要求。
- ❌ 不要在未征询用户时改 `package.json` 核心依赖大版本、或改动本文件 / `.cursorrules` / `design/README.md` / `design/UI_SPEC.md` / `lingyun-ui/readme.md` 的约定本身。

## 6. 约定（应做）

- 新页面：在 `src/pages/<name>/` 加页面，并登记到 `pages.json`；对应设计稿放 `design/pages/<name>/`。
- 新业务组件：放 `src/components/...`；对应设计稿放 `design/components/...` 同相对路径。
- 新自研 UI：放 `src/uni_modules/lingyun-ui/components/lingyun-<name>/lingyun-<name>.vue`，样式用 `$lingyun-glass-*` / `$lingyun-*`、**`px`（禁止 `rpx`）** 并符合 Liquid Glass，更新该包 `readme.md` / `changelog.md`。
- 新接口：`src/api/<domain>.ts` 导出函数，内部调用 `request`。
- 新状态：`src/stores/<name>.ts`，在需要处 `useXxxStore()`。
- **业务代码用 TypeScript**：页面 / 业务组件 / api / stores / utils / router / config 一律 `.ts`（Vue 用 `lang="ts"`），禁止业务侧新增 `.js`。扩展（`uni_modules`）不要为「全量 TS」改语言。
- 鉴权相关读写 token：走 `src/utils/auth.ts`。
- 第三方 UI：在 `src/uni_modules` 按需安装（如 `uni-icons`、`uni-list`）；页面内直接用标签，依赖 easycom。
- 样式：全局 `uni.scss`；自研扩展用 `lingyun-ui/styles/`（含 `_glass.scss`）；uni-ui 主题见 `uni_modules/uni-scss`（二者前缀隔离）。自研与业务样式尺寸一律 **`px`**，禁止 `rpx`。
- 设计：先读 `design/UI_SPEC.md` + `design/README.md`；移动/重命名页面或组件时同步移动设计文件。
- **Git 提交说明**：严格按根目录 `.cursorrules`（简体中文 + 全角冒号 + 任务清单；禁止 Conventional Commits）。

## 7. 不确定就问

出现以下情况先问用户，不要自行拍板：

- 新增依赖（含 devDependencies）
- 调整路由/多端发布策略或改 `manifest.json` 关键项
- 更换状态管理、请求层，或改回 npm 方式安装 UI
- 修改 TypeScript 双安装方案或 `type-check` 脚本
- 单次改动预期超过约 400 行 diff

## 8. 自检清单（结束工作前）

- [ ] 改动与本仓库技术栈一致（uni-app / Vue3 / TS）
- [ ] **业务侧为 TypeScript**（未新增 `src/pages|components|api|stores|utils|router|config` 下的 `.js`）；未把 `uni_modules` 扩展 JS 改成 TS
- [ ] **微信小程序兼容**：涉及 UI/样式/模板/API 的改动可通过 `pnpm dev:mp-weixin` 编译，WXSS 无 `*` 等非法选择器，微信开发者工具无编译报错（见 `mp-weixin-compat.mdc`）
- [ ] `pnpm type-check` 通过
- [ ] 新页面已写入 `pages.json`；入口 HTML 仍为 `/src/main.ts`
- [ ] UI 来自 `src/uni_modules`，未重新引入 `@dcloudio/uni-ui`
- [ ] 新增 / 修改 UI 已对照 `design/UI_SPEC.md` Liquid Glass 自检清单（含 **§6.2 注意事项**：玻璃 mixin 选型、插槽样式、列表分割线、暗黑）；图表对照 `design/CHARTS.md`
- [ ] 自研样式尺寸为 `px`（1pt = 1px），未使用 `rpx`
- [ ] 新增 `lingyun-*` 时已放在 `lingyun-ui/components/`（非独立包、非 `src/components`）
- [ ] 若涉及设计稿：路径与 `src/pages` / `src/components` 保持对应（见 `design/README.md`）
- [ ] 请求走 `utils/request`，状态走 Pinia
- [ ] 未误提交密钥、`.env`、构建产物
- [ ] 若用户要求提交：commit message 符合 `.cursorrules`

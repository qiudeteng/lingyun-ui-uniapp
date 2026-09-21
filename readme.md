# 凌云UI

凌云UI 组件库（`uni_modules` 单包多组件）。当前版本 **1.0.0**，变更见 [`changelog.md`](./changelog.md)。

📖 <a href="https://lingyun.xinyicanyin.com/" target="_blank">使用手册</a>（组件用法、属性、示例；右侧手机框实时预览）

**UI 风格强制：Apple Liquid Glass** → 仓库 [`design/UI_SPEC.md`](design/UI_SPEC.md)  
**主题色强制：System Colors** → [`design/COLORS.md`](design/COLORS.md) · [Sketch](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/color-variables?g=System%2520Colors)  
**外观**：浅色 / 暗黑 / 跟随系统，业务侧用 `useThemeStore()`（`src/stores/theme.ts`）

页面直接写 `lingyun-*` 标签，走 easycom，不必逐个 `import`。

## 接入

`createApp` 里先挂 Pinia，再挂本包。Toast / HUD，以及 H5 宽屏侧栏，都从这里注册。

```ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { lingyunUi } from '@/uni_modules/lingyun-ui'

export function createApp() {
	const app = createSSRApp(App)
	app.use(createPinia())
	app.use(lingyunUi)
	return { app }
}
```

业务页用 `lingyun-app-page` 当壳（自定义顶栏、滚动玻璃、反馈宿主）。含输入框的页面保持默认页面级滚动，见 [`design/TEXTFIELDS.md`](design/TEXTFIELDS.md) §5。

```vue
<lingyun-app-page title="Home" :show-back="false">
  <!-- 正文 -->
</lingyun-app-page>
```

命令式反馈（无需 import，页面须在 `lingyun-app-page` 内）：

```ts
uni.showLingyunToast({ text: 'Saved', type: 'success' })
uni.showLingyunHud('Loading…')
uni.hideLingyunHud()
```

## 宽屏

窗口宽度 **≥ 700** 时，页面左侧停靠导航，宽 **220**。折叠屏展开（如 717×781）走这一档；手机竖屏仍是单栏。顶栏和内容区跟随 `--lingyun-page-nav-width`，不会压住导航。

| 端         | 行为                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| H5         | `app.use(lingyunUi)` 把侧栏挂到 `body`，只创建一次。换页不闪，滚动位置保持 |
| 微信小程序 | 侧栏留在 `lingyun-app-page` 里。换页记住选中项和滚动位置                   |

关掉某一页：`<lingyun-app-page :show-nav="false">`。Sheet / 带 Grabber 的页不显示这列。

默认目录来自业务工程 `src/router/pageNav.ts`（与首页列表共用）。要换目录，传 `nav-sections`。

```vue
<lingyun-app-page title="订单" :nav-sections="sections" />
```

## 硬规则

1. **所有 `lingyun-*` 组件只放在本包下**，路径固定为 `components/<组件名>/<组件名>.vue`。
2. **禁止**再建 `src/uni_modules/lingyun-xxx` 独立插件包。
3. **禁止**把 `lingyun-*` 放到 `src/components/`。
4. 目录与文件名必须一致，便于 easycom 自动扫描。
5. **样式扩展统一走 `styles/`**；控件层必须使用 `$lingyun-glass-*`，禁止组件内私造第二套模糊参数。选型见 `src/uni_modules/lingyun-ui/styles/README.md` 与 `design/UI_SPEC.md` §6.2：
   - 透底控件 / Toolbar / **一切浮层面板（Alert / Sheet / Toast / HUD / Action Sheet…）** → `@include lingyun-glass-surface`（+ 全端 blur；见 UI_SPEC §6.2-A.1）
   - 仅极端无遮罩实霜浮层 → `@include lingyun-glass-regular`
6. **尺寸一律 `px`**（Sketch **1pt = 1px**）。❌ 禁止 `rpx`。
7. **必须兼容微信小程序（`mp-weixin`）**：样式须通过 WXSS 编译（禁止通用选择器 `*` 等）；不得只在 H5 验证。见仓库 `.cursor/rules/mp-weixin-compat.mdc` 与 `AGENTS.md`。
8. 每个组件交付前对照 `design/UI_SPEC.md` §8 自检清单（含 §6.2）。

## 目录

```
src/uni_modules/lingyun-ui/
├── package.json          # 1.0.0
├── readme.md
├── changelog.md
├── index.ts              # app.use(lingyunUi)
├── utils/feedback.ts     # uni.showLingyunToast / Hud
├── styles/               # variables、theme、Liquid Glass mixin
└── components/
    ├── lingyun-app-page/ # 页面壳；宽屏时为左侧导航留位
    ├── lingyun-page-nav/ # 宽屏目录。H5 挂载见 mountLingyunPageNav.ts
    ├── lingyun-toolbars/
    ├── lingyun-fab/
    └── lingyun-*/        # 其余组件：目录名 = 文件名
```

新增组件：在 `src/uni_modules/lingyun-ui/components/` 下建 `lingyun-<name>/lingyun-<name>.vue`，样式走 `src/uni_modules/lingyun-ui/styles/`，并更新本文件与 `changelog.md`。

## 示例

```vue
<lingyun-button variant="glass" size="large" text="Continue" @click="onSubmit" />
<lingyun-button variant="borderedProminent" text="Save" />
<lingyun-button variant="glass" role="destructive" text="Delete" />

<lingyun-fab
	:content="[
		{ icon: 'compose', text: '新建' },
		{ icon: 'camera', text: '拍照' }
	]"
	@trigger="onFab" />

<lingyun-toolbars title="Title" @back="onBack" />
<lingyun-toolbars placement="sheet" title="Title" @close="onClose" />
<lingyun-toolbars title-style="large" title="Title" />

<lingyun-sheets v-model:show="open" title="Sheet" detent="medium">
  <view>内容</view>
</lingyun-sheets>

<lingyun-action-sheet v-model:show="asOpen" title="Select an option" :actions="[{ text: 'Edit' }, { text: 'Delete', role: 'destructive' }]" @action="onAction" />

<lingyun-activity-view
	v-model:show="shareOpen"
	detent="half"
	title="Title"
	:contacts="[{ name: 'Ashley Kamin', badge: 'chat' }]"
	:apps="[{ name: 'Messages', icon: 'chat', color: '#34c759' }]"
	:groups="[{ actions: [{ text: 'Copy', icon: 'paperclip' }] }]"
	@select="onShare" />

<lingyun-alert
	v-model:show="visible"
	title="A Short Title Is Best"
	message="A message should be a short, complete sentence."
	:actions="[
		{ text: 'Secondary', role: 'cancel' },
		{ text: 'Primary', primary: true }
	]"
	@action="onAction" />

<lingyun-sidebar v-model:show="open" v-model:current="key" title="Library" :sections="sections" />

<lingyun-form-item name="name" label="姓名">
  <lingyun-text-field v-model="form.name" placeholder="请输入" />
</lingyun-form-item>
<lingyun-text-field v-model="name" label="Name" placeholder="Placeholder" clearable />
<lingyun-text-field v-model="pwd" label="Password" secure />

<lingyun-list header="Header" header-type="extraProminent" footer="Footer">
  <lingyun-list-item title="Title" note="Subtitle" />
  <lingyun-list-item title="Title" detail="Detail" accessory="disclosure" />
  <lingyun-list-item title="Title" accessory="toggle" v-model:switch-checked="on" />
</lingyun-list>

<lingyun-swipe-action>
  <lingyun-swipe-action-item
    :right-options="[
      { text: 'Flag', role: 'orange' },
      { text: 'Delete', role: 'destructive' },
    ]"
    @click="onSwipe"
  >
    <lingyun-list-item title="Inbox" detail="12" accessory="disclosure" />
  </lingyun-swipe-action-item>
</lingyun-swipe-action>

<lingyun-tabbars
	v-model="current"
	:items="[
		{ key: 'home', text: 'Home', icon: '⌂' },
		{ key: 'search', role: 'search' }
	]" />
<lingyun-search-bar v-model="query" placeholder="Search" @confirm="onSearch" />
<lingyun-segmented-control v-model="current" :items="['Day', 'Week', 'Month', 'Year']" />

<lingyun-badge text="247" />
<lingyun-badge color="green" text="3" />
<lingyun-badge dot />
<lingyun-activity-indicator size="large" />
<lingyun-progress :percent="40" show-info />
<lingyun-empty variant="plain" title="No Notes" description="Start by adding a note." />

<lingyun-section title="Variant" hint="Sketch Style">
  <view class="lingyun-section-row">
    <lingyun-button variant="glass" text="Glass" />
  </view>
</lingyun-section>
```

## 规范

按钮：[`design/BUTTONS.md`](design/BUTTONS.md) · [Sketch Buttons](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons)

Tab Bars：[`design/TABBARS.md`](design/TABBARS.md) · [Sketch Tab Bars](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars)

Search Bar：[`design/SEARCHBARS.md`](design/SEARCHBARS.md) · [Sketch Search Selected](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/C46C53EC-096C-448D-94FC-AB949829C87E#Inspect)

Lists：[`design/LISTS.md`](design/LISTS.md) · [Sketch Lists · Grouped](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect)

Swipe Actions：[`design/SWIPE_ACTIONS.md`](design/SWIPE_ACTIONS.md) ·
[Sketch Rows with Swipe Actions](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions)

Toolbars：[`design/TOOLBARS.md`](design/TOOLBARS.md) · [Sketch Toolbars/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone)

Sheets：[`design/SHEETS.md`](design/SHEETS.md) · [Sketch Sheets/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FLight%252FiPhone) ·
[Sheets/Dark/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FDark%252FiPhone)

Text Fields：[`design/TEXTFIELDS.md`](design/TEXTFIELDS.md) · [Sketch Text Field Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/39D95D27-DDDF-4750-8ECE-18FF32FEC086#Inspect) ·
[Text Field Dark](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/CEBB1E12-74F7-4BF8-949D-3696FCFF4351#Inspect)

Alerts：[`design/ALERTS.md`](design/ALERTS.md) · [Sketch Alerts/Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight) ·
[Alerts/Dark](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FDark)

Badges：[`design/BADGES.md`](design/BADGES.md) · [Sketch App Icons / Badge](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4FE3C0D6-2F3E-4203-A201-C708AFA8AC55#Inspect)

Segmented Controls：[`design/SEGMENTED_CONTROLS.md`](design/SEGMENTED_CONTROLS.md) · [Sketch Segmented Controls](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls) ·
[Dark/Large](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls%252FDark%252FLarge)

Sidebar：[`design/SIDEBARS.md`](design/SIDEBARS.md)

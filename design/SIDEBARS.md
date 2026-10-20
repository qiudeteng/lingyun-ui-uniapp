# Sidebar 规范（强制 · lingyun-sidebar）

> 对齐 [Sketch Sidebar 画板](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/C28B7233-F267-4266-849D-30DBBFBDA772/canvas#Inspect) 与 [HIG · Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)。  
> 侧栏浮在内容之上，属 **Liquid Glass 导航层**，不是整页分栏壳。

## 权威来源

1. **Sketch · Sidebar（本页）**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/C28B7233-F267-4266-849D-30DBBFBDA772/canvas#Inspect
2. **HIG · Sidebars**  
   https://developer.apple.com/design/human-interface-guidelines/sidebars
3. **Liquid Glass**  
   [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) · [`UI_SPEC.md`](./UI_SPEC.md) §6.2-A.1

---

## 1. 形态（1pt = 1px）

| 项 | 约定 |
|----|------|
| 形态 | 从 leading（默认）或 trailing 滑入的悬浮列；背后内容留出约 **56** 可窥见 |
| 宽 | `min(320, 屏宽 − 8 − 56)`，且 ≥ 240 |
| 内缩 | `lingyun-app-page` 内：顶 = 状态栏 + Toolbar + **8**，避开微信胶囊；独立使用时降级为状态栏 + **8**。底 = 安全区 + **8**；贴边侧 **8** |
| 圆角 | 四角 **34** |
| 材质 | `lingyun-glass-surface` + `#fff`@**0.72** / 暗黑 `#1a1a1a`@0.7 + 全端 blur |
| 遮罩 | 与 Sheet 同：`--lingyun-mask` |
| 行 | 高 **44**；左右外边距 **8**；选中圆角 **12**；Fill `rgba(120,120,128,0.16)` |
| 图标 | **22**；与标题间距 **12** |
| 标题 | **22 / 28** semibold |
| 分组头 | **13 / 18** secondary |
| 动效 | 与 Sheet 同曲线：入场 **0.42s**、退场 **0.24s**；玻璃节点不用 `opacity` 显隐 |
| 挂载 | H5 `Teleport`→`body`；mp `root-portal`；根自挂 `theme-*` |

❌ `lingyun-sidebar` 不做：跟手拖拽关闭、与 Tab Bar 互变、把本浮层当成持久分栏。

窗口 **≥ 690** 时的持久左侧导航见下文 §4。窄屏不出现。顶栏 `left` 使用 `--lingyun-page-nav-width`。

---

## 2. API

```vue
<lingyun-sidebar
  v-model:show="open"
  v-model:current="key"
  title="Library"
  placement="leading"
  :sections="sections"
  @select="onSelect"
/>
```

```js
const sections = [
  {
    title: 'Library',
    items: [
      { key: 'home', label: 'Home', icon: 'home' },
      { key: 'inbox', label: 'Inbox', icon: 'email', badge: '3' },
    ],
  },
]
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `show` / `modelValue` | — | 是否打开 |
| `current` | `''` | 选中项 `key` |
| `title` | `''` | 顶标题；也可用 `#header` |
| `sections` | `[]` | `{ title?, items[] }` |
| `items` | `[]` | 无分组时的扁平行 |
| `placement` | `leading` | `leading` / `trailing` |
| `maskClosable` | `true` | 点遮罩关闭 |
| `closeOnSelect` | `true` | 选中后关闭 |
| `zIndex` | `1300` | 浮层层级 |

`items[]`：`key`、`label`、`icon`（`lingyun-icon` type）、`badge`、`disabled`。

事件：`select` → `{ key, item, index }`；`close`；`update:show` / `update:modelValue` / `update:current`。

插槽：`header`、`footer`、默认插槽（自定义正文，有插槽时仍可同时渲染 `sections`）。

---

## 3. 自检

- [ ] 玻璃按 §6.2-A.1；无 `opacity` 显隐
- [ ] Teleport / root-portal；自挂 `theme-*`
- [ ] 移动端面板顶端位于 Toolbar / 微信胶囊下方
- [ ] 选中为圆角填充，不是整行实心蓝
- [ ] 浅色 / 暗黑；微信小程序可编译

---

## 4. 持久左侧导航（lingyun-page-nav）

窗口 **≥ 690** 时停靠在页面左侧，完整宽 **220**，分组实底；配置全局 tabs 后收窄为 **84** 浮动玻璃窄栏（见下）。折叠屏内屏（如 OPPO Find **692**、常见 **717×781**）因此是左导航、右内容。H5 上这一列挂在 `body`，只创建一次，不随页面 `redirectTo` 销毁，所以换页不闪、滚动停在原地。微信小程序没有页面外的常驻节点，同一列嵌在 `lingyun-app-page` 里，滚动位置记在内存里，新页面挂上时再写回去。点选 `redirectTo`（无转场）换页，当前路由高亮。点到未注册页面会打开 404，高亮仍停在点中的那一项。目录与首页列表共用 `src/router/pageNav.ts`。页面可传 `:show-nav="false"` 关闭这一列。

### 窄栏（iPad/PC + 全局 tabs）

窗口 **≥ 690** 且配置了全局 tabs 时，这一列收窄为 **84** 悬浮玻璃窄栏：

- 整列为通高悬浮玻璃栏，四周各留 **8**、圆角 **28**，不是分组实底；页面背景从玻璃下方透出。
- 页面内容背景通过左侧安全区铺满整屏：页面壳自动让内容首子承接安全区；内容根节点不是首子或一页多个根节点时，给对应节点加 `.lingyun-page-safe-left`。也可以直接把背景配在 `lingyun-app-page` 根节点。
- 图标 **24** 在上、标签 **11 / 14** 在下，单项高 **60**，左右外边距 **12**（项宽 **60**）。
- 选中胶囊宽 **60**、圆角 **12**，在菜单项之间上下滑动。
- 顶部只保留头像（有头像时）或品牌首字；名称、副标题、门店选择器隐藏。
- 未配置 tabs 时仍为 **220** 行布局；iPad 与 PC 同档。

### iPhone Duo 右侧全高栏（lingyun-duo-rail）

- 外屏竖屏：右侧 **84** 宽；padding `24 / 24 / 24 / 12`，gap 8；顶部摄像头保留 42 + 状态 83 + 工具组 **48×164**；下部 Tab 组 **48×210**（4×48，gap 2）+ 搜索 **48**。
- 外屏横屏：顶部「…」溢出 **48**；Tab 组 + 搜索；摄像头保留在底部 **48×42**。
- 内屏横屏：状态 83 + 工具组 **48×164**；Tab 组 + 搜索；顶部工具栏隐藏。
- 选中胶囊 **44×58**，在 Tab 之间上下滑动；Tab 仅图标，选中系统蓝 `#0088ff`。
- Tab 最多 **4** 个；更多入口由页面或「…」溢出处理。
- 内屏横屏折叠/半折：Split View，左主栏 **456**、折痕避让带 **40**、右详情栏 **371**、右侧返回列 **84**；顶部 84 工具栏，Tab 隐藏。

### 顶部

栏身至少与内容顶栏同高（宽屏 **54**），上下各 **8**。已登录且有授权门店时，左侧是 **52** 圆角矩形头像（圆角 **12**），右侧标题 **17 / 22** semibold，标题下是 `user_type_text`（**13 / 18** secondary）。头像、名称与下方门店选择器的左右边距都是 **8**，与菜单行对齐。门店胶囊宽度固定为这一行的内容宽，不随店名伸缩。门店名 **15 / 20** regular，单行，放不下时末尾省略。胶囊底是 Gray 5（浅色 `#E5E5EA`，暗黑 `#2C2C2E`），文字与箭头用 Label。右侧保留上下箭头。点开后是门店滚轮，滚轮下方可按门店名搜索，选中后写入全局 `useUserStore()` 的 `storeId`。没有门店数据时仍用名称 **15 / 20**，副标题 **13 / 18** secondary。头像与右侧这一组垂直居中。Mac 窗口按钮仍在这一栏左侧。

默认名称「凌云UI」。未再传入名称时，副标题为「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。传入自定义名称且不传副标题时，不显示这句介绍。当前门店来自 `fetchUserAuthStores`，选中项在 `storeId` / `storeInfo` / `storeName`，页面直接读这些字段就会随切换更新。

| 来源 | 作用 |
|------|------|
| `lingyun-app-page` 插槽 `nav-avatar` / `nav-name` / `nav-subtitle` | 当前页顶部。可只传其中一部分。H5 送进 `body` 上的侧栏；微信嵌在当前页。离开该页后恢复 |
| `setLingyunPageNavProfile({ avatar, name, subtitle })` | 全局默认头像、名称、副标题。插槽盖过对应的一项 |
| `useUserStore().selectStore(id)` | 切换当前门店。`storeId`、`storeInfo`、`storeName` 同步更新 |
| `setLingyunPageNavSections` | 全局菜单。H5 侧栏与首页目录都读这份 |
| `setLingyunPageConfig({ tabs })` | 全局一级导航。窄屏同一份数据渲染底部 Tab，宽屏渲染这一列；优先级高于 `setLingyunPageNavSections`。支持 `badge` 与 `match`，使用时隐藏内置「首页」行 |
| `:nav-sections` | 只覆盖当前页的微信内嵌列 |

切换时选中胶囊在菜单项之间做 **280ms** 上下滑动（Fill Secondary 背景）；右侧内容块做 **240ms** 淡入，页面背景（含左侧安全区）保持稳定、不参与渐变。H5 与小程序常驻宿主切换共用这一套过渡。

- [ ] 有门店时：圆角矩形头像 + 标题，标题下是用户类型；门店胶囊浅色 Gray 5、暗黑 Gray 5，文字为 Label
- [ ] 胶囊文案是当前选中门店，单行，过长时末尾省略；滚轮下方可搜索，选中后全局 `storeId` 更新
- [ ] 无门店数据时名称 15 / 20，副标题在名称下
- [ ] 默认介绍单行省略；自定义名称且无副标题时不显示默认介绍

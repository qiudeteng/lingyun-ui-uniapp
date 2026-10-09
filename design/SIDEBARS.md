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
| 内缩 | 顶 = 状态栏 + **8**；底 = 安全区 + **8**；贴边侧 **8** |
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

窗口 **≥ 700** 时的持久左侧导航见下文 §4。窄屏不出现。顶栏 `left` 使用 `--lingyun-page-nav-width`。

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
- [ ] 选中为圆角填充，不是整行实心蓝
- [ ] 浅色 / 暗黑；微信小程序可编译

---

## 4. 持久左侧导航（lingyun-page-nav）

窗口 **≥ 700** 时停靠在页面左侧，宽 **220**，分组实底。折叠屏内屏（如 **717×781**）因此是左导航、右内容。H5 上这一列挂在 `body`，只创建一次，不随页面 `redirectTo` 销毁，所以换页不闪、滚动停在原地。微信小程序没有页面外的常驻节点，同一列嵌在 `lingyun-app-page` 里，滚动位置记在内存里，新页面挂上时再写回去。点选 `redirectTo`（无转场）换页，当前路由高亮。目录与首页列表共用 `src/router/pageNav.ts`。页面可传 `:show-nav="false"` 关闭这一列。

### 顶部

栏身至少与内容顶栏同高（宽屏 **54**），上下各 **8**。已登录且有授权门店时，左侧是 **52** 圆角矩形头像（圆角 **12**），右侧标题 **17 / 22** semibold。标题下是黑色胶囊：人员图标、当前门店名、上下箭头。点胶囊弹出菜单，选中项打勾，并写入全局 `useUserStore()` 的 `storeId`。没有门店数据时仍用名称 **15 / 20**，副标题 **13 / 18** secondary。头像与右侧这一组垂直居中。Mac 窗口按钮仍在这一栏左侧。

默认名称「凌云UI」。未再传入名称时，副标题为「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。传入自定义名称且不传副标题时，不显示这句介绍。当前门店来自 `fetchUserAuthStores`，选中项在 `storeId` / `storeInfo` / `storeName`，页面直接读这些字段就会随切换更新。

| 来源 | 作用 |
|------|------|
| `lingyun-app-page` 插槽 `nav-avatar` / `nav-name` / `nav-subtitle` | 当前页顶部。可只传其中一部分。H5 送进 `body` 上的侧栏；微信嵌在当前页。离开该页后恢复 |
| `setLingyunPageNavProfile({ avatar, name, subtitle })` | 全局默认头像、名称、副标题。插槽盖过对应的一项 |
| `useUserStore().selectStore(id)` | 切换当前门店。`storeId`、`storeInfo`、`storeName` 同步更新 |
| `setLingyunPageNavSections` | 全局菜单。H5 侧栏与首页目录都读这份 |
| `:nav-sections` | 只覆盖当前页的微信内嵌列 |

- [ ] 有门店时：圆角矩形头像 + 标题 + 黑色门店胶囊
- [ ] 胶囊文案是当前选中门店，菜单选中后全局 `storeId` 更新
- [ ] 无门店数据时名称 15 / 20，副标题在名称下
- [ ] 默认介绍单行省略；自定义名称且无副标题时不显示默认介绍

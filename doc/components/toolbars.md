# lingyun-toolbars

顶栏。放在 `lingyun-app-page` 里时不用再写一份；单独用在自定义布局或 Sheet 里。搜索 / 分段 / 综合示例见 `pages/demo/toolbar-search`、`pages/demo/toolbar-segments`、`pages/demo/toolbar-comprehensive`。

## 示例

```vue
<lingyun-toolbars title="标题" @back="onBack" />
<lingyun-toolbars title-style="large" title="大标题" />
<lingyun-toolbars placement="sheet" title="Sheet" @close="onClose" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `subtitle` | 副标题。本栏 `subtitlePicker` 打开时忽略 | '' |
| `subtitlePicker` | 副标题位置显示全局选择器。默认关。详见下文「副标题选择器」 | false |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `placement` | `standard` 或 `sheet` | standard |
| `showBack` | 返回。`auto` 按场景决定 | auto |
| `showClose` | 关闭 | auto |
| `showGrabber` | 抓手 | auto |
| `showTrailing` | 右侧按钮 | true |
| `trailingButtons` | 右侧自定义按钮组；`{ key, icon?, label?, disabled? }[]` 为一组，二维数组按组渲染多个胶囊 | [] |
| `trailingButtonsHidden` | 隐藏数据驱动的按钮组；页面打开自己的锚点浮层时使用 | false |
| `trailingMenuEnabled` | 显式启用 `#trailing-menu` 内置浮层；小程序必须开启 | false |
| `showThemeSwitch` | 主题钮开关；`auto` 跟随全局，`false` 只隐藏当前 toolbar | auto |
| `searchable` | 开启顶部搜索：右侧多一个独立分组搜索按钮 | false |
| `searching` | 搜索模式；输入框替换左侧内容，原搜索按钮变取消 | false |
| `searchValue` | 搜索关键词 | '' |
| `searchPlaceholder` | 搜索占位文案 | 搜索 |
| `segments` | 顶栏下方数据驱动控件数据 `{ key, text?, icon?, badge?, disabled? }[]`；为空不占高度 | [] |
| `segmentValue` | 当前控件 key | '' |
| `segmentControl` | `segmented` / `tabs`；同一份 `segments` 数据渲染成分段控件或顶部 Tabs | segmented |
| `fixed` | 固定在视口顶部。页面壳里会设为 true | false |
| `safeArea` | 加上状态栏高度 | true |
| `avoidCapsule` | 右侧微信胶囊避让；分栏 pane 里不是整宽 toolbar 时设为 false，只保留状态栏 | true |
| `glassProgress` | 0 到 1，玻璃从透明到铺满 | 0 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 返回 |
| `close` | 关闭 |
| `trailing` | 默认右侧按钮 |
| `trailing-action` | 自定义按钮组点击，参数 `{ key, button, index, groupIndex, buttonIndex, anchor }` |
| `update:searching` | 搜索模式变化 |
| `update:searchValue` | 搜索关键词变化 |
| `search-open` | 点搜索按钮 |
| `search-cancel` | 点取消按钮，参数为当前关键词 |
| `search-input` | 输入变化，参数为当前关键词 |
| `search` | 键盘确认搜索，参数为当前关键词 |
| `update:segmentValue` | 分段值变化 |
| `segment-click` | 点击分段项，参数 `{ value, item }` |
| `segment-change` | 分段切换，参数 `{ value, item }` |

`trailingButtons` 支持一维 / 二维数组：一维是一组，二维按子数组拆成多个玻璃胶囊。单个按钮是 44×44 圆钮，多个是 36×36 + gap 18 的胶囊组。点击后发 `trailing-action`，`anchor` 是**按钮组**的视口矩形（整组会隐藏，菜单按组右上角对齐），可直接作为 `lingyun-menu` 的 `anchor` 打开自定义浮层；如果设置 `trailing-menu-enabled` 并传入 `#trailing-menu="{ button, index, groupIndex, buttonIndex, close }"` 插槽，也会自动在按钮组下方弹出自定义菜单内容。主题钮菜单同样按第一组右上角定位。

## 副标题选择器

副标题位置可以换成一个全站共用的选择器：显示当前项，点击弹出 `lingyun-picker`（取消 / 完成，可带搜索）。组件不认「门店」这类业务，也不请求数据。名单由使用方传成 `{ value, label }[]`，门店只是其中一种。

顶栏**没有** `change` 事件。数据入口和页面监听是两件事，不要混在一个回调里。

从 `@/uni_modules/lingyun-ui` 引入：`setLingyunToolbarPicker`、`setLingyunToolbarPickerValue`、`setLingyunToolbarPickerEnabled`、`lingyunToolbarPicker`。

### 谁负责什么

| 角色 | 做什么 | 不要做 |
| --- | --- | --- |
| 持有名单的地方（登录后的用户数据，不是页面） | 名单请求成功后再 `setLingyunToolbarPicker` | 启动时、登录页、每个页面各注入一次 |
| 需要显示的页面 | 顶栏设 `subtitle-picker`，用 `picker-value` 在进入页面时拿当前值 | 在页面里再传 `onChange`，或自己查名单 |
| 不需要的页面 | 什么都不用写。默认关 | 给每个顶栏写 `subtitle-picker="false"` |

`onChange` 全站只有一个。页面里再传，会把登录时登记的回调盖掉。它适合「记住当前选择」（例如把当前门店写入登录态）。页面要跟着刷新自己的列表时，监听响应式的当前值。

### 在哪里注入、什么时候注入

名单属于登录后的用户数据。登录之前没有这份数据，所以不要在下面这些时机注入：

| 时机 | 为什么不行 |
| --- | --- |
| `main.ts`、`configureLingyunUi`、应用刚启动 | 还没有登录，接口也还没发 |
| 登录页打开、登录按钮点击 | 同上 |
| 登录接口刚返回、token 刚写入 | 只有会话，名单请求还没回来。本仓库里这是 `auth` 的 `applySession`，它接着才调 `userStore.refreshData()` |
| 每个业务页的 `onLoad` / `onShow` | 会重复查询，后进入的页面还会盖掉 `onChange` |

注入点放在**已经负责拉取并保存这份名单的地方**，并且等请求成功之后。组件包不能引用宿主的 `@/stores`，所以这段代码写在宿主里，不要写进 `lingyun-ui`。

本仓库的门店名单在 `src/stores/user.ts`：`refreshData()` 会在登录成功后调用 `getUserStoreList`，列表写入 `storeList` 并 `ensureSelectedStore()` 之后，才是第一次有数据的时刻。在这个 `then` 里注入一次。权限变化后如果再次拉到名单，只更新 `options` 和当前值，不要重新传入 `onChange`。

```ts
import { setLingyunToolbarPicker, setLingyunToolbarPickerValue } from '@/uni_modules/lingyun-ui'

function publishToolbarPicker(): void {
  const options = storeOptions.value.map((item) => ({
    value: item.store_id,
    label: item.store_name,
  }))
  setLingyunToolbarPicker({
    title: '选择门店',
    placeholder: '请选择',
    searchPlaceholder: '搜索门店',
    options,
    // 已有缓存时这个 value 不会盖掉上次选中的门店，见下文
    value: storeId.value,
    onChange: (value) => selectStore(value),
  })
}
```

`getUserStoreList` 成功并选好当前门店后调用 `publishToolbarPicker()`。之后用户在顶栏里改选，走 `onChange` → `selectStore`，登录态里的当前门店跟着变。页面如果本来就在看 `storeId`，不必再听选择器。

名单和当前项由组件写入本地存储，键名 `lingyun-toolbar-picker`。冷启动先读出上次选中的项，重新进入应用仍然选中它。宿主不用自己再存一份。缓存里没有 `onChange`，回调仍要在名单请求成功时登记一次。

当前项不跟着登录走。小程序会自动登录，如果每次登录都把当前项改成接口给的默认门店，用户可能在错误的门店下单。`setLingyunToolbarPicker` 即使带了 `value`，只要缓存里的项还在新名单中，就保持缓存，并在传入值不同时用缓存项再调用一次 `onChange`，把业务侧的当前门店拉回来。只有缓存项已经不在新名单里，才改成本次传入且仍在名单中的值，否则用第一项。用户在选择器里点「完成」，或调用 `setLingyunToolbarPickerValue`，才会主动改选并写入缓存。

退出登录时清空名单，当前项一并清掉。下次登录没有缓存，才会采用当时传入的 `value`。

空值检查只发生在**打开了选择器的那一栏**。没写 `subtitle-picker` 的页面不读这个值，也不会被提示或返回。打开之后：当前值是空或对不上名单时改成第一项并写入缓存，已登记的 `onChange` 会接到这一项；一项都没有时才提示并返回。

还没有缓存时不要用空数组占位，否则会把「还没登录」写成一份空名单。退出登录（本仓库是 `clearUser`）时清掉，这次清空也会写入存储，下一个账号不会看到上一个人的名单：

```ts
setLingyunToolbarPicker({ options: [], value: null })
```

清的时候不要传新的 `onChange`。只改当前门店、名单没变时，用 `setLingyunToolbarPickerValue(storeId)`，例如其它入口调用了 `selectStore`。

### 写入名单（只传一次）

```ts
import { setLingyunToolbarPicker } from '@/uni_modules/lingyun-ui'

setLingyunToolbarPicker({
  title: '选择门店',
  placeholder: '请选择',
  searchPlaceholder: '搜索门店',
  options: stores.map((item) => ({ value: item.store_id, label: item.store_name })),
  value: currentStoreId,
  onChange: (value, option) => {
    // 用户点「完成」之后才会进这里。value 是选中项的 value，option 是 { value, label }
    saveCurrentStore(value)
  },
})
```

不传的字段保持原样。只换名单时 `setLingyunToolbarPicker({ options })`，不要把 `onChange` 再传一遍。不要在自动登录里调用 `setLingyunToolbarPickerValue` 去「同步当前门店」，那会绕过缓存、改掉用户上次的选择。

弹出层标题用 `title`。`searchable` 默认 `true`，关掉后选择器里没有搜索框。

打开了选择器的页面如果名单是空的（一项都没有），顶栏弹出「没有可选项」，确定后返回上一页。同一时刻只提示一次。已经是页面栈的第一页时无法返回，只留下这次提示。没开选择器的页面不会弹。退出登录若已经离开该页，不会再弹。

### 打开某一栏

三个组件都有 `subtitlePicker`，默认 `false`。写成布尔属性即可：

```vue
<!-- 普通页：页面壳的顶栏 -->
<lingyun-app-page subtitle-picker title="订货" />

<!-- 单独使用的顶栏 -->
<lingyun-toolbars subtitle-picker title-style="title2Line" title="调拨单" />

<!-- 分栏：左栏要、右栏不要。两栏都打开时显示同一个当前项 -->
<lingyun-split-toolbar subtitle-picker title="订货单" />
<lingyun-split-toolbar title="订货单详情" />
```

打开后，这一栏标题下显示「当前项 + 箭头」。该栏自己的 `subtitle`（属性或插槽）被忽略，其它没开的顶栏不受影响。单行标题会多出这一行，不必改成 `title2Line`。分栏顶栏是左对齐的两行标题，当前项出现在标题下面。

iPhone Duo 顶栏不走这套，设了 `subtitle-picker` 也不会出现。

### 页面进入时拿到当前值

只监听自己打开的那一栏。进入页面、之后每次再进入、以及用户点「完成」改选，都会收到 `picker-value`。第一个参数是当前值，第二个是 `{ value, label }`。有选项时这个值不会是空的。

```vue
<lingyun-app-page subtitle-picker title="订货" @picker-value="onPickerValue" />
```

```vue
<lingyun-split-toolbar subtitle-picker title="订货单" @picker-value="onPickerValue" />
```

```ts
function onPickerValue(value: string | number): void {
  loadPage(value)
}
```

没写 `subtitle-picker` 的页面不会收到这个事件，也不要在 `onShow` 里读 `lingyunToolbarPicker.value` 做本页逻辑。`onChange` 仍然只留给注入名单的地方。

### 其它两个函数

| 函数 | 作用 |
| --- | --- |
| `setLingyunToolbarPickerValue(value)` | 主动改当前项并写入缓存。自动登录不要调用 |
| `setLingyunToolbarPickerEnabled(false)` | 总开关。关掉后，已经写了 `subtitle-picker` 的顶栏也恢复副标题；名单和当前值还在。默认是开的，但顶栏仍要自己设 `subtitle-picker` 才显示 |

### 容易用错

- 顶栏默认关。不要为了「关掉」去改每一个页面。
- 页面不要调用 `setLingyunToolbarPicker({ onChange })`。进入页面用 `picker-value` 拿当前值。
- 不要在应用启动、登录页或登录接口刚返回时注入。那时还没有名单。等持有名单的请求成功后再写入，退出登录时清空。
- 换页不要重新查询名单。名单本身变了（例如权限变了）才再次传入 `options`。
- 同一页里嵌套的预览顶栏也会跟着显示。演示或不该出现的那一个不要设 `subtitle-picker`。
- `subtitle-picker="false"` 是关。要开就写 `subtitle-picker`，或 `:subtitle-picker="某个布尔值"`。

`segments` 会在 toolbar 下方渲染数据驱动控件：默认 `segmentControl="segmented"` 是 48 高 Large 分段控制、行高 56；`segmentControl="tabs"` 用 `lingyun-tabs` 渲染顶部 Tabs，Tabs 行 44 贴底，页面顶部额外留 8 间距（toolbar 栈 52）。两者共用同一份数据和事件，`segmentValue` 受控，切换发 `update:segmentValue`、`segment-click`、`segment-change`。搜索模式只让左侧输入框从右往左滑入，搜索/取消按钮位置固定不变，关闭时输入框反向滑出。

返回、关闭、分享都用 `lingyun-icon`。圆钮保持 **44**。返回是 `left`、字号 **28**；关闭是 `closeempty`、分享是 `upload`，字号都是 **26**。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/toolbars.vue -->

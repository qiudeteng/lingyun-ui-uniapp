# 接入

凌云UI 是一套 uni-app 组件。

## 安装到应用

先挂 Pinia，再挂组件库。顺序不能反，否则 Toast / HUD 没有状态。

```ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { lingyunUi } from '@/uni_modules/lingyun-ui'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  app.use(lingyunUi)
  return { app }
}
```

本仓库的 Pinia 在 `src/stores` 里创建，效果相同：先 `app.use(pinia)`，再 `app.use(lingyunUi)`。

## 页面壳

每个业务页用 `lingyun-app-page` 包住正文。它负责顶栏、滚动玻璃，以及 Toast / HUD 的宿主。

```vue
<lingyun-app-page title="首页" :show-back="false">
  <view>正文</view>
</lingyun-app-page>
```

有输入框的页面不要关闭页面级滚动（不要写 `:page-scroll="false"`）。

## 宽屏

窗口宽度达到 **700** 时，左侧出现宽 **220** 的导航，右侧是当前页。折叠屏展开（例如 717×781）会进入这个布局；手机竖屏不会。

- H5：`app.use(lingyunUi)` 时侧栏挂到 `body`，换页不会拆掉。
- 微信小程序：侧栏画在页面里，换页时记住滚动位置和选中项。

某一页不需要导航时：

```vue
<lingyun-app-page title="登录" :show-nav="false" />
```

左栏顶部默认是「凌云UI」，下面一行是「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。名称和右侧顶栏对齐，介绍超出一行会省略。

默认目录在 `src/router/pageNav.ts`。登录后把后台菜单和顶部资料写进来，宽屏左栏和首页目录都会跟着变：

```ts
import { setLingyunPageNavProfile, setLingyunPageNavSections } from '@/router/pageNav'

setLingyunPageNavSections(sections)
setLingyunPageNavProfile({
  avatar: user.avatar,
  name: user.name,
  subtitle: user.org,
})
```

某一页要换成自己的头像、名称或副标题时，用 `nav-avatar`、`nav-name`、`nav-subtitle`。插槽盖过上面的默认图片和文字。`:nav-sections` 只覆盖当前页的微信内嵌列，H5 侧栏读不到它。

## 屏幕

`app.use(lingyunUi)` 之后，模板里可以直接判断 `lingyun`。折叠、旋转或拉窗口时会更新。

| 字段 | 取值 | 含义 |
|------|------|------|
| `lingyun.screen` | `phone` / `pad` / `pc` | 当前窗口档。宽度 &lt; 700 为 phone，700–1199 为 pad，≥ 1200 为 pc |
| `lingyun.os` | `ios` / `android` / `harmony` / `windows` / `mac` | 操作系统。手机常见是 `ios`、`android` |
| `lingyun.device` | `phone` / `pad` / `pc` | 硬件类型。折叠展开不会把手机改成平板 |
| `lingyun.foldable` | `yes` / `no` | 是否折叠屏 |
| `lingyun.fold` | `folded` / `expanded` / `half` / `''` | 折叠、展开、半折叠。不是折叠屏时为空串 |

```vue
<view v-if="lingyun.os == 'ios'">iOS 布局</view>
<view v-else-if="lingyun.fold == 'expanded'">折叠屏已展开</view>
<view v-else-if="lingyun.device == 'pad'">平板布局</view>
```

`<script setup>` 中：

```ts
import { lingyun } from '@/uni_modules/lingyun-ui'
```

非页面代码用 `uni.lingyun`。微信没有折叠状态接口：常见折叠屏按机型识别；内屏接近正方形，或同一次使用里短边明显拉开，也会记为折叠屏。半折叠（`half`）只在窗口明显只占一半，或内屏变成宽而扁时能判断出来。

## 手册里的手机预览

组件文档在宽窗口右侧有一个手机框，画面是对应的演示页，可以直接点。框下方可在「手机」（390×844）和「宽屏」（717×781）之间切换。本地写文档时需要同时开着 `pnpm dev`（默认 http://localhost:5173）；线上手册会自动指向演示站 `https://demo.xinyicanyin.com`（hash 模式）。窗口窄于 1180 时不显示，避免挡住正文。宽屏目录和页面壳默认用宽屏视口，才能看到左侧导航。

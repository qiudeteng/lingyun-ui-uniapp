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

默认目录在业务工程的 `src/router/pageNav.ts`。要换成自己的菜单，把分组传给 `nav-sections`。

## 手册里的手机预览

组件文档在宽窗口右侧有一个手机框，画面是对应的演示页，可以直接点。框下方可在「手机」（390×844）和「宽屏」（717×781）之间切换。本地写文档时需要同时开着 `pnpm dev`（默认 http://localhost:5173）；线上手册会自动指向演示站 `https://demo.xinyicanyin.com`（hash 模式）。窗口窄于 1180 时不显示，避免挡住正文。宽屏目录和页面壳默认用宽屏视口，才能看到左侧导航。

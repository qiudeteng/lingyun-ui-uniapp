# design/pages/demo/demo

对应源码：`src/pages/demo/demo.vue`

组件库入口。目录固定为 `src/config/pageTabs.ts` 的 `DEMO_PAGE_TABS`（与首页、底部 Tab / 工作台共用），不跟登录后的业务菜单走。该页在 `PUBLIC_PATHS` 的 `/pages/demo/*` 下，不要求登录。

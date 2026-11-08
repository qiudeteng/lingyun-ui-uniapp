# Banner Demo

对应页面：`src/pages/demo/banner.vue`

## 区块

1. `hero`：标题 Banner + 说明「营销横幅 · 图片 / 卡片 · 标题 / 操作 / 关闭」。
2. `图片横幅`：图片 + 标题 / 说明 / 操作 / 关闭，overlay=bottom。
3. `卡片横幅`：无图片，主色操作。
4. `自定义内容`：默认插槽放角标与两行文字，overlay=full。
5. `禁用`：disabled。
6. `最近操作`：click / action / close。

## 规范

- 组件规格见 [`BANNERS.md`](../../BANNERS.md)。
- 图片使用 Unsplash，微信真机需配置 downloadFile 域名或在开发者工具关闭校验。

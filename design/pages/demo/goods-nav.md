# design/pages/demo/goods-nav

对应源码：`src/pages/demo/goods-nav.vue`

展示 `lingyun-goods-nav` 的 **cart 变体**：悬浮玻璃胶囊 + 购物车圆钮（数量角标）+ 合计 / 配送费 + 蓝色结算钮，效果与 `lingyun-order-goods` 底部购物车一致。

- 页面按钮可加购或清空，验证有商品 / 空车 / 未达起送价三种状态
- 购物车圆钮和结算分别抛 `cart` / `checkout`
- 默认变体（左侧图标入口 + 右侧按钮组）仍保留，规范见 [`GOODS_NAV.md`](../../GOODS_NAV.md)

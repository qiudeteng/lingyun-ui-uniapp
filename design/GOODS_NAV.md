# Goods Nav 规范（强制 · lingyun-goods-nav）

> 商品详情底栏。结构对齐 `uni-goods-nav`：左侧图标入口 + 右侧主操作按钮组；`variant="cart"` 为点单页购物车结算栏。  
> 视觉必须是 Liquid Glass，禁止原组件的白底实条 + 红橙渐变按钮。

## 权威来源

1. [`UI_SPEC.md`](./UI_SPEC.md) · [`BUTTONS.md`](./BUTTONS.md) · [`TABBARS.md`](./TABBARS.md) · [`BADGES.md`](./BADGES.md)
2. 对照源：`src/uni_modules/uni-goods-nav`（只保留结构，不保留视觉）

---

## 1. 尺寸（1pt = 1px，禁止 rpx）

| 区域 | px | 说明 |
|------|----|------|
| 整条内边距 | 8 / 16 / 8 / 8 | 上 / 右 / 下 / 左 |
| 左侧图标胶囊 | 高 54 | `lingyun-glass-control`，与 Tab 单项同档 |
| 图标 | 22 | `lingyun-icon` |
| 入口文案 | 10 / Semibold | Labels - Liquid Glass |
| 右侧按钮组 | 高 46 | 胶囊，与 Glass Large 按钮同高 |
| 按钮文案 | 15 / Semibold | 末项白字，其余系统蓝 |

贴底时 `left` 跟随 `--lingyun-page-nav-width`，宽屏不压住左侧导航。底部加上 `safeAreaInsets.bottom`。

## 2. 分层

- 左侧图标栏是 **控件玻璃**，不是实心白块。
- 右侧按钮是 **标准材质**（Bordered + Bordered Prominent），和玻璃栏并排，不把按钮再做成一层玻璃（避免 glass-on-glass）。
- 角标用 `lingyun-badge`（System Red），不要自绘红点。
- 禁止 `backgroundColor` 渐变、禁止 `#ff0000` 角标、禁止整条不透明白底。

默认两钮：前一钮 Bordered（浅蓝底 + 蓝字），末钮 Bordered Prominent（系统蓝实底 + 白字）。只有一钮时这一钮就是 Prominent。

## 3. API

```vue
<lingyun-goods-nav
  :options="[
    { icon: 'shop', text: '店铺' },
    { icon: 'cart', text: '购物车', info: 2 },
  ]"
  :button-group="[{ text: '加入购物车' }, { text: '立即购买' }]"
  @click="onOption"
  @button-click="onBuy"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `options` | `{ icon, text, info \| badge }` | 店铺 / 购物车 |
| `buttonGroup` | `{ text }`，末项为主操作 | 加入购物车 / 立即购买 |
| `fill` | 按钮组占满剩余宽度 | true |
| `fixed` | 贴底 | true |
| `safeArea` | 底部安全区 | true |

| 事件 | 载荷 |
|------|------|
| `click` | `{ index, content }` 左侧入口 |
| `buttonClick` | `{ index, content }` 右侧按钮 |

---

## 4. Cart 变体（`variant="cart"`）

点单页同款购物车结算栏，和 `lingyun-order-goods` 的底部购物车保持一致：

| 区域 | 规格 |
|------|------|
| 外层 | 悬浮玻璃胶囊：左右 12、底部 8 + 安全区，高 62，圆角 31，`lingyun-glass-control`；禁止实底白条 |
| 购物车钮 | 48 圆，主色（默认系统蓝）实心，`cart-filled` 24 白；距胶囊左侧和上下各 7（62 - 48 垂直居中），右上角 `lingyun-badge` 数量角标（左侧固定、数字变多向右伸展） |
| 合计 | `¥` 13 / 金额 22 Semibold，主文本色；下方 11/15 次要色显示「另需配送费¥x」或「共 n 件」 |
| 空车 | 「未选购商品」15 三级色 +「¥xx起送」11 次要色 |
| 结算钮 | 40 高、最小宽 104、圆角 20、主色实底白字；未达起送价置灰，文案为「¥xx起送」 |
| 宽屏 | `fixed` 时左边让开 `--lingyun-page-nav-width`，再加 12 外边距 |
| 反馈 | 购物车数量增加时，圆钮（含角标）做一次 0.4s 放大回弹，缩回原位；数量减少不触发 |

```vue
<lingyun-goods-nav
  variant="cart"
  :cart-count="2"
  :total="59.9"
  :min-price="20"
  :delivery-fee="5"
  @cart="openCart"
  @checkout="onCheckout"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `variant` | `default` / `cart` | default |
| `cartCount` | 购物车数量 | 0 |
| `total` | 合计金额 | 0 |
| `minPrice` / `deliveryFee` | 起送价 / 配送费 | 0 / 0 |
| `currency` / `checkoutText` / `emptyText` | 货币符号 / 结算文案 / 空车文案 | ¥ / 去结算 / 未选购商品 |
| `priceDecimals` / `accentColor` | 价格小数位 / 主色 | -1 / 系统蓝 |

| 事件 | 载荷 |
|------|------|
| `cart` | `{ count, total }` |
| `checkout` | `{ count, total, minPrice, deliveryFee }` |

---

## 5. Cart 详情（`detail`，强制）

点购物车 / 合计区域时，**整张购物车玻璃卡向上增高**，详情和购物车栏是同一张卡、同一个圆角轮廓，不是独立 Sheet / 弹窗：

| 项 | 规格 |
|----|------|
| 结构 | 一张连续玻璃卡：详情在上、购物车栏在下；关闭时就是 62 高的玻璃胶囊，展开后胶囊向上长高 |
| 尺寸 | 圆角 **31**（始终不变，强调是同一颗胶囊）；`lingyun-glass-surface` + 全端 blur；Light `#fff`@0.72，Dark `#1a1a1a`@0.7 |
| 详情顶栏 | 高约 48：左上角 36 玻璃圆钮关闭（`closeempty` 20），右侧 `#detail-header` 插槽（标题 / 件数 / 清空） |
| 详情内容 | `#detail` 插槽，位于顶栏下方，内部 `scroll-view`；默认随内容自动撑开，超过上限后内部滚动 |
| 高度上限 | 默认 = 视口高 − `detailTopGap`（默认 120）− 底部安全区 − 8 − 购物车栏 62，即详情顶部至少距屏幕顶部 120 |
| 动效 | 详情区域 `height: 0 → 目标高度`（`0.34s cubic-bezier(0.32, 0.72, 0, 1)`），整卡向上增高；购物车栏始终贴底 |
| 关闭 | 左上角关闭钮；点卡片外的遮罩（可见变暗）；点购物车 / 合计区域再次切换；购物车归零自动收起；点「去结算」先收起 |
| 结算钮 | 始终在卡片底部的购物车栏内，展开时不被遮罩覆盖，随时可点 |
| 遮罩 | 展开时铺满视口并变暗（`--lingyun-mask`：浅色 0.2 / 暗黑 0.48），拦截页面滚动与点击穿透；卡片内容与结算钮在遮罩之上。贴底时外层 fixed 根节点铺满视口、`pointer-events: none`，遮罩用 absolute 撑满，卡片固定在底部 |
| 端 | 不 teleport：卡片留在页面内，随页面隐藏；H5 / 小程序都用同一套 fixed 定位 |

```vue
<lingyun-goods-nav variant="cart" detail :cart-count="count" :total="total">
  <template #detail-header>
    <view class="cart-head">已选商品 · 共 3 件 <text class="cart-clear">清空</text></view>
  </template>
  <template #detail>
    <view class="cart-detail">…</view>
  </template>
</lingyun-goods-nav>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `detail` | 开启详情能力，点购物车让卡片向上增高 | false |
| `detailOpen` | 受控展开状态；不传由组件维护 | — |
| `detailHeight` | 详情区域固定高度 px（含顶栏）；0 按内容自动 | 0 |
| `detailMaxHeight` | 详情区域最大高度 px；0 按视口自动 | 0 |
| `detailTopGap` | 自动最大高度时距屏幕顶部保留 px | 120 |
| `detailVersion` | 详情内容版本；变化时重新测量高度 | '' |

| 方法 | 说明 |
|------|------|
| `openDetail({ height?, maxHeight?, topGap? })` | 打开详情，参数按次覆盖 |
| `closeDetail()` / `toggleDetail()` | 收起 / 切换 |
| `refreshDetail()` | 重新测量详情高度与最大高度 |

- 详情内容由业务注入（`#detail-header` / `#detail` 插槽），组件只负责卡片轮廓、玻璃、顶栏关闭钮、测高与滚动，不内置商品行样式。
- `lingyun-order-goods` 使用该能力展示「已选商品」：购物车固定悬浮在商品列表之上，列表和分类栏通高到页面底部，内部留出 `78 + 安全区` 的尾部让位，商品从购物车底部穿过。

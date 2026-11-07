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

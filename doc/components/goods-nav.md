# lingyun-goods-nav

商品底栏。默认变体：左侧是店铺、购物车这类图标入口，右侧是加入购物车和立即购买，结构对齐 `uni-goods-nav`；`variant="cart"` 变体是点单页同款购物车结算栏。外观走 Liquid Glass，不用红橙渐变。

## 默认变体

```vue
<lingyun-goods-nav
  :options="[
    { icon: 'shop', text: '店铺' },
    { icon: 'cart', text: '购物车', info: 2 },
  ]"
  :button-group="[
    { text: '加入购物车' },
    { text: '立即购买' },
  ]"
  @click="onOption"
  @button-click="onButton"
/>
```

## Cart 变体

和 `lingyun-order-goods` 底部购物车一致：悬浮玻璃胶囊 + 购物车圆钮（数量角标）+ 合计 / 配送费 + 结算钮。未达起送价时结算钮置灰并显示「¥xx起送」。

```vue
<lingyun-goods-nav
  variant="cart"
  :cart-count="cartCount"
  :total="total"
  :min-price="20"
  :delivery-fee="5"
  :price-decimals="2"
  @cart="openCart"
  @checkout="onCheckout"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `variant` | `default` 图标入口 + 按钮组；`cart` 购物车结算栏 | default |
| `options` | 左侧入口：`{ icon, text, info }`。`info` 为角标数字（default） | 店铺 / 购物车 |
| `button-group` | 右侧按钮：`{ text }`。最后一项是主按钮（default） | 加入购物车 / 立即购买 |
| `fill` | 按钮组占满剩余宽度 | true |
| `fixed` | 贴在页面底部 | true |
| `safe-area` | 避开底部安全区 | true |
| `cart-count` | cart：购物车数量，显示在圆钮角标 | 0 |
| `total` | cart：商品合计金额 | 0 |
| `min-price` | cart：起送价 | 0 |
| `delivery-fee` | cart：配送费，大于 0 时显示「另需配送费」 | 0 |
| `currency` | cart：货币符号 | ¥ |
| `empty-text` | cart：购物车为空文案 | 未选购商品 |
| `checkout-text` | cart：可结算时的按钮文案 | 去结算 |
| `price-decimals` | cart：价格小数位；`-1` 去掉多余的 0 | -1 |
| `accent-color` | cart：购物车圆钮 / 结算钮主色 | 系统蓝 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | default：点左侧入口，`{ index, content }` |
| `button-click` | default：点右侧按钮，`{ index, content }` |
| `cart` | cart：点购物车圆钮或合计区域，`{ count, total }` |
| `checkout` | cart：点结算，`{ count, total, minPrice, deliveryFee }` |

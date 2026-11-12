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

和 `lingyun-order-goods` 底部购物车一致：悬浮玻璃胶囊 + 购物车圆钮（数量角标）+ 合计 / 配送费 + 结算钮。未达起送价时结算钮置灰并显示「¥xx起送」。购物车数量增加时，圆钮（含角标）会放大回弹一次；数量减少不触发。

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

## Cart 详情

开启 `detail` 后，点购物车（或合计区域）会让**整张购物车玻璃卡向上增高**：详情和购物车栏是同一张卡，不是独立弹窗。

```vue
<lingyun-goods-nav
  ref="goodsNav"
  variant="cart"
  detail
  :cart-count="cartCount"
  :total="total"
  :detail-version="cartVersion"
  @checkout="onCheckout"
>
  <template #detail-header>
    <view class="cart-head">
      <text class="cart-head__title">已选商品</text>
      <text class="cart-head__count">共 {{ cartCount }} 件</text>
      <text class="cart-head__clear" @click="clearCart">清空</text>
    </view>
  </template>
  <template #detail>
    <view class="cart-detail">
      <view v-for="line in lines" :key="line.key" class="cart-detail__line">
        {{ line.name }} × {{ line.quantity }}
      </view>
    </view>
  </template>
</lingyun-goods-nav>
```

- 详情与购物车栏同一张玻璃卡：详情在上、购物车栏在下；关闭时是 62 高的胶囊，展开后胶囊向上长高，购物车栏始终贴底。
- 详情顶栏左上角是 36px 玻璃关闭钮；右侧 `#detail-header` 插槽放标题 / 件数 / 清空。
- `#detail` 插槽是内容区，默认随内容自动撑开，超过上限后内部滚动。
- 点击卡片外任何区域（全屏遮罩，展开时变暗并拦截页面滚动）收起；点购物车 / 合计再次切换；购物车归零自动收起；点「去结算」先收起。
- 详情卡片自身阻止 `touchmove` 冒泡，内容不足一屏时滑动卡片也不会带动背景页面滚动；内部 `scroll-view` 仍可滚动，内容超过上限时出现滚动条。
- 购物车栏在卡片底部，展开时不被遮罩覆盖，结算钮随时可点。
- 默认上限 = 视口高 − `detailTopGap`（默认 120）− 底部安全区 − 8 − 购物车栏 62，即详情顶部至少距屏幕顶部 `detailTopGap`。
- 可用 `detailHeight` 指定详情区域（含顶栏）的固定高度，或 `openDetail({ height, maxHeight, topGap })` 按次覆盖。
- 内容行数 / 高度变化时传 `detailVersion` 触发重测，或调用 `refreshDetail()`。组件方法：`openDetail(options?)` / `closeDetail()` / `toggleDetail()` / `refreshDetail()`。

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
| `detail` | cart：开启购物车详情，点购物车让卡片向上增高 | false |
| `detail-open` | 受控展开状态（`v-model:detail-open`）；不传由组件内部维护 | — |
| `detail-height` | 详情区域固定高度 px（含顶栏）；`0` 按内容自动 | 0 |
| `detail-max-height` | 详情区域最大高度 px；`0` 按视口与 `detail-top-gap` 自动 | 0 |
| `detail-top-gap` | 自动最大高度时距屏幕顶部保留 px | 120 |
| `detail-version` | 详情内容版本；变化时重新测量高度 | '' |

## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | default：点左侧入口，`{ index, content }` |
| `button-click` | default：点右侧按钮，`{ index, content }` |
| `cart` | cart：点购物车圆钮或合计区域，`{ count, total }` |
| `checkout` | cart：点结算，`{ count, total, minPrice, deliveryFee }` |
| `update:detail-open` | cart：详情展开 / 收起 |
| `detail-open` / `detail-close` | cart：详情展开 / 收起完成 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `detail-header` | cart：详情顶栏右侧内容（关闭钮已在组件左上角），放标题 / 件数 / 清空 |
| `detail` | cart：购物车详情内容；高度随内容自动撑开，超出上限后内部滚动 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `openDetail({ height?, maxHeight?, topGap? })` | 打开详情；参数按次覆盖对应属性 |
| `closeDetail()` | 收起详情 |
| `toggleDetail()` | 展开 / 收起 |
| `refreshDetail()` | 重新测量底栏位置与最大高度（页面布局变化后调用） |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/goods-nav.vue -->

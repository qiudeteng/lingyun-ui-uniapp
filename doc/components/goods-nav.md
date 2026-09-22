# lingyun-goods-nav

商品底栏。左侧是店铺、购物车这类图标入口，右侧是加入购物车和立即购买。结构对齐 `uni-goods-nav`，外观走液态玻璃，不再用红橙渐变。

## 示例

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

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `options` | 左侧入口：`{ icon, text, info }`。`info` 为角标数字 | 店铺 / 购物车 |
| `button-group` | 右侧按钮：`{ text }`。最后一项是主按钮 | 加入购物车 / 立即购买 |
| `fill` | 按钮组占满剩余宽度 | true |
| `fixed` | 贴在页面底部 | true |
| `safe-area` | 避开底部安全区 | true |

## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点左侧入口，`{ index, content }` |
| `button-click` | 点右侧按钮，`{ index, content }` |

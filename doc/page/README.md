# lingyun-ui-page

标准页面扩展。当前版本 **{{ pageVersion }}**。控件仍在 `lingyun-ui`，这里只放可复用的整页。

路由仍登记在业务工程的 `pages.json` / `src/pages`。页面里直接写标签，账号请求、登录态和跳转留在路由文件。

`components/lingyun-ui-page/lingyun-ui-page.vue` 是空文件，保留它，不要删，也不要往里写页面。

## 页面一览

| 页面 | 标签 | 说明 |
| --- | --- | --- |
| [登录](./login.md) | `lingyun-login` | 账号密码登录；协议用 Sheet 展示；可选次按钮 |
| [订单商品加购](./order-goods.md) | `lingyun-order-goods` | 店铺头 + 左右分类商品联动 + 购物车结算；数据驱动，抛结算 / 规格事件 |
| [订货单列表](./purchase-order-list.md) | `lingyun-purchase-order-list` | 顶部 Tabs 状态筛选 + 订货单卡片 + 横向商品缩略图 + 金额 / 操作；多批配送显示包裹数 |
| [订货单详情](./purchase-order-detail.md) | `lingyun-purchase-order-detail` | 状态头 + 配送 / 自提 + 商品 + 金额 + 物流 + 订货单信息；支持子订货单 |

## 约定

- 目录名 = 文件名 = 标签名（如 `lingyun-login`）。
- 标准页不请求接口、不读写 token。文案、logo、加载用 props；提交和跳转用事件。
- 样式走 `lingyun-ui/styles`，尺寸 `px`。遵守 Liquid Glass 与微信小程序约束。
- 新增一页时更新本包 `readme.md` 与 `changelog.md`，并在本手册 `/page/` 下补文档。

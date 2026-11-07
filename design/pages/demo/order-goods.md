# design/pages/demo/order-goods

对应源码：`src/pages/demo/order-goods.vue`（标准页：`src/uni_modules/lingyun-ui-page/components/lingyun-order-goods`）

参考美团外卖点单页的左右布局，做一个数据驱动的「订单商品加购」标准页：

- 店铺头：Banner（支持 `#banner` 插槽，演示用渐变文案）+ 悬浮店铺卡片（logo、名称、评分、月售、配送时长、提示条）
- 主体：左侧 88px 分类导航，右侧商品列表；分类名左侧可带 14px 小图标（后台 URL `iconSrc` 或 `icon` 字形），图标作为行内元素参与换行，分类名最多两行；购物车数字角标浮在右上角，不影响换行。点击分类右侧平滑滚动，右侧滚动时左侧自动高亮并滚进可视区
- 左侧选中背景为圆角胶囊，切换时上下滑动（类似 tabbar 透镜），点击的文字做轻微回弹；分类有已选商品时右上角显示数量角标
- 商品行：76px 图片（无图用名称首字兜底）、名称最多两行、规格 / 销量、招牌角标、现价 / 划线原价、右下角主色加购钮
- 商品数据扩展：`details` 多行说明（发货仓库、规格描述、截单时间、预计配送）、`priceUnit` 价格后缀、`quantityUnit` 步进器单位；售罄显示「商品已售罄」，多规格商品显示「选规格」（`price=0` 时隐藏价格）；`priceDecimals` 控制价格小数位
- 加购：普通商品点 `+` 变成步进器；多规格商品抛 `spec-request`，演示页用 Action Sheet 选规格并回写购物车
- 底部购物车栏：复用 `lingyun-goods-nav` 的 `variant="cart"`（悬浮玻璃胶囊、主色购物车圆钮 + 数量角标、合计价格、配送费、起送价 / 去结算钮）；购物车固定悬浮在列表之上，左侧分类栏与右侧商品列表通高到页面底部，列表尾部留出购物车让位，商品从购物车底部穿过
- 已选商品：使用 `lingyun-goods-nav` 的 `detail` 详情，详情与购物车是同一张玻璃卡、展开时整卡向上增高；左上角关闭钮，点卡片外收起，结算钮始终可点；高度随内容自动撑开，超过视口上限后内部滚动，逐项步进器 + 清空
- 演示数据使用真实的蛋糕图片（Unsplash）；微信小程序真机需把 `images.unsplash.com` 加入 downloadFile 合法域名，或在开发者工具勾选「不校验合法域名」
- 数据全部走 props：`store` / `categories` / `v-model` 购物车；结算、规格、返回抛事件
- Banner 右上角可循环切换「全部加载 / 分段加载 / 按分类加载」：分段先渲染前 2 个分类、滚到底部追加；按分类只渲染当前分类并模拟加载态

规范：[`UI_SPEC.md`](../../UI_SPEC.md)（Liquid Glass、px、暗黑）、[`GOODS_NAV.md`](../../GOODS_NAV.md)（商品底栏约定）、[`SHEETS.md`](../../SHEETS.md)。

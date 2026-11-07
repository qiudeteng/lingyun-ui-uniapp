## 1.1.1（2026-11-07）
- `lingyun-order-goods` 改为悬浮购物车布局：左侧分类栏与右侧商品列表通高到页面底部，商品从购物车底部穿过；购物车固定悬浮在列表上方，列表与分类栏尾部预留 `78 + 安全区` 的让位，不再像底栏下面多一条安全区。
- 已选商品改为 `lingyun-goods-nav` 的 `detail` 一体卡：详情与购物车是同一张玻璃卡、展开时整卡向上增高；左上角关闭钮，点卡片外收起，结算钮始终可点；详情顶栏拆到 `#detail-header` 插槽，内容在 `#detail` 插槽，随行数变化重新测高。
- 新增内置商品详情 Sheet（`lingyun-sheets` 大模式）：点商品图 / 名称打开，包含 4:3 头图、价格 / 月售 / 划线原价、商品名、属性行与「商品介绍」，用商品介绍替代评价；加购按钮统一放到 Sheet 底部 `footer` 操作区（移动端 / 宽屏一致），并与列表联动：普通商品已加购时显示步进器，多规格显示「选规格」+ 数量角标，售罄置灰。
- 商品新增 `images` 多图：详情页使用 `lingyun-swiper` 显示大图，支持左右滑动 / 自动轮播（5s），底部横排缩略图作为指示器，点击缩略图切换；不传时回退到单张 `image`。
- 移动端头图通过 `lingyun-sheets` 的 `bleedTop` 延伸到面板顶部、关闭钮浮在图片左上角；宽屏（≥690）左侧为图片 + 图下商品介绍、右侧为价格 / 名称 / 属性；商品介绍自动填满左栏剩余高度（`contentFill`），标题固定、内容在自身区域滚动，不再带动整页滚动；图片列固定 42% 宽，图片左距与右侧文字右距一致；缩略图切换增加高亮过渡与列表平滑滚动。
- `lingyun-order-goods` 顶部工具栏支持搜索（`showToolbar` + `searchable`）：搜索时隐藏 Banner / 店铺卡片 / 分类栏，列表切换为搜索结果视图，按原分类分组并显示结果数、未输入提示与无结果空态；结果可直接加购 / 步进 / 打开详情，关闭后回到原列表并定位当前分类。新增 `search` 事件与 `searchHintText` / `searchEmptyText`。
- 顶栏改为页面唯一头部：开启 `showToolbar` 后 Banner 自带返回钮与右上角操作区自动隐藏；新增 `autoTopInset`（默认 true），设为 `false` 时 Banner 顶到页面顶部、由 `lingyun-app-page` 工具栏透明覆盖，Banner 顶部按主题加渐隐保证标题可读；搜索视图自动恢复顶部留白。
- 新增 `toolbarButtons` / `toolbarMenuEnabled` 与 `#toolbar-menu` 插槽：顶部工具栏可加自定义按钮（与主题钮同一组），点击弹出菜单内容，作用域带 `close`；demo 把加载方式移到工具栏的「筛选」面板，面板内可切换加载模式、开关 Banner，并用滑块实时调整 Banner 高度（60–300px）。
- 暗黑下页面 / 分类栏背景改用 `bg-grouped-primary`（黑），店铺卡片保持 `bg-grouped-secondary`（#1c1c1e），与浅色一样能看出「卡片浮在页面上」的层级；Banner 高度为 0 时不显示 Banner，自动恢复顶部工具栏留白，店铺卡片从工具栏下方开始，不会垫到工具栏下面。
- 商品数据结构新增 `attributes` / `description`；新增 `goodsDetail`（默认 true）/ `goodsDetailTitle` / `addToCartText` 属性，`goods-click` 仍会抛出。
- 演示数据改为「八喜冰淇淋蛋糕」，商品、店铺 logo 与 Banner 使用真实蛋糕图片（Unsplash），并补齐属性行与商品介绍；微信小程序真机需配置 `images.unsplash.com` 合法域名或勾选「不校验合法域名」。
## 1.1.0（2026-11-07）
- 新增标准页 `lingyun-order-goods`「订单商品加购」：店铺头 + 左侧分类 + 右侧商品列表 + 底部购物车结算栏；左右双向滚动联动（点击分类滚动、滚动回写分类高亮）。
- 数据驱动：`store` / `categories` / `v-model` 购物车；商品支持图片、规格、销量、招牌角标、划线原价、售罄、步进数量、多规格；无图时用名称首字兜底。
- 商品行支持多行说明 `details`（发货仓库、规格描述、截单时间、预计配送等）、价格后缀 `priceUnit`、步进器单位 `quantityUnit`；售罄显示 `soldOutText`，多规格商品使用「选规格」按钮（`specButtonText`），`price=0` 时隐藏价格；新增 `priceDecimals` 控制价格小数位。
- 加购交互：`+` 变步进器；多规格商品抛 `spec-request`；底部购物车栏复用 `lingyun-goods-nav` 的 cart 变体，显示合计 / 配送费 / 起送价，未达起送价禁用结算。
- 修复非多规格商品从 `+` 切换为步进器时行高变化导致的轻微抖动：加购操作区固定 30px 高。
- 左侧分类选中背景改为圆角胶囊，切换时上下滑动（类似 tabbar 透镜），点击文字回弹；分类有已选商品时右上角显示数量角标。
- 分类支持名称左侧小图标：`iconSrc`（后台图片 URL）/ `icon` + `iconColor`，14px 与文字同高，作为行内元素参与换行；分类名最多两行，购物车数字角标浮在右上角、不影响换行。
- 已选商品使用 `lingyun-sheets` 半屏面板，逐项步进器与一键清空；结算、清空、返回、分类切换均抛事件，标准页不请求接口。
- 新增 `loadByCategory` / `categoryLoading`：按分类加载，右侧只渲染当前分类、不做滚动联动，点击分类抛 `category-change` 由宿主取数；已选商品保留快照，切换分类不会丢购物车。`windowed` / `windowSize` 支持全量模式分段渲染（先渲染前 N 个分类，滚到底部追加，点击靠后分类自动展开）。
- 新增 `renderMode="auto"` 默认策略：商品数 ≤100 全部加载、>100 分段加载、>500 按分类加载；阈值可用 `windowedThreshold` / `categoryThreshold` 调整，`totalGoodsCount` 供懒加载场景传入真实总数。
- 商品图与已选商品图加入 `lazy-load`。
- demo 新增 `pages/demo/order-goods`（参考美团外卖点单页的布局与交互），Banner 右上角可切换自动 / 全部 / 分段 / 按分类四种加载方式。
## 1.0.3（2026-11-06）
- 登录页账号 / 密码输入框补充 `name` 与 `autocomplete`（`username` / `current-password`），浏览器密码管理器可正确识别并自动填充。
- 配合 `lingyun-text-field` 1.0.42：H5 自动填充后同步值、隐藏占位符，自动填充底色跟随主题，浏览器原生密码眼睛不再与组件显隐按钮重复。
## 1.0.2（2026-10-15）
- 登录页默认隐藏顶栏（`lingyun-app-page` 的 `showToolbar=false`），不再显示「登录」标题。
## 1.0.1（2026-10-09）
- 登录页可加次按钮。传入 `demoText` 后显示在登录按钮下，点击抛 `demo`，跳转仍由页面处理。
## 1.0.0（2026-10-09）
- 新增登录页 `lingyun-login`。界面和表单校验在本包，路由页只接登录请求与跳转。
- 宽屏下登录表单最大宽度 420px。协议在组件内用全屏 Sheet 打开。

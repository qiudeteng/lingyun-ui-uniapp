## 1.0.59（2026-11-12）
- 新增分栏插槽结构工具类（全局样式 `styles/setting/_split-layout.scss`）：`lingyun-split-layout-pane`（插槽根容器绝对铺满 + 纵向 flex）、`lingyun-split-layout-fill`（根节点是 scroll-view 时绝对铺满）、`lingyun-split-layout-scroll`（内层滚动 `flex:1 + height:0`）。列表与详情、分栏布局、订货单列表与详情三个 demo 改用工具类，删掉各自重复的绝对定位 / 高度样板，并同步组件文档与分栏 guide。
- `lingyun-tabs`：Tab 角标改为上标定位——挂在文字右上角、不占行内排版宽度，选中 pill 内文字保持居中；角标仍使用 `lingyun-badge size="small"`，可随 Tab 一起点击。
## 1.0.58（2026-11-12）
- 新增 `lingyun-copy`：显示文字或图标的复制触发器，点击把 `text` 属性值写入剪贴板；支持 `size` / `variant` / `toast` / `toastText` / `disabled`、默认插槽，抛出 `copy` / `success` / `error` 事件。微信端沿用 `setClipboardData` 的系统「内容已复制」提示，H5 / App 由组件 toast。
- 新增 `lingyun-save-image`：保存为图片触发器。H5 传入 ref 截取该元素，不传则截取整个页面；克隆 DOM 后内联计算样式、图片与图标字体，经 SVG foreignObject + Canvas 导出 PNG（默认触发下载，`pixelRatio` / `background` / `download` 可配）。小程序没有整页截图能力，需传入 canvas 节点或带 `toTempFilePath()` 的组件 ref，导出后默认保存到相册（`album`）。`save()` 方法返回 `Promise<string>`。
- `lingyun-list-item`：`accessory="disclosure"` 的右侧箭头改到 `#extra` 插槽之后渲染，自定义右侧内容（如状态文案）时也保留可点击提示。
- `lingyun-split-layout`：左栏底色统一由组件提供——窄屏 Primary、宽屏 grouped-secondary（浅色白 / 暗黑 `#1c1c1e`），与右侧详情分层；列表与详情 demo 不再自己设置左栏背景。
- Demo：「屏幕」菜单改名「屏幕信息」并改用信息图标；新增复制（`/pages/demo/copy`）、保存为图片（`/pages/demo/save-image`）演示与组件文档；分栏布局 demo 左列表状态按进行中 / 待处理 / 已完成使用蓝 / 橙 / 绿三色，右栏标题去掉副标题。
## 1.0.57 (2026-11-12)
- 新增 `lingyun-split-layout`：列表 + 详情分栏布局组件。≥ `splitAt`（默认 900）左右分栏（左栏固定 `listWidth`，默认 375），窄屏只渲染左栏；`list-header` / `list` / `detail-header` / `detail` 四个插槽，头部自动量高并通过作用域插槽把 `topSpace` 交给内容，`wide-change` 事件区分宽窄屏行为。列表与详情 demo、订货单列表与详情 demo 均已改用该组件。分栏页面模板与踩坑清单见 `doc/guide/split-pages.md`。
- 新增「订货单列表与详情」分栏 demo（`/pages/demo/purchase-order-split`）：宽屏左 375 列表 + 右详情、各自内层滚动与浮动玻璃 toolbar，窄屏点卡片进现有订货单详情标准页；左侧列表 full 通栏、选中态与分栏边线对齐列表与详情 demo，手机模式不显示选中态；不动原有列表 / 详情 demo，内容直接复用两个标准页拆出的面板组件。
- 「列表 + 详情」demo 暗黑模式宽屏分层：左栏列表底色改用 `grouped-secondary`（浅色白 / 暗黑 `#1c1c1e`），与右侧黑色详情区分层次；选中行仍用页面底色（暗黑 `#000`），与详情无缝衔接，暗黑下选中效果清晰可见。窄屏列表不变。
- 修复 H5 页面样式跨页泄漏：`list-detail` / `refresh` / `search-bar` / `indexed-list` 的页面根结构样式（flex / 100vh / relative / height）改挂独立类（`list-page` / `refresh-page` / `search-page` / `indexed-page`），不再写在通用 `.page` 上，避免访问过这些页面后其它页面的 `.page` 被套上 flex / 100vh，导致目录工作台等内容被压成一列（小程序各页面样式隔离，不受影响）。
- 「列表 + 详情」demo 手机模式底部日期切换器改回组件自身的 `fixed` + 安全区模式（与纯列表页一致），不再用页面内绝对定位，修复小程序上位置偏移；宽屏分栏仍为左栏内的浮层。
## 1.0.56（2026-11-10）
- Demo 全站页面背景改为 iOS 标准纯色：移除全局彩色径向渐变与各页 `.page` 渐变，统一 `--lingyun-bg-grouped-primary`（浅 `#f2f2f7` / 暗黑 `#000`）；纯列表页仍用 Primary Background。
- `lingyun-list` 新增 `plain`：Apple Plain 全宽平铺列表，去掉分组卡片的底色、圆角与左右 inset，行直接铺在页面背景上；顶部搜索 / 筛选 + 底部日期切换条的「纯列表」demo 见 `/pages/demo/plain-list`。
- 新增「列表 + 详情」demo：宽屏隐藏页面壳 toolbar，左右各一个独立 `lingyun-toolbars`（左「工单 / N 条结果」+ 搜索按钮 + `segments` 状态分段，右「工单详情 / 当前单号」）；左栏为 375px 独立页面（纯列表，38 条样本，底部日期条浮动在列表上方），左右 toolbar 均浮动、列表与详情从下方穿过并驱动玻璃，窄屏点行进独立详情页 `/pages/demo/list-detail-item`；两栏各自滚动，详情复用 `ticket-detail` 面板。
- 「列表 + 详情」demo 适配 iPad：分栏门槛改为 900（竖屏 768 走单栏、横屏 1024 起分栏）；页面自带 toolbar 并让宿主页隐藏自己的 toolbar，宽屏按 `statusBarHeight` 补顶部安全区、窄屏 `safe-area` 处理状态栏与胶囊；列表返回按左侧导航是否停靠判断（iPad 竖屏从左侧 Tab 进入，不显示返回），详情页强制显示返回。
- 「列表 + 详情」demo 宽屏选中行背景改为右侧内容区底色（grouped primary），不再是偏深的 `fill.secondary`；两栏之间的 0.5px 缝隙改为透出页面底色——白色列表旁自然成线，选中行与详情列同一底色、贴边无缝，不再出现选中块与右侧边线颜色不一致。
- `lingyun-toolbars`：`title2LineLeft` 在没有返回 / 关闭 / 交通灯 / `leading` 时不再预留 44pt 前导位，标题直接贴内容边缘；分栏 pane 内单独放 toolbar 时左侧不再留空。
- 宿主目录页（index / demo）内容根类由通用 `.page` 改为 `.directory`，避免小程序宽屏托管时 40px 底部 padding 串到被托管页面；去掉冗余的 `min-height` / `background`。列表与详情页同时保留 `.page` padding 重置作为兜底。
- 「列表 + 详情」固定高度页面重置宿主目录页 `.page` 的 40px 底部 padding，列表 / 详情铺满到窗口底部，不再露出页面壳灰底；日期切换器的底部安全区保留。
- 微信 PC 客户端安全区按 Web 处理：胶囊在窗口标题栏、不在页面内，`getLingyunNavLayout` 的 `rightInset` 归零；新增 `isLingyunWeixinPc()` 导出。检测改看 `platform` 的 `windows` / `mac`（真机客户端 `deviceType` 仍报 phone），`lingyun.device` 同步纠正为 `pc`。列表详情 PC 端 toolbar 顶部与 H5 一致；日期条保留自身底部安全区（PC 无系统 env，只剩 12 设计留白）。
- 小程序宽屏宿主不再托管「点单加购」（固定高度 + 内层滚动页），点击时按整页打开，分类点击定位 / 滚动联动恢复正常。
- 小程序宽屏宿主补齐所有导航页面的静态分支（顶部 Tabs、二维码 / 条码、文件上传、日历、筛选菜单、工具栏系列等），宽屏点击不再回落到 404。
- `lingyun-toolbars` 新增 `avoidCapsule`：分栏 pane 内的 toolbar 可以只保留状态栏占位、不避让右侧微信胶囊；「列表 + 详情」左栏宽屏设为 `false`，搜索按钮回到 pane 右侧，窄屏与右侧详情保持默认避让。
- `lingyun-page-nav` / `lingyun-app-page`：停靠导航的所有右边缘（220 目录列、84 窄栏、窄栏与菜单列之间、菜单列右侧）统一使用右侧内容区底色（`--lingyun-bg-grouped-primary`），不再画深色分割线，也不根据右侧有没有菜单列改变颜色——视觉上没有边线，由白色列自身与 grouped 底色的色差形成边界。小程序 `lingyun-app-page__nav-line` 同步改为内容区底色。列表详情页的内容列表右侧分割线同样用列表底色，详情列不在时不露线。
- `lingyun-app-page`：小程序左侧导航的状态栏留白补上导航底色 / 窄栏 tint 和右侧边缘线，顶部不再露出页面渐变。
- `lingyun-date-switcher`：修正 `limit` 边界下上一段 / 下一段的判断——从 10 月可以切回包含今天的 11 月（周 / 月 / 年 / 日期段同理），不再因为整段结束时间越界而卡在上一段。
## 1.0.55（2026-11-10）
- `lingyun-combobox` 打开后自动聚焦搜索框；小程序键盘抬起时 Popover 按键盘高度重排并缩短列表，避免下拉被遮挡；`lingyun-popover` 新增 `bottomInset`。
- Demo 导航统一为 `src/config/pageTabs.ts` 的 `DEMO_PAGE_TABS` 单数据源，首页 / 底部 Tab / 工作台 / 宽屏侧栏共用；新增 Swiper 演示，补充记录列表与响应式文档，工作台二级/三级菜单改用 `lingyun-group-header` 分组。
## 1.0.54 (2026-11-09)
- `lingyun-toolbars` / `lingyun-app-page` 的 `segments` 新增 `segmentControl`：同一份数据可渲染成分段控件（默认，行高 56）或顶部 Tabs（Tabs 行 44 贴底、页面额外 8 间距、透明背景）；事件与 `segmentValue` 保持一致。
## 1.0.53（2026-11-09）
- 修复二维码 / 条码在部分小程序运行环境不显示：内置编码器移除 `??` 空值合并语法，兼容较低版本 JS 引擎；重新构建 `dist/dev` 与 `dist/build`。
- `lingyun-markdown` 代码块新增内置语法高亮：支持 ts / js / tsx / jsx / json / html / xml / vue / css / scss / less / bash / sh / sql / php / rust / swift；新增 `highlight` 属性（默认 true），token 颜色走 `--ly-md-code-*` CSS 变量，未知语言保持单色，不引入第三方依赖。
## 1.0.52（2026-11-09）
- 新增分组标题 `lingyun-group-header`：统一 Nested / Prominent / Extra Prominent 三种高度、字阶、次级色与右侧操作；`lingyun-list` 的 `header` / `headerType` / `headerAction` / `#header` / `#header-action` 用法保持不变，内部统一由该组件渲染。
- 新增 Markdown 预览 `lingyun-markdown`：组件内自研解析器，支持标题、段落、粗体 / 斜体 / 删除线、行内代码、链接、图片、有序 / 无序列表（嵌套、任务列表）、引用、表格、代码块与分割线；解析结果渲染成原生节点，不使用 `v-html` / `rich-text`。
- 列表 / 引用在解析阶段拍平成带缩进的行，微信小程序不需要递归组件 `usingComponents`；代码块与宽表格横向滚动，代码块不做语法高亮。
- 链接 / 图片通过 `link-click` / `image-click` 交给页面；只放行 http(s) / mailto / tel / 相对路径与 data:image，原始 HTML 不执行。
- Markdown 解析器内置在组件内，不引入任何第三方 npm 扩展；同步 Markdown 设计规范、组件文档与 demo。
- 二维码 / 条码编码器移植到组件内（QR / Code128 / Code39 / EAN13），移除根 `uqr` / `etiket` 依赖；宿主无需额外安装，MIT 许可见 `THIRD_PARTY_NOTICES.md`。
## 1.0.51（2026-11-09）
- 新增图片上传 `lingyun-image-upload`：缩略图网格与上传队列，支持直接上传 / 编辑后上传、90° 旋转、固定比例 / 自由裁剪、上传进度与失败重试；裁剪与导出逻辑拆在 `crop.ts` / `export-image.ts`。
- 新增文件上传 `lingyun-file-upload`：文件列表、类型色、上传进度、重试、删除与预览 / 下载；H5 通过 `public/system-file-picker.html` 调起系统文件选择。
- 新增顶部 Tabs `lingyun-tabs`：可滚动、underline / pill 两种形态、滑动指示器、自动滚入与吸顶；支持 `badge`、`disabled` 与自定义内容。
- 新增手写签名 `lingyun-signature`：触控 / 鼠标绘制、清除 / 重新签名、PNG 导出；支持 `v-model`、只读 / 禁用、透明底、自定义笔色 / 粗细 / 画布高度。
- 新增流程步骤条 `lingyun-steps`：横向 / 纵向、完成 / 进行中 / 等待 / 错误、可点击切换、`next` / `prev` 方法与状态覆盖。
- 新增纵向时间线 `lingyun-timeline`：时间 / 标题 / 说明 / 状态 / 图标、可点击、空态与插槽。
- 新增评分 `lingyun-rating`：整星 / 半星、只读 / 禁用、可清除、显示分值、自定义尺寸与颜色。
- 新增独立日历 `lingyun-calendar`：单选 / 范围、月份切换、今天、农历、标记与禁用日期；复用 `lingyun-picker-cal-day`。
- 新增加载更多 `lingyun-load-more`：更多 / 加载中 / 没有更多 / 失败重试、自动触底与 `trigger()`。
- 新增分页 `lingyun-pagination`：页码窗口、总数、省略号跳页、简单模式、小尺寸与单页隐藏。
- 新增扫码 `lingyun-scan`：小程序 / App 走 `uni.scanCode`，H5 支持 `scanFn` 自定义扫码；默认按钮与自定义插槽、start / success / error / cancel 事件。
- 新增二维码 `lingyun-qrcode`：依赖 `uqr` 前端生成，Canvas 绘制；支持纠错级别、静区、颜色与 `toTempFilePath()` 导出。
- 新增一维条码 `lingyun-barcode`：依赖 `etiket` 编码，支持 Code128 / Code39 / EAN13、模块宽度、静区、文字与图片导出。
- `lingyun-barcode` 新增 `fluid`：按父容器宽度自适应，修复 H5 宽屏下条码比背景色块窄的问题。
- `lingyun-rating` 支持移动端在星星行左右滑动调整（半星 / 整星步进），H5 同步支持鼠标拖动；只读 / 禁用不拦截页面滚动。
- 新增位置选择 `lingyun-location-picker`：小程序 / App 走 `uni.chooseLocation`，H5 使用腾讯地图 Key（`VITE_TENCENT_MAP_KEY`，不入库）；小程序已补 `requiredPrivateInfos`。
- 新增 `lingyun-tooltip`（复用 Popover）、`lingyun-notice-bar`（四种状态 / 操作 / 关闭）与 `lingyun-accordion`（单开 / 多开 / 自定义内容）。
- 新增 `lingyun-banner`（图片 / 卡片横幅）、`lingyun-combobox`（可搜索选择）与 `lingyun-token-field`（多选标签输入）。
- `lingyun-badge` 新增 `size="small"` 紧凑档（18px 高、11px 字号），用于 Tab / 列表等空间受限场景。
- `lingyun-list-item` 新增 `hideDivider`，首行 / 添加行可隐藏顶部分割线。
## 1.0.50（2026-11-07）
- `lingyun-stepper` 新增 `size="large"`：38 高、按钮 46 宽、数值 17 号，适合真机大点击区；默认尺寸保持不变。
- `lingyun-goods-nav` cart 详情卡片增加 `touchmove.stop`：展开后触摸卡片不会把事件冒泡到后面的页面，内容不足一屏时背景也不会跟着滑动；内部 scroll-view 仍可正常滚动。
## 1.0.49（2026-11-07）
- 新增图片轮播 `lingyun-swiper`：基于内置 swiper，支持左右滑动、`autoplay` / `interval` / `circular`、`ratio`（默认 4:3）、`radius`、内置圆点、懒加载；配合 `v-model:current` 可用缩略图作为指示器。
- `lingyun-goods-nav` cart 变体恢复加购反馈：购物车数量增加时，底部购物车圆钮（含角标）做一次 0.4s 放大回弹。
- `lingyun-sheets` 新增 `footer` 插槽：底部操作区固定在面板底部、不参与 body 滚动，底部安全区由组件承接；body 顶部内边距与安全区随之调整。
- `lingyun-sheets` 新增 `contentFill`：body 不滚动，内容自行填满 body 高度并在内部滚动；配合 `footer` 可做左右分栏、左栏内部滚动的详情页。
- `lingyun-sheets` 新增 `bleedTop`：内容从面板顶部开始，顶部 Chrome（关闭钮 / 标题）改为绝对定位浮在内容上；同时隐藏 Grabber，并把 body 顶部内边距归 0。适合商品详情这类头图铺满的场景，窄屏 / 宽屏卡片都生效。
- `lingyun-toolbars` 的 `segments` 分段控制改为默认大小（Large 48 高），行高由 40 调整为 56，真机更易点按；`lingyun-app-page` 顶部留白同步。
- `lingyun-menu` 行新增 `iconClass`：用 CSS 绘制图标，支持跟随主题色；内置 `lingyun-menu__symbol-icon--sun` / `--moon` 太阳与月牙。`lingyun-context-menu` 同步支持。
- `lingyun-theme-action` 主题菜单的浅色 / 暗黑图标改为太阳 / 月亮，选中态只由右侧勾选表示，避免圆形图标被误解为选中。
- `lingyun-goods-nav` cart 详情展开时改为可见全屏遮罩（`--lingyun-mask`，浅色 0.2 / 暗黑 0.48）：贴底时外层 fixed 根节点铺满视口，遮罩用 absolute 撑满、卡片固定在底部并在遮罩之上；遮罩拦截 `touchmove`，点上方收起，修复小程序上触摸穿透、页面跟着滚动、点上方不收起的问题。
- `lingyun-goods-nav` cart 详情移除详情与购物车栏之间的分割线，只保留列表最后一行自身的分隔线；详情高度上限同步不再扣分割线。
- 同步组件文档、SHEETS / SWIPER / TOOLBARS / MENUS 规范与组件清单。
## 1.0.48（2026-11-07）
- `lingyun-goods-nav` 的 cart 变体新增购物车详情 `detail`：点购物车 / 合计区域，整张购物车玻璃卡向上增高；详情与购物车栏是同一张卡、同一圆角轮廓，关闭时即 62 高胶囊，不再使用独立弹窗，购物车栏始终贴底。
- 详情左上角新增 36px 玻璃关闭钮；右侧 `#detail-header` 插槽放标题 / 件数 / 清空，`#detail` 插槽放内容。点卡片外的透明点击层收起，结算钮始终在点击层之上、随时可点；购物车归零自动收起，点「去结算」先收起。
- 详情高度默认按顶栏 + 内容自动测量，超过 `detailMaxHeight`（默认按视口与 `detailTopGap` 计算）后内部滚动；`detailTopGap` 默认 120，详情顶部至少距屏幕顶部 120。
- 新增 `detailVersion`：内容行数 / 高度变化时重新测量；新增 `detailOpen` 受控状态、`detailHeight`（含顶栏）、`openDetail({ height, maxHeight, topGap })` / `closeDetail` / `toggleDetail` / `refreshDetail`，以及 `update:detailOpen` / `detail-open` / `detail-close` 事件。
- 详情卡片使用 `lingyun-glass-surface` + 全端 blur（Light `#fff`@0.72 / Dark `#1a1a1a`@0.7），不再 teleport，随页面一起隐藏；demo 的 Goods Nav 同步改为一体卡并增加指定高度示例。
## 1.0.47（2026-11-07）
- 新增日期显示组件 `lingyun-date-text`：自动显示今天 / 昨天 / 明天，同年 `MM-DD`、跨年 `YYYY-MM-DD`；`precision` 支持到天 / 时 / 分 / 秒，字阶 / 颜色 / 加粗复用 `lingyun-text`，并支持自定义相对文案与 `fallback`。
- 新增并导出 `formatLingyunDate` / `parseLingyunDate` 日期格式化与解析函数；纯日期按本地零点解析，避免 UTC 跨天。
- 新增金额显示组件 `lingyun-amount-text`：按数量级自动使用 万 / 百万 / 千万 / 亿 / 百亿 / 千亿 / 万亿，支持 `decimals`（0–6）、`prefix`、`fallback`；字阶 / 颜色 / 加粗复用 `lingyun-text`。
- 新增并导出 `formatLingyunAmount` / `parseLingyunAmount` 金额格式化与解析函数。
- 新增 Date Text / Amount Text demo、`design/DATE_TEXT.md` / `design/AMOUNT_TEXT.md` 规范与组件文档。
## 1.0.46（2026-11-07）
- `lingyun-goods-nav` 新增 `variant="cart"` 购物车结算栏：悬浮玻璃胶囊 + 购物车圆钮（数量角标）+ 合计 / 配送费 + 主色结算钮；未达起送价时置灰并显示「¥xx起送」。
- cart 变体新增 `cartCount` / `total` / `minPrice` / `deliveryFee` / `currency` / `emptyText` / `checkoutText` / `priceDecimals` / `accentColor` 属性，以及 `cart` / `checkout` 事件；默认变体保持不变。
- 修复 cart 变体从「未选购商品」切换到合计金额时两行文字抖动：空车文案与金额统一 26px 行高，信息区固定 42px 高并顶部对齐。
- cart 变体购物车圆钮左侧间距改为 7px，与上下间距一致（62 - 48 垂直居中）。
- cart 变体数量角标改为左侧固定、向右伸展，`99+` 等长数字不再向左盖住购物车图标和价格。
- demo 的 Goods Nav 改为 cart 变体，可用按钮验证加购 / 清空 / 起送价状态；同步组件文档与 GOODS_NAV 规范。
## 1.0.45（2026-11-07）
- 新增后台菜单树统一换算 `buildLingyunPageFromMenus` / `applyLingyunPageFromMenus` / `buildLingyunSectionsFromMenus`：一次得到一级 Tab、220 目录分组与工作台分组，二级 / 三级子项保留 `iconSrc` / `activeIconSrc` 图片图标，宿主不用各写一份菜单转换。
- 菜单图标支持图片地址与字形名混用：图片自动转 `iconSrc` / `activeIconSrc`，缺失时按标题关键词与序号取兜底字形，可用 `iconKeywords` / `iconFallbacks` / `fallbackIcon` 覆盖；`homeTab` + `homePath` 处理固定首页节点，`meta.hideInMenu` 的节点自动跳过。
- `LingyunPageNavSection` 新增可选 `icon`，工作台分组卡片可直接使用。
- 同步 App Page 文档「后台菜单树接入」与 readme。
## 1.0.44（2026-11-07）
- PC 宽屏（≥1200）配置全局 tabs 后改为三栏：84 通高窄栏 + 220 内联二级 / 三级菜单列 + 内容区（内容左距 304）。点一级 Tab 直接切换右侧菜单列、不再弹出 `lingyun-menu`，点菜单项跳转并高亮；一级 Tab 没有子项时菜单列自动收起、只让出 84。平板（690–1199）保持 84 窄栏 + 点击弹出菜单。
- 全局 tabs 与二级 / 三级子项支持图片图标 `iconSrc` / `activeIconSrc`，贯通 84 窄栏、内联菜单列和平板弹出菜单；选中态优先 `activeIconSrc`，未传时回退 `iconSrc`。
- `lingyun-menu` 的 `actions` 支持 `iconSrc` / `activeIconSrc`，`selected` 时使用选中图并显示勾选。
- 修复 `lingyun-toolbars` 内置蓝色右侧按钮与按钮组 / 自定义 trailing 之间没有间距：按 `--ly-toolbar-gap` 补上组间距，右边缘位置不变。
- 修复固定底部 `lingyun-date-switcher` 在宽屏按整个窗口居中：注入页面壳导航占位，和 `lingyun-tabbars` / `lingyun-search-bar` 一样只在右侧内容区居中；PC 三栏菜单列展开 / 收起时同步更新占位。
- 同步 Page Nav / App Page / Menu / Date Switcher 文档与 SIDEBARS / COMPONENTS 设计说明。
## 1.0.43（2026-11-06）
- 修复 `lingyun-row` 设置 `gutter` 后整行左移、右侧少一半间距：`gutter > 0` 时行宽按 `calc(100% + gutter)` 计算，配合左右负 margin 让列内容与父级左右边缘对齐；`gutter=0` 保持 `width: 100%` 不变。
## 1.0.42（2026-11-06）
- `lingyun-tabbars` 支持图片图标：`items` 可传 `iconSrc` / `activeIconSrc`，优先于 `icon` / `iconMode`；选中态优先 `activeIconSrc`，未传时回退 `iconSrc`，搜索项同样支持。`lingyun-app-page` 全局 tabs 同步透传。
- `lingyun-text-field` 新增 `name` / `autocomplete`，H5 浏览器自动填充后主动同步原生值并隐藏占位符；自动填充底色与文字跟随浅色 / 暗黑主题。
- `lingyun-text-field` 隐藏浏览器原生密码眼睛 / 清除装饰，避免和组件自己的显隐、清除按钮重复。
- demo 的 Tab Bars 增加「5 项 · 图片图标」示例；同步 Tab Bars / Text Field 文档。
## 1.0.41（2026-11-06）
- 新增底部日期切换器 `lingyun-date-switcher`：支持天 / 周 / 月 / 年 / 自定义日期段，前后切换、模式菜单、范围限制，`change` / `center` 统一返回 `value` 与 `range`。
- `lingyun-menu` 新增 `full-width`、`anchor` 与默认插槽自定义内容；不传 `actions` 时菜单只负责弹出、定位、遮罩和动效，内容完全由页面接管。
- `lingyun-popover` 新增 `full-width` / `anchor`，并在展开动画结束后发送内部事件，供内容重新测量。
- `lingyun-toolbars` 新增顶部搜索模式（独立搜索钮、从右往左输入框过渡、关闭清空关键词、延迟聚焦）、下方 `segments` 分段控制、`trailing-buttons` 二维分组、`trailing-buttons-hidden`、`trailing-menu-enabled`、`showThemeSwitch`；点击事件返回 `groupIndex` / `buttonIndex` / 整组 `anchor`。
- `lingyun-app-page` 透传搜索与分段配置，支持 `v-model:searching` / `v-model:search-value` / `v-model:segment-value`，新增 `openSearch()` / `closeSearch()` / `toggleSearch()` 方法及 `search` / `search-input` / `search-cancel` / `segment-click` / `segment-change` 事件。
- 修复 `lingyun-segmented-control` 在缩放浮层（菜单 / Sheet）内选中块测量错误：H5 使用布局尺寸，小程序在展开完成后重新测量。
- `lingyun-stepper` 数值框宽度按数字位数自适应，多位数字完整显示。
- 主题菜单 / `trailing-menu` 改为按按钮组右上角定位；新增页面级 `showThemeSwitch`，局部隐藏不再修改全局主题钮状态。
- demo 新增底部日期切换、顶部搜索、顶部分段、筛选菜单与 All In One 综合示例；同步设计规范与组件文档。
## 1.0.40（2026-11-06）
- 修复 Tab 二级 / 三级工作台被宿主页嵌入时，小程序顶部缺少状态栏安全区：工作台保持 `autoTopInset`，由嵌入页自行承接「状态栏 + 顶栏」留白；H5 宿主对嵌入页根节点的去重逻辑不变，不会双重留白。
- 同步 `lingyun-app-page` 文档：嵌入页也应保持 `auto-top-inset` 为 `true`。
## 1.0.39（2026-10-30）
- 宽屏（≥690）配置全局 tabs 后的 **84** 左侧窄栏改为通高固定材质：去掉悬浮玻璃卡片、外边距、圆角与侧边线，整列铺满左侧区域，底色使用与内容卡片相同的 grouped 背景，叠加固定的顶栏满玻璃同款 tint（浅色 `#fff`@0.42 / 暗黑 `#fff`@0.14），滚动时不再变色，与顶栏玻璃连接处不再出现竖线或色差。
- 侧栏为实底，不再读取顶栏滚动进度、不做 blur；未配置 tabs 的 **220** 完整目录不受影响。
## 1.0.38（2026-10-30）
- `lingyun-sheets` 顶栏右侧新增内置按钮：`trailing-icon` + `trailing-text`（最多 2 字，超出截断），复用 `lingyun-button`（`borderedProminent` / `medium`）；仅 icon 时 40×40 蓝色圆钮，带文字为蓝色胶囊，点击发 `trailing`。优先级为内置按钮 > `#trailing` 插槽 > `showTrailing` 默认分享圆钮（小程序插槽为静态声明，无法判断插槽内是否真的有内容）。
- `lingyun-sheets` 新增宽屏居中卡片尺寸 `width` / `height`（px，仅窗口 ≥690 生效）：`0` 用默认上限 936×770，实际夹在 `[320, 视口-64]` / `[240, 视口-64]`，卡片保持水平垂直居中；窄屏仍由 `detent` 决定。
- `lingyun-sheets` 的 `maskClosable=false` 时点遮罩改为拒绝反馈：面板水平轻抖 + `uni.vibrateShort({ type: 'medium' })`（对齐 `lingyun-alert`），关闭 / 重开 / 卸载时清理计时器；H5 等无震动端不再产生未处理的 Promise。
- `lingyun-stepper` 新增 `left-text` / `right-text`：控件外侧灰色说明文字（15px、secondary），最多 4 字，禁用时同步变淡；根节点增加 host 包裹层，内部 `.lingyun-stepper` 类名保持不变。
- demo 同步：Sheets 增加点遮罩开关、内置 trailing、宽屏卡片尺寸示例；Switch & Stepper 增加左右文字示例；相关文档与 readme 更新。
## 1.0.37（2026-10-29）
- 递增版本号，重新发布 1.0.36；内容与 1.0.36 一致。
## 1.0.36（2026-10-29）
- 递增版本号，重新发布 1.0.35 的固定页面背景、图表 tooltip 外部关闭、Duo 工具栏与菜单动效等更新，确保 uni-app 插件市场识别最新内容；本版本内容与 1.0.35 一致。
## 1.0.35（2026-10-28）
- `lingyun-duo-toolbar` 按官方 `Toolbar - Top - iPhone Duo` 重做布局：84 高，Leading 48、标题 17/22 左对齐、右侧 164×48 玻璃工具组（1~3 个 36×36，gap 18，左右 10），最右保留 134 给状态栏；空 Leading / 工具组不再额外占 12 间距。`leading` 插槽改为接管整个 Leading 区，提供后不再渲染默认返回钮。
- `lingyun-app-page` 的 `duo-tools` 插槽同时供 Duo 内屏竖屏顶部工具组和右侧全高栏使用；`trailing` 在 Duo 下作为兼容回退，二者同时存在时优先 `duo-tools`。
- `lingyun-duo-rail` 新增独立页模式：非一级 Tab 根页隐藏 Tab 组与搜索，在摄像头 / 状态栏下方显示返回钮；Tab 根页仍显示 Tab，搜索需配置 `tabbar.search = true`。工具组改为由 `tools-visible` 显式控制，修复微信小程序声明空 slot 时仍渲染空玻璃组、外屏横屏无工具仍显示「…」的问题。Tab 组保持 **48×210**（上下 padding 6），选中胶囊 **44×56**，首尾上下与左右均留 **2px**。
- 搜索入口 `duo-search` 保留，但不再默认渲染；配置 `setLingyunPageConfig({ tabbar: { search: true } })` 后才显示。
- 修复 Tab 二级 / 三级工作台被宿主页嵌入时顶部重复留白：工作台页通过 `auto-top-inset="false"` 取消自身顶部留白，顶部只由外层 `lingyun-app-page` 负责；普通页面顶部占位逻辑不变。
- `lingyun-toolbars` 新增右侧自定义按钮组：`trailing-buttons` + `trailing-action` 事件；提供 `trailing-menu` 插槽（`{ button, index, close }`），点击按钮自动在下方弹出自定义菜单内容。1 个按钮为 44×44 圆钮，多个为 36×36 玻璃胶囊组。
- 新增内置 `lingyun-theme-action`：`setLingyunThemeSwitchVisible(true)` 后进入工具栏右侧按钮组 / Duo 工具组，点击切换浅色 / 暗黑 / 自动；demo 已开启，不再使用页面右上角浮层。
- `lingyun-app-page` 新增 `autoTopInset`（宿主页嵌入的工作台页关掉自身顶部留白）与 `trailingButtons` / `trailing-action` / `trailing-menu` 透传。
- 宽屏（Pad / PC）无系统状态栏时顶部至少保留 **8px** 安全区，toolbar 不再贴顶。
- 统一控件玻璃材质：`lingyun-toolbars` 返回 / 关闭钮、右侧按钮组、`lingyun-tabbars`、Duo 工具组和 Duo Tab 组都走 `lingyun-glass-control`；Duo 主题钮与 mobile 下表现一致。
- 右侧按钮图标与返回钮同尺寸（标准 toolbar 28 / Duo 22）；标题右侧按实际按钮组宽度避让，小程序里不再被右侧按钮挤得偏右。
- 修复 iPhone Duo 在小程序模拟器里被识别成 Android、且不进入 Duo 布局：机型或 UA 已包含 Duo / iPhone / iPad 时，`lingyun.os` 优先判为 `ios`；iOS 手机为折叠形态，或屏幕 / 窗口尺寸为 Duo 的 **466×678 / 669×951**（横竖均可）时，按 Duo 识别。半折姿态改用物理屏幕横竖判断，窗口变横也不会识别错。
- 微信小程序默认启用 Duo 布局（此前 `MP-WEIXIN` 被强制回落到 mobile）；仍可用 `setLingyunDuoSupported(false)` 关闭。
- `lingyun-popover` 的 `variant="menu"` 改为 iOS 27 菜单材质化动效：从触发按钮中心、原位置长出一颗 48–72px 的玻璃水滴（按按钮短边取），点击后按钮立即隐藏；面板按按钮左右可用空间自动贴左上角或右上角，不再水平居中在按钮下面，覆盖按钮原来的位置。面板按锚点矩形做 translate + scale 映射，圆角起始帧用椭圆半径补偿非等比缩放，视觉为正圆，落定 32 圆角并轻微回弹，约 0.46s。内容晚约 0.1s 淡入，H5 同时从 `blur(10px)` 清晰化。关闭时内容先淡出，面板反向收缩并淡出，菜单几乎完全消失后按钮再淡入；不做下挂小水滴（异形融合需要画布，Web / 小程序暂不实现）。`lingyun-menu`、`lingyun-toolbars #trailing-menu`、宽屏二级菜单共用；`lingyun-popover` 新增 `closed` 事件（退场动画结束、浮层卸载后触发）。
- `lingyun-theme-action` 新增 `menu-open` / `menu-closed` 事件；`lingyun-toolbars` 与 `lingyun-app-page` 的 Duo 顶部 / 右侧工具组在主题菜单打开到退场结束期间整体隐去，`closed` 后再恢复，避免玻璃胶囊从菜单边缘漏出或提前盖住按钮。
- `lingyun-tabbars` 选中透镜改为「中心位移 + 宽度延迟弹簧」，选中时外扩 4×2 并弹一下图标（可关 `haptic`）；Tab 指示器增加重试与 480ms 兜底，修复偶发图标变蓝而背景没跟上的问题。
- 修复 `lingyun-indexed-list` 在微信自定义组件宿主下高度失效（只显示 A/B）：宿主节点改为 flex 撑满，字母条预测量并补 `touchcancel` 与越界吸附。
- `lingyun-search-bar` 的搜索字段与取消圆钮统一走 `lingyun-glass-control`，去掉额外的 raised 阴影，和 toolbar / tabbar 玻璃材质一致。
- `lingyun-app-page` 页面背景改为独立固定层：页面级滚动、内层 `scroll-view`、`body` 自管滚动时背景渐变都固定在视口，不再跟着内容移动；壳根节点保留纯色兜底，宽屏侧栏透出的仍是同一张固定背景。
- `lingyun-app-page` 根节点触摸时广播 `lingyun:page-touch`，图表组件据此收起 tooltip；手机上点击页面其他位置即可关闭图表提示，不必再点图表本身。
## 1.0.34（2026-10-28）
- 递增版本号，确保 uni-app 插件市场能识别 1.0.33 的 `lingyun-section #icon` 插槽更新；内容与 1.0.33 一致。
## 1.0.33 (2026-10-28)
- `lingyun-section` 标题左侧新增 `#icon` 插槽，可放 `lingyun-icon` 或其他节点；原有 `icon` 图片地址用法不变。自定义色块需要自己负责 flex 居中。
## 1.0.32（2026-10-28）
- 一级 Tab 在工作台内切换改为页内更新：只替换工作台 key 和内容，不再 `reLaunch`，Tab 栏与页面实例保持不动，消除移动端白屏；H5 只同步地址栏和当前页 options，从子页返回仍停在切换后的 Tab。
- `LingyunPageTabChild` 支持 `children` 三级菜单：二级项作为分组卡片标题，三级项作为卡片里的按钮；只有二级菜单的 Tab 渲染成没有标题的卡片。宽屏 `lingyun-menu` 同步用分组标题分隔。
- H5 首页 / 目录可作为一级 Tab 宿主页：点击底部 Tab 只切换宿主视图，地址保持为宿主路由的 `?tab=<key>`，页面栈不增长；刷新或子页返回后按 `?tab=` 恢复。
- 修复 H5 一级 Tab 宿主页顶部重复留白：外层页面壳和内嵌页面都留了一次顶栏，导致工具栏下方出现黑色断层；现在只保留内嵌页自己的留白，页面背景一直铺到工具栏下方。
- `lingyun-duo-toolbar` 新增 `glassProgress`：Duo 内屏 / 横屏顶部栏在页面顶部全透明，随滚动逐渐浮出玻璃；`lingyun-app-page` 自动传入滚动进度。
- H5 页面级滚动的顶栏玻璃进度改为直接读取窗口滚动位置，不再依赖 IntersectionObserver；iframe / 文档预览里页顶也稳定保持全透明。
- 页面背景统一由页面壳根节点绘制，新增 `--lingyun-page-background` 覆盖点；内容层 `.page` 默认透明，Tab 页底部留白不会再露出纯色断层。宿主工程可只配一次变量让所有页面共用同一背景。
- `lingyun-alert` 输入行改用 `lingyun-text-field`；输入弹窗不做缩放入场，等输入框挂载稳定后再聚焦，避免小程序 `textarea` 闪一下聚焦又失焦。切换两个输入框时不再被旧的 blur 定时器把键盘高度清零。
- `lingyun-alert` 的 `inputs` 支持多行备注：`multiline: true`（或 `type: 'textarea'`）、`autoHeight`、`rows`，内部使用 `lingyun-text-field` 的多行模式。
- 修复 `lingyun-alert` 输入框键盘弹起时的文字滞后：键盘上推不用 `transform`（原生输入文字层跟不上 WXSS 外壳），改为布局位移且不做补间；输入框所在页面保持页面级滚动。
- `lingyun-alert` 关闭时先收起键盘，等键盘落下后再播放正常退场动画；退场期间冻结上推位置，不再先跳回中间再闪烁消失。
- 微信小程序 `lingyun-picker` 自定义滚轮新增 `haptic`（默认开）：跨过选项时触发轻震动，近似原生 `picker-view` 的选择反馈。原生滚轮的系统音在自定义 `scroll-view` 下不可用。
## 1.0.31（2026-10-20）
- 页面壳默认不再接管底部 Tab：只有一级 Tab 根页或工作台页显示 Tab 并自动留白；子页 / 详情页 / 首页默认没有 Tab，其他页面需要 Tab 时自行使用 `lingyun-tabbars`。
- 修复了手机端从工作台进入子页无法返回的问题：工作台子项统一用 `uni.navigateTo` 压栈，第一个子项也显示返回；深链直接落到子页时返回父 Tab 工作台。
- 修复了二级菜单触发层在微信端把导航项压成内容宽度、导致 Tab 不居中的问题；`lingyun-menu` / `lingyun-popover` 新增 `trigger-block`，导航项恢复整格宽度，点击区域覆盖整个导航单元。
- 全局 tabs 支持 `children` 二级菜单：宽屏左侧（Web / 小程序一致）点击父项用 `lingyun-menu` 弹出（透明遮罩，点击外部关闭）；底部 / Duo 点击带 children 的父项进入固定工作台页，没有 children 直接进 `url`。新增 `workspaceUrl` 配置，子项路径自动归父 Tab 高亮。
- 新增设备形态 `formFactor` 与 Duo 姿态 `duoPose`；宿主可通过 `configureLingyunLayout({ getFormFactor, getDuoPose })` 接入已有型号判断，未接入时用机型 + fold 状态兜底。
- iPad / PC 配置全局 tabs 后，左侧导航改为 **84** 悬浮玻璃窄栏（图标上、文字下）：玻璃栏通高、四周各留 8，页面内容背景经左侧安全区铺满整屏并从玻璃下方透出。演示页 `.page` 已内置安全区；其他内容根节点加 `.lingyun-page-safe-left`（需在 `lingyun-app-page` 内），也可将背景配在 `lingyun-app-page` 根节点。未配置 tabs 的完整目录仍为 220。
- P1 支持 iPhone Duo 内屏竖屏：84 高 `lingyun-duo-toolbar` + 95 高底部 Duo Tab（玻璃条 62、Tab 77×54、图标 22、文字 10/12）；半折时屏幕中心显示 40 横向折痕安全带。
- P2 支持 Duo 外屏竖屏 / 外屏横屏 / 内屏横屏右侧全高栏：84 宽，工具组 48×164、Tab 组 48×210（4×48）、搜索 48、选中胶囊 44×58；外屏横屏工具自动收进「…」溢出。
- `lingyun-app-page` 新增 `duo-tools` 插槽与 `duo-search` / `duo-overflow` 事件；新增 `lingyun-duo-rail` 组件。
- P3 支持 Duo 内屏横屏折叠/半折 Split View：顶部 84 高 Duo Toolbar、右侧 84 返回列、左主栏 456 + 40 折痕避让带 + 右详情栏 371；Split View 隐藏 Tab。新增 `lingyun-split-view` 与 `split-primary` / `split-detail` 插槽。
- 窄栏顶部直接使用 `lingyun-avatar size="ml"`（52；新增 ml 档）：有用户头像显示头像，无头像显示姓名缩写；图标 / 标签 / 单项加大为 28 / 13 / 68，状态栏安全区改到导航列外部。`lingyun-avatar` 新增 `error` 事件用于图片失败时回退缩写。
- 换页过渡只淡入内容块，页面背景（含左侧安全区）保持稳定，不再跟着渐入/闪烁。
## 1.0.30（2026-10-20）
- `lingyun-app-page` 支持数据驱动的一级导航：`setLingyunPageConfig({ tabs })` 一次配置，窄屏渲染底部 Tab、宽屏渲染左侧停靠导航，默认按窗口宽度 690 切换。
- 新增页面级覆盖 `pages[path].hideTabbar / hideNav / navMode`，以及 props `nav-mode / show-tabbar / auto-bottom-inset`。
- 新增 `--lingyun-app-page-inset-bottom` 与 `LINGYUN_APP_PAGE_BOTTOM_INSET`：三种滚动模式自动为底部 Tab 留白；`lingyun-fab` 自动上移避开 Tab 栏。
- PC（≥1200）由全局 tabs 驱动的左侧导航改为 **84** 窄栏：图标在上、文字在下，选中胶囊上下滑动；平板档（690–1199）与完整目录保持 220。
- `lingyun-tabbars` 新增 `iconMode="icon"`（用 `lingyun-icon` 渲染图标）、`fallbackFirst`（无匹配项时是否高亮第一项）与 `fromKey`（跨页时指示器从上一项滑入）；`--fill` 断点由 743 对齐到 689，修复窄屏 Tab 整体右移。
- `lingyun-app-page` 一级 Tab 切换增加内容淡入过渡；`reLaunch` 换页时 Tab 指示器从上一项滑入，避免动画丢失。左侧菜单选中胶囊在菜单项之间上下滑动，内容区淡入。
- `lingyun-page-nav` 可由全局 tabs 驱动，支持 `badge` 角标与 `match` 详情页高亮；使用全局 tabs 时隐藏内置「首页」行。
## 1.0.29（2026-10-16）
- 移除对宿主工程组件、状态和路由的直接依赖。
- 修复宽屏侧栏下固定搜索条超出可视范围。
- Sidebar 在移动端避开 Toolbar 与微信胶囊安全区域。
## 1.0.28（2026-10-16）
- 微信宽屏侧栏改为常驻 Tab，右侧直接切换组件。
## 1.0.27（2026-10-16）
- `lingyun-alert` 支持 `uni.showLingyunAlert`。
- `lingyun-table` 宽屏筛选改为 Popover，分组行可收起，加载遮罩盖住整表。
- `lingyun-popover` 箭头对准触发器。
## 1.0.26（2026-10-15）
- `lingyun-alert` 新增 JS 调用：`uni.showLingyunAlert(options)` / `uni.hideLingyunAlert()`（也挂在 `this.$showLingyunAlert`），和 Toast 一样由 `lingyun-app-page` 里的反馈宿主渲染，不用在页面放组件。返回 Promise，关闭时给出 `{ confirm, cancel, index, action, values }`；不传 `actions` 时用 `confirmText` / `cancelText` / `showCancel` 生成按钮。原来的组件写法不变。
- `lingyun-table` 筛选面板在窗口宽 690 及以上改为箭头指向筛选图标的 Popover，底部「取消 / 确定」；窄屏仍是底部 Sheet。面板内容拆到新组件 `lingyun-table-filter-form`。
- `lingyun-table` 分组行底色改为与分割线同色。
- `lingyun-table` 点分组行可收起 / 展开该组明细，分组列前显示箭头；新增事件 `group-toggle`。收起时序号不变。
- `lingyun-table` 加载遮罩改为盖住标题栏以下全部（含左右固定列、表头、表尾、分页），并加表格底色蒙层；加载中标题栏工具变灰不可点，刷新图标旋转。
- `lingyun-popover` 新增 `anchor`（直接给视口矩形定位，不测触发器插槽）和 `estimateHeight`（判断上下翻转用的面板预估高度）。
- 修复 `lingyun-popover` 箭头指不准触发器：打开前先隐藏挂载量出面板真实高度再定位（原来固定按 52px 估算，`top` 方向会压住按钮、`left` / `right` 箭头纵向偏移）；H5 补回 uni 坐标里减掉的 windowTop；缩放原点改到箭头尖，进场动画中箭头不再偏离；上下 / 左右都放不下时选空间大的一侧；快速连点不再用到过期的测量结果。
- `lingyun-popover` 的 `arrowAlign` 改为决定箭头在面板哪一侧、面板随之偏移，箭头始终指向触发器（原来是面板居中后把箭头挪到边上，指不到按钮）。H5 改为同步读 DOM 量触发器，不再因异步查询超时落到左上角兜底位置；打开期间页面滚轮 / 惯性滚动或窗口缩放时弹层跟随触发器；视口宽度扣除滚动条。
- `lingyun-popover` 箭头与面板融为一体：箭头填充改用面板同一底色，斜边描边与面板 hairline 同色并连成一圈，面板描边和内高光在箭头处挖空。去掉箭头自身的背景模糊，交界处不再出现暗线或亮线。箭头与面板描边接成一条线（面板不再留透明边框，描边挖空只到斜边内侧）；箭头离面板边缘至少「圆角 + 半个箭头宽」，不再压到圆角弧线上。
## 1.0.25（2026-10-15）
- `lingyun-table` 排序标记改用 `lingyun-icon` 上下箭头，手机上不再显示成 emoji；当前方向用主色。
- 筛选改为底部面板（新组件 `lingyun-table-filter`），不再在表头下插一行。点表头右侧筛选图标打开，可排序的列在面板里也能改排序；改完点 ✓ 才生效，`remote` 只发一次请求。
- 列新增 `filterType`：`select` 多选（选项多时可搜索、全选、显示条数）、`number` 等于 / 不等于 / 大于 / 大于等于 / 小于 / 小于等于 / 介于、`text` 包含 / 不包含 / 等于 / 开头是、`date` 当天 / 不早于 / 不晚于 / 介于。`filterable: true` 时多选项从数据去重生成。
- 生效的筛选在表格上方显示为可横滑的标签，可单个删除或清除全部。
- `query-change`、`filter-change` 新增 `conditions`（数字、文本、日期条件）；原 `filters` 不变。
- 修复 `lingyun-sheets` 在小程序上不显示 `title`。
- `lingyun-table` 列宽按表格实际宽度分配：没写 `width` 的列平分剩余宽度（不小于 `minWidth`，默认 120），都没写就平分整个宽度；新增 `fit`，全部写了宽度且总宽不足时按比例放大占满。窗口变化时重算。
## 1.0.24（2026-10-15）
- `lingyun-table` 小程序滚动改由 WXS 在渲染层驱动。表头、表尾、左右固定列、中间列和滚动条同一帧移动，固定列不再慢一拍；惯性也在渲染层跑。
- 修复小程序表体滚过约 8 行后，中间列比固定列多偏一段、上下错行。
- 大数据：行和列按块换虚拟窗口，滚动时少发数据；序号、多选、全选改为线性计算；排序先取排序键再比较；分组合计翻页不重算。
- 按下行延迟约 90ms 再高亮，手指一动就开始滚时不再闪一下。

## 1.0.23（2026-10-15）
- `lingyun-table` 支持 `group-fields`。按列归组并插入分组行，`sum` 列自动求和；格式化与 `#cell` 跟数据行一致。

## 1.0.22（2026-10-15）
- `lingyun-table` 支持 `size="compact"`。表头 32、行高 36，标题栏、分页、勾选和字号一起收紧。默认仍是 52 行高。
- 表体默认绘制行分割线。不传 `stripe` 和 `border` 时只有横线。
- `lingyun-table` 支持 `show-footer` 与 `footer-data`。表尾按列 `key` 填值，没写的列留空，并固定在表体下方。

## 1.0.21（2026-10-14）
- 新增 `mp-overlay-gate`：Sheet / Picker / Alert 等浮层打开时占位，图表侧截图并 `hidden` canvas，避免微信原生层盖住弹层。
- 分组内嵌表格时正确去掉 body 内边距与外壳 spacing；Sections demo 增加内嵌表格示例。
## 1.0.20（2026-10-14）
- `lingyun-table` 小程序布局与滚动全面对齐：跟外层高度、中间列裁切、固定列不错位。
- 小程序电脑端滚轮只滚表格，到顶/底再交给页面；松手有惯性滑动；到表底不再回拉页面抖动。
- 小程序竖向悬浮条贴整表最右侧；手机端为细指示条，电脑端为可拖句柄。
- H5 关掉原生滚动条占位，滚到底与固定列对齐；横、竖常显悬浮拖动条，可拖可点。

## 1.0.19（2026-10-14）

- 分组卡片在微信上不再把插槽当成函数调用。原先渲染中断，带图标的卡片报错，白底也按列表自己的宽度撑开。

## 1.0.18（2026-10-13）

- 新增 `lingyun-table`。分组卡片表格，支持固定列、表头不随表体滚动、排序、筛选、分页、多选、斑马纹和单元格竖线。不传 `height` 时表体跟着行数撑开，传入后表体上下滚动。
- 斑马纹行的按压色改用 Fill，盖过条纹底。有固定列时按下整行一起高亮。
- 列 `type` 为 `index` 时显示序号，按当前页顺序编号，翻页接着数。
- 表格标题栏支持图标、标题、刷新、选择列、导出 Excel 和 `#tools`。
- `remote` 时筛选、排序、分页抛 `query-change`，由外部异步回填。`loading` 表示请求进行中。
- 不传 `height` 时表格占满外层高度，外层没有高度时占满页面，表体在其中滚动。行和中间列只渲染可视区域。
- 固定列分隔线与单元格竖线同粗。最右侧固定列不再画外侧竖线。
- 横向滚动条改为悬浮，不占表体高度，只在横向滚动时显示。竖向滚动条不占宽度。滚到底时中间行与固定列对齐。
- 自动高度时表体让出分页的位置，分页不再盖住最后一行。
- 小程序单元格插槽按左、中、右错开列号，避免多个 `cell-0-0` 只渲染第一格。
- 小程序表格跟着外层高度，中间列裁在滚动区内，不再盖住固定列和下一张表。

## 1.0.17（2026-10-12）

- 分组卡片默认不透明分组底，与列表卡片同一档。玻璃改为 `color="glass"`，与 `green` / `blue` 等系统色共用 `color`。去掉 `glass` 布尔属性。描边和阴影默认关闭。
- 分组卡片内嵌列表时，header 以下与列表卡片一致，内容区自动没有内边距。

## 1.0.16（2026-10-10）
- `lingyun-avatar` 支持显示形式 `shape`（直角 / 圆角 / 圆形）和圆角幅度 `radius`，取值与图片相同。不传仍是圆形。
## 1.0.15（2026-10-10）
- 新增 `lingyun-row` 与 `lingyun-col`。24 分栏，支持间隔、偏移、对齐和 xs / sm / md / lg / xl。
## 1.0.14（2026-10-09）
- 新增 `lingyun-mobile` 与 `lingyun-pc`。窗口宽度小于 690 显示前者，达到 690 的平板和电脑显示后者。
## 1.0.13（2026-10-09）
- `lingyun-app-page` 增加 `showToolbar`。为假时不显示头部顶栏，也不再预留顶栏高度。
## 1.0.12（2026-10-09）

- `lingyun-app-page` 增加 `showToolbar`。为假时不显示头部顶栏，也不再预留顶栏高度。
## 1.0.11（2026-10-09）

- 分组卡片增加 `headerLine`。为真时在标题和内容之间画一条横线，默认不画。

## 1.0.10（2026-10-09）

- 宫格不传 `radius` 时不再传给图片，图标圆角跟图片默认 `2xl`（26px）。写了才按传入的值。

## 1.0.9（2026-10-09）

- 分组卡片设置 `color` 后改为系统色实底，不再叠玻璃透明。标题、副标题和说明仍为白色。
- 分组卡片 `radius` 与图片相同。新增 `2xl`（26px），不传默认这一档。通栏仍是直角。
- 图片新增圆角档 `2xl`（26px），不传默认这一档。
- 宫格图片图标可设 `shape` 和 `radius`，取值与图片相同，有值才传入。

## 1.0.8（2026-10-09）

- 宫格增加 `iconSize`，按任意像素控制图标大小。不传为 28。格子或 `items` 里再传则覆盖宫格。

## 1.0.7（2026-10-09）

- 微信里未传 `items` 时不再把插槽宫格渲成空的。只有数组里真有格子才按数据生成。
- 宫格和格子去掉小程序宿主节点，并用 flex-basis 分配列宽，避免格子宽度变成 0。

## 1.0.6（2026-10-09）

- 分组卡片标题左侧可放 `icon` 图片地址。不传 `iconSize` 为 24，`small` 为 16，`large` 为 32。图标在整段标题左侧，主标题和副标题左对齐。
- 分组卡片 `color` 用系统色半透明叠在玻璃上，不再铺实色。着色后标题、副标题和说明为白色。
- 宫格放进分组卡片里时不再自带圆角，圆角由外面的卡片负责。单独使用仍是 26px。
- 宫格可用 `background` 改背景，`transparent` 为透明。传入 `items` 后按数据生成格子。`iconSrc` 或图片地址用 `lingyun-image`。`link` 有值时点击跳转页面。
- 密码框遮住时改用原生 `password`，系统不会切到中文输入法。浏览器自带的明文眼睛收起，只留组件自己的显隐按钮。

## 1.0.5（2026-10-09）

- 未登录时，宽屏左栏「首页」打开 `/pages/demo/demo`。登录后仍打开业务首页。
- 宽屏左栏门槛从 700 收到 690。OPPO Find 展开窗口约 692，原先进不了左侧导航。
- 微信里打开 `lingyun-picker` 时用 `setPageStyle` 锁住页面滚动。滚轮改滚选项，不再带动页面滚动条。不用 `page-meta`：它只能是页面第一个节点，放进组件会被 `wx:if` 包住并报渲染错误。
- 宽屏左栏门店名单行显示，超出胶囊宽度时末尾省略。
- 级联 `lingyun-data-picker` 与普通 `lingyun-picker`（selector）增加 `showSearch`。为真时滚轮下方显示搜索栏；`lingyun-search-bar` 增加 `showMic`，语音按钮默认关闭。
- 宽屏左栏门店滚轮打开搜索，可按门店名过滤。
- 宽屏左栏门店胶囊改回 Gray 5 实底：浅色 `#E5E5EA`，暗黑 `#2C2C2E`。宽度固定为侧栏内容宽，不随店名变化。
- Web 左侧菜单点到未注册页面时，高亮留在点中的那一项。刷新 404 时用地址里的 from 定位到对应菜单。404 页返回首页后，高亮回到首页。
- Picker 浮层内搜索条改为上 12、左右 12、下 28，避免左右过宽且贴住滚轮。
- 凌云UI 组件脚本改为 TypeScript。`render.js`、`wx.wxs` 与内置 `calendar.js` 保持原语言。
- 404 空态「返回首页」在微信里水平居中：行内操作区交叉轴居中，按钮开启 `virtualHost`，避免胶囊贴在组件宿主左侧。
- `lingyun-picker` 脚本改为 TypeScript。日期解析在 `picker-date.ts`，农历文案在 `lunar.ts`。公历农历换算表仍用内置 `calendar.js`。
- `lingyun-menu` 脚本改为 TypeScript。行数据归一化仍从 `normalizeMenuActions` 导出。
- 微信控制台：列表行去掉 `uni-switch` 标签选择器；页面玻璃进度改用小程序组件实例创建交叉观察器，并打开 `nativeMode`。
- 微信 PC 客户端顶栏不再按胶囊抬高。状态栏为 0，栏身与同宽度 H5 一致（宽屏 54，窄屏 60）。
- 宽屏左栏已登录时，顶部为圆角矩形头像、标题，以及当前门店胶囊。切换写入 `useUserStore().storeId`，读这个字段的页面会一起更新。
- 宽屏里点到未注册页面时，404 在顶栏以下的内容区垂直居中。

## 1.0.4（2026-10-08）

- 微信宽屏左侧菜单切到未注册页面时留在当前页，只换右侧内容，侧栏和顶栏不再随跳转拆掉。
- 宽屏左栏菜单项支持 `iconSrc`。后台菜单图标是图片地址时画 22px 图片，字形图标仍走 `lingyun-icon`。
- 演示页 `/pages/demo/screen`：实时显示 `lingyun` 的窗口档、系统、硬件和折叠状态。
- 宽屏左栏顶部支持头像、名称、副标题。页面插槽为 `nav-avatar` / `nav-name` / `nav-subtitle`；全局资料用 `setLingyunPageNavProfile`。
- 默认名称「凌云UI」，副标题「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。名称与内容顶栏对齐，副标题挂在名称下，不撑高栏身。传入自定义名称且不传副标题时，不显示这句介绍。
- 插槽盖过对应的默认图片或文字。H5 送进挂在 body 上的侧栏，微信嵌在当前页。

## 1.0.3（2026-10-08）

- 全局 `lingyun`：当前窗口档、操作系统、是否折叠屏、折叠状态、硬件类型。模板里可写 `lingyun.os == 'ios'`。
- `lingyun-picker-cal-day`：挪到独立目录，微信 easycom 能解析日期格。
- `lingyun-icon`：字形改为直接输出字库字符，并开启 `virtualHost`，圆钮内图标可居中；脚本改为 TypeScript。
- `lingyun-toolbars`：返回、关闭、分享改用 `lingyun-icon`。圆钮仍为 44px，返回图标 28，关闭与分享 26。
- 宽屏左侧菜单支持 `setLingyunPageNavSections` 写入后台数据；不传页面 prop 时，侧栏与首页目录共用这份列表。

## 1.0.2（2026-09-22）

- `lingyun-stepper`：新增 `showValue`，为真时在 − / + 之间展示可编辑的当前值。
- `lingyun-list` / `lingyun-list-item`：首行分割线改为沿 `$parent` 登记一次，去掉列表级 `provide/inject`，避免长列表整表重绘。样式不变。
- 新增 `lingyun-indexed-list`：索引列表，结构对齐 `uni-indexed-list`，分组卡片加右侧字母条。
- 新增 `lingyun-grid` / `lingyun-grid-item`：宫格，结构对齐 `uni-grid`，卡片走分组材质。
- 新增 `lingyun-goods-nav`：商品底栏，结构对齐 `uni-goods-nav`，左侧图标胶囊走控件玻璃，右侧按钮用系统蓝。
- Mac 宽屏停靠左侧导航时，窗口交通灯画在侧栏顶栏，内容顶栏不再重复。
- `lingyun-app-page`：宽屏停靠左侧导航时，`showBack` 为 `auto` 不再显示返回按钮。

## 1.0.1（2026-09-21）

- 修复 `lingyun-segmented-control` 在中文 key 下的选中胶囊错位：段 id 改用 index 生成，不再依赖 key 文本清洗，避免不同中文 key 生成重复 id 导致 `createSelectorQuery` 命中错误节点。

## 1.0.0（2026-09-21）

- 首次发布：一套对齐 Apple Liquid Glass 的 uni-app 多端组件库，所有 lingyun-_ 均位于本包 components/ 下；样式走 lingyun-ui/styles 的 $lingyun-glass-_ token，尺寸一律 px；兼容 H5 与微信小程序（mp-weixin 为硬门禁）。

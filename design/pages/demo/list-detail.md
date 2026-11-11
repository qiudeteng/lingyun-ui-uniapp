# design/pages/demo/list-detail

对应源码：`src/pages/demo/list-detail.vue`

列表 + 详情的主页面：宽屏左列表右详情，窄屏只显示列表，详情走独立页面（`/pages/demo/list-detail-item`）。左栏本身按「独立页面」设计，筛选、搜索、时间切换都在左栏内完成。

- 分栏门槛：窗口宽度 **≥ 900**；iPad 竖屏 768 走单栏，横屏 1024 起分栏；阈值来自页面自己的 `windowWidth`，与页面壳 690 的导航档位解耦
- 分栏布局由 [`lingyun-split-layout`](../../../doc/components/split-layout.md) 提供（≥ `split-at=900` 左右分栏、左栏固定 `list-width=375`，窄屏只渲染左栏；头部量高经作用域插槽 `topSpace` 交给列表 / 详情做占位），本页只写两栏内容与业务
- 宽屏布局：左侧列表栏固定 **375px**（手机逻辑宽度，对齐 `UI_SPEC.md` 1pt = 1px），左右两栏之间一条 **0.5px** 缝隙（1px 布局 + scaleX(0.5)），缝隙透出页面 grouped 底色：白色列表旁自然形成细线，选中行与详情同为 grouped 底色时无缝衔接；右侧详情占满剩余宽度；左侧导航 / 二级菜单列的右边缘统一取内容区底色（视觉上无右线，白色列自身形成边界，不随菜单列有无变色），页面不再叠加，避免三栏时双线变粗；左右各自滚动
- **页面自带 toolbar**：`lingyun-app-page` 的 toolbar 关闭；小程序宽屏宿主页的 toolbar 也通过 `pageHostState.hideToolbar` 隐藏。宽屏左右各一个 `lingyun-toolbars`（`title2LineLeft`、非 fixed、`safe-area` 默认 true，状态栏占位在 toolbar 内部）：左侧「工单 / N 条结果」+ 搜索按钮 + `segments` 状态分段，并设 `avoid-capsule=false`——左栏不是整宽，胶囊在右侧详情上方，不需要为它让位；右侧「工单详情 / 当前单号」保持默认胶囊避让，供详情工具使用。窄屏用同一个左栏 toolbar 作为整页 toolbar（整宽，胶囊避让默认开启；左侧导航未停靠且非宿主时才显示返回——iPad 竖屏从左侧 Tab 进入，不显示返回）。H5 没有系统状态栏，只给 toolbar 内部补 12px `padding-top`。
- **固定高度铺满**：宿主目录页（index / demo）的内容根类已改为 `.directory`，不再用通用 `.page`，避免 40px 底部 padding 串到被托管页面；本页固定 `height:100vh` + `border-box`，仍用 `.list-detail-page .page { padding:0; min-height:0 }` 作为兜底，内容铺满窗口；日期切换条的底部安全区不受影响。
- **微信 PC 端按 Web**：没有系统状态栏 / 胶囊；toolbar 顶部与 H5 一样补 12px；日期条保留自身底部安全区（PC 无系统 `env`，只剩 12px 设计留白，`isLingyunWeixinPc()` 判断）。
- **搜索**：与移动端列表页同一个 toolbar 搜索按钮——点右侧放大镜进入搜索模式，标题区换成输入框，再点取消退出并清空关键词；宽窄屏共用同一份 `searching` / `keyword`
- **左栏 = 独立页面**：自己的 toolbar + 状态分段（`segments` 行）+ 纯列表 + 底部玻璃日期切换条
- **浮动头部**：toolbar（含 `segments` 分段行）绝对定位在左栏顶部，列表从下方穿过；头部高度用 `createSelectorQuery` 实测后给列表做顶部占位，滚动时**整条 toolbar** 进入玻璃
- **浮动日期条**：宽屏下 `lingyun-date-switcher` 绝对定位在左栏底部、浮在列表上方（不占列表布局高度）；列表铺到栏底，尾部留出可滚过日期条的缓冲，日期条毛玻璃能透出下方内容。窄屏（手机）不再用页面绝对定位，改用组件自身的 `fixed` + 安全区模式，底部间距与纯列表页一致，避免小程序上的位置偏移
- **纯列表**：`lingyun-list plain` 全宽平铺，行直接贴左栏两边；无卡片、无圆角、无投影、无分组头；列表行自己的 16 内距与 hairline。宽屏左栏底色用 `grouped-secondary`（浅色白 / 暗黑 `#1c1c1e`）——暗黑下与右侧黑色详情分开层次，选中行（页面底色 `#000`）仍与详情无缝衔接；窄屏整页列表仍用 `Primary Background`
- 控件：`lingyun-toolbars`（宽窄屏共用左栏 toolbar，窄屏 `safe-area=true`）、`lingyun-date-switcher`（非 fixed、浮层）
- 联动：关键词匹配标题 / 客户 / 负责人 / 单号 / 描述；状态与日期范围同时生效；筛选后宽屏自动选中结果第一条，选中项被过滤掉时也会换到第一条；条件变化时列表回到顶部；无结果时列表区展示 `lingyun-empty` + 重置筛选
- 窄屏：页面 toolbar 就是整页顶部（非宿主时带返回），搜索 / 状态 / 列表 / 日期条与宽屏一致；点行 `uni.navigateTo` 打开 `/pages/demo/list-detail-item?id=…`
- 列表行：标题、客户 · 更新时间，右侧状态文字用语义色（待处理橙 / 处理中蓝 / 已完成绿）；宽屏选中行背景用右侧内容区底色（grouped primary，暗黑为 `#000`，与左栏 `#1c1c1e` 形成对比），与详情列同一底色、跨两栏缝隙无缝衔接，不出现深色选中块与边上细线颜色不一致
- 详情：共用业务组件 [`ticket-detail`](../../components/ticket-detail/ticket-detail.md)；右栏 toolbar 同样浮动，详情内容从下方穿过并驱动自身 `glassProgress`；切工单时用 `scroll-into-view` 锚点把右栏滚回顶部，锚点用完即清，避免重渲染反复回顶
- 滚动：页面壳 `body-scroll=false`，左栏列表与右栏各自 `scroll-view`，滚动驱动当前栏 toolbar 的 `glassProgress`
- 数据：`src/pages/demo/listDetailDemo.ts`（38 条工单：8 条完整样例 + 30 条批量样本，覆盖滚动 / 搜索 / 筛选）

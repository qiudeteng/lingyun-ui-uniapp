# design/pages/demo/list-detail

对应源码：`src/pages/demo/list-detail.vue`

列表 + 详情的主页面：宽屏左列表右详情，窄屏只显示列表，详情走独立页面（`/pages/demo/list-detail-item`）。左栏本身按「独立页面」设计，筛选、搜索、时间切换都在左栏内完成。

- 宽屏门槛：窗口宽度 **≥ 690**（`isLingyunWideScreen()`）；窄屏 < 690
- 宽屏布局：左侧列表栏固定 **375px**（手机逻辑宽度，对齐 `UI_SPEC.md` 1pt = 1px），左右两栏之间一条 **0.5px hairline**（1px 画布 scaleX(0.5)，`separator-opaque`），右侧详情占满剩余宽度；左侧导航 / 二级菜单列各自带自己的右侧分割线，页面不再叠加，避免三栏时双线变粗；左右各自滚动
- **宽屏隐藏页面壳 toolbar**（`showPageToolbar`；小程序宽屏宿主内 toolbar 属于宿主，仍保留顶栏占位），左右各用一个 `lingyun-toolbars`（`title2LineLeft`、非 fixed、不占安全区）：左侧「工单 / N 条结果」+ 搜索按钮，右侧「工单详情 / 当前单号」，相当于两张独立页面拼在一起；窄屏保留页面 toolbar（返回 / 标题 / 主题）
- **搜索**：与移动端列表页同一个 toolbar 搜索按钮——点右侧放大镜进入搜索模式，标题区换成输入框，再点取消退出并清空关键词；窄屏用 `lingyun-app-page` 的 `searchable`，宽屏用左栏 toolbar 的 `searchable`，共用 `searching` / `keyword`
- **左栏 = 独立页面**：自己的 toolbar + 状态分段（`segments` 行）+ 纯列表 + 底部玻璃日期切换条
- **浮动头部**：toolbar（含 `segments` 分段行）绝对定位在左栏顶部，列表从下方穿过；头部高度用 `createSelectorQuery` 实测后给列表做顶部占位，滚动时**整条 toolbar** 进入玻璃
- **浮动日期条**：`lingyun-date-switcher` 绝对定位在左栏底部、浮在列表上方（不占列表布局高度）；列表铺到栏底，尾部留出可滚过日期条的缓冲，日期条毛玻璃能透出下方内容
- **纯列表**：左栏用 `Primary Background`，`lingyun-list plain` 全宽平铺，行直接贴左栏两边；无卡片、无圆角、无投影、无分组头；列表行自己的 16 内距与 hairline
- 控件：两栏 `lingyun-toolbars`（左栏带 `segments` 状态分段）、`lingyun-date-switcher`（非 fixed、不占安全区）；不再使用内嵌 `lingyun-search-bar`
- 联动：关键词匹配标题 / 客户 / 负责人 / 单号 / 描述；状态与日期范围同时生效；筛选后宽屏自动选中结果第一条，选中项被过滤掉时也会换到第一条；条件变化时列表回到顶部；无结果时列表区展示 `lingyun-empty` + 重置筛选
- 窄屏：左栏即整页，页面 toolbar 开启 `searchable` 并挂同一份 `segments`；点行 `uni.navigateTo` 打开 `/pages/demo/list-detail-item?id=…`
- 列表行：标题、客户 · 更新时间，右侧状态文字用语义色（待处理橙 / 处理中蓝 / 已完成绿）；宽屏选中行用 `fill.secondary` 高亮
- 详情：共用业务组件 [`ticket-detail`](../../components/ticket-detail/ticket-detail.md)；右栏 toolbar 同样浮动，详情内容从下方穿过并驱动自身 `glassProgress`；切工单时用 `scroll-into-view` 锚点把右栏滚回顶部，锚点用完即清，避免重渲染反复回顶
- 滚动：页面壳 `body-scroll=false`，左栏列表与右栏各自 `scroll-view`，滚动驱动当前栏 toolbar 的 `glassProgress`，并通过 `useLingyunAppPageScroll()` 上报页面壳 / 宿主 toolbar
- 数据：`src/pages/demo/listDetailDemo.ts`（38 条工单：8 条完整样例 + 30 条批量样本，覆盖滚动 / 搜索 / 筛选）

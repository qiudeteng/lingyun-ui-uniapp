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

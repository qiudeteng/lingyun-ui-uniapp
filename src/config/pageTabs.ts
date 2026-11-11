/**
 * Demo 站导航唯一数据源。
 * 首页、底部 Tab / 工作台、宽屏侧栏、宽屏宿主页都由这份数据派生，避免多处维护漂移。
 */
import type {
  LingyunPageConfig,
  LingyunPageTab,
  LingyunPageTabChild,
} from '@/uni_modules/lingyun-ui'

interface NavMeta {
  title: string
  icon: string
  note: string
}

/** 每个 demo 页的图标与说明，只做元数据，不再维护第二份入口清单 */
const NAV_META: Record<string, NavMeta> = {
  '/pages/guide/start': { title: '接入', icon: 'info', note: '安装 · 页面壳 · 宽屏与 Tab' },
  '/pages/demo/order-goods': { title: '点单加购', icon: 'cart', note: '标准页 · 分类联动 / 购物车' },
  '/pages/demo/purchase-order-list': { title: '订货单列表', icon: 'list', note: '标准页 · 状态筛选 / 多批配送' },
  '/pages/demo/purchase-order-detail': { title: '订货单详情', icon: 'list', note: '标准页 · 状态 / 商品 / 金额 / 物流' },
  '/pages/demo/purchase-order-split': { title: '订货单列表与详情', icon: 'list', note: '标准页 · 宽屏左右分栏 / 窄屏独立详情' },
  '/pages/demo/records': { title: '记录列表', icon: 'list', note: '列表 · 筛选 · 搜索 · 时间选择' },
  '/pages/demo/plain-list': { title: '纯列表', icon: 'list', note: '全宽平铺 · 搜索 / 筛选 / 底部时间' },
  '/pages/demo/list-detail': { title: '列表与详情', icon: 'bars', note: '宽屏左右分栏 · 手机独立详情页' },
  '/pages/demo/list-detail-item': { title: '工单详情', icon: 'list', note: '列表与详情 · 手机端独立页面' },
  '/pages/demo/workbench': { title: '工作台', icon: 'bars', note: '二级 / 三级菜单工作台' },
  '/pages/demo/buttons': { title: 'Buttons', icon: 'circle', note: '按钮 · Glass / Prominent' },
  '/pages/demo/icons': { title: 'Icons', icon: 'star', note: '图标字体 · lingyun-icon' },
  '/pages/demo/scan': { title: 'Scan', icon: 'scan', note: '扫码 · 原生 / scanFn / 自定义触发' },
  '/pages/demo/qrcode': { title: 'QR Code', icon: 'scan', note: '二维码 · 前端生成 / 导出' },
  '/pages/demo/barcode': { title: 'Barcode', icon: 'bars', note: '条码 · Code128 / Code39 / EAN13' },
  '/pages/demo/badges': { title: 'Badges', icon: 'notification', note: '角标' },
  '/pages/demo/segmented-controls': { title: 'Segmented Controls', icon: 'tune', note: '分段控件' },
  '/pages/demo/tags': { title: 'Tags & Chips', icon: 'flag', note: '标签 · 筛选胶囊' },
  '/pages/demo/texts': { title: 'Text', icon: 'font', note: '文本 · 字阶 / 颜色' },
  '/pages/demo/markdown': { title: 'Markdown', icon: 'font', note: 'Markdown 预览 · 标题 / 列表 / 代码 / 表格' },
  '/pages/demo/images': { title: 'Image', icon: 'image', note: '图片 · 懒加载 / 圆角' },
  '/pages/demo/image-upload': { title: 'Image Upload', icon: 'images', note: '图片上传 · 选图 / 旋转裁剪 / 上传' },
  '/pages/demo/file-upload': { title: 'File Upload', icon: 'paperclip', note: '文件上传 · 列表 / 进度 / 预览' },
  '/pages/demo/file-upload-system': { title: 'System File', icon: 'folder-add', note: '系统文件 · web-view + H5' },
  '/pages/demo/signature': { title: 'Signature', icon: 'compose', note: '手写签名 · 触控 / 鼠标 / 导出 PNG' },
  '/pages/demo/avatars': { title: 'Avatars', icon: 'person', note: '头像' },
  '/pages/demo/page-controls': { title: 'Page Control', icon: 'more', note: '轮播指示点' },
  '/pages/demo/forms': { title: 'Forms', icon: 'list', note: '表单容器 · Grouped 行布局' },
  '/pages/demo/text-fields': { title: 'Text Fields', icon: 'compose', note: '输入框 · Label / Secure / Multiline' },
  '/pages/demo/switches': { title: 'Switch & Stepper', icon: 'settings', note: '开关与步进器' },
  '/pages/demo/checks': { title: 'Checkbox & Radio', icon: 'circle', note: '多选 / 单选 · data 驱动' },
  '/pages/demo/sliders': { title: 'Slider', icon: 'tune', note: '滑条' },
  '/pages/demo/rating': { title: 'Rating', icon: 'star', note: '评分 · 整星 / 半星 / 可清除' },
  '/pages/demo/pickers': { title: 'Pickers', icon: 'bars', note: '选择器 · 级联 data-picker' },
  '/pages/demo/date-time-pickers': { title: 'Date & Time', icon: 'calendar', note: '日期 / 时间 / 日期时间 · 起止 · 表单' },
  '/pages/demo/date-switcher': { title: 'Date Switcher', icon: 'calendar', note: '底部日期切换条 · 天 / 周 / 月 / 年 / 日期段' },
  '/pages/demo/date-text': { title: 'Date Text', icon: 'calendar', note: '日期显示 · 今天 / 昨天 / 明天 · 精度' },
  '/pages/demo/calendar': { title: 'Calendar', icon: 'calendar', note: '日历 · 单选 / 范围 / 标记' },
  '/pages/demo/location-picker': { title: 'Location Picker', icon: 'location', note: '位置选择 · 门店 / 收货地址' },
  '/pages/demo/combobox': { title: 'Combobox', icon: 'search', note: '可搜索选择 · 搜索列表' },
  '/pages/demo/token-field': { title: 'Token Field', icon: 'flag', note: '多选标签输入 · 建议 / 上限' },
  '/pages/demo/amount-text': { title: 'Amount Text', icon: 'wallet', note: '金额显示 · 万 / 亿 / 万亿 · 小数位' },
  '/pages/demo/toolbars': { title: 'Toolbars', icon: 'bars', note: '顶栏 · 滚动玻璃' },
  '/pages/demo/screen': { title: 'Screen', icon: 'tune', note: '窗口档 · 系统 · 折叠 · 硬件' },
  '/pages/demo/responsive': { title: 'Mobile / PC', icon: 'tune', note: '窄屏与平板、电脑分开展示' },
  '/pages/demo/app-page': { title: 'App Page', icon: 'bars', note: '数据驱动页面壳 · Tab / 侧栏自动切换' },
  '/pages/demo/tabbars': { title: 'Tab Bars', icon: 'list', note: '底部标签栏' },
  '/pages/demo/tabs': { title: 'Tabs', icon: 'bars', note: '顶部 Tabs · underline / pill / 滚动' },
  '/pages/demo/sidebars': { title: 'Sidebar', icon: 'bars', note: '悬浮玻璃侧栏' },
  '/pages/demo/search-bar': { title: 'Search Bar', icon: 'search', note: '搜索栏' },
  '/pages/demo/lists': { title: 'Lists', icon: 'list', note: '分组列表' },
  '/pages/demo/tables': { title: 'Tables', icon: 'list', note: '分组表格 · 固定列 · 分页' },
  '/pages/demo/grid': { title: 'Grid', icon: 'bars', note: '宫格 · 快捷入口' },
  '/pages/demo/layout': { title: 'Layout', icon: 'bars', note: '24 分栏 · 间隔 · 偏移' },
  '/pages/demo/indexed-list': { title: 'Indexed List', icon: 'list', note: '索引列表 · 字母跳转' },
  '/pages/demo/sections': { title: 'Sections', icon: 'list', note: '分组卡片 · Glass / Plain / 布局' },
  '/pages/demo/accordion': { title: 'Accordion', icon: 'list', note: '折叠分组 · 单开 / 多开' },
  '/pages/demo/banner': { title: 'Banner', icon: 'image', note: '营销横幅 · 图片 / 卡片' },
  '/pages/demo/steps': { title: 'Steps', icon: 'bars', note: '步骤条 · 横向 / 纵向 / 状态' },
  '/pages/demo/timeline': { title: 'Timeline', icon: 'list', note: '时间线 · 轨迹 / 日志 / 状态' },
  '/pages/demo/load-more': { title: 'Load More', icon: 'bottom', note: '加载更多 · 触底 / 状态' },
  '/pages/demo/pagination': { title: 'Pagination', icon: 'more', note: '分页 · 页码窗口 / 简单模式' },
  '/pages/demo/swipe-actions': { title: 'Swipe Actions', icon: 'right', note: '列表左右滑菜单' },
  '/pages/demo/empty': { title: 'Empty', icon: 'info', note: '空态' },
  '/pages/demo/skeletons': { title: 'Skeleton', icon: 'more', note: '骨架屏' },
  '/pages/demo/refresh': { title: 'Refresh', icon: 'refresh', note: '下拉刷新' },
  '/pages/demo/activity-indicator': { title: 'Activity Indicator', icon: 'loop', note: '转圈加载' },
  '/pages/demo/progress': { title: 'Progress', icon: 'download', note: '线性 / 环形进度' },
  '/pages/demo/toasts': { title: 'Toast & HUD', icon: 'chat', note: '轻提示 · 加载遮罩' },
  '/pages/demo/notice-bar': { title: 'Notice Bar', icon: 'info', note: '通知条 · 信息 / 成功 / 警告 / 错误' },
  '/pages/demo/alerts': { title: 'Alerts', icon: 'info', note: '居中弹窗' },
  '/pages/demo/sheets': { title: 'Sheets', icon: 'list', note: '底部 Sheet · medium / large' },
  '/pages/demo/action-sheets': { title: 'Action Sheets', icon: 'bars', note: '底部操作列表 · Cancel' },
  '/pages/demo/activity-views': { title: 'Activity Views', icon: 'paperplane', note: '分享面板 · 半高 / 全高' },
  '/pages/demo/popovers': { title: 'Popover', icon: 'chat', note: '锚定浮层' },
  '/pages/demo/tooltip': { title: 'Tooltip', icon: 'info', note: '轻量说明 · hover / 点击 / 长按' },
  '/pages/demo/menus': { title: 'Menus', icon: 'more', note: '弹出菜单 · 长按' },
  '/pages/demo/filter-menu': { title: 'Filter Menu', icon: 'tune', note: '顶部筛选 · 全宽菜单' },
  '/pages/demo/toolbar-search': { title: 'Toolbar Search', icon: 'search', note: '顶部搜索 · 输入框 / 取消' },
  '/pages/demo/toolbar-segments': { title: 'Toolbar Segments', icon: 'more', note: '顶栏下方分段 · click / change' },
  '/pages/demo/toolbar-comprehensive': { title: 'All In One', icon: 'star', note: '筛选 + 搜索 + 分段' },
  '/pages/demo/fab': { title: 'Fab', icon: 'plusempty', note: '悬浮按钮 · 展开菜单' },
  '/pages/demo/goods-nav': { title: 'Goods Nav', icon: 'cart', note: '商品底栏 · 店铺 / 购物车 / 购买' },
  '/pages/demo/charts/column': { title: 'Column', icon: 'bars', note: '柱状图' },
  '/pages/demo/charts/stack': { title: 'Stack', icon: 'bars', note: '堆积图' },
  '/pages/demo/charts/bar': { title: 'Bar', icon: 'bars', note: '条状图' },
  '/pages/demo/charts/line': { title: 'Line', icon: 'tune', note: '折线图' },
  '/pages/demo/charts/curve': { title: 'Curve', icon: 'tune', note: '曲线图' },
  '/pages/demo/charts/area': { title: 'Area', icon: 'image', note: '区域图' },
  '/pages/demo/charts/pie': { title: 'Pie', icon: 'circle', note: '饼图' },
  '/pages/demo/charts/ring': { title: 'Ring', icon: 'loop', note: '圆环图' },
  '/pages/demo/charts/rose': { title: 'Rose', icon: 'star', note: '玫瑰图' },
  '/pages/demo/charts/funnel': { title: 'Funnel', icon: 'download', note: '漏斗图' },
  '/pages/demo/charts/radar': { title: 'Radar', icon: 'flag', note: '雷达图' },
  '/pages/demo/charts/gauge': { title: 'Gauge', icon: 'info', note: '仪表盘' },
  '/pages/demo/charts/arcbar': { title: 'Arcbar', icon: 'loop', note: '圆弧进度' },
  '/pages/demo/charts/mount': { title: 'Mount', icon: 'bars', note: '山峰图' },
  '/pages/demo/charts/mix': { title: 'Mix', icon: 'tune', note: '混合图' },
  '/pages/demo/charts/scatter': { title: 'Scatter', icon: 'circle', note: '散点图' },
  '/pages/demo/charts/bubble': { title: 'Bubble', icon: 'circle', note: '气泡图' },
  '/pages/demo/charts/candle': { title: 'Candle', icon: 'bars', note: 'K 线图' },
  '/pages/demo/charts/word': { title: 'Word', icon: 'font', note: '词云图' },
  '/pages/demo/charts/map': { title: 'Map', icon: 'map', note: '地图' },
  '/pages/demo/charts/tline': { title: 'Time Line', icon: 'calendar', note: '时间轴折线' },
  '/pages/demo/charts/tarea': { title: 'Time Area', icon: 'calendar', note: '时间轴区域' },
  '/pages/demo/swiper': { title: 'Swiper', icon: 'images', note: '图片轮播 · 自动 / 指示点 / 手势' },
}

function demoChildKey(url: string): string {
  return (
    url
      .replace(/^\/pages\/demo\//, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'page'
  )
}

/** 入口文案与分组以本文件为准，图标 / 说明从 NAV_META 取 */
function navChild(
  url: string,
  text?: string,
  note?: string,
): LingyunPageTabChild {
  const meta = NAV_META[url]
  return {
    key: demoChildKey(url),
    text: text || meta?.title || url,
    icon: meta?.icon || 'circle',
    url,
    note: note || meta?.note || '',
  }
}

function pageChild(
  key: string,
  text: string,
  icon: string,
  url: string,
  note: string,
): LingyunPageTabChild {
  return { key, text, icon, url, note }
}

function group(
  key: string,
  text: string,
  items: LingyunPageTabChild[],
): LingyunPageTabChild {
  return { key, text, children: items }
}

/* 接入只有二级菜单：工作台渲染成一张没有标题的卡片 */
const GUIDE_CHILDREN: LingyunPageTabChild[] = [
  navChild('/pages/guide/start', '接入指南'),
]

const COMPONENT_CHILDREN: LingyunPageTabChild[] = [
  group('components-nav', '页面与导航', [
    navChild('/pages/demo/app-page', '页面壳'),
    navChild('/pages/demo/responsive', '响应式'),
    navChild('/pages/demo/screen', '屏幕'),
    navChild('/pages/demo/toolbars', '顶栏'),
    navChild('/pages/demo/tabbars', '底栏'),
    navChild('/pages/demo/tabs', '顶部 Tabs'),
    navChild('/pages/demo/search-bar', '搜索栏'),
    navChild('/pages/demo/sidebars', '侧栏浮层'),
  ]),
  group('components-basic', '基础控件', [
    navChild('/pages/demo/layout', '布局'),
    navChild('/pages/demo/buttons', '按钮'),
    navChild('/pages/demo/icons', '图标'),
    navChild('/pages/demo/scan', '扫码'),
    navChild('/pages/demo/qrcode', '二维码'),
    navChild('/pages/demo/barcode', '条码'),
    navChild('/pages/demo/badges', '角标'),
    navChild('/pages/demo/segmented-controls', '分段控件'),
    navChild('/pages/demo/tags', '标签与胶囊'),
    navChild('/pages/demo/texts', '文本'),
    navChild('/pages/demo/markdown', 'Markdown'),
    navChild('/pages/demo/amount-text', '金额显示'),
    navChild('/pages/demo/date-text', '日期显示'),
    navChild('/pages/demo/images', '图片'),
    navChild('/pages/demo/swiper', '图片轮播'),
    navChild('/pages/demo/avatars', '头像'),
    navChild('/pages/demo/page-controls', '分页点'),
  ]),
  group('components-form', '表单', [
    navChild('/pages/demo/text-fields', '输入框'),
    navChild('/pages/demo/image-upload', '图片上传'),
    navChild('/pages/demo/file-upload', '文件上传'),
    navChild('/pages/demo/file-upload-system', '系统文件'),
    navChild('/pages/demo/signature', '手写签名'),
    navChild('/pages/demo/forms', '表单'),
    navChild('/pages/demo/switches', '开关与步进器'),
    navChild('/pages/demo/checks', '复选框与单选'),
    navChild('/pages/demo/sliders', '滑条'),
    navChild('/pages/demo/rating', '评分'),
    navChild('/pages/demo/pickers', '选择器'),
    navChild('/pages/demo/date-time-pickers', '日期与时间'),
    navChild('/pages/demo/date-switcher', '日期切换器'),
    navChild('/pages/demo/calendar', '日历'),
    navChild('/pages/demo/location-picker', '位置选择'),
    navChild('/pages/demo/combobox', '可搜索选择'),
    navChild('/pages/demo/token-field', '标签输入'),
  ]),
  group('components-content', '列表与内容', [
    navChild('/pages/demo/lists', '列表'),
    navChild('/pages/demo/sections', '分组卡片'),
    navChild('/pages/demo/accordion', '折叠分组'),
    navChild('/pages/demo/banner', '横幅'),
    navChild('/pages/demo/steps', '步骤条'),
    navChild('/pages/demo/timeline', '时间线'),
    navChild('/pages/demo/load-more', '加载更多'),
    navChild('/pages/demo/pagination', '分页'),
    navChild('/pages/demo/tables', '表格'),
    navChild('/pages/demo/swipe-actions', '滑动操作'),
    navChild('/pages/demo/empty', '空状态'),
    navChild('/pages/demo/skeletons', '骨架屏'),
    navChild('/pages/demo/refresh', '下拉刷新'),
    navChild('/pages/demo/grid', '宫格'),
    navChild('/pages/demo/indexed-list', '索引列表'),
  ]),
  group('components-feedback', '反馈', [
    navChild('/pages/demo/activity-indicator', '加载转圈'),
    navChild('/pages/demo/progress', '进度'),
    navChild('/pages/demo/toasts', '轻提示'),
    navChild('/pages/demo/notice-bar', '通知条'),
  ]),
  group('components-overlay', '浮层', [
    navChild('/pages/demo/alerts', '弹窗'),
    navChild('/pages/demo/sheets', '底部面板'),
    navChild('/pages/demo/action-sheets', '操作列表'),
    navChild('/pages/demo/activity-views', '分享面板'),
    navChild('/pages/demo/popovers', '气泡'),
    navChild('/pages/demo/tooltip', '轻提示气泡'),
    navChild('/pages/demo/menus', '菜单'),
    navChild('/pages/demo/filter-menu', '筛选菜单'),
    navChild('/pages/demo/toolbar-search', '顶部搜索'),
    navChild('/pages/demo/toolbar-segments', '顶部分段'),
    navChild('/pages/demo/toolbar-comprehensive', '顶栏综合'),
    navChild('/pages/demo/fab', '悬浮按钮'),
    navChild('/pages/demo/goods-nav', '商品导航'),
  ]),
]

/* 图表只有二级菜单：同样是一张没有标题的卡片 */
const CHART_CHILDREN: LingyunPageTabChild[] = [
    navChild('/pages/demo/charts/column', '柱状图'), // Column
    navChild('/pages/demo/charts/stack', '堆积图'), // Stack
    navChild('/pages/demo/charts/bar', '条状图'), // Bar
    navChild('/pages/demo/charts/line', '折线图'), // Line
    navChild('/pages/demo/charts/curve', '曲线图'), // Curve
    navChild('/pages/demo/charts/area', '区域图'), // Area
    navChild('/pages/demo/charts/pie', '饼图'), // Pie
    navChild('/pages/demo/charts/ring', '圆环图'), // Ring
    navChild('/pages/demo/charts/rose', '玫瑰图'), // Rose
    navChild('/pages/demo/charts/funnel', '漏斗图'), // Funnel
    navChild('/pages/demo/charts/radar', '雷达图'), // Radar
    navChild('/pages/demo/charts/gauge', '仪表盘'), // Gauge
    navChild('/pages/demo/charts/arcbar', '圆弧进度'), // Arcbar
    navChild('/pages/demo/charts/mount', '山峰图'), // Mount
    navChild('/pages/demo/charts/mix', '混合图'), // Mix
    navChild('/pages/demo/charts/scatter', '散点图'), // Scatter
    navChild('/pages/demo/charts/bubble', '气泡图'), // Bubble
    navChild('/pages/demo/charts/candle', 'K 线图'), // Candle
    navChild('/pages/demo/charts/word', '词云图'), // Word
    navChild('/pages/demo/charts/map', '地图'), // Map
    navChild('/pages/demo/charts/tline', '时间轴折线'), // Time Line
    navChild('/pages/demo/charts/tarea', '时间轴区域'), // Time Area
]

const PAGE_CHILDREN: LingyunPageTabChild[] = [
  group('pages-standard', '标准页面', [
    pageChild(
      'page-login',
      '登录',
      'person',
      '/pages/login/login',
      '账号密码登录 · 协议 Sheet',
    ),
    pageChild('page-404', '404', 'info', '/pages/404/404', '缺失页面'),
    pageChild(
      'page-order-goods',
      '点单加购',
      'cart',
      '/pages/demo/order-goods',
      '标准页 · 左右分类 / 购物车',
    ),
    pageChild(
      'page-purchase-order-list',
      '订货单列表',
      'list',
      '/pages/demo/purchase-order-list',
      '标准页 · 状态筛选 / 多批配送',
    ),
    pageChild(
      'page-purchase-order-detail',
      '订货单详情',
      'list',
      '/pages/demo/purchase-order-detail',
      '标准页 · 子订货单 / 物流 / 金额',
    ),
    pageChild(
      'page-purchase-order-split',
      '订货单列表与详情',
      'list',
      '/pages/demo/purchase-order-split',
      '标准页 · 宽屏分栏 / 窄屏详情页',
    ),
    pageChild(
      'page-records',
      '记录列表',
      'list',
      '/pages/demo/records',
      '列表 · 筛选 · 搜索 · 时间选择',
    ),
    pageChild(
      'page-plain-list',
      '纯列表',
      'list',
      '/pages/demo/plain-list',
      '全宽平铺 · 搜索 / 筛选 / 底部时间',
    ),
    pageChild(
      'page-list-detail',
      '列表与详情',
      'bars',
      '/pages/demo/list-detail',
      '宽屏左右分栏 · 手机独立详情页',
    ),
    pageChild(
      'page-workbench',
      '工作台',
      'bars',
      '/pages/demo/workbench',
      '二级 / 三级菜单工作台',
    ),
  ]),
]

export interface LingyunDemoNavGroup {
  key: string
  /** 空字符串表示没有分组标题 */
  title: string
  items: LingyunPageTabChild[]
}

/** 把 Tab 的二级 / 三级 children 拍平成首页和侧栏可渲染的分组 */
export function getLingyunDemoTabGroups(tab: LingyunPageTab): LingyunDemoNavGroup[] {
  const list = tab.children || []
  const grouped: LingyunDemoNavGroup[] = []
  const loose: LingyunPageTabChild[] = []
  list.forEach((entry) => {
    const nested = (entry.children || []).filter((item) => !!item.url)
    if (nested.length) {
      grouped.push({ key: entry.key, title: entry.text, items: nested })
      return
    }
    if (entry.url) loose.push(entry)
  })
  if (loose.length) {
    grouped.push({ key: `${tab.key}__loose`, title: '', items: loose })
  }
  return grouped
}

/** 首页 / 组件目录使用的完整分组：所有带 children 的 Tab 按同一份数据拍平 */
export function getLingyunDemoHomeGroups(): LingyunDemoNavGroup[] {
  return DEMO_PAGE_TABS.filter(
    (tab) => tab.key !== 'home' && !!tab.children && tab.children.length > 0,
  ).flatMap((tab) =>
    getLingyunDemoTabGroups(tab).map((group) => ({
      key: `${tab.key}-${group.key}`,
      title: group.title || tab.text || '',
      items: group.items,
    })),
  )
}

export const DEMO_PAGE_TABS: LingyunPageTab[] = [
  {
    key: 'home',
    text: '首页',
    icon: 'home',
    url: '/pages/index/index',
  },
  {
    key: 'guide',
    text: '接入',
    icon: 'info',
    url: '/pages/guide/start',
    children: GUIDE_CHILDREN,
  },
  {
    key: 'components',
    text: '组件',
    icon: 'star',
    url: '/pages/demo/demo',
    children: COMPONENT_CHILDREN,
  },
  {
    key: 'charts',
    text: '图表',
    icon: 'bars',
    url: '/pages/demo/charts/column',
    children: CHART_CHILDREN,
  },
  {
    key: 'pages',
    text: '页面',
    icon: 'list',
    url: '/pages/login/login',
    children: PAGE_CHILDREN,
  },
]

export const DEMO_PAGE_CONFIG: Partial<LingyunPageConfig> = {
  tabs: DEMO_PAGE_TABS,
  workspaceUrl: '/pages/demo/workbench',
  layout: { navMode: 'auto' },
  pages: {
    '/pages/login/login': { hideTabbar: true, hideNav: true },
    '/pages/login/user-agreement': { hideTabbar: true, hideNav: true },
    '/pages/login/privacy-policy': { hideTabbar: true, hideNav: true },
    '/pages/404/404': { hideTabbar: true, hideNav: true },
    '/pages/demo/search-bar': { hideTabbar: true },
    '/pages/demo/goods-nav': { hideTabbar: true },
    '/pages/demo/tabbars': { hideTabbar: true },
  },
}

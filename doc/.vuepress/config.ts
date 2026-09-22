import { viteBundler } from '@vuepress/bundler-vite'
import { slimsearchPlugin } from '@vuepress/plugin-slimsearch'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

const guideSidebar = [
  {
    text: '接入',
    children: [
      { text: '接入', link: '/guide/start.html' },
      { text: '反馈', link: '/guide/feedback.html' },
    ],
  },
]

const chartSidebar = [
  {
    text: '图表',
    children: [
      { text: '图表', link: '/charts/' },
      { text: '柱状图', link: '/charts/column.html' },
      { text: '条状图', link: '/charts/bar.html' },
      { text: '折线图', link: '/charts/line.html' },
      { text: '区域图', link: '/charts/area.html' },
      { text: '饼图', link: '/charts/pie.html' },
      { text: '圆环图', link: '/charts/ring.html' },
      { text: '玫瑰图', link: '/charts/rose.html' },
      { text: '漏斗图', link: '/charts/funnel.html' },
      { text: '雷达图', link: '/charts/radar.html' },
      { text: '仪表盘', link: '/charts/gauge.html' },
      { text: '圆弧进度', link: '/charts/arcbar.html' },
      { text: '山峰图', link: '/charts/mount.html' },
      { text: '混合图', link: '/charts/mix.html' },
      { text: '散点图', link: '/charts/scatter.html' },
      { text: '气泡图', link: '/charts/bubble.html' },
      { text: 'K 线图', link: '/charts/candle.html' },
      { text: '词云图', link: '/charts/word.html' },
      { text: '时间轴折线', link: '/charts/tline.html' },
      { text: '时间轴区域', link: '/charts/tarea.html' },
    ],
  },
]

const componentSidebar = [
  {
    text: '页面与导航',
    children: [
      { text: '页面壳', link: '/components/app-page.html' },
      { text: '宽屏目录', link: '/components/page-nav.html' },
      { text: '顶栏', link: '/components/toolbars.html' },
      { text: '底栏', link: '/components/tabbars.html' },
      { text: '搜索栏', link: '/components/search-bar.html' },
      { text: '侧栏浮层', link: '/components/sidebar.html' },
    ],
  },
  {
    text: '基础控件',
    children: [
      { text: '按钮', link: '/components/button.html' },
      { text: '图标', link: '/components/icon.html' },
      { text: '角标', link: '/components/badge.html' },
      { text: '分段控件', link: '/components/segmented-control.html' },
      { text: '标签', link: '/components/tag.html' },
      { text: '筛选胶囊', link: '/components/chip.html' },
      { text: '文本', link: '/components/text.html' },
      { text: '图片', link: '/components/image.html' },
      { text: '头像', link: '/components/avatar.html' },
      { text: '分页点', link: '/components/page-control.html' },
    ],
  },
  {
    text: '表单',
    children: [
      { text: '输入框', link: '/components/text-field.html' },
      { text: '表单', link: '/components/form.html' },
      { text: '表单分组', link: '/components/form-group.html' },
      { text: '表单行', link: '/components/form-item.html' },
      { text: '开关', link: '/components/switch.html' },
      { text: '步进器', link: '/components/stepper.html' },
      { text: '复选框', link: '/components/checkbox.html' },
      { text: '单选', link: '/components/radio.html' },
      { text: '单选组', link: '/components/radio-group.html' },
      { text: '多选列表', link: '/components/data-checkbox.html' },
      { text: '单选列表', link: '/components/data-radio.html' },
      { text: '滑条', link: '/components/slider.html' },
      { text: '选择器', link: '/components/picker.html' },
      { text: '级联选择', link: '/components/data-picker.html' },
    ],
  },
  {
    text: '列表与内容',
    children: [
      { text: '列表', link: '/components/list.html' },
      { text: '列表行', link: '/components/list-item.html' },
      { text: '分组卡片', link: '/components/section.html' },
      { text: '滑动容器', link: '/components/swipe-action.html' },
      { text: '滑动行', link: '/components/swipe-action-item.html' },
      { text: '空状态', link: '/components/empty.html' },
      { text: '骨架屏', link: '/components/skeleton.html' },
      { text: '下拉刷新', link: '/components/refresh.html' },
      { text: '宫格', link: '/components/grid.html' },
      { text: '索引列表', link: '/components/indexed-list.html' },
    ],
  },
  {
    text: '反馈',
    children: [
      { text: '加载转圈', link: '/components/activity-indicator.html' },
      { text: '进度', link: '/components/progress.html' },
      { text: '轻提示', link: '/components/toast.html' },
      { text: '加载遮罩', link: '/components/hud.html' },
      { text: '反馈宿主', link: '/components/feedback-host.html' },
    ],
  },
  {
    text: '浮层',
    children: [
      { text: '弹窗', link: '/components/alert.html' },
      { text: '底部面板', link: '/components/sheets.html' },
      { text: '操作列表', link: '/components/action-sheet.html' },
      { text: '分享面板', link: '/components/activity-view.html' },
      { text: '气泡', link: '/components/popover.html' },
      { text: '菜单', link: '/components/menu.html' },
      { text: '上下文菜单', link: '/components/context-menu.html' },
      { text: '悬浮按钮', link: '/components/fab.html' },
      { text: '商品导航', link: '/components/goods-nav.html' },
    ],
  },
]

export default defineUserConfig({
  lang: 'zh-CN',
  title: '凌云UI 使用手册',
  description: '组件用法与示例',
  bundler: viteBundler(),
  theme: defaultTheme({
    repo: 'qiudeteng/lingyun-ui-uniapp',
    repoLabel: 'GitHub',
    sidebarDepth: 0,
    navbar: [
      { text: '接入', link: '/guide/start.html', activeMatch: '^/guide/' },
      { text: '组件', link: '/components/app-page.html', activeMatch: '^/components/' },
      { text: '图表', link: '/charts/', activeMatch: '^/charts/' },
    ],
    sidebar: {
      '/guide/': guideSidebar,
      '/charts/': chartSidebar,
      '/components/': componentSidebar,
    },
  }),
  plugins: [
    slimsearchPlugin({
      indexContent: true,
    }),
  ],
})

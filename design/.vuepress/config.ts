/**
 * VuePress 配置：把 design/ 直接当作文档源。
 *
 * 约定：md 文件本身不为建站改动，导航与分组全部收在本文件里。
 * 启动：pnpm docs:dev   构建：pnpm docs:build（产物 design/.vuepress/dist）
 */
import { viteBundler } from '@vuepress/bundler-vite'
import { slimsearchPlugin } from '@vuepress/plugin-slimsearch'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

import { injectLingyunDocs } from './plugins/injectLingyunDocs'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '凌云UI · 设计规范',
  description: 'Apple Liquid Glass 设计规范与 凌云UI 组件文档',

  head: [['meta', { name: 'theme-color', content: '#007aff' }]],

  bundler: viteBundler(),

  theme: defaultTheme({
    repo: 'qiudeteng/lingyun-ui-uniapp',
    repoLabel: 'GitHub',
    navbar: [
      { text: 'UI 规范', link: '/UI_SPEC.md' },
      { text: '组件清单', link: '/COMPONENTS.md' },
      {
        text: '凌云UI',
        children: [
          { text: '使用说明', link: '/lingyun-ui/readme.html' },
          { text: '更新日志', link: '/lingyun-ui/changelog.html' },
          { text: 'Charts 使用说明', link: '/lingyun-ui-charts/readme.html' },
        ],
      },
      { text: '页面设计', link: '/pages/demo/buttons.md' },
    ],

    sidebar: [
      {
        text: '总则',
        collapsible: false,
        children: [
          { text: '目录规则', link: '/' },
          { text: 'Liquid Glass UI 规范', link: '/UI_SPEC.md' },
          { text: 'Colors · 系统色', link: '/COLORS.md' },
          { text: 'Icons · 图标', link: '/ICONS.md' },
          { text: 'Text · 字阶', link: '/TEXTS.md' },
          { text: '组件清单与规划', link: '/COMPONENTS.md' },
        ],
      },
      {
        text: '控件',
        collapsible: true,
        children: [
          { text: 'Buttons · 按钮', link: '/BUTTONS.md' },
          { text: 'Text Fields · 输入框', link: '/TEXTFIELDS.md' },
          { text: 'Forms · 表单', link: '/FORMS.md' },
          { text: 'Checks · 勾选', link: '/CHECKS.md' },
          { text: 'Switches · 开关与步进', link: '/SWITCHES.md' },
          { text: 'Sliders · 滑块', link: '/SLIDERS.md' },
          { text: 'Segmented Controls · 分段', link: '/SEGMENTED_CONTROLS.md' },
          { text: 'Pickers · 选择器', link: '/PICKERS.md' },
          { text: 'Page Controls · 分页点', link: '/PAGE_CONTROLS.md' },
        ],
      },
      {
        text: '导航与栏',
        collapsible: true,
        children: [
          { text: 'Tab Bars · 底部标签栏', link: '/TABBARS.md' },
          { text: 'Toolbars · 顶栏', link: '/TOOLBARS.md' },
          { text: 'Search Bars · 搜索条', link: '/SEARCHBARS.md' },
          { text: 'Menus · 菜单', link: '/MENUS.md' },
        ],
      },
      {
        text: '浮层',
        collapsible: true,
        children: [
          { text: 'Alerts · 弹窗', link: '/ALERTS.md' },
          { text: 'Sheets · 底部面板', link: '/SHEETS.md' },
          { text: 'Action Sheets · 操作列表', link: '/ACTIONSHEETS.md' },
          { text: 'Popovers · 气泡', link: '/POPOVERS.md' },
          { text: 'Toasts & HUD · 轻提示', link: '/TOASTS.md' },
        ],
      },
      {
        text: '列表与内容',
        collapsible: true,
        children: [
          { text: 'Lists · 分组列表', link: '/LISTS.md' },
          { text: 'Swipe Actions · 滑动操作', link: '/SWIPE_ACTIONS.md' },
          { text: 'Images · 图片', link: '/IMAGES.md' },
          { text: 'Charts · 图表', link: '/CHARTS.md' },
          { text: 'Avatars · 头像', link: '/AVATARS.md' },
          { text: 'Badges · 角标', link: '/BADGES.md' },
          { text: 'Tags & Chips · 标签', link: '/TAGS.md' },
          { text: 'Empty · 空态', link: '/EMPTY.md' },
        ],
      },
      {
        text: '状态与反馈',
        collapsible: true,
        children: [
          { text: 'Activity Indicators · 转圈', link: '/ACTIVITY_INDICATORS.md' },
          { text: 'Progress · 进度', link: '/PROGRESS.md' },
          { text: 'Skeletons · 骨架屏', link: '/SKELETONS.md' },
          { text: 'Refresh · 下拉刷新', link: '/REFRESH.md' },
        ],
      },
      {
        text: '页面设计说明',
        collapsible: true,
        children: [
          { text: 'demo / buttons', link: '/pages/demo/buttons.md' },
          { text: 'demo / icons', link: '/pages/demo/icons.md' },
          { text: 'demo / lists', link: '/pages/demo/lists.md' },
          { text: 'demo / sections', link: '/pages/demo/sections.md' },
          { text: 'demo / search-bar', link: '/pages/demo/search-bar.md' },
          { text: 'demo / tabbars', link: '/pages/demo/tabbars.md' },
          { text: 'demo / text-fields', link: '/pages/demo/text-fields.md' },
          { text: 'demo / alerts', link: '/pages/demo/alerts.md' },
          { text: 'demo / sheets', link: '/pages/demo/sheets.md' },
          { text: 'demo / action-sheets', link: '/pages/demo/action-sheets.md' },
          {
            text: 'demo / charts',
            collapsible: true,
            children: [
              { text: 'column · 柱状图', link: '/pages/demo/charts/column.md' },
              { text: 'bar · 条状图', link: '/pages/demo/charts/bar.md' },
              { text: 'line · 折线图', link: '/pages/demo/charts/line.md' },
              { text: 'area · 区域图', link: '/pages/demo/charts/area.md' },
              { text: 'pie · 饼图', link: '/pages/demo/charts/pie.md' },
              { text: 'ring · 圆环图', link: '/pages/demo/charts/ring.md' },
              { text: 'rose · 玫瑰图', link: '/pages/demo/charts/rose.md' },
              { text: 'funnel · 漏斗图', link: '/pages/demo/charts/funnel.md' },
              { text: 'radar · 雷达图', link: '/pages/demo/charts/radar.md' },
              { text: 'gauge · 仪表盘', link: '/pages/demo/charts/gauge.md' },
              { text: 'arcbar · 圆弧进度', link: '/pages/demo/charts/arcbar.md' },
              { text: 'mount · 山峰图', link: '/pages/demo/charts/mount.md' },
              { text: 'mix · 混合图', link: '/pages/demo/charts/mix.md' },
              { text: 'scatter · 散点图', link: '/pages/demo/charts/scatter.md' },
              { text: 'bubble · 气泡图', link: '/pages/demo/charts/bubble.md' },
              { text: 'candle · K 线', link: '/pages/demo/charts/candle.md' },
              { text: 'word · 词云', link: '/pages/demo/charts/word.md' },
              { text: 'tline · 时间轴折线', link: '/pages/demo/charts/tline.md' },
              { text: 'tarea · 时间轴区域', link: '/pages/demo/charts/tarea.md' },
            ],
          },
        ],
      },
      {
        text: '凌云UI',
        collapsible: true,
        children: [
          { text: '使用说明', link: '/lingyun-ui/readme.html' },
          { text: '更新日志', link: '/lingyun-ui/changelog.html' },
          { text: 'Charts 使用说明', link: '/lingyun-ui-charts/readme.html' },
          { text: 'Charts 更新日志', link: '/lingyun-ui-charts/changelog.html' },
        ],
      },
    ],

    sidebarDepth: 2,
    // 仓库未配公开地址，编辑链接与贡献者信息先关掉
    editLink: false,
    contributors: false,
    lastUpdated: true,

    locales: {
      '/': {
        lastUpdatedText: '最后更新',
        toggleColorMode: '切换主题',
        toggleSidebar: '切换侧边栏',
        openInNewWindow: '在新窗口打开',
        notFound: ['这里没有对应的规范', '页面走丢了', '换个入口试试'],
        backToHome: '回首页',
      },
    },
  }),

  plugins: [
    slimsearchPlugin({
      indexContent: true,
      locales: {
        '/': {
          placeholder: '搜索规范',
        },
      },
    }),
    injectLingyunDocs(),
  ],
})

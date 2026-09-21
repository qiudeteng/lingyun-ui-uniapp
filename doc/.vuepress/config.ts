import { viteBundler } from '@vuepress/bundler-vite'
import { slimsearchPlugin } from '@vuepress/plugin-slimsearch'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '凌云UI 使用手册',
  description: '组件用法与示例',
  bundler: viteBundler(),
  theme: defaultTheme({
    navbar: [
      { text: '接入', link: '/guide/start.html' },
      { text: '组件', link: '/components/button.html' },
    ],
    sidebar: [
  {
    "text": "开始",
    "collapsible": false,
    "children": [
      {
        "text": "接入",
        "link": "/guide/start.html"
      },
      {
        "text": "反馈",
        "link": "/guide/feedback.html"
      }
    ]
  },
  {
    "text": "页面与导航",
    "collapsible": true,
    "children": [
      {
        "text": "页面壳",
        "link": "/components/app-page.html"
      },
      {
        "text": "宽屏目录",
        "link": "/components/page-nav.html"
      },
      {
        "text": "顶栏",
        "link": "/components/toolbars.html"
      },
      {
        "text": "底栏",
        "link": "/components/tabbars.html"
      },
      {
        "text": "搜索栏",
        "link": "/components/search-bar.html"
      },
      {
        "text": "侧栏浮层",
        "link": "/components/sidebar.html"
      }
    ]
  },
  {
    "text": "基础控件",
    "collapsible": true,
    "children": [
      {
        "text": "按钮",
        "link": "/components/button.html"
      },
      {
        "text": "图标",
        "link": "/components/icon.html"
      },
      {
        "text": "角标",
        "link": "/components/badge.html"
      },
      {
        "text": "分段控件",
        "link": "/components/segmented-control.html"
      },
      {
        "text": "标签",
        "link": "/components/tag.html"
      },
      {
        "text": "筛选胶囊",
        "link": "/components/chip.html"
      },
      {
        "text": "文本",
        "link": "/components/text.html"
      },
      {
        "text": "图片",
        "link": "/components/image.html"
      },
      {
        "text": "头像",
        "link": "/components/avatar.html"
      },
      {
        "text": "分页点",
        "link": "/components/page-control.html"
      }
    ]
  },
  {
    "text": "表单",
    "collapsible": true,
    "children": [
      {
        "text": "输入框",
        "link": "/components/text-field.html"
      },
      {
        "text": "表单",
        "link": "/components/form.html"
      },
      {
        "text": "表单分组",
        "link": "/components/form-group.html"
      },
      {
        "text": "表单行",
        "link": "/components/form-item.html"
      },
      {
        "text": "开关",
        "link": "/components/switch.html"
      },
      {
        "text": "步进器",
        "link": "/components/stepper.html"
      },
      {
        "text": "复选框",
        "link": "/components/checkbox.html"
      },
      {
        "text": "单选",
        "link": "/components/radio.html"
      },
      {
        "text": "单选组",
        "link": "/components/radio-group.html"
      },
      {
        "text": "多选列表",
        "link": "/components/data-checkbox.html"
      },
      {
        "text": "单选列表",
        "link": "/components/data-radio.html"
      },
      {
        "text": "滑条",
        "link": "/components/slider.html"
      },
      {
        "text": "选择器",
        "link": "/components/picker.html"
      },
      {
        "text": "级联选择",
        "link": "/components/data-picker.html"
      }
    ]
  },
  {
    "text": "列表与内容",
    "collapsible": true,
    "children": [
      {
        "text": "列表",
        "link": "/components/list.html"
      },
      {
        "text": "列表行",
        "link": "/components/list-item.html"
      },
      {
        "text": "分组卡片",
        "link": "/components/section.html"
      },
      {
        "text": "滑动容器",
        "link": "/components/swipe-action.html"
      },
      {
        "text": "滑动行",
        "link": "/components/swipe-action-item.html"
      },
      {
        "text": "空状态",
        "link": "/components/empty.html"
      },
      {
        "text": "骨架屏",
        "link": "/components/skeleton.html"
      },
      {
        "text": "下拉刷新",
        "link": "/components/refresh.html"
      }
    ]
  },
  {
    "text": "反馈",
    "collapsible": true,
    "children": [
      {
        "text": "加载转圈",
        "link": "/components/activity-indicator.html"
      },
      {
        "text": "进度",
        "link": "/components/progress.html"
      },
      {
        "text": "轻提示",
        "link": "/components/toast.html"
      },
      {
        "text": "加载遮罩",
        "link": "/components/hud.html"
      },
      {
        "text": "反馈宿主",
        "link": "/components/feedback-host.html"
      }
    ]
  },
  {
    "text": "浮层",
    "collapsible": true,
    "children": [
      {
        "text": "弹窗",
        "link": "/components/alert.html"
      },
      {
        "text": "底部面板",
        "link": "/components/sheets.html"
      },
      {
        "text": "操作列表",
        "link": "/components/action-sheet.html"
      },
      {
        "text": "分享面板",
        "link": "/components/activity-view.html"
      },
      {
        "text": "气泡",
        "link": "/components/popover.html"
      },
      {
        "text": "菜单",
        "link": "/components/menu.html"
      },
      {
        "text": "上下文菜单",
        "link": "/components/context-menu.html"
      },
      {
        "text": "悬浮按钮",
        "link": "/components/fab.html"
      }
    ]
  }
],
  }),
  plugins: [
    slimsearchPlugin({
      indexContent: true,
    }),
  ],
})

# lingyun-markdown

Markdown 预览组件。组件内自带解析器，把 Markdown 解析成原生 `view` / `text` / `image` 节点，不使用 `v-html`，也不使用 `rich-text`；不依赖任何第三方 npm 扩展，微信小程序不依赖递归自定义组件。

- 设计规范：[`design/MARKDOWN.md`](../../design/MARKDOWN.md)
- 演示：`/pages/demo/markdown`

## 示例

```vue
<lingyun-markdown
  :content="article"
  :font-size="15"
  :line-height="24"
  @link-click="onLink"
  @image-click="onImage"
/>
```

```ts
function onLink(payload: { href: string; title?: string; text: string }) {
  // 预览组件不自动跳转，由页面决定打开 WebView / 站内页 / 复制链接
  uni.showToast({ title: payload.href, icon: 'none' })
}

function onImage(payload: { src: string; alt: string; href?: string }) {
  uni.previewImage({ urls: [payload.src] })
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `content` | Markdown 源文本 | `''` |
| `emptyText` | 空内容文案；也可用 `#empty` 插槽 | 暂无内容 |
| `fontSize` | 正文字号，px | 15 |
| `lineHeight` | 正文行高，px | 24 |
| `breaks` | 单个换行是否当 `<br>`；默认按 Markdown 规则折叠为空格 | false |
| `selectable` | 是否允许长按选择文本 | false |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `link-click` | `{ href, title, text }` | 点击链接。组件不自动跳转 |
| `image-click` | `{ src, alt, title, href }` | 点击图片。`href` 为图片外层链接（如果有） |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `empty` | 内容为空时替代默认空态 |

## 支持的语法

| 语法 | 渲染 |
| --- | --- |
| `#` – `######` | H1–H6 |
| 段落、软换行 | 段落；`breaks` 为 true 时单换行变 `<br>` |
| `**粗体**` / `*斜体*` / `~~删除线~~` | 原生文本样式 |
| `` `行内代码` `` | 行内代码 |
| `[链接](url)` | 系统蓝文字，点击抛 `link-click` |
| `![alt](url)` | 图片，点击抛 `image-click` |
| `-` / `1.` | 无序 / 有序列表，支持嵌套 |
| `- [x]` / `- [ ]` | 任务列表 |
| `>` | 引用 |
| 围栏代码块 / 缩进代码 | 代码块，显示语言标签，横向滚动 |
| 表格 | 支持列对齐，≥3 列可横向滚动 |
| `---` | 分割线 |

## 行为与限制

- 原始 HTML 不执行：`<br>` 转为换行，其它 HTML 标签忽略；不使用 `v-html` / `rich-text`。
- 链接只放行 `http(s)` / `mailto` / `tel` / 相对路径；图片只放行 `http(s)` / 相对路径 / `data:image/`，其它协议会降级为普通文字。
- 代码块不做语法高亮；超长行和宽表格横向滚动。
- 段落中的图片按块级渲染，前后文字会另起行；把图片单独放一行是常见用法。
- 嵌套引用当前只显示一层左侧竖线（v1 限制）。
- 组件只做预览，不提供编辑器；编辑请用输入框 + 本组件实时预览。
- 组件不请求接口、不读写路由、不读写登录态。

## 小程序与主题

- 解析后列表 / 引用会拍平成带缩进的行，微信小程序不需要递归组件 `usingComponents` 配置。
- 代码行使用 `space="nbsp"` 保留空格；代码 / 表格使用 `scroll-view scroll-x`。
- 所有尺寸 px，不使用 `rpx`；不使用 `*` 选择器。
- 颜色全部走 `--lingyun-*` 主题变量，浅色 / 暗黑自动切换；组件本身不画卡片和玻璃，背景由宿主提供。
- 解析器内置在组件内，无第三方 npm 依赖；复制 `uni_modules` 到业务工程即可直接使用。
- 解析器不依赖全局 polyfill，避免影响宿主工程的运行时。

## 完整接入

```vue
<template>
  <view class="article">
    <lingyun-markdown
      :content="article"
      :font-size="16"
      :line-height="26"
      selectable
      @link-click="onLink"
      @image-click="onImage"
    >
      <template #empty>
        <lingyun-empty title="暂无内容" description="发布后会显示在这里" />
      </template>
    </lingyun-markdown>
  </view>
</template>
```

```ts
import { ref } from 'vue'

const article = ref(`
# 公告

支持 **Markdown** 预览，详见 [文档](https://uniapp.dcloud.net.cn/)。
`)

function onLink(payload: { href: string }) {
  // 业务决定：站内路由 / web-view / 复制链接
}

function onImage(payload: { src: string }) {
  uni.previewImage({ urls: [payload.src] })
}
```

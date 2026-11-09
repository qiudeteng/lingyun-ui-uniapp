# Markdown 规范（强制 · lingyun-markdown）

> Markdown **预览**组件：标题、段落、列表、引用、代码、表格、图片。属于**内容层**，不使用玻璃材质。
> 组件内自研解析器，渲染成 `view` / `text` / `image` 原生节点；❌ 不使用 `v-html`、❌ 不使用 `rich-text`、❌ 不引入第三方 npm 扩展。

## 权威来源

1. [HIG · Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
2. [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md) · [`TEXTS.md`](./TEXTS.md)
3. [`IMAGES.md`](./IMAGES.md) · [`LISTS.md`](./LISTS.md) · [`TABLES.md`](./TABLES.md)

尺寸 **1pt = 1px**，禁止 `rpx`。

## 1. 分层与边界

| 层 | 内容 | 材质 |
|---|---|---|
| 容器 | `lingyun-markdown` | 透明，由宿主卡片 / 页面提供背景 |
| 正文 | 段落、标题、列表、引用 | 内容层，系统语义色 |
| 代码 / 表格 | 代码块、行内代码、表格 | `fill-secondary` + `separator` |
| 图片 | 图片 | 内容层，圆角 10 |

- 组件不画外卡片、不画渐变、不叠玻璃；需要卡片时由页面用 `lingyun-section` 或自己的卡片包住。
- 链接、图片**不自动跳转**：`link-click` / `image-click` 交给页面。预览组件不读写路由、不请求接口。

## 2. 排版

| 元素 | 字号 / 行高 | 字重 | 颜色 |
|---|---|---|---|
| 正文 | 15 / 24（可由 `font-size` / `line-height` 调整） | 400 | `label` |
| H1 | 24 / 32 | 700 | `label` |
| H2 | 20 / 28 | 700 | `label` |
| H3 | 18 / 26 | 600 | `label` |
| H4 | 16 / 24 | 600 | `label` |
| H5 | 15 / 24 | 600 | `label` |
| H6 | 13 / 20 | 600 | `label` |
| 行内代码 | 0.92em / 继承 | 400 | `label`，`fill-secondary` 底 |
| 代码块 | 13 / 20 | 400 | `label` |
| 表格 | 13 / 20 | 400（表头 600） | `label` |

- 正文默认 15 / 24，与 `lingyun-text` 的 body 对齐；宿主可整体缩放。
- 粗体用 600（SF Semibold），斜体用 italic，删除线用 line-through。
- 字体继承系统字体；代码 / 行内代码使用等宽字体 `Menlo, Monaco, Consolas, 'Courier New', monospace`。

## 3. 颜色

| 用途 | Token |
|---|---|
| 正文 / 标题 | `--lingyun-label` |
| 次要文字 / 引用正文 / 列表标记 | `--lingyun-label-secondary` |
| 链接 | `--lingyun-system-blue` |
| 行内代码 / 代码块 / 表头底色 | `--lingyun-fill-secondary` |
| 表格底色 | `--lingyun-bg-grouped-secondary` |
| 表格 / 分割线 / 代码头分割线 | `--lingyun-separator` |
| 引用左侧竖线 | `--lingyun-separator-opaque` |
| 已完成任务标记 | `--lingyun-system-blue` |

暗黑下全部由 CSS 变量切换，不写死浅色值；代码块与表格在暗黑下保持内容层级，不使用玻璃。

## 4. 间距

- 段落下边距 **12px**；列表 / 引用 / 代码 / 表格内部正文使用紧凑档 **4px**。
- 标题上边距 20px（H1 24px）、下边距 10px；紧凑档上 8 / 下 4。
- 引用：左竖线 3px，正文左缩进 14px（含竖线），引用内文字用次级色。
- 分割线：上下 16px，0.5px `separator`。
- 图片：上下 8 / 12px，圆角 10px，宽度 100%。

## 5. 列表

- 列表项首行使用 **24px 标记列**（右对齐、右内距 6px），正文用 flex 1；同一项的后续块缩进到标记右侧。
- 无序：`•` / `◦` / `▪` 按层级循环；有序：`1.` / `2.`，从 Markdown 的 `start` 开始。
- 任务列表：`☑` / `☐`，已完成用系统蓝；标记列不可选中。
- 嵌套列表通过缩进层级表达（每层 24px），不使用额外的列表容器。
- 列表项内的代码块、表格、图片同样按 24px 对齐。

## 6. 引用

- 左侧 3px `separator-opaque` 竖线，正文 14px 缩进，`label-secondary`。
- 引用内的列表 / 代码 / 表格继续继承缩进与次级色；嵌套引用当前只保留一层竖线（v1 限制，文档写明）。

## 7. 代码

- 代码块：`fill-secondary` 背景、圆角 10px；有语言时顶部 6×12 的小标签（11/16、500、次级色），下方 0.5px 分割线。
- 代码正文：13/20 等宽，`padding: 12px 14px`，`white-space: pre`；每行一个 `text`，空行保留高度。
- 内置轻量语法高亮，不依赖第三方库：支持 `ts` / `js` / `tsx` / `jsx` / `json` / `html` / `xml` / `vue` / `css` / `scss` / `less` / `bash` / `sh` / `sql` / `php` / `rust` / `swift`；未知语言退回单色。
- token 颜色：keyword 紫、string 绿、number 橙、function 蓝、tag 粉、attr 靛、property 青、variable 棕、boolean 紫、comment / operator / punctuation 次级色；均可用 `--ly-md-code-*` CSS 变量覆盖。
- 超长行横向滚动（`scroll-view scroll-x`），不换行。
- 行内代码：`fill-secondary` 底、4px 圆角、左右 5px 内距；允许随正文换行。

## 8. 表格

- 0.5px `separator` 外框、圆角 8px；表头 `fill-secondary`、字重 600。
- 单元格内距 8×10，13/20；列对齐取 Markdown 的 `:---` / `:---:` / `---:`。
- 1–2 列占满宽度；≥3 列单元格最小 110px，整体可横向滚动。
- 行 / 列之间用 0.5px 分隔线；最后一行 / 最后一列去边线。

## 9. 图片

- 宽度 100%、`mode="widthFix"`、圆角 10px，默认 `fill-secondary` 占位底。
- 段落中的图片按块级渲染（图片前后文字会另起行），这是 v1 的取舍；独立图片行是最常见用法。
- 点击抛 `image-click`，由页面调用 `uni.previewImage`。

## 10. 链接与安全

- 链接用系统蓝、无下划线；点击抛 `link-click`，不自动打开。
- 链接协议只放行 `http(s)` / `mailto` / `tel` / 相对路径；`javascript:`、`data:`、`vbscript:` 等直接降级为普通文字。
- 图片地址放行 `http(s)` / 相对路径 / `data:image/`，其它协议降级为 alt 文本。
- 原始 HTML 不执行：`<br>` 转为换行，其它 HTML 标签忽略；❌ 不用 `v-html`、❌ 不用 `rich-text`。
- 内容由宿主提供，组件不做富文本编辑器；需要编辑请用输入框 + 本组件预览。

## 11. 小程序约束

- 解析器输出后**拍平成行**（列表 / 引用转成缩进行），不依赖递归自定义组件；微信小程序无需在 `usingComponents` 里声明自身。
- 代码行用 `text` + `space="nbsp"` + `white-space: pre` 保留空格；代码 / 表格用 `scroll-view scroll-x`。
- 不使用 `*` 选择器、不使用 `rpx`；所有尺寸 px。
- 解析器内置在 `lingyun-markdown` 组件内，无第三方 npm 依赖；复制 `uni_modules` 到业务工程即可直接使用。
- 解析器不依赖全局 polyfill，避免影响宿主工程的运行时。

## 12. 完成标准

- [ ] `pnpm type-check` 通过
- [ ] `pnpm build:mp-weixin` 通过，产物无递归组件、无 `rpx`
- [ ] H5 浅色 / 暗黑预览：标题、列表（嵌套 / 任务）、引用、代码横向滚动、表格横向滚动、图片点击
- [ ] 代码块常用语言 token 着色正常，未知语言回退单色，`highlight=false` 关闭高亮
- [ ] 链接点击抛 `link-click`，图片点击抛 `image-click`
- [ ] 空内容显示 `emptyText` 或 `#empty` 插槽
- [ ] 文档 / demo / COMPONENTS / ROADMAP 同步

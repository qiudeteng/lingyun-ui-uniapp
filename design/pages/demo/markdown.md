# design/pages/demo/markdown

对应源码：`src/pages/demo/markdown.vue`（组件：`src/uni_modules/lingyun-ui/components/lingyun-markdown`）

Markdown 预览演示页，用来验收排版、列表 / 引用拍平、代码 / 表格横向滚动、语法高亮与链接 / 图片事件。

- 页面壳：`lingyun-app-page`，标题「Markdown」；页面背景沿用 demo 渐变，内容层不叠玻璃。
- 编辑区：`lingyun-text-field` 多行（8 行）编辑 Markdown；下方「基础示例 / 代码与表格 / PHP / Rust / Swift」三个次按钮切换示例内容。
- 预览区：`lingyun-section` 内放 `lingyun-markdown`，实时跟随输入；内容层由 section 提供卡片背景。
- 示例一（基础）：H1 / H2、粗体、斜体、删除线、行内代码、链接、无序 / 嵌套 / 任务列表、有序列表、引用。
- 示例二（完整）：带语言标签与语法高亮的代码块、三列表格（含右对齐 / 居中）、Unsplash 蛋糕图片、分割线、结尾长文本。
- 示例三（多语言）：PHP / Rust / Swift 代码块，验证关键字、字符串、数字、变量、注释、标签与函数的 token 颜色。
- 链接点击用 `uni.showToast` 展示 href；图片点击用 `uni.previewImage`。组件本身不跳转。
- 说明区：提示不执行原始 HTML、代码块支持常用语言语法高亮、代码 / 表格横向滚动、尺寸 px、微信小程序可编译。
- 图片域名：沿用 order-goods demo 的 `images.unsplash.com`；微信真机需配置 downloadFile 合法域名，或在开发者工具勾选「不校验合法域名」。
- 规范：[`MARKDOWN.md`](../../MARKDOWN.md)、[`UI_SPEC.md`](../../UI_SPEC.md)；组件文档 `doc/components/markdown.md`。

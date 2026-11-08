# File Upload 规范（强制 · lingyun-file-upload）

> 文件上传控件：文件列表、类型标识、上传进度、重试、删除、预览/下载。
> 属于**内容层**，复用 `lingyun-list` 标准材质，不使用玻璃。

## 权威来源

1. [HIG · Lists](https://developer.apple.com/design/human-interface-guidelines/lists)
2. [`UI_SPEC.md`](./UI_SPEC.md) · [`LISTS.md`](./LISTS.md) · [`COLORS.md`](./COLORS.md)
3. [`IMAGE_UPLOADS.md`](./IMAGE_UPLOADS.md)（上传交互对齐）

尺寸 **1pt = 1px**，禁止 `rpx`。

## 1. 分层

```text
┌─────────────────────────────────────┐
│ 文件列表（内容层）                     │  ← lingyun-list + list-item
│  类型块 · 文件名 · 大小/状态 · 操作     │
├─────────────────────────────────────┤
│ 添加文件行（内容层）                   │
└─────────────────────────────────────┘
```

- 文件行是表单内容，**不要**套玻璃卡片。
- 组件放在 `lingyun-section` 内时，列表自动贴齐分组卡片；独立使用时显示自己的分组卡片。

## 2. 文件行

| 项 | 规格 |
|----|------|
| 行高 | 68px（有 note 的 tall 行） |
| 左右内边距 | 16px |
| 类型块 | 30×30、圆角 7px；扩展名 10px/600，最多 4 字符；过长用 `paperclip` |
| 文件名 | 17/24，单行省略 |
| 大小/状态 | 15/20，Secondary Label |
| 操作区 | 28×28 图标按钮，间距 4px；上传中为进度 + 百分比 |
| 分割线 | 由 `lingyun-list-item` 绘制，左侧随 30px 类型块内缩；首行与「添加文件」行不画线 |

- 首行与「添加文件」行显式隐藏顶部分割线；文件之间保留分割线。

### 2.1 类型色

| 类型 | 颜色 |
|------|------|
| PDF | 系统红（Error Soft 底） |
| Word / RTF / TXT | 系统蓝（Primary Soft 底） |
| Excel / CSV | 系统绿 |
| PPT | 系统橙 |
| ZIP / RAR / 7Z | 系统靛 |
| 其他 / 无扩展名 | Fill Tertiary + Secondary Label + `paperclip` |

## 3. 状态

| 状态 | 行内表现 |
|------|----------|
| `queued` | 大小 · 等待上传；操作区仅删除 |
| `uploading` | 大小 · 上传中；操作区进度条 + 百分比 + 删除 |
| `success` | 大小；操作区下载 + 删除 |
| `error` | 大小 · 失败原因；操作区红色重试 + 删除 |

- 上传中进度条宽约 100px，3px 线；避免挤压文件名。
- 失败原因取接口错误文案，过长时由 note 单行省略。

## 4. 添加行 & 空态

- 添加行：30×30 系统蓝 plus 块 + 「添加文件」+ 右侧 `n/max`。
- 达到 `maxCount`、`readonly`、`disabled` 时隐藏添加行。
- 只读/禁用且无文件时显示「暂无文件」。
- 只读仍可预览/下载；禁用整体 0.6 透明度并禁止交互。

## 5. 交互

- 点击成功行：预览/打开文件；同时 emit `preview`。
- 点击失败行：重试；点击等待/上传中行不响应。
- 下载图标：emit `download` 后下载/打开菜单。
- 删除上传中的文件会中止请求。
- 选择文件：H5/App `uni.chooseFile`；mp-weixin `uni.chooseMessageFile`（聊天/文件）。
- 微信端原生没有系统文件选择器；需要系统文件时由业务传 `chooseFn`（web-view + H5 `<input type=file>` 或原生插件）。配置后微信端显示「从聊天选择 / 从系统选择」。
- 系统文件 demo：`pages/demo/file-upload-system` + `pages/demo/file-picker-webview`，H5 页面 `public/system-file-picker.html`。
- 类型与大小在选择后再次校验；不符合的行不入列。

## 6. 多端预览

| 端 | 预览 | 下载 |
|----|------|------|
| H5 | `window.open(url)` | `<a download>` |
| mp-weixin | 本地路径直接 `openDocument`；远程先 `downloadFile` | `downloadFile` + `openDocument({ showMenu: true })` |
| 不支持类型 | ZIP/RAR 等 toast + 复制链接 | 复制链接 |

`openDocument` 支持 `pdf/doc/docx/xls/xlsx/ppt/pptx`。

## 7. API 摘要

```vue
<lingyun-file-upload
  v-model="files"
  :max-count="5"
  :max-size="20"
  accept="pdf,docx,xlsx,zip"
  upload-url="/api/upload"
  :upload-fn="uploadFile"
/>
```

完整属性 / 事件见 [`doc/components/file-upload.md`](../doc/components/file-upload.md)。

## 8. 自检清单

- [ ] 文件列表是内容层，未套玻璃
- [ ] 行高 68、类型块 30、操作 28、进度 3px
- [ ] 类型色使用系统色，暗黑下可读
- [ ] 上传中 / 失败 / 成功 / 等待状态完整
- [ ] 只读可预览/下载，禁用完全不可交互
- [ ] H5 与 mp-weixin 都可选择、上传、预览；不支持类型有兜底
- [ ] 微信端系统文件入口已按 `chooseFn` 配置（默认聊天文件）
- [ ] 尺寸全部 `px`，未使用 `rpx`

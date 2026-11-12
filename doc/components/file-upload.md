# lingyun-file-upload

文件上传。列表行展示文件名、类型、大小、上传进度，支持重试、删除、预览/下载。

- H5/App：`uni.chooseFile` 本地选择文件。
- mp-weixin：`uni.chooseMessageFile` 从聊天/文件选择（微信没有本地文件选择器）。
- `v-model` 为对象数组 `{ url, name, size }`，也兼容传入 `string[]`。

## 示例

```vue
<lingyun-file-upload
  v-model="files"
  :max-count="5"
  :max-size="20"
  accept="pdf,docx,xlsx,zip"
  upload-url="/api/upload"
/>

<lingyun-file-upload
  v-model="files"
  :max-count="3"
  :upload-fn="uploadFile"
  @preview="onPreview"
  @download="onDownload"
/>
```

```ts
async function uploadFile(file: { tempFilePath: string; name: string; size: number }) {
  const result = await api.upload(file)
  return result.url
}
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `v-model` | 已上传文件 `{ url, name, size }[]`；也接受 `string[]` | `[]` |
| `max-count` | 最多文件数，最小 1 | `9` |
| `max-size` | 单文件大小上限，单位 MB；`0` 不限制 | `20` |
| `accept` | 扩展名，`'pdf,docx'` 或 `['pdf','.docx']`；空 = 全部 | — |
| `title` | 列表标题 | — |
| `tip` | 列表页脚提示 | — |
| `disabled` | 禁用选择/删除/重试/预览 | `false` |
| `readonly` | 只读；仍可预览/下载 | `false` |
| `preview` | 点击成功文件时预览/打开 | `true` |
| `show-size` | 文件行显示大小 | `true` |
| `show-download` | 成功文件显示下载图标 | `true` |
| `upload-url` | 内置 `uni.uploadFile` 地址 | — |
| `upload-name` | 上传文件字段名 | `file` |
| `upload-header` | 额外请求头；内置上传自动带 `Authorization` | `{}` |
| `upload-form-data` | 额外表单字段 | `{}` |
| `upload-fn` | 自定义上传函数，返回地址或 `{ url }` | — |
| `choose-fn` | 自定义文件选择器；返回 `{ tempFilePath, name, size }[]`。微信端配置后显示「从聊天选择 / 从系统选择」 | — |
| `parse-response` | 自定义内置上传响应解析 | — |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `{ url, name, size }[]` | 成功文件变化 |
| `change` | `{ files, items }` | 任意状态变化 |
| `select` | `{ files, remaining }` | 选择完成 |
| `invalid` | `{ file, reason: 'type' \| 'size' }` | 格式或大小不符 |
| `upload-start` | `item` | 开始上传 |
| `upload-success` | `item, response` | 上传成功 |
| `upload-error` | `item, error` | 上传失败 |
| `remove` | `{ item, index }` | 删除 |
| `retry` | `item` | 失败重试 |
| `preview` | `{ item, index }` | 点击成功文件 |
| `download` | `{ item, index }` | 点击下载 |
| `exceed` | `{ maxCount, selected }` | 超出数量上限 |

## 方法

通过 `ref` 调用：

```ts
fileUploadRef.value?.choose()
fileUploadRef.value?.retryAll()
fileUploadRef.value?.clear()
```

## 预览 / 下载

- H5：点击文件 `window.open` 打开；下载图标通过 `<a download>` 下载（跨域可能变成新页）。
- mp-weixin：
  - 本地路径直接 `uni.openDocument`；远程地址先 `uni.downloadFile`。
  - `openDocument` 支持 `pdf/doc/docx/xls/xlsx/ppt/pptx`。
  - ZIP/RAR 等不支持预览时 toast，并复制链接。
  - 下载图标走 `downloadFile` + `openDocument({ showMenu: true })`，可在菜单中保存/分享。

## 微信端选文件

微信小程序原生只支持 `wx.chooseMessageFile`（从聊天/会话选择文件），**没有访问系统文件管理器的 API**；当前基础库也没有 `wx.chooseFile`。H5/App 的 `uni.chooseFile` 才会打开系统文件选择器。

如果要在微信端提供「系统文件」入口，传入 `choose-fn`：

```vue
<lingyun-file-upload
  v-model="files"
  :choose-fn="chooseSystemFile"
  :upload-fn="uploadFile"
/>
```

```ts
async function chooseSystemFile({ count, accept }) {
  // 例如 web-view + H5 <input type="file">，或原生插件
  return [{ tempFilePath, name, size }]
}
```

配置后，微信端点击「添加文件」会弹出「从聊天选择 / 从系统选择」：

- 从聊天选择：`uni.chooseMessageFile`。
- 从系统选择：调用 `choose-fn`。

H5/App 配置 `choose-fn` 时直接调用它；未配置时使用 `uni.chooseFile`。

> web-view + H5 方案需要把 H5 域名配置到小程序的业务域名，并把登录态/上传结果带回小程序；属于业务侧接入，不在本组件内实现。
>
> 仓库 demo：`pages/demo/file-upload-system`（web-view + H5，H5 页面在 `public/system-file-picker.html`）。
>
> 只做 H5 文件选择页的独立示例见 `pages/demo/file-picker-webview`；设计说明见 `design/pages/demo/file-picker-webview.md`。

## 上传说明

- 同时配置 `upload-fn` 与 `upload-url` 时，优先使用 `upload-fn`。
- 内置上传默认从 `data.url`、`url`、`data` 取地址；后端结构不同用 `parse-response`。
- 选择文件后会再次校验扩展名与大小；不符合的文件不入列。
- 上传串行执行；删除上传中的文件会中止请求。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/file-upload.vue -->

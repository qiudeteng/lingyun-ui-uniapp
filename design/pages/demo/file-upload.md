# File Upload Demo

对应页面：`src/pages/demo/file-upload.vue`

## 区块

1. `hero`：标题 File Upload + 说明「列表行 · 进度 / 重试 / 预览 / 下载」。
2. `基础文件上传`：`maxCount=5`、`maxSize=20`，模拟上传；演示进度、下载、删除、清空。
3. `限制文件类型`：`accept=pdf,doc,docx,xls,xlsx,zip`、`maxSize=10`，演示格式/大小拒绝。
4. `只读 / 禁用`：预填 PDF / XLSX / ZIP 三种类型行，只读与禁用各一组。
5. `最近操作`：显示最近一次选择 / 上传 / 下载 / 校验事件。

## 规范

- 组件规格见 [`FILE_UPLOADS.md`](../../FILE_UPLOADS.md)。
- 页面只负责示例状态与模拟上传，不承载组件内部逻辑。
- 预填文件的 URL 指向公开 PDF，仅用于展示文件行；实际上传后的本地文件可正常预览。

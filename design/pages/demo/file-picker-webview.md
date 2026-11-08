# System File Picker Web-view

对应页面：`src/pages/demo/file-picker-webview.vue`

## 用途

`lingyun-file-upload` 系统文件示例的 web-view 桥接页。

## 约定

- 加载 `public/system-file-picker.html`；开发地址 `http://localhost:5175/system-file-picker.html`。
- H5 通过 JSSDK `wx.miniProgram.postMessage` 回传 `{ name, size, type, dataUrl }`，随后 `navigateBack`。
- 本页监听 `web-view` 的 `message` 事件，将 payload 写入 `lingyun-system-file-pick`。
- demo 页在 `onShow` 读取该 storage，并 resolve `chooseFn`。
- 真机需要 HTTPS 业务域名；开发者工具需关闭域名校验。

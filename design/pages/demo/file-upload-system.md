# System File Demo

对应页面：`src/pages/demo/file-upload-system.vue`

## 用途

演示微信小程序通过 **web-view + H5** 选择系统文件，并把结果回传给 `lingyun-file-upload` 的 `chooseFn`。

## 流程

1. 点击「添加文件」。
2. 微信端弹出「从聊天选择 / 从系统选择」。
3. 选择「从系统选择」→ 打开 `pages/demo/file-picker-webview`。
4. web-view 加载 `public/system-file-picker.html`；H5 的 `input[type=file]` 调起系统文件选择器。
5. H5 读取文件（≤2MB），通过 `wx.miniProgram.postMessage` 回传，再 `navigateBack`。
6. web-view 页把数据写入 `lingyun-system-file-pick`；demo 页 `onShow` 读取并 resolve `chooseFn`。
7. `lingyun-file-upload` 把文件加入列表并走模拟上传。

## 约束

- 微信小程序原生没有系统文件选择器；这是 web-view + H5 的接入示例。
- 开发者工具需勾选「不校验合法域名、web-view（业务域名）」。
- 真机需要把 H5 部署到 HTTPS 业务域名，并替换 web-view 地址。
- H5 页面只做 2MB 限制与 data URL 回传；生产环境应上传到服务器后回传 URL。

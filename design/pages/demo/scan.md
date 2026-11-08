# Scan Demo

对应页面：`src/pages/demo/scan.vue`

## 区块

1. `hero`：标题 Scan + 说明「扫码入口 · 小程序 / App 原生扫码 · H5 自定义 scanFn」。
2. `模拟扫码`：传入 `scanFn`，700ms 后返回模拟取货码，演示 start / success 与结果展示。
3. `原生扫码`：不传 `scanFn`；小程序 / App 打开 `uni.scanCode`，H5 提示不支持。
4. `自定义触发`：使用默认插槽，整行「扫描取货码」触发，插槽参数 `scanning`。
5. `禁用态`：`disabled` 置灰不响应。
6. `最近操作`：显示扫码结果 / 类型 / 错误。

## 规范

- 组件规格见 [`SCAN.md`](../../SCAN.md)。
- 页面用模拟 `scanFn` 演示 H5；真实网页扫码需业务接入相机与识别方案。

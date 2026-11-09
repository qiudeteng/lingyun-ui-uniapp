# Barcode Demo

对应页面：`src/pages/demo/barcode.vue`

## 区块

1. `hero`：标题 Barcode + 说明「一维条码 · Code128 / Code39 / EAN-13 · Canvas 导出」。
2. `Code 128`：短编号 `LY-0001`，`fluid` 铺满内容宽度。
3. `EAN-13`：输入 12 位数字，自动补校验位，90px 高，`fluid`。
4. `Code 39 · 自定义颜色`：深蓝条码 + 浅蓝背景，`fluid` 铺满；宽度不再比背景色块窄。
5. `导出图片`：调用 `toTempFilePath()`，H5 显示 data URL，小程序 / App 显示临时路径。
6. `最近操作`：显示生成格式 / 模块数 / 导出结果。

## 规范

- 组件规格见 [`BARCODE.md`](../../BARCODE.md)。
- 页面使用短编号与较低模块宽度，避免窄屏横向溢出。

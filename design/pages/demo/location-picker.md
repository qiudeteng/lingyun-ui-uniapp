# Location Picker Demo

对应页面：`src/pages/demo/location-picker.vue`

## 区块

1. `hero`：标题 Location Picker + 说明「位置选择 · 门店 / 收货地址 · 腾讯地图」。
2. `基础选择`：点击打开平台位置选择器，成功后展示名称 / 地址 / 坐标。
3. `已选回显`：只读 + 显示坐标的示例。
4. `禁用`：不可选择的占位。
5. `平台说明`：H5 腾讯 Key 与小程序原生 chooseLocation 的说明。
6. `最近操作`：打开 / 选择 / 取消 / 失败。

## 规范

- 组件规格见 [`LOCATION_PICKER.md`](../../LOCATION_PICKER.md)。
- H5 Key 只在本机 `.env.local`，页面不显示 Key。
- 微信小程序需在开发者工具中允许地理位置权限。

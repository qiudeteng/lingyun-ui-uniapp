## 1.0.1（2026-09-21）
- 修复 `lingyun-segmented-control` 在中文 key 下的选中胶囊错位：段 id 改用 index 生成，不再依赖 key 文本清洗，避免不同中文 key 生成重复 id 导致 `createSelectorQuery` 命中错误节点。
## 1.0.0（2026-09-21）

- 首次发布：一套对齐 Apple Liquid Glass 的 uni-app 多端组件库，所有 lingyun-* 均位于本包 components/ 下；样式走 lingyun-ui/styles 的 $lingyun-glass-* token，尺寸一律 px；兼容 H5 与微信小程序（mp-weixin 为硬门禁）。

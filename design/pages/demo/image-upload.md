# Image Upload Demo

对应页面：`src/pages/demo/image-upload.vue`

## 区块

1. `hero`：标题 Image Upload + 说明「direct 直接上传 · edit 旋转裁剪后上传」。
2. `直接上传（最多 9 张）`：`mode=direct`，演示选图即上传、清空、最近操作。
3. `编辑后上传 · 固定 1:1`：`mode=edit`、`cropAspect=1`，演示旋转与固定比例裁剪。
4. `编辑后上传 · 自由裁剪`：`mode=edit`、`cropAspect='free'`，演示拖动裁剪框与四角缩放。
5. `只读 / 禁用`：只读缩略图与禁用态。
6. `最近操作`：显示最近一次选图 / 上传 / 裁剪事件。

## 规范

- 组件规格见 [`IMAGE_UPLOADS.md`](../../IMAGE_UPLOADS.md)。
- 页面只负责示例状态与模拟上传，不承载组件内部逻辑。
- demo 上传使用模拟 `uploadFn`（延迟返回本地临时路径），不依赖后端。

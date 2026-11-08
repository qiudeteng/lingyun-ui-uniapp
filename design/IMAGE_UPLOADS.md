# Image Upload 规范（强制 · lingyun-image-upload）

> 图片上传控件：缩略图网格、上传队列、90° 旋转与裁剪编辑器。
> 缩略图属于**内容层**；编辑器顶栏 / 底栏属于**控件层**，使用 Liquid Glass。

## 权威来源

1. [HIG · Images](https://developer.apple.com/design/human-interface-guidelines/images)
2. [HIG · Loading](https://developer.apple.com/design/human-interface-guidelines/loading)
3. [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md) · [`IMAGES.md`](./IMAGES.md)
4. [`BUTTONS.md`](./BUTTONS.md)（圆钮 / 工具栏按钮）

尺寸 **1pt = 1px**，禁止 `rpx`。

## 1. 分层

```text
┌─────────────────────────────────────┐
│ 编辑器顶栏 / 底栏（玻璃）              │  ← 控件层：取消、完成、旋转、重置
├─────────────────────────────────────┤
│ 裁剪舞台（黑色内容区）                 │  ← 内容层：图片、裁剪框、遮罩
├─────────────────────────────────────┤
│ 缩略图网格（内容层）                   │  ← 页面表单的一部分，不铺玻璃
└─────────────────────────────────────┘
```

- 缩略图网格**不要**整块套玻璃卡片；它属于表单内容。
- 编辑器是浮层：H5/App `teleport to="body"`，mp-weixin `root-portal`；根节点自挂 `theme-*`。
- 编辑器顶栏 / 底栏使用深色半透明玻璃 + 全端 blur；不要在玻璃节点上写 opacity 做显隐。

## 2. 缩略图网格

| 项 | 规格 |
|----|------|
| 列数 | `columns`，默认 3，范围 1–6 |
| 间距 | 8px |
| 单格 | 1:1（padding-bottom 100%） |
| 圆角 | `radius`，默认 `md`（8px） |
| 删除钮 | 右上角 22px 玻璃圆钮，`close` 图标 12 |
| 加号块 | 虚线边框 + Fill Quaternary 底；`plusempty` 图标 26；多张时显示 `n/max` |
| 上传中 | 半透明黑遮罩 + 小号 Activity Indicator + 百分比 |
| 失败 | 2px 系统红内描边 + 遮罩内「点击重试」 |
| 只读 / 禁用 | 隐藏加号与删除；禁用整体 0.6 透明度 |

- 点击成功缩略图：`uni.previewImage`。
- 点击失败缩略图：立即重试。
- 删除上传中的图片：中止请求并移除。

## 3. 编辑器

### 3.1 布局

| 区域 | 规格 |
|------|------|
| 顶栏 | 全宽，左右各 52px 文字按钮，标题 16/600 居中；顶部含状态栏安全区 |
| 舞台 | 占满剩余高度，背景 `#000` |
| 底栏 | 三个 44px 玻璃圆钮，间距 28px；底部含安全区 |
| 圆钮 | 44px，`rgba(255,255,255,0.12)` 底，0.5px `rgba(255,255,255,0.2)` 描边 |
| 取消 / 完成 | 16px；完成用系统蓝 `#0a84ff`，字重 600 |

### 3.2 裁剪框

| 项 | 规格 |
|----|------|
| 边框 | 1px `rgba(255,255,255,0.92)` |
| 遮罩 | 裁剪框外 `rgba(0,0,0,0.55)`（box-shadow 9999px） |
| 三分线 | 1px `rgba(255,255,255,0.28)` |
| 四角手柄 | 32px 命中区，12px 白色圆点；仅自由裁剪显示 |
| 自由裁剪最小框 | 40×40px |
| 固定比例 | `cropAspect` 数字；裁剪框比例锁定，图片在框后拖动/缩放 |
| 自由裁剪 | `cropAspect="free"`；裁剪框可拖动，四角可缩放 |

### 3.3 手势与变换

- 单指拖动图片；双指捏合缩放（以两指中点为锚点）。
- 图片必须始终盖住裁剪框；越界自动 clamp。
- 旋转按 90° 步进，旋转后重新 cover 并居中。
- 重置：旋转归 0、图片 cover 居中、裁剪框回默认。
- 舞台 `touchmove.stop.prevent`；H5 `touch-action: none`；打开时锁定页面滚动。

## 4. 上传状态

| 状态 | 表现 |
|------|------|
| `queued` | 缩略图 + 「等待上传」遮罩 |
| `uploading` | 转圈 + 百分比 |
| `success` | 正常缩略图，可预览 |
| `error` | 红色描边 + 「点击重试」 |

- 上传串行执行，避免同时打满后端。
- `v-model` 只同步成功地址；上传中/失败项留在组件内部。
- 上传失败保留缩略图，点击重试；删除即中止。

## 5. API 摘要

```vue
<lingyun-image-upload
  v-model="urls"
  mode="direct | edit"
  :max-count="9"
  :max-size="10"
  upload-url="/api/upload"
  :upload-fn="uploadFile"
  :crop-aspect="1 | '4:3' | 'free'"
  :output-max-size="2048"
/>
```

完整属性 / 事件见 [`doc/components/image-upload.md`](../doc/components/image-upload.md)。

## 6. 自检清单

- [ ] 缩略图是内容层，未整块套玻璃
- [ ] 编辑器顶栏/底栏使用 `$lingyun-glass-*` 或深色玻璃 token，未对玻璃节点写 opacity
- [ ] 圆钮 44px、删除钮 22px、间距按本页规格
- [ ] 固定比例与自由裁剪都可用；四角手柄仅自由模式出现
- [ ] 90° 旋转后 cover 与居中正确，导出方向与预览一致
- [ ] 上传中 / 失败 / 重试 / 删除状态完整
- [ ] H5 与 mp-weixin 均可编译；Canvas 离屏导出，不遮挡浮层
- [ ] 尺寸全部 `px`，未使用 `rpx`

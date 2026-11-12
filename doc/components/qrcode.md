# lingyun-qrcode

前端二维码：组件内置 QR 编码器生成矩阵，Canvas 绘制；支持颜色、纠错级别、边框与图片导出。

规范见 [`design/QRCODE.md`](../../design/QRCODE.md)。

## 示例

```vue
<lingyun-qrcode
  value="https://lingyun.example/order/LY-20261108-0001"
  :size="180"
  @ready="onReady"
  @error="onError"
/>
```

自定义颜色与纠错：

```vue
<lingyun-qrcode
  value="LINGYUN-PROMO-2026"
  :size="220"
  ecc="H"
  foreground-color="#0a3d62"
  background-color="#f7fbff"
/>
```

导出图片：

```vue
<lingyun-qrcode ref="qrRef" :value="content" />
<lingyun-button text="导出" @click="exportQr" />
```

```ts
import { ref } from 'vue'

const qrRef = ref<{ toTempFilePath: () => Promise<string> } | null>(null)

async function exportQr() {
  const path = await qrRef.value?.toTempFilePath()
  // H5: data URL；小程序 / App: 临时文件路径
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | 二维码内容（文本 / 链接） | `''` |
| `size` | 二维码尺寸 px，80–480 | 180 |
| `ecc` | 纠错级别 `L` / `M` / `Q` / `H` | `M` |
| `border` | 静区模块数，0–16 | 4 |
| `foregroundColor` | 前景色 | `#000000` |
| `backgroundColor` | 背景色 | `#ffffff` |
| `emptyText` | 空内容占位 | 暂无二维码 |
| `errorText` | 生成失败占位 | 二维码生成失败 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `ready` | 生成完成，参数 `{ size, version, modules }` |
| `error` | 生成失败，参数 `{ message }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `refresh()` | 重新绘制 |
| `toTempFilePath()` | 导出 PNG：H5 返回 data URL，小程序 / App 返回临时文件路径 |

## 说明

- QR 编码器已内置在组件内，不依赖第三方 npm 包，只在本地生成矩阵，不请求网络。
- 内容变化、尺寸 / 纠错 / 颜色 / 边框变化时自动重绘。
- 二维码始终保持白底黑码（或高对比自定义色），不跟随暗黑反色。
- 不内置 logo、保存相册；导出后由业务上传或保存。
- 内容过长导致编码失败时显示错误占位并抛 `error`。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/qrcode.vue -->

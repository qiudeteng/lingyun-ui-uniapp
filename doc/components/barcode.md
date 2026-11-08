# lingyun-barcode

一维条码：Code128 / Code39 / EAN-13，Canvas 绘制与图片导出。

规范见 [`design/BARCODE.md`](../../design/BARCODE.md)。

## 示例

```vue
<lingyun-barcode
  value="LY-0001"
  format="CODE128"
  :module-width="2"
  @ready="onReady"
  @error="onError"
/>
```

EAN-13（12 位自动补校验位）：

```vue
<lingyun-barcode value="690123456789" format="EAN13" :height="90" />
```

Code 39：

```vue
<lingyun-barcode
  value="CAKE-2026"
  format="CODE39"
  :code39-check-digit="true"
  foreground-color="#0a3d62"
  background-color="#f7fbff"
/>
```

导出：

```vue
<lingyun-barcode ref="barcodeRef" :value="code" />
<lingyun-button text="导出" @click="exportBarcode" />
```

```ts
const barcodeRef = ref<{ toTempFilePath: () => Promise<string> } | null>(null)

async function exportBarcode() {
  const path = await barcodeRef.value?.toTempFilePath()
  // H5: data URL；小程序 / App: 临时文件路径
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | 条码内容 | `''` |
| `format` | `CODE128` / `CODE39` / `EAN13` | `CODE128` |
| `moduleWidth` | 窄条宽度 px，1–6 | 2 |
| `height` | 总高度 px，48–200 | 80 |
| `quietZone` | 左右静区模块数，0–20 | 10 |
| `showValue` | 条码下方显示文字 | true |
| `displayValue` | 自定义显示文字 | `''` |
| `fontSize` | 文字字号 px，9–18 | 12 |
| `foregroundColor` | 条 / 文字颜色 | `#000000` |
| `backgroundColor` | 背景色 | `#ffffff` |
| `code128Charset` | Code128 字符集 `auto` / `A` / `B` / `C` | `auto` |
| `code39CheckDigit` | Code39 追加校验位 | false |
| `emptyText` | 空内容占位 | 暂无条件码 |
| `errorText` | 生成失败占位 | 条码生成失败 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `ready` | 生成完成，参数 `{ format, text, modules, width, height }` |
| `error` | 生成失败，参数 `{ message }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `refresh()` | 重新绘制 |
| `toTempFilePath()` | 导出 PNG：H5 返回 data URL，小程序 / App 返回临时文件路径 |

## 说明

- 依赖 `etiket` 的纯编码器，只在本地生成，不请求网络。
- 宽度由静区 + 条空模块总数 × `moduleWidth` 决定；内容较长时降低 `moduleWidth` 或缩短内容。
- EAN13 输入 12 位自动计算校验位，展示使用 13 位。
- 条码始终白底深色（或高对比自定义色），不跟随暗黑反色。
- 不内置 logo、保存相册；导出后由业务上传或保存。
- 内容非法或过长时显示错误占位并抛 `error`。

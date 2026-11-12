# lingyun-signature

手写签名板：触控 / 鼠标绘制、清除、重新签名、导出 PNG。用于送货签收、门店确认、审批等场景。

规范见 `design/SIGNATURE.md`。

## 示例

```vue
<lingyun-signature
  v-model="signature"
  tip="签收时可让收件人手写确认"
  @confirm="onConfirm"
  @clear="onClear"
/>
```

```ts
import { ref } from 'vue'
import type { LingyunSignatureConfirmPayload } from '@/uni_modules/lingyun-ui/components/lingyun-signature/types'

const signature = ref('')

function onConfirm(payload: LingyunSignatureConfirmPayload) {
  // path 为 PNG 地址：H5 是 data URL，小程序是临时文件路径
  console.log(payload.path, payload.width, payload.height)
}
```

自定义笔迹与透明底：

```vue
<lingyun-signature
  v-model="signature"
  pen-color="#0088ff"
  :pen-width="5"
  :height="220"
  background-color="transparent"
/>
```

已有签名回显：

```vue
<lingyun-signature :model-value="savedSignature" readonly />
```

不显示内置操作区，由业务按钮调用方法：

```vue
<lingyun-signature ref="signatureRef" v-model="signature" :show-toolbar="false" />
<lingyun-button text="清除" @click="signatureRef?.clear()" />
<lingyun-button text="完成" @click="signatureRef?.confirm()" />
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 签名 PNG 地址；传入已有签名时显示预览 | `''` |
| `title` | 标题 | 手写签名 |
| `tip` | 标题下方说明，空字符串不显示 | `''` |
| `placeholder` | 空态占位文案 | 请在此签名 |
| `height` | 画布高度 px，最小 120 | 180 |
| `penColor` | 笔迹颜色 | `#1c1c1e` |
| `penWidth` | 笔迹宽度 px，限制 1–12 | 3 |
| `backgroundColor` | 画布 / 导出背景；`transparent` 为透明 PNG | `#ffffff` |
| `confirmText` | 完成按钮文案 | 完成 |
| `clearText` | 清除按钮文案 | 清除 |
| `restartText` | 重新签名按钮文案 | 重新签名 |
| `exportingText` | 导出中提示 | 处理中… |
| `showToolbar` | 显示内置清除 / 完成操作区 | true |
| `disabled` | 禁用绘制与操作 | false |
| `readonly` | 只展示签名，不显示操作区 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 导出成功或清除，回写 PNG 地址 / 空字符串 |
| `confirm` | 导出成功，参数 `{ path, width, height }` |
| `clear` | 清除或重新签名 |
| `start` | 开始一笔 |
| `end` | 完成一笔 |
| `error` | 导出失败，参数 `{ message }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `clear()` | 清空笔画并回写空字符串 |
| `restart()` | 清空并回到绘制态 |
| `confirm()` | 导出当前签名并回写 `modelValue` |
| `resize()` | 重新测量画布并按归一化坐标重绘 |

## 平台说明

- H5 同时支持鼠标与触控，小程序 / App 使用触控；绘制时阻止页面滚动。
- 导出统一走 `uni.canvasToTempFilePath`，PNG；业务拿到 `path` 后自行上传。
- 画布是内容层白纸，不使用 Liquid Glass；外层卡片是标准分组材质。
- 笔画坐标按画布归一化，窗口尺寸变化后重绘。
- 不提供撤销与手掌防误触；需要重来直接清除。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/signature.vue -->

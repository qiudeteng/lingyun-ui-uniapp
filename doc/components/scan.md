# lingyun-scan

扫码入口：小程序 / App 走 `uni.scanCode`；H5 与自定义场景用 `scanFn` 覆盖。只负责触发与结果事件，不内置相机取景 UI。

规范见 [`design/SCAN.md`](../../design/SCAN.md)。

## 示例

```vue
<lingyun-scan @success="onScanSuccess" @error="onScanError" />
```

```ts
import type { LingyunScanResult } from '@/uni_modules/lingyun-ui/components/lingyun-scan/types'

function onScanSuccess(result: LingyunScanResult) {
  // result: { result, scanType, charSet, path, rawData? }
  console.log(result.result)
}
```

H5 / 自定义扫码：

```vue
<lingyun-scan :scan-fn="webScan" />

<script setup lang="ts">
import type { LingyunScanOptions, LingyunScanResult } from '@/uni_modules/lingyun-ui/components/lingyun-scan/types'

function webScan(options: LingyunScanOptions): Promise<LingyunScanResult> {
  // 接浏览器相机 + 扫码库 / 后端识别
  return Promise.resolve({
    result: 'LY-20261108-0001',
    scanType: options.scanType[0] || 'qrCode',
    charSet: 'UTF-8',
    path: '',
  })
}
</script>
```

自定义触发：

```vue
<lingyun-scan :scan-fn="webScan" @success="onScanSuccess">
  <template #default="{ scanning }">
    <view class="scan-row">
      {{ scanning ? '正在识别…' : '扫描取货码' }}
    </view>
  </template>
</lingyun-scan>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `scanType` | 扫码类型，如 `['qrCode', 'barCode']` | `['qrCode', 'barCode']` |
| `onlyFromCamera` | 仅允许相机扫码（不允许从相册选图） | false |
| `scanText` | 原生扫码界面提示 | 将二维码/条码放入框内，即可自动扫描 |
| `text` | 默认按钮文案 | 扫码 |
| `scanningText` | 扫描中文案 | 扫描中… |
| `tip` | 触发区下方说明 | `''` |
| `variant` | 默认按钮样式，透传 `lingyun-button` | borderedProminent |
| `size` | 默认按钮尺寸 | large |
| `block` | 默认按钮占满宽度 | false |
| `showIcon` | 显示扫码图标 | true |
| `icon` | 图标名 | scan |
| `iconSize` | 图标尺寸 px | 20 |
| `disabled` | 禁用 | false |
| `showErrorToast` | 失败时自动 toast | true |
| `scanFn` | 覆盖原生扫码，H5 / 自定义扫码 / 测试 | — |

## 事件

| 事件 | 说明 |
| --- | --- |
| `start` | 开始扫码 |
| `success` | 成功，参数 `{ result, scanType, charSet, path, rawData? }` |
| `error` | 失败，参数 `{ message, error }` |
| `cancel` | 用户取消（错误信息含 cancel） |

## 方法

| 方法 | 说明 |
| --- | --- |
| `scan()` | 触发扫码，等同点击 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义触发内容，作用域 `{ scanning }`；提供后不再渲染默认按钮 |

## 平台说明

- 微信小程序 / App：`uni.scanCode`。
- H5：无原生扫码；不传 `scanFn` 会提示不支持并抛 `error`。
- `scanFn` 可返回字符串或结果对象，支持同步 / Promise；错误信息含 cancel 时抛 `cancel`。
- 组件不申请相机权限、不内置取景框。

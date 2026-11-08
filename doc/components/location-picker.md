# lingyun-location-picker

位置选择：门店 / 收货地址。小程序 / App 走原生 `uni.chooseLocation`，H5 使用 uni 内置地图并注入腾讯地图 Key。

规范见 [`design/LOCATION_PICKER.md`](../../design/LOCATION_PICKER.md)。

## 示例

```vue
<lingyun-location-picker
  v-model="location"
  @change="onChange"
  @cancel="onCancel"
  @error="onError"
/>
```

```ts
import { ref } from 'vue'
import type { LingyunLocation } from '@/uni_modules/lingyun-ui/components/lingyun-location-picker/types'

const location = ref<LingyunLocation | null>(null)

function onChange(value: LingyunLocation) {
  // { name, address, latitude, longitude }
}
```

只读 / 显示坐标：

```vue
<lingyun-location-picker :model-value="location" readonly show-coordinate />
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 已选位置 `{ name, address, latitude, longitude }` | null |
| `label` | 行标签 | 选择位置 |
| `placeholder` | 空态文案 | 请选择门店或收货地址 |
| `disabled` | 禁用 | false |
| `readonly` | 只读，不打开选择器 | false |
| `showIcon` | 显示定位图标 | true |
| `icon` | 图标名 | location-filled |
| `showCoordinate` | 显示经纬度 | false |
| `showErrorToast` | 失败时自动 toast | true |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选择成功回写位置 |
| `change` | 选择成功，参数 `LingyunLocation` |
| `open` | 打开平台位置选择器 |
| `cancel` | 用户取消 |
| `error` | 失败，参数 `{ message }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开位置选择器 |

## 平台与 Key

- **微信小程序**：`uni.chooseLocation`；`manifest.json` 已声明 `requiredPrivateInfos: ["chooseLocation"]` 和 `scope.userLocation` 权限。
- **H5**：uni-h5 内置地图选择器；组件在打开前把 `VITE_TENCENT_MAP_KEY` 注入 `__uniConfig.qqMapKey`。
  - Key 只放本机 `.env.local`，不要提交。
  - 腾讯控制台需开启 JavaScript API / WebService，并配置 H5 域名白名单。
  - 未配置 Key 会提示并抛 `error`。
- **App**：需在本地 manifest 配置地图 SDK / Key；仓库不提交 App Key。
- 坐标统一为 GCJ-02，业务存库保留名称 / 地址 / 经纬度。
- H5 的内置地图 UI 由 uni-h5 提供，不是凌云UI 自绘；触发器遵循内容层规范。

# 屏幕

Demo 页：`/pages/demo/screen`。拉宽窗口，或在右侧预览里切换「手机 / 宽屏」，列表里的值会变。

页面要按当前窗口、系统和硬件分叉时，用全局对象 `lingyun`。`app.use(lingyunUi)` 之后就能用。折叠、旋转或拉窗口时，这些字符串会更新。

## 模板

```vue
<view v-if="lingyun.os == 'ios'">iOS 布局</view>
<view v-else-if="lingyun.fold == 'expanded'">折叠屏已展开</view>
<view v-else-if="lingyun.screen == 'pad'">当前是宽屏</view>
```

## 脚本

```ts
import { lingyun } from '@/uni_modules/lingyun-ui'

if (lingyun.device == 'pad') {
  // …
}
```

组件以外的代码读 `uni.lingyun`，字段相同。

## 字段

| 字段 | 取值 | 含义 |
|------|------|------|
| `lingyun.screen` | `phone` / `pad` / `pc` | 当前窗口档 |
| `lingyun.os` | `ios` / `android` / `harmony` / `windows` / `mac` | 操作系统 |
| `lingyun.device` | `phone` / `pad` / `pc` | 硬件类型 |
| `lingyun.foldable` | `yes` / `no` | 是否折叠屏 |
| `lingyun.fold` | `folded` / `expanded` / `half` / `''` | 折叠、展开、半折叠。不是折叠屏时为空串 |

信息还没读到时，字段是空串。

## 窗口档

按窗口宽度划分，和宽屏左侧导航用的 **690** 是同一条线。

| 宽度 | `lingyun.screen` |
|------|------------------|
| &lt; 690 | `phone` |
| 690–1199 | `pad` |
| ≥ 1200 | `pc` |

`screen` 看现在的窗口，`device` 看机器。折叠屏展开后硬件仍是手机，窗口会进宽屏档：

```vue
<view v-if="lingyun.device == 'phone' && lingyun.screen == 'pad'">
  折叠屏内屏
</view>
```

手机横过来、宽度到了 690，`screen` 也会变成 `pad`。iPad 分屏缩得很窄时，`device` 仍是 `pad`，`screen` 可以是 `phone`。

## 折叠

| 状态 | 取值 |
|------|------|
| 折叠 | `lingyun.fold == 'folded'` |
| 展开 | `lingyun.fold == 'expanded'` |
| 半折叠 | `lingyun.fold == 'half'` |
| 不是折叠屏 | `lingyun.fold == ''` |

是否折叠屏：`lingyun.foldable == 'yes'`。

微信没有折叠状态接口。常见折叠屏按机型识别；内屏接近正方形，或同一次使用里短边明显拉开，也会记为折叠屏。半折叠只在窗口明显只占一半，或内屏变成宽而扁时记为 `half`。

## 重新读取

进前台和窗口尺寸变化时会自己刷新。要立刻重读：

```ts
import { refreshLingyunScreen } from '@/uni_modules/lingyun-ui'

refreshLingyunScreen()
```

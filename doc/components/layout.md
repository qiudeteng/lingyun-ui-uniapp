# 布局

24 分栏。一行是 `lingyun-row`，列是 `lingyun-col`。用法对齐 [Element Plus Layout](https://element-plus.org/zh-CN/component/layout)。

列宽按窗口宽度计算，不靠 CSS 媒体查询。微信里媒体查询看的是整块屏幕，小程序窗口变窄时会判错。

## 示例

```vue
<lingyun-row :gutter="12">
  <lingyun-col :span="16">
    <view>16</view>
  </lingyun-col>
  <lingyun-col :span="8">
    <view>8</view>
  </lingyun-col>
</lingyun-row>
```

父级不要写成行内排列，否则这一行撑不满。

## lingyun-row

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `gutter` | 列间距，单位 px。左右各分一半 | 0 |
| `justify` | `start` / `center` / `end` / `space-between` / `space-around` / `space-evenly` | start |
| `align` | `top` / `middle` / `bottom`。不传则列高拉伸 | '' |

默认插槽里放 `lingyun-col`。

## lingyun-col

一列最少 0 格、最多 24 格。`span` 为 0 时不显示。

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `span` | 占几格 | 24 |
| `offset` | 左侧空出几格 | 0 |
| `push` | 向右移几格 | 0 |
| `pull` | 向左移几格 | 0 |
| `xs` | 宽度小于 768。数字只改 `span`，对象可写 `span` / `offset` / `push` / `pull` | — |
| `sm` | 宽度 ≥ 768 | — |
| `md` | 宽度 ≥ 992 | — |
| `lg` | 宽度 ≥ 1200 | — |
| `xl` | 宽度 ≥ 1920 | — |

大档盖过小档。某一档没写时，沿用更小一档或 `span`。

```vue
<lingyun-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1" />
<lingyun-col :md="{ span: 8, offset: 2 }" />
```

这套断点和 `lingyun-mobile` 的 690 不是同一条线。690 用来区分窄屏和宽屏页面，这里的五档用来分栏。

# 山峰图 · mount

山峰图。`type="mount"`。Demo 页：`/pages/demo/charts/mount`。

## 数据

没有 `categories`。峰写在 `series[0].data`：`{ name, value }`。引擎会把每一项拆成一条序列。

正负山峰的 `value` 可以是负数。默认 Y 轴 `min` 是 0，负值会被裁在零轴上，需要在 `opts.yAxis.data` 里把 `min` / `max` 设成能包住数据的范围。

## 峰形

写在 `extra.mount.type`。

| type | 效果 | 示例里的其它字段 |
|------|------|------------------|
| `mount` | 圆角山峰（默认） | `widthRatio: 1.5` |
| `sharp` | 尖角 | `widthRatio: 1.5` |
| `triangle` | 三角 | `widthRatio: 1` 或 `1.5` |
| `bar` | 直角柱 | `widthRatio: 0.8`；胶囊柱再用 `barBorderRadius: [50, 50, 50, 50]`，并把 `widthRatio` 收到 `0.3` |

`widthRatio` 是峰宽相对类目间距的比例，范围 0–2。

渐变：`linearType: "custom"` 用引擎内置渐变色；`linearType: "opacity"` 从峰顶透明过渡到系列色，透明度看 `linearOpacity`。描边用 `borderWidth`，`0` 为无边。

横向滚动：`enableScroll: true`，`xAxis.itemCount` 小于类目数，`xAxis.scrollShow: true`。

标记线：`enableMarkLine: true`，线写在 `extra.markLine.data`。右侧标签要留白时把 `padding` 右侧加大（示例用 `[15, 40, 0, 15]`）。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="mount"
    :chartData="chartData"
    :opts="chartOpts"
  />
</view>
```

```ts
const chartData = {
  series: [
    {
      data: [
        { name: '一班', value: 82 },
        { name: '二班', value: 63 },
        { name: '三班', value: 86 },
        { name: '四班', value: 65 },
        { name: '五班', value: 79 },
      ],
    },
  ],
}

const chartOpts = {
  extra: {
    mount: {
      type: 'mount',
      widthRatio: 1.5,
    },
  },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。

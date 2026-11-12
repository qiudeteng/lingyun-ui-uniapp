# lingyun-save-image

保存为图片：显示文字或图标的触发器，点击把 ref 元素或整个页面保存成 PNG。

## 示例

保存指定元素：

```vue
<view ref="cardRef" class="pickup-card">…</view>
<lingyun-save-image :target="cardRef" label="保存卡片" icon="download" />
```

保存整个页面（不传 `target`）：

```vue
<lingyun-save-image label="保存当前页面" />
```

小程序导出 canvas / 组件：

```vue
<lingyun-qrcode ref="qrRef" :value="url" />
<lingyun-save-image :target="qrRef" label="保存二维码" />
```

只生成图片、不触发下载（预览 / 上传）：

```vue
<lingyun-save-image :target="cardRef" icon="image" :download="false" @success="onCaptured" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `target` | 要保存的 ref。H5：元素或组件实例（取 `$el`）；小程序：canvas 节点或带 `toTempFilePath()` 的组件 | — |
| `label` | 显示文案；不传且没有 `icon` 时显示「保存为图片」 | `''` |
| `icon` | `lingyun-icon` 图标名 | `''` |
| `size` | `small` / `medium` / `large` | small |
| `variant` | `glass` / `plain` | glass |
| `fileName` | H5 下载文件名（不含 `.png`） | lingyun-image |
| `pixelRatio` | H5 导出倍率，1–3 | 2 |
| `background` | H5 画布底色；空则取元素 / 祖先第一个非透明背景色 | `''` |
| `download` | H5 是否自动触发下载 | true |
| `album` | 小程序导出后是否保存到相册 | true |
| `toast` | 成功后是否提示 | true |
| `toastText` | 成功提示文案 | 已保存 |
| `busyText` | 保存中提示文案 | 保存中… |
| `disabled` | 禁用 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `success` | 成功，参数 `{ path }`（H5 为 data URL，小程序为临时文件路径） |
| `error` | 失败，参数 `{ message }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `save()` | 手动保存，返回 `Promise<string>` |

## 平台说明

- **H5**：克隆 DOM → 内联计算样式、图片、背景图与图标字体 → SVG foreignObject → Canvas → PNG。`target` 为空时截取当前页面（含整页高度）；默认触发浏览器下载。
  - 跨域图片需要在服务端允许 CORS，否则无法内联，导出结果里会缺失该图。
  - 模糊玻璃（`backdrop-filter`）在静态图里按半透明底色呈现。
- **微信小程序**：没有整页截图能力。传入 canvas 2d 节点，或带 `toTempFilePath()` 的组件 ref（二维码、签名、图表等），导出后默认保存到相册（`album`）；否则抛错提示传入 ref。
- App / 其他小程序端只保证编译通过；运行时同样需要传入可导出的 canvas / 组件。
- 截图会保留当前明暗主题（计算样式已解析 CSS 变量）。

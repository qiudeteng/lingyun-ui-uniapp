# lingyun-image-upload

图片上传。支持两种模式：

- `mode="direct"`：选图后立即上传，可配置最多张数。
- `mode="edit"`：选图后进入编辑器，90° 旋转、固定比例或自由裁剪，确认后再上传。

`v-model` 只包含**上传成功**的图片地址（`string[]`）；上传中、失败状态在组件内部维护。

## 示例

```vue
<!-- 直接上传：最多 9 张 -->
<lingyun-image-upload
  v-model="urls"
  mode="direct"
  :max-count="9"
  upload-url="/api/upload"
  upload-name="file"
/>

<!-- 编辑后上传：固定 1:1，自定义上传函数 -->
<lingyun-image-upload
  v-model="urls"
  mode="edit"
  :max-count="3"
  :crop-aspect="1"
  :upload-fn="uploadFile"
/>

<!-- 自由裁剪 -->
<lingyun-image-upload v-model="urls" mode="edit" crop-aspect="free" />
```

```ts
// 换成你自己的上传接口
async function uploadFile(file: { tempFilePath: string; name: string; size: number }) {
  const result = await api.upload(file)
  return result.url
}
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `v-model` | 已上传图片地址 | `[]` |
| `mode` | `direct` 直接上传 / `edit` 编辑后上传 | `direct` |
| `max-count` | 最多张数；`<=0` 按 1 处理 | `9` |
| `max-size` | 单张大小上限，单位 MB；`0` 不限制 | `0` |
| `disabled` | 禁用选图、删除、重试 | `false` |
| `readonly` | 只读；仍可预览 | `false` |
| `columns` | 缩略图列数，1–6 | `3` |
| `radius` | 缩略图圆角：`none/sm/md/lg/xl/2xl` 或像素 | `md` |
| `preview` | 点击已上传图片调用 `uni.previewImage` | `true` |
| `upload-url` | 内置 `uni.uploadFile` 地址 | — |
| `upload-name` | 上传文件字段名 | `file` |
| `upload-header` | 额外请求头；内置上传会自动带 `Authorization` | `{}` |
| `upload-form-data` | 额外表单字段 | `{}` |
| `upload-fn` | 自定义上传函数，返回图片地址或 `{ url }` | — |
| `parse-response` | 自定义内置上传响应解析，返回图片地址 | — |
| `crop-aspect` | `1`、`4/3`、`'4:3'` 固定比例；`'free'` 自由裁剪 | `1` |
| `output-max-size` | 导出图片最长边上限（px） | `2048` |
| `quality` | 导出 JPEG 质量，0–1 | `0.85` |
| `source-type` | `['album','camera']` | 相册 + 拍照 |
| `size-type` | `['original','compressed']` | 两者 |
| `z-index` | 编辑器浮层层级 | `1200` |
| `tip` | 网格下方提示文案 | — |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string[]` | 成功地址变化 |
| `change` | `{ urls, items }` | 任意状态变化 |
| `select` | `{ files, remaining }` | 选图完成 |
| `upload-start` | `item` | 开始上传 |
| `upload-success` | `item, response` | 上传成功 |
| `upload-error` | `item, error` | 上传失败 |
| `remove` | `{ item, index }` | 删除 |
| `exceed` | `{ maxCount, selected }` | 超出上限 |
| `retry` | `item` | 点击失败项重试 |
| `preview` | `{ item, index }` | 点击已上传图片 |
| `crop-open` | `{ file, index, total }` | 打开编辑器 |
| `crop-confirm` | `{ file, result }` | 当前图片裁剪完成 |
| `crop-cancel` | `{ file, remaining }` | 取消当前编辑 |

## 方法

通过 `ref` 调用：

```ts
uploadRef.value?.choose()
uploadRef.value?.clear()
uploadRef.value?.retryAll()
```

## 上传说明

- 同时配置 `upload-fn` 与 `upload-url` 时，优先使用 `upload-fn`。
- 内置上传默认从 `data.url`、`url`、`data` 依次取地址；后端结构不同用 `parse-response`。
- 编辑模式一次可选多张，编辑器按顺序逐张处理；取消时若还有未编辑图片，会弹窗确认。
- 微信小程序使用 Canvas 2D 导出，基础库需 **2.9.0+**；H5 用 DOM Canvas 导出。
- 导出按原图分辨率计算，并用 `output-max-size` 限制最长边。

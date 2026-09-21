# lingyun-toast

轻提示。业务里优先用命令式 `uni.showLingyunToast`，不必自己放组件。组件由页面壳里的反馈宿主渲染。

## 示例

```vue
uni.showLingyunToast('已保存')
uni.showLingyunToast({ text: '失败', type: 'error' })
uni.hideLingyunToast()
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否显示 | — |
| `text` | 文案 | '' |
| `type` | `default` / `success` / `error` / `loading` | default |
| `duration` | 毫秒。`loading` 默认不自动关 | 2000 |

调用前需要 `app.use(pinia)` 和 `app.use(lingyunUi)`，并且页面使用 `lingyun-app-page`。

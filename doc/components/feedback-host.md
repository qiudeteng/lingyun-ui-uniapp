# lingyun-feedback-host

Toast、HUD 和 JS 调用的 Alert（`uni.showLingyunAlert`）的挂载点。`lingyun-app-page` 已经放好了，不要在页面里再写一个。

## 示例

```vue
<!-- 不需要手写。lingyun-app-page 内部包含 lingyun-feedback-host -->
<lingyun-app-page title="首页">
  <view>点按钮后调用 uni.showLingyunToast</view>
</lingyun-app-page>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `—` | 无公开属性 | — |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/toasts.vue -->

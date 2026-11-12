# lingyun-load-more

长列表底部的加载更多：更多 / 加载中 / 没有更多 / 失败重试。支持手动点击与自动触底。

规范见 [`design/LOAD_MORE.md`](../../design/LOAD_MORE.md)。

## 示例

```vue
<lingyun-load-more :status="status" @load="loadMore" />
```

```ts
import { ref } from 'vue'
import type { LingyunLoadMoreStatus } from '@/uni_modules/lingyun-ui/components/lingyun-load-more/types'

const status = ref<LingyunLoadMoreStatus>('more')

async function loadMore(payload: { source: 'click' | 'auto' }) {
  status.value = 'loading'
  try {
    const rows = await fetchNextPage()
    status.value = rows.length ? 'more' : 'nomore'
  } catch {
    status.value = 'error'
  }
}
```

自动触底：

```vue
<lingyun-load-more :status="status" auto @load="loadMore" />
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `status` | `more` / `loading` / `nomore` / `error` | `more` |
| `moreText` | 加载更多文案 | 加载更多 |
| `loadingText` | 加载中文案 | 加载中… |
| `noMoreText` | 没有更多文案 | 没有更多了 |
| `errorText` | 失败文案 | 加载失败，点击重试 |
| `showEndLine` | 没有更多时显示两侧分割线 | true |
| `auto` | 触底自动触发 | false |
| `disabled` | 禁用点击与自动加载 | false |
| `minHeight` | 最小高度 px | 48 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `load` | 点击 / 自动加载，参数 `{ source: 'click' \| 'auto' }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `trigger()` | 手动触发一次加载（等同点击） |

## 说明

- 宿主在请求开始时把 `status` 改为 `loading`，结束改为 `more` / `nomore` / `error`。
- `auto` 使用 IntersectionObserver 观察底部 80px；状态回到 `more` 会重新观察。
- `loading` / `nomore` 不响应点击；`error` 点击即重试。
- 内容层控件，不铺 Liquid Glass。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/load-more.vue -->

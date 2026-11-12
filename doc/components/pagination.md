# lingyun-pagination

分页控件：总数、页码窗口、上一页 / 下一页、简单模式、小尺寸。

规范见 `design/PAGINATION.md`。

## 示例

```vue
<lingyun-pagination
  v-model="page"
  :total="126"
  :page-size="10"
  @change="onPageChange"
/>
```

简单 / 小尺寸：

```vue
<lingyun-pagination
  v-model="page"
  :total="48"
  :page-size="10"
  size="small"
  simple
/>
```

```ts
import { ref } from 'vue'
import type { LingyunPaginationChangePayload } from '@/uni_modules/lingyun-ui/components/lingyun-pagination/types'

const page = ref(1)

function onPageChange(payload: LingyunPaginationChangePayload) {
  // payload: { page, pageSize, pageCount }
  fetchPage(payload.page, payload.pageSize)
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 当前页，`v-model` | 1 |
| `total` | 总条数 | 0 |
| `pageSize` | 每页条数 | 10 |
| `maxButtons` | 页码窗口上限（5–11） | 7 |
| `size` | `default` / `small` | default |
| `showTotal` | 显示「共 N 条」 | true |
| `totalText` | 自定义总数文案 | `共 N 条` |
| `showPrevNext` | 显示上一页 / 下一页 | true |
| `simple` | 只显示当前页 / 总页数 | false |
| `hideOnSinglePage` | 总页数 ≤1 时隐藏 | false |
| `disabled` | 禁用交互 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 页码变化 |
| `change` | 参数 `{ page, pageSize, pageCount }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `go(page)` | 跳到指定页 |
| `prev()` | 上一页 |
| `next()` | 下一页 |

## 说明

- 页码窗口默认 7 个位置：首页 + 省略号 + 当前附近 + 省略号 + 末页。
- 省略号可点击向前 / 后跳若干页。
- `total` / `pageSize` 变化时当前页自动限制在 1–总页数。
- 内容层控件，不铺 Liquid Glass。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/pagination.vue -->

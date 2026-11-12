# 分栏页面开发规范与踩坑清单（列表 + 详情）

> 来源：`/pages/demo/pages/list-detail/list-detail`、`/pages/demo/pages/purchase-order-split/purchase-order-split` 两轮开发中实际踩过的坑。做「宽屏左右分栏、窄屏独立详情页」这类页面之前先读一遍。
>
> **优先直接用 [`lingyun-split-layout`](/components/split-layout.html)**：页面结构、头部浮动与测高、分栏缝隙都已封装；本文档说明它内部做了什么、以及内容侧仍要注意的约束（尤其是小程序宿主节点高度）。

## 1. 页面结构模板

```
lingyun-app-page（show-toolbar=false、body-scroll=false、show-tabbar=false）
└── .xxx-page（专属类，flex 行、height:100vh、padding:0）
    ├── 左栏 .xxx-pane--list（宽屏固定 375px；position:relative）
    │   ├── .xxx-pane__header（position:absolute，放 lingyun-split-toolbar）
    │   └── 列表内容（内层 scroll-view 或面板组件）
    ├── 分隔（0.5px 透明缝隙，或按设计）
    └── 右栏 .xxx-pane--detail（仅宽屏渲染）
        ├── .xxx-pane__header（放 lingyun-split-toolbar）
        └── 详情内容
```

> 用 `lingyun-split-layout` 时以上结构全部由组件提供；两栏 toolbar 用配套的 **`lingyun-split-toolbar`** 放进 `list-header` / `detail-header` 插槽，页面只传标题 / 搜索 / 分段等业务配置，**不要直接写 `lingyun-toolbars`，也不要设置 `title-style` 等展示属性**。下面的模板用于理解组件内部或手写分栏的场景。

分栏门槛：窄屏 **< 900** 单栏 + 点行进独立详情页；≥ 900 分栏（与 `list-detail` 一致）。窗口宽度变化用 `uni.onWindowResize` 更新，`wide` 为 computed。

## 2. 必踩的坑（按出现频率排序）

### 2.1 ❌ 用通用 `.page` 承载页面结构样式（H5 跨页错版）

H5 路由切换**不会卸载旧页面的 CSS**。如果页面根内容元素叫 `.page` 并写了 `display:flex / height:100vh / position`，离开该页后这些样式会套到其它页面的 `.page` 上，典型症状：目录页内容缩成一列、只有图标没文字、底栏不见了。

- ✅ 结构样式挂**页面专属类**（`.list-page` / `.po-page` / `.refresh-page` / `.indexed-page` …），元素上同时保留 `.page` 让全局规则（导航让位、透明背景）继续生效：
  ```scss
  .po-page { display: flex; height: 100vh; min-height: 0; padding: 0; }
  ```
- ✅ `.page` 上只留 padding / 背景这类「可以被下一页覆盖」的属性。
- 排查口诀：**访问过 A 之后 B 才错版 → 查 A 的样式是否写在通用类上。**

### 2.2 ❌ 内层滚动给百分比高度，小程序整页跟着滚

WXSS 里 `scroll-view` 的 `height: 100%` 在 flex 链路上拿不到确定高度，会被内容撑开，页面整体滚动、浮动 toolbar 跟着滚走。

- ✅ 统一用 `flex: 1 + height: 0`：
  ```scss
  .xxx-body { flex: 1; min-height: 0; height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .xxx-scroll { flex: 1; min-height: 0; height: 0; }
  ```

### 2.3 ❌ 分栏里直接嵌整页标准页（嵌套 app-page）

`lingyun-app-page` 会通过 provide/inject 把任何内层实例降级为 **embedded**（内容随页面流、没有固定高度、内层 scroll 失效）；同时 H5 的导航宿主 `setLingyunH5PageNavAllowed` 会被内层覆盖、`--nav` 类会往里叠加导航内边距，出现「列表钻到导航下面、详情内容大幅右移」。

- ✅ 标准页拆成「**页面壳 + 内容面板**」：面板组件（如 `lingyun-purchase-order-list-panel`）不含 app-page，分栏页直接用面板，toolbar 用 `lingyun-split-toolbar`；面板暴露 `topSpace`（工具条高度占位）与 `scroll`（驱动玻璃进度）事件。
- ❌ 不要为了复用给标准页加 `inline` 之类往 app-page 里塞特例的开关。

### 2.4 ❌ 小程序自定义组件宿主节点没有高度（本轮最大坑）

```vue
<lingyun-purchase-order-list-panel ... />
```

在小程序里，这行会生成一个**宿主节点**，它默认高度随内容。面板内部的 `height: 100%` 全部失效 → 面板随列表内容变高 → **整页滚动、toolbar 不固定**（H5 没有这层节点，所以「H5 正常、小程序滚」多半是它）。

- ✅ 用 `lingyun-split-layout` 时：插槽内容直接用组件自带的全局结构工具类（容器有确定高度、是定位参照）：
  ```vue
  <template #list>
    <lingyun-purchase-order-list-panel
      class="lingyun-split-layout-pane"
      :top-space="listTopSpace"
      ...
    />
  </template>
  ```
  - 插槽根容器：`lingyun-split-layout-pane`（绝对铺满 + 纵向 flex）
  - 插槽根节点本身就是 `scroll-view`：`lingyun-split-layout-fill`
  - 容器内的内层 `scroll-view`：`lingyun-split-layout-scroll`（`flex:1 + height:0`）

  工具类在 `styles/setting/_split-layout.scss`，经 `App.vue` 全局注入；不要写进组件样式——小程序 styleIsolation 下插槽节点吃不到组件 wxss。
- 不用布局组件、手写分栏时：给宿主节点显式 `flex: 1 1 0; height: 0`（页面的 pane 是 flex 列）。
- ❌ 不要在面板组件里写 `:host { height: … }`——会连带影响标准页（非 flex 容器里的正常用法）；也不要在小程序里指望 slot 内容被 flex 拉伸。

### 2.5 ❌ 改完只看 H5；小程序不重新编译

- 改完必须 `pnpm build:mp-weixin`，微信开发者工具**不会自动重新编译被替换的 dist 目录**；脚本化验证时用 `cli close --project …` + `cli auto --project … --auto-port 9420` 重开项目才会加载新代码。
- 残留的 dev server / 僵尸进程会一直返回旧代码（H5 端口 5175 被占时先 `netstat -ano | grep :5175` 再 `taskkill`）。**现象诡异先怀疑进程和编译缓存，不要急着改代码。**

### 2.6 ⚠️ 选中态、暗黑分层与边线语义

- **左栏底色由 `lingyun-split-layout` 统一提供**：窄屏 Primary、宽屏 grouped-secondary（浅色白 / 暗黑 `#1c1c1e`）；页面插槽内容不要再自己设左栏背景。
- 选中行 = **页面底色**（`--lingyun-bg-grouped-primary`）；未选中列表列 = `grouped-secondary`。暗黑下 `Primary` 和 `Grouped Primary` **都是 #000**，想分层只能靠把列表列用 `grouped-secondary`（#1c1c1e）「抬升」一级。
- 分栏缝隙给 `transparent`、透出页面底色即可；**不要**再画 `--lingyun-separator` 灰线，也不要按「右侧有没有白色列」切换颜色。
- 手机模式没有「选中」概念：`selectedKey` 只在宽屏传，窄屏不传。

### 2.7 ⚠️ 底部悬浮栏

底部操作胶囊用 `position:absolute; bottom:0` 浮在滚动内容上方（左右 12、底部 8 + 安全区、`lingyun-glass-control`），滚动内容 `padding-bottom: calc(96px + env(safe-area-inset-bottom))` 让最后一块能滚出来；不要做成占据一条底栏的实底条。

### 2.8 ⚠️ 浮动 toolbar 的占位与玻璃

- 用 `lingyun-split-layout` 时只需要：把 `lingyun-split-toolbar` 放进 header 插槽并传业务配置（标题 / 搜索 / 分段 / 自定义按钮）、把内容滚动换算成 `glass-progress`（`min(1, top / 56)`）、用 `layout-change` 的 `listTopSpace` / `detailTopSpace` 做顶部占位（不要解构作用域插槽参数：微信小程序里页面重渲染后插槽内组件会丢 props，点行后整栏空白）。头部高度由分栏组件实测，`title-style` / 分段形态 / 12px 顶部补偿都固定在 `lingyun-split-toolbar` 里。
- 手写分栏时才需要自己放 `:fixed="false"` 的 toolbar、`createSelectorQuery` 量高、`:avoid-capsule="false"`（微信胶囊在别的栏上面）；这些在组件里已经固定处理，页面层不要重复。

## 3. 验证清单

H5（所有宽度 + 明暗两套主题）：

- [ ] `document.documentElement.scrollHeight === window.innerHeight`（整页不滚）
- [ ] 两栏各自的 `scroll-view` 可滚动（clientHeight = 视口高，scrollHeight 更大）
- [ ] 浮动 toolbar 不随内容滚动，滚动后玻璃出现
- [ ] 宽度 390 / 768 / 1024 / 1400 / 1920 往返切换后布局不散、占位高度重测
- [ ] 访问别的页面再回来、访问过的旧页样式不影响本页（关掉重开无差别）

微信小程序（开发者工具即可，无需真机）：

- [ ] `wx.pageScrollTo(200)` 后 `page.scrollTop` 仍为 0
- [ ] 修复前后对比 toolbar 的 offset 不随页面滚动变化
- [ ] 内层 `scroll-view` 的实际高度 = 视口高度（`createSelectorQuery` 在组件内查询）
- [ ] 模拟器上状态栏 / 胶囊 / 底部安全区正常，toolbar 固定

脚本化验证（miniprogram-automator 连 `cli auto --auto-port 9420`）可用 `mp.pageScrollTo` + `page.scrollTop()` + `page.$('.lingyun-split-layout-pane').offset()` 快速回归。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/pages/purchase-order-split/purchase-order-split.vue -->
<!-- demo-source: src/pages/demo/pages/purchase-order-split/purchaseOrderDemo.ts -->

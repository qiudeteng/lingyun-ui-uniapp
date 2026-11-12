# 工作台 Demo

演示页面：`/pages/demo/workbench?tab=<key>`  
设计说明：`design/pages/demo/workbench.md`

一级导航配置了二级 / 三级菜单（`children`）后，**窄屏点父级 Tab 不进 `url`，而是进入这个固定落地页**，把子菜单渲染成分组卡片。宽屏 PC 直接展开内联菜单列、平板点父项弹 `lingyun-menu`，都不经过工作台。

## 结构

- 顶部工具栏：当前一级 Tab 的文案（`lingyun-app-page title`），无返回（它是 Tab 的落地页）。
- 内容：`hero`（Tab 名 +「选择一个功能进入」）+ 按分组排列的 `lingyun-grid`（4 列），二级项一个卡片；有三级的分组带 `lingyun-group-header` 分组标题。
- 空态：当前 Tab 没有 `children` 时显示「暂无二级菜单」。

## 数据来源

工作台的菜单就是全局 `tabs` 里该 Tab 的 `children`，不需要额外配置：

```ts
setLingyunPageConfig({
  tabs: [
    {
      key: 'pages',
      text: '页面',
      icon: 'grid',
      url: '/pages/pages/pages',
      children: [
        { key: 'list', text: '记录列表', url: '/pages/records/records' },
        {
          key: 'orders',
          text: '订货单',
          children: [
            { key: 'order-list', text: '订货单列表', url: '/pages/demo/purchase-order-list' },
            { key: 'order-detail', text: '订货单详情', url: '/pages/demo/purchase-order-detail' },
          ],
        },
      ],
    },
  ],
  // 工作台页本身（一般全局配一次）
  workspaceUrl: '/pages/demo/workbench',
})
```

- 有 `children` 的一级 Tab 在窄屏 / Duo 走工作台（地址 `workspaceUrl?tab=<key>`），点卡片进入子页；没有 `children` 的 Tab 直接进 `url`。
- 工作台子项用 `navigateTo` 压栈，第一个子项也有返回；从子页返回回到工作台原 Tab。
- 切 Tab 不重建页面：只按全局 workspace key 换内容，背景与底部 Tab 不动。
- 小程序宽屏宿主要求页面 **静态登记**：新增工作台目标页时同时登记宿主视图（本仓库由 `src/router/pageViews.ts` + `app-page-view-host` 完成），否则宽屏点击会回落 404。

## 使用

直接打开 `pages/demo/workbench?tab=pages` 体验；切换底部 Tab 的一级项可以看到工作台跟着换分组。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/workbench.vue -->

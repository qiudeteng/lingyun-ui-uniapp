# lingyun-ui-page

标准页面扩展。控件仍在 `lingyun-ui`，这里只放可复用的整页，例如登录。

路由仍登记在业务工程的 `pages.json` / `src/pages`。页面里直接写标签，账号请求、登录态和跳转留在路由文件。

`components/lingyun-ui-page/lingyun-ui-page.vue` 是空文件，保留它，不要删，也不要往里写页面。

## 登录

```vue
<lingyun-login
  :logo="logo"
  :enterprise-name="enterpriseName"
  :booting="booting"
  @submit="onSubmit"
  @policy="openPolicy"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `logo` | 企业 logo，空则不显示 | '' |
| `enterpriseName` | 标题上的企业名称，空则不显示 | '' |
| `hint` | logo 下方的说明 | 内部管理使用，不提供注册功能 |
| `booting` | 为真时只显示转圈，用于静默登录 | false |
| `submitText` | 登录按钮文案 | 立即登录 |
| `copyright` | 登录按钮下方的版权水印，空则不显示 | '' |

| 事件 | 说明 |
|------|------|
| `submit` | 账号、密码和协议都通过后触发，参数 `{ username, password }` |
| `policy` | 点协议链接时仍会抛出。`user` 用户服务协议，`privacy` 隐私政策。组件自己用全屏 Sheet 展示正文，页面不必再跳转 |

未填账号、密码短于 6 位或未勾选协议时，组件自己弹出 Toast，不会触发 `submit`。

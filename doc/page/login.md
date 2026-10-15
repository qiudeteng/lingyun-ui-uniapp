# lingyun-login

标准登录页。界面和表单校验在 `lingyun-ui-page`，路由页只接交互。本仓库 `pages/login/login` 是**纯演示**：不调登录接口，点登录进首页，点次按钮进组件演示列表。

## 示例

```vue
<lingyun-login
  enterprise-name="凌云UI"
  copyright="© 凌云UI Demo"
  demo-text="组件演示"
  @submit="goHome"
  @demo="goDemo"
/>
```

```ts
function goHome(): void {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goDemo(): void {
  uni.navigateTo({ url: '/pages/demo/demo' })
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `logo` | 企业 logo，空则不显示 | '' |
| `enterpriseName` | 标题上的企业名称，空则不显示 | '' |
| `hint` | logo 下方的说明 | 内部管理使用，不提供注册功能 |
| `booting` | 为真时只显示转圈，用于静默登录 | false |
| `submitText` | 登录按钮文案 | 立即登录 |
| `demoText` | 登录按钮下方的次按钮。空则不显示 | '' |
| `copyright` | 登录按钮下方的版权水印，空则不显示 | '' |

## 事件

| 事件 | 说明 |
| --- | --- |
| `submit` | 账号、密码和协议都通过后触发，参数 `{ username, password }` |
| `demo` | 点次按钮。组件不跳转，页面自己打开目标页 |
| `policy` | 点协议链接时仍会抛出。`user` 用户服务协议，`privacy` 隐私政策。组件自己用全屏 Sheet 展示正文，页面不必再跳转 |

## 校验

未填账号、密码短于 6 位或未勾选协议时，组件自己弹出 Toast，不会触发 `submit`。

## 业务工程怎么接

接真实登录时：在 `@submit` 里调接口并写登录态，成功后再跳转；需要静默登录时用 `booting`。本演示站关闭了路由鉴权，任意页可直接打开。

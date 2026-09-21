# 反馈

轻提示和加载遮罩不要在每个页面各放一个组件。调用下面两个方法即可，宿主已经在 `lingyun-app-page` 里。

## 轻提示

```ts
uni.showLingyunToast('已保存')
uni.showLingyunToast({ text: '保存失败', type: 'error' })
uni.showLingyunToast({ text: '提交中', type: 'loading' })
uni.hideLingyunToast()
```

`type` 可以是 `default`、`success`、`error`、`loading`。除 loading 外，默认约 2 秒后消失。

## 加载遮罩

```ts
uni.showLingyunHud('提交中')
uni.hideLingyunHud()
```

点遮罩就能关掉时：

```ts
uni.showLingyunHud({ text: '加载中', maskClosable: true })
```

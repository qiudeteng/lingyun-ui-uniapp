# lingyun-mobile

窗口宽度小于 690 时显示插槽内容。平板和电脑不渲染。

## 示例

```vue
<lingyun-mobile>
  <lingyun-section title="手机上的内容" />
</lingyun-mobile>
```

和 `lingyun-pc` 成对使用。窗口达到 690 后，这一支隐藏，宽屏那一支显示。还没读到窗口宽度时，先按窄屏显示。

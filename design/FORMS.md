# Forms 规范（强制 · lingyun-form）

> 表单**容器**：用 iOS Settings **Grouped List** 视觉统一包裹表单控件。  
> 不依赖 `uni-forms`；控件浮层仍各自 Teleport / root-portal。

## 权威来源

1. **HIG · Lists / Settings 风格表单** — 分组卡片 + 行内 Label / 控件  
2. 本仓库 [`LISTS.md`](./LISTS.md) · [`TEXTFIELDS.md`](./TEXTFIELDS.md) §0  
3. Liquid Glass：表单属**内容层**，卡片用 Grouped 标准材质，禁止整表玻璃

---

## 1. 结构

```
lingyun-form
  └── lingyun-form-group（可选多组）
        └── lingyun-form-item
              └── 控件（text-field / picker / switch / …）
```

| 组件 | 职责 |
|------|------|
| `lingyun-form` | `model` + `rules`；provide；`validate` / `clearValidate` |
| `lingyun-form-group` | 分组标题 / 页脚 + 卡片（对齐 list card，**不**依赖 `lingyun-list`） |
| `lingyun-form-item` | 行：Label + 插槽控件 + 错误文案；组内真实分割线 |

---

## 2. API

### lingyun-form

```vue
<lingyun-form ref="formRef" :model="form" :rules="rules">
  …
</lingyun-form>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `model` | `{}` | 表单数据对象 |
| `rules` | `{}` | `{ [name]: Rule[] }` |
| `inset` | `true` | 左右 16 页边距 |

**Rule**：`{ required?, message?, pattern?, validator?(value, model) => true \| string }`  

方法（组件实例）：`validate()` → `Promise<model>`；`validateField(name)`；`clearValidate(name?)`  
失败时 `validate` reject `{ errors: { [name]: message } }`。

### lingyun-form-group

| 属性 | 说明 |
|------|------|
| `title` | 分组头（Nested 风格 13/20 secondary） |
| `footer` | 卡片外页脚说明 |

### lingyun-form-item

| 属性 | 默认 | 说明 |
|------|------|------|
| `name` | — | 对应 `model` 字段 |
| `label` | `''` | 左侧标签 |
| `required` | `false` | 红星 |
| `error` | `''` | 覆盖 form 校验错误 |
| `layout` | `row` | `row` 左标右控；`stack` 上下（多行兜底） |

---

## 3. 用法

```vue
<lingyun-form ref="formRef" :model="form" :rules="rules">
  <lingyun-form-group title="资料" footer="必填项请完整填写">
    <lingyun-form-item name="name" label="姓名" required>
      <lingyun-text-field v-model="form.name" placeholder="请输入" />
    </lingyun-form-item>
    <lingyun-form-item name="city" label="城市">
      <lingyun-data-picker v-model="form.city" :localdata="tree" />
    </lingyun-form-item>
    <lingyun-form-item name="notify" label="通知">
      <lingyun-switch v-model="form.notify" />
    </lingyun-form-item>
  </lingyun-form-group>
</lingyun-form>
```

---

## 4. 控件嵌入（cell）

`lingyun-text-field` / `lingyun-picker` / `lingyun-data-picker` 在 `form-item` 内默认 **`variant="auto"` → `cell`**：

- 去掉独立胶囊 / 圆角底，避免双层底
- 控件自身 Label 不渲染（用 form-item 的 `label`）
- `row`：值右对齐；`stack`（多行）：通栏左对齐
- 可点区域须拉满右侧（`form-item__control`：`flex:1; width:0`；控件根 `width:100%`），避免真机点空白无焦点

独立场景仍用 `variant="field"`（或脱离 form-item 的默认 `auto`）。

---

## 5. 自检

- [ ] 分组卡片圆角 / 底色对齐 list；分割线为真实节点
- [ ] `validate` 必填失败时 item 下显示红字
- [ ] form-item 内 text-field / picker 为 cell，无双层底
- [ ] 浅色 / 暗黑；微信小程序可编译
- [ ] 未引入 `uni-forms`；mp-weixin 可编译
- [ ] 浮层控件（picker 等）不被 form 裁切（仍走各自 portal）

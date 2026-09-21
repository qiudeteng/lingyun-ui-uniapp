function normalizeItem(raw, index) {
  const item = raw || {}
  return {
    kind: 'item',
    key: item.key != null ? String(item.key) : `a${index}`,
    label: item.label != null ? String(item.label) : '',
    subtitle: item.subtitle != null ? String(item.subtitle) : '',
    icon: item.icon != null ? String(item.icon) : '',
    role: item.role === 'destructive' ? 'destructive' : 'default',
    disabled: !!item.disabled,
    selected: !!item.selected,
    submenu: !!item.submenu,
    raw: item,
  }
}

/** Sketch Menu 行：普通项 / 分隔 / 分组标题 / 顶部快捷操作 */
export function normalizeMenuActions(list) {
  const source = Array.isArray(list) ? list : []
  return source.map((raw, index) => {
    const item = raw || {}
    const type = item.type || item.kind || 'item'
    if (type === 'separator' || type === 'sep') {
      return {
        kind: 'separator',
        key: item.key != null ? String(item.key) : `sep${index}`,
        raw: item,
      }
    }
    if (type === 'title' || type === 'section') {
      return {
        kind: 'title',
        key: item.key != null ? String(item.key) : `title${index}`,
        label: item.label != null ? String(item.label) : '',
        raw: item,
      }
    }
    if (type === 'controls') {
      const items = Array.isArray(item.items) ? item.items : []
      return {
        kind: 'controls',
        key: item.key != null ? String(item.key) : `controls${index}`,
        items: items.map((child, childIndex) => normalizeItem(child, `${index}-${childIndex}`)),
        raw: item,
      }
    }
    return normalizeItem(item, index)
  })
}

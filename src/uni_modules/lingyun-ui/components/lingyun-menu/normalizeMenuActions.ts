export type MenuRole = 'default' | 'destructive'

/** 调用方传入的一行。type / kind 决定是普通项、分隔、标题还是顶部快捷操作。 */
export type MenuActionInput = {
  key?: string | number
  label?: string | number
  subtitle?: string | number
  icon?: string | number
  role?: string
  disabled?: boolean
  selected?: boolean
  submenu?: boolean
  type?: string
  kind?: string
  items?: MenuActionInput[]
}

export type MenuItem = {
  kind: 'item'
  key: string
  label: string
  subtitle: string
  icon: string
  role: MenuRole
  disabled: boolean
  selected: boolean
  submenu: boolean
  raw: MenuActionInput
}

export type MenuSeparator = {
  kind: 'separator'
  key: string
  raw: MenuActionInput
}

export type MenuTitle = {
  kind: 'title'
  key: string
  label: string
  raw: MenuActionInput
}

export type MenuControls = {
  kind: 'controls'
  key: string
  items: MenuItem[]
  raw: MenuActionInput
}

export type MenuAction = MenuItem | MenuSeparator | MenuTitle | MenuControls

function textOf(value: unknown): string {
  return value != null ? String(value) : ''
}

function normalizeItem(raw: MenuActionInput | null | undefined, index: number | string): MenuItem {
  const item = raw || {}
  return {
    kind: 'item',
    key: item.key != null ? String(item.key) : `a${index}`,
    label: textOf(item.label),
    subtitle: textOf(item.subtitle),
    icon: textOf(item.icon),
    role: item.role === 'destructive' ? 'destructive' : 'default',
    disabled: !!item.disabled,
    selected: !!item.selected,
    submenu: !!item.submenu,
    raw: item,
  }
}

/** Sketch Menu 行：普通项 / 分隔 / 分组标题 / 顶部快捷操作 */
export function normalizeMenuActions(list: MenuActionInput[] | null | undefined): MenuAction[] {
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
        label: textOf(item.label),
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

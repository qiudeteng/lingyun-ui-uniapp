/** 是否在工具栏 / Duo 工具组里显示内置主题切换。宿主按需开启。 */
import { shallowRef } from 'vue'

const visible = shallowRef(false)

export function setLingyunThemeSwitchVisible(value: boolean): void {
  visible.value = !!value
}

export function useLingyunThemeSwitchVisible() {
  return visible
}

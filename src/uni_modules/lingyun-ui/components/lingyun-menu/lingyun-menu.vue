<template>
  <lingyun-popover
    v-model:show="innerShow"
    variant="menu"
    :show-arrow="false"
    :width="250"
    :placement="placement"
    :mask-closable="maskClosable"
    :z-index="zIndex"
    @close="onClose"
  >
    <template #trigger="{ show, toggle }">
      <slot name="trigger" :show="show" :toggle="toggle" />
    </template>
    <view class="lingyun-menu">
      <view
        v-for="(action, index) in normalizedActions"
        :key="action.key || index"
        :class="rowClass(action)"
        :hover-class="hoverClass(action)"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onRow(action, index)"
      >
        <view v-if="action.kind === 'separator'" class="lingyun-menu__sep-line" />
        <text v-else-if="action.kind === 'title'" class="lingyun-menu__heading-text">{{ action.label }}</text>
        <template v-else-if="action.kind === 'controls'">
          <view
            v-for="item in action.items"
            :key="item.key"
            class="lingyun-menu__control"
            :class="controlClass(item)"
            :hover-class="item.disabled ? '' : 'lingyun-menu__control--hover'"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click.stop="onControl(item)"
          >
            <lingyun-icon
              v-if="item.icon"
              :type="item.icon"
              :size="22"
              :color="iconColor(item)"
            />
            <text class="lingyun-menu__control-label">{{ item.label }}</text>
          </view>
        </template>
        <template v-else>
          <view v-if="action.icon" class="lingyun-menu__symbol">
            <lingyun-icon :type="action.icon" :size="20" :color="iconColor(action)" />
          </view>
          <view class="lingyun-menu__text">
            <text class="lingyun-menu__label">{{ action.label }}</text>
            <text v-if="action.subtitle" class="lingyun-menu__subtitle">{{ action.subtitle }}</text>
          </view>
          <lingyun-icon
            v-if="action.selected"
            class="lingyun-menu__trail"
            type="checkmarkempty"
            :size="17"
            :color="iconColor(action)"
          />
          <lingyun-icon
            v-if="action.submenu"
            class="lingyun-menu__trail"
            type="right"
            :size="12"
            color="secondary"
          />
        </template>
      </view>
    </view>
  </lingyun-popover>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  normalizeMenuActions,
  type MenuAction,
  type MenuActionInput,
  type MenuItem,
} from './normalizeMenuActions'

/**
 * lingyun-menu
 * @see design/MENUS.md
 */
export default defineComponent({
  name: 'LingyunMenu',
  emits: ['update:show', 'update:modelValue', 'select', 'close'],
  props: {
    show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    actions: { type: Array as PropType<MenuActionInput[]>, default: () => [] },
    placement: { type: String, default: 'bottom' },
    maskClosable: { type: Boolean, default: true },
    zIndex: { type: [Number, String] as PropType<number | string>, default: 1100 },
  },
  computed: {
    innerShow: {
      get(): boolean {
        if (this.show !== undefined && this.show !== null) return !!this.show
        if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
        return false
      },
      set(val: boolean) {
        this.$emit('update:show', val)
        this.$emit('update:modelValue', val)
      },
    },
    normalizedActions(): MenuAction[] {
      return normalizeMenuActions(this.actions)
    },
  },
  methods: {
    iconColor(action: Pick<MenuItem, 'disabled' | 'role'>): string {
      if (action.disabled) return 'tertiary'
      if (action.role === 'destructive') return 'red'
      return 'label'
    },
    rowClass(action: MenuAction): string {
      if (action.kind === 'separator') return 'lingyun-menu__sep'
      if (action.kind === 'title') return 'lingyun-menu__heading'
      if (action.kind === 'controls') return 'lingyun-menu__controls'
      return [
        'lingyun-menu__item',
        action.subtitle ? 'lingyun-menu__item--sub' : '',
        action.disabled ? 'lingyun-menu__item--disabled' : '',
        action.role === 'destructive' ? 'lingyun-menu__item--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    controlClass(item: MenuItem): string {
      return [
        item.disabled ? 'lingyun-menu__control--disabled' : '',
        item.role === 'destructive' ? 'lingyun-menu__control--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass(action: MenuAction): string {
      if (action.kind !== 'item' || action.disabled) return ''
      return 'lingyun-menu__item--hover'
    },
    emitSelect(action: MenuItem, index: number) {
      this.$emit('select', { action: action.raw || action, index, key: action.key })
      this.innerShow = false
    },
    onRow(action: MenuAction, index: number) {
      if (action.kind !== 'item' || action.disabled) return
      this.emitSelect(action, index)
    },
    onControl(item: MenuItem) {
      if (!item || item.disabled) return
      this.emitSelect(item, 0)
    },
    onClose() {
      this.$emit('close')
    },
  },
})
</script>

<style lang="scss">
@import './menu.scss';
</style>

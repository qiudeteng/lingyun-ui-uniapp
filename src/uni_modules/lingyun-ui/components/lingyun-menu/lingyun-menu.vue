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

<script>
import { normalizeMenuActions } from './normalizeMenuActions'

/**
 * lingyun-menu
 * @see design/MENUS.md
 */
export default {
  name: 'LingyunMenu',
  emits: ['update:show', 'update:modelValue', 'select', 'close'],
  props: {
    show: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    actions: { type: Array, default: () => [] },
    placement: { type: String, default: 'bottom' },
    maskClosable: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 1100 },
  },
  computed: {
    innerShow: {
      get() {
        if (this.show !== undefined && this.show !== null) return !!this.show
        if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
        return false
      },
      set(val) {
        this.$emit('update:show', val)
        this.$emit('update:modelValue', val)
      },
    },
    normalizedActions() {
      return normalizeMenuActions(this.actions)
    },
  },
  methods: {
    iconColor(action) {
      if (action.disabled) return 'tertiary'
      if (action.role === 'destructive') return 'red'
      return 'label'
    },
    rowClass(action) {
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
    controlClass(item) {
      return [
        item.disabled ? 'lingyun-menu__control--disabled' : '',
        item.role === 'destructive' ? 'lingyun-menu__control--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass(action) {
      if (action.kind !== 'item' || action.disabled) return ''
      return 'lingyun-menu__item--hover'
    },
    emitSelect(action, index) {
      this.$emit('select', { action: action.raw || action, index, key: action.key })
      this.innerShow = false
    },
    onRow(action, index) {
      if (action.kind !== 'item' || action.disabled) return
      this.emitSelect(action, index)
    },
    onControl(item) {
      if (!item || item.disabled) return
      this.emitSelect(item, 0)
    },
    onClose() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import './menu.scss';
</style>

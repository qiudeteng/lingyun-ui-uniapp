<template>
  <view id="ly-indexed" class="lingyun-indexed-list">
    <scroll-view
      class="lingyun-indexed-list__scroll"
      scroll-y
      :scroll-into-view="scrollViewId"
      :scroll-with-animation="false"
      :show-scrollbar="false"
    >
      <view
        v-for="(group, idx) in lists"
        :id="'ly-indexed-' + idx"
        :key="group.key + '-' + idx"
        class="lingyun-indexed-list__group"
      >
        <view class="lingyun-indexed-list__title">
          <text class="lingyun-indexed-list__title-text">{{ group.key }}</text>
        </view>
        <view class="lingyun-indexed-list__card">
          <view
            v-for="(item, index) in group.items"
            :key="group.key + '-' + index"
            class="lingyun-indexed-list__row"
            hover-class="lingyun-indexed-list__row--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="onClick(idx, index)"
          >
            <view v-if="showSelect" class="lingyun-indexed-list__check">
              <lingyun-icon
                :type="item.checked ? 'checkbox-filled' : 'circle'"
                :size="22"
                :color="item.checked ? 'var(--lingyun-system-blue, #0088ff)' : 'var(--lingyun-label-tertiary, #aeaeb2)'"
              />
            </view>
            <text class="lingyun-indexed-list__name">{{ item.name }}</text>
            <view v-if="index < group.items.length - 1" class="lingyun-indexed-list__line" />
          </view>
        </view>
      </view>
      <view class="lingyun-indexed-list__end" />
    </scroll-view>

    <view
      id="ly-indexed-menu"
      class="lingyun-indexed-list__menu"
      @touchstart.stop="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop="onTouchEnd"
      @mousedown.stop="onMouseDown"
      @mousemove.stop.prevent="onMouseMove"
      @mouseup.stop="onTouchEnd"
      @mouseleave.stop="onTouchEnd"
    >
      <view
        v-for="(group, index) in lists"
        :key="'k-' + group.key + '-' + index"
        class="lingyun-indexed-list__key"
        :class="{ 'lingyun-indexed-list__key--active': touchmoveIndex === index }"
      >
        <text
          class="lingyun-indexed-list__key-text"
          :class="{ 'lingyun-indexed-list__key-text--active': touchmoveIndex === index }"
        >{{ group.key }}</text>
      </view>
    </view>

    <view v-if="touchmove && activeKey" class="lingyun-indexed-list__bubble-wrap">
      <view class="lingyun-indexed-list__bubble">
        <text class="lingyun-indexed-list__bubble-text">{{ activeKey }}</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * lingyun-indexed-list
 * @description 索引列表。数据与点击对齐 uni-indexed-list。
 * 分组走列表卡片（圆角 26、行高 52），右侧字母条按下时用控件玻璃气泡，不用灰底和黑块。
 * @see design/INDEXED_LIST.md
 *
 * @property {Array} options [{ letter, data: string[] | { name, checked }[] }]
 * @property {Boolean} showSelect 点选模式，回传已选项
 * @event click { item, select }
 */
export default {
  name: 'LingyunIndexedList',
  emits: ['click'],
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      lists: [],
      menuTop: 0,
      itemHeight: 0,
      touchmove: false,
      touchmoveIndex: -1,
      scrollViewId: '',
      isPC: false,
    }
  },
  computed: {
    activeKey() {
      const group = this.lists[this.touchmoveIndex]
      return group ? group.key : ''
    },
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.setList()
      },
    },
  },
  mounted() {
    /* #ifdef H5 */
    this.isPC = this.detectPC()
    /* #endif */
    this.setList()
  },
  methods: {
    setList() {
      const lists = []
      let cursor = 0
      ;(this.options || []).forEach((group) => {
        const letter = group && (group.letter || group.key)
        const data = group && Array.isArray(group.data) ? group.data : []
        if (!letter || !data.length) return
        const itemIndex = cursor
        const items = data.map((raw) => {
          const name = raw && typeof raw === 'object' ? raw.name || '' : String(raw)
          const row = {
            key: letter,
            name,
            itemIndex: cursor,
            checked: !!(raw && typeof raw === 'object' && raw.checked),
          }
          cursor += 1
          return row
        })
        lists.push({
          title: letter,
          key: letter,
          items,
          itemIndex,
        })
      })
      this.lists = lists
      if (this.touchmoveIndex >= lists.length) this.touchmoveIndex = -1
    },
    detectPC() {
      const ua = navigator.userAgent || ''
      return !/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/i.test(ua)
    },
    pointY(event) {
      const touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0])
      if (touch && touch.clientY != null) return touch.clientY
      return event.clientY
    },
    measureMenu(done) {
      uni
        .createSelectorQuery()
        .in(this)
        .select('#ly-indexed-menu')
        .boundingClientRect((rect) => {
          if (rect && rect.height && this.lists.length) {
            this.menuTop = rect.top
            this.itemHeight = rect.height / this.lists.length
          }
          if (done) done()
        })
        .exec()
    },
    jumpTo(index) {
      if (!this.lists[index]) return
      this.touchmoveIndex = index
      const id = 'ly-indexed-' + index
      if (this.scrollViewId === id) {
        this.scrollViewId = ''
        this.$nextTick(() => {
          this.scrollViewId = id
        })
        return
      }
      this.scrollViewId = id
    },
    pick(event) {
      if (!this.itemHeight) return
      const index = Math.floor((this.pointY(event) - this.menuTop) / this.itemHeight)
      if (index === this.touchmoveIndex) return
      this.jumpTo(index)
    },
    onTouchStart(event) {
      this.touchmove = true
      this.measureMenu(() => this.pick(event))
    },
    onTouchMove(event) {
      this.touchmove = true
      if (!this.itemHeight) {
        this.measureMenu(() => this.pick(event))
        return
      }
      this.pick(event)
    },
    onTouchEnd() {
      this.touchmove = false
    },
    onMouseDown(event) {
      if (!this.isPC) return
      this.onTouchStart(event)
    },
    onMouseMove(event) {
      if (!this.isPC || !this.touchmove) return
      this.onTouchMove(event)
    },
    onClick(idx, index) {
      const row = this.lists[idx] && this.lists[idx].items[index]
      if (!row) return
      const item = {
        key: row.key,
        name: row.name,
        itemIndex: row.itemIndex,
        checked: row.checked,
      }
      const select = []
      if (this.showSelect) {
        row.checked = !row.checked
        item.checked = row.checked
        this.lists.forEach((group) => {
          group.items.forEach((entry) => {
            if (entry.checked) {
              select.push({
                key: entry.key,
                name: entry.name,
                itemIndex: entry.itemIndex,
                checked: true,
              })
            }
          })
        })
      }
      this.$emit('click', { item, select })
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-indexed-list {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;

  &__scroll {
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  &__group {
    width: 100%;
  }

  &__title {
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    height: 42px;
    padding: 10px 36px 10px 16px;
  }

  &__title-text {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.08px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__card {
    margin: 0 28px 0 16px;
    overflow: hidden;
    border-radius: 26px;
    background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  }

  &__row {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    min-height: 52px;
    padding: 0 16px;
  }

  &__row--hover {
    background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  }

  &__check {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-right: 12px;
  }

  &__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 17px;
    line-height: 22px;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &__line {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 16px;
    height: 1px;
    background-color: var(--lingyun-separator, #{$lingyun-separator});
  }

  &__end {
    height: 24px;
  }

  &__menu {
    position: absolute;
    top: 8px;
    right: 0;
    bottom: 8px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    width: 24px;
  }

  &__key {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  &__key-text {
    width: 16px;
    height: 16px;
    font-size: 10px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__key-text--active {
    border-radius: 8px;
    color: #ffffff;
    background-color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__bubble-wrap {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__bubble {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    @include lingyun-glass-control;
  }

  &__bubble-text {
    font-size: 32px;
    font-weight: 600;
    line-height: 40px;
    color: var(--lingyun-label, #{$lingyun-label});
  }
}
</style>

<template>
  <lingyun-sheets
    v-model:show="innerShow"
    :title="title"
    :detent="detent"
    :z-index="1350"
  >
    <view v-if="item" class="lingyun-order-goods-variant" :style="accentStyle">
      <!-- 只有规格：列出全部规格，各自加减 -->
      <view
        v-if="mode === 'specs'"
        class="lingyun-order-goods-variant__spec-list"
        :class="{ 'lingyun-order-goods-variant__spec-list--multi': specColumns > 1 }"
      >
        <view
          v-for="(spec, index) in specs"
          :key="spec.key"
          class="lingyun-order-goods-variant__spec-row"
          :class="{ 'lingyun-order-goods-variant__spec-row--last': index === specs.length - 1 }"
        >
          <view class="lingyun-order-goods-variant__spec-media">
            <image
              v-if="specImage(spec)"
              class="lingyun-order-goods-variant__spec-media-img"
              :src="specImage(spec)"
              mode="aspectFill"
              lazy-load
            />
            <text v-else class="lingyun-order-goods-variant__spec-media-char">
              {{ firstChar(spec.text) }}
            </text>
          </view>
          <view class="lingyun-order-goods-variant__spec-main">
            <text class="lingyun-order-goods-variant__spec-name">{{ spec.text }}</text>
            <view v-if="showSpecPrice(spec)" class="lingyun-order-goods-variant__spec-price">
              <text class="lingyun-order-goods-variant__currency">{{ currency }}</text>
              <text class="lingyun-order-goods-variant__amount">{{ formatPrice(specPrice(spec)) }}</text>
              <text v-if="spec.originalPrice" class="lingyun-order-goods-variant__original">
                {{ currency }}{{ formatPrice(spec.originalPrice) }}
              </text>
              <text v-if="specStockText(spec)" class="lingyun-order-goods-variant__spec-stock">
                {{ specStockText(spec) }}
              </text>
            </view>
          </view>
          <view class="lingyun-order-goods-variant__spec-action">
            <text v-if="isSpecSoldOut(spec)" class="lingyun-order-goods-variant__soldout">
              {{ soldOutText }}
            </text>
            <lingyun-stepper
              v-else-if="specQuantity(spec) > 0"
              :value="specQuantity(spec)"
              :min="0"
              :max="specMax(spec)"
              :step="step"
              :right-text="quantityUnitText"
              size="large"
              show-value
              @change="onSpecQuantity(spec, $event)"
            />
            <view
              v-else
              class="lingyun-order-goods-variant__plus"
              hover-class="lingyun-order-goods-variant__plus--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              :aria-label="`增加${spec.text}`"
              @click="onSpecPlus(spec)"
            >
              <lingyun-icon type="plus" :size="20" color="#ffffff" />
            </view>
          </view>
        </view>
      </view>

      <!-- 有属性：先单选规格（如有），再选属性分组 -->
      <view v-else class="lingyun-order-goods-variant__form">
        <view v-if="specs.length" class="lingyun-order-goods-variant__section">
          <view class="lingyun-order-goods-variant__section-head">
            <text class="lingyun-order-goods-variant__section-title">规格</text>
            <text class="lingyun-order-goods-variant__section-hint">单选</text>
          </view>
          <view
            v-if="specsHaveImages"
            class="lingyun-order-goods-variant__option-grid"
            :class="gridColsClass"
          >
            <view
              v-for="spec in specs"
              :key="spec.key"
              class="lingyun-order-goods-variant__option-card"
              :class="{
                'lingyun-order-goods-variant__option-card--active':
                  selectedSpecKey === spec.key,
                'lingyun-order-goods-variant__option-card--disabled': isSpecSoldOut(spec),
              }"
              hover-class="lingyun-order-goods-variant__option-card--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="selectSpec(spec)"
            >
              <view class="lingyun-order-goods-variant__option-media">
                <image
                  v-if="specCardImage(spec)"
                  class="lingyun-order-goods-variant__option-img"
                  :src="specCardImage(spec)"
                  mode="aspectFill"
                  lazy-load
                />
                <text v-else class="lingyun-order-goods-variant__option-char">
                  {{ firstChar(spec.text) }}
                </text>
                <text
                  v-if="specStockText(spec)"
                  class="lingyun-order-goods-variant__option-stock"
                >{{ specStockText(spec) }}</text>
                <view class="lingyun-order-goods-variant__option-name-bar">
                  <text class="lingyun-order-goods-variant__option-name">{{ spec.text }}</text>
                </view>
              </view>
              <view class="lingyun-order-goods-variant__option-body">
                <text
                  v-if="showSpecPrice(spec)"
                  class="lingyun-order-goods-variant__option-price"
                >{{ currency }}{{ formatPrice(specPrice(spec)) }}</text>
                <view
                  class="lingyun-order-goods-variant__option-check"
                  :class="{
                    'lingyun-order-goods-variant__option-check--active':
                      selectedSpecKey === spec.key,
                  }"
                >
                  <lingyun-icon
                    v-if="selectedSpecKey === spec.key"
                    type="checkmarkempty"
                    :size="15"
                    color="#ffffff"
                  />
                </view>
              </view>
            </view>
          </view>
          <view v-else class="lingyun-order-goods-variant__chips">
            <view
              v-for="spec in specs"
              :key="spec.key"
              class="lingyun-order-goods-variant__chip"
              :class="{
                'lingyun-order-goods-variant__chip--active': selectedSpecKey === spec.key,
                'lingyun-order-goods-variant__chip--disabled': isSpecSoldOut(spec),
              }"
              hover-class="lingyun-order-goods-variant__chip--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="selectSpec(spec)"
            >
              <text class="lingyun-order-goods-variant__chip-text">{{ specChipLabel(spec) }}</text>
            </view>
          </view>
        </view>

        <view
          v-for="group in groups"
          :key="group.key"
          class="lingyun-order-goods-variant__section"
        >
          <view class="lingyun-order-goods-variant__section-head">
            <text class="lingyun-order-goods-variant__section-title">{{ group.title }}</text>
            <text class="lingyun-order-goods-variant__section-hint">{{ groupHint(group) }}</text>
          </view>
          <view
            v-if="groupHasImages(group)"
            class="lingyun-order-goods-variant__option-grid"
            :class="gridColsClass"
          >
            <view
              v-for="option in group.options"
              :key="option.key"
              class="lingyun-order-goods-variant__option-card"
              :class="{
                'lingyun-order-goods-variant__option-card--active': isOptionSelected(
                  group,
                  option,
                ),
                'lingyun-order-goods-variant__option-card--disabled': optionDisabled(option),
              }"
              hover-class="lingyun-order-goods-variant__option-card--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="onOptionTap(group, option)"
            >
              <view class="lingyun-order-goods-variant__option-media">
                <image
                  v-if="option.image"
                  class="lingyun-order-goods-variant__option-img"
                  :src="option.image"
                  mode="aspectFill"
                  lazy-load
                />
                <text v-else class="lingyun-order-goods-variant__option-char">
                  {{ firstChar(option.text) }}
                </text>
                <view class="lingyun-order-goods-variant__option-name-bar">
                  <text class="lingyun-order-goods-variant__option-name">{{ option.text }}</text>
                </view>
              </view>
              <view class="lingyun-order-goods-variant__option-body">
                <view
                  v-if="isSingleGroup(group)"
                  class="lingyun-order-goods-variant__option-check"
                  :class="{
                    'lingyun-order-goods-variant__option-check--active':
                      isOptionSelected(group, option),
                  }"
                >
                  <lingyun-icon
                    v-if="isOptionSelected(group, option)"
                    type="checkmarkempty"
                    :size="15"
                    color="#ffffff"
                  />
                </view>
                <template v-else>
                  <view
                    v-if="optionQuantity(group, option) <= 0"
                    class="lingyun-order-goods-variant__option-plus"
                    :class="{
                      'lingyun-order-goods-variant__option-plus--disabled':
                        isGroupFull(group),
                    }"
                    role="button"
                    :aria-label="`增加${option.text}`"
                    @click.stop="addOption(group, option)"
                  >
                    <lingyun-icon
                      type="plus"
                      :size="14"
                      :color="isGroupFull(group) ? 'secondary' : '#ffffff'"
                    />
                  </view>
                  <view
                    v-else
                    class="lingyun-order-goods-variant__option-stepper"
                    @click.stop
                  >
                    <view
                      class="lingyun-order-goods-variant__option-step lingyun-order-goods-variant__option-step--minus"
                      @click.stop="decreaseOption(group, option)"
                    >
                      <lingyun-icon type="minus" :size="12" color="label" />
                    </view>
                    <text class="lingyun-order-goods-variant__option-step-value">
                      {{ optionQuantity(group, option) }}
                    </text>
                    <view
                      class="lingyun-order-goods-variant__option-step lingyun-order-goods-variant__option-step--plus"
                      :class="{
                        'lingyun-order-goods-variant__option-step--disabled':
                          isGroupFull(group),
                      }"
                      @click.stop="addOption(group, option)"
                    >
                      <lingyun-icon
                        type="plus"
                        :size="12"
                        :color="isGroupFull(group) ? 'secondary' : '#ffffff'"
                      />
                    </view>
                  </view>
                </template>
              </view>
            </view>
          </view>
          <view v-else-if="isSingleGroup(group)" class="lingyun-order-goods-variant__chips">
            <view
              v-for="option in group.options"
              :key="option.key"
              class="lingyun-order-goods-variant__chip"
              :class="{
                'lingyun-order-goods-variant__chip--active': isOptionSelected(group, option),
                'lingyun-order-goods-variant__chip--disabled': optionDisabled(option),
              }"
              hover-class="lingyun-order-goods-variant__chip--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="onOptionTap(group, option)"
            >
              <text class="lingyun-order-goods-variant__chip-text">{{ option.text }}</text>
            </view>
          </view>
          <view v-else class="lingyun-order-goods-variant__text-options">
            <view
              v-for="option in group.options"
              :key="option.key"
              class="lingyun-order-goods-variant__text-option"
              :class="{
                'lingyun-order-goods-variant__text-option--active': isOptionSelected(
                  group,
                  option,
                ),
                'lingyun-order-goods-variant__text-option--disabled': optionDisabled(option),
              }"
              @click="onOptionTap(group, option)"
            >
              <text class="lingyun-order-goods-variant__text-option-label">
                {{ option.text }}
              </text>
              <template v-if="optionQuantity(group, option) > 0">
                <view class="lingyun-order-goods-variant__option-stepper" @click.stop>
                  <view
                    class="lingyun-order-goods-variant__option-step lingyun-order-goods-variant__option-step--minus"
                    @click.stop="decreaseOption(group, option)"
                  >
                    <lingyun-icon type="minus" :size="12" color="label" />
                  </view>
                  <text class="lingyun-order-goods-variant__option-step-value">
                    {{ optionQuantity(group, option) }}
                  </text>
                  <view
                    class="lingyun-order-goods-variant__option-step lingyun-order-goods-variant__option-step--plus"
                    :class="{
                      'lingyun-order-goods-variant__option-step--disabled':
                        isGroupFull(group),
                    }"
                    @click.stop="addOption(group, option)"
                  >
                    <lingyun-icon
                      type="plus"
                      :size="12"
                      :color="isGroupFull(group) ? 'secondary' : '#ffffff'"
                    />
                  </view>
                </view>
              </template>
              <view
                v-else
                class="lingyun-order-goods-variant__option-plus"
                :class="{
                  'lingyun-order-goods-variant__option-plus--disabled': isGroupFull(group),
                }"
                role="button"
                :aria-label="`增加${option.text}`"
                @click.stop="addOption(group, option)"
              >
                <lingyun-icon
                  type="plus"
                  :size="12"
                  :color="isGroupFull(group) ? 'secondary' : '#ffffff'"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <template #footer>
      <view v-if="item" class="lingyun-order-goods-variant__footer" :style="accentStyle">
        <template v-if="mode === 'specs'">
          <view
            class="lingyun-order-goods-variant__cta"
            hover-class="lingyun-order-goods-variant__cta--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            @click="closeSheet"
          >
            <text class="lingyun-order-goods-variant__cta-text">完成</text>
          </view>
        </template>
        <template v-else>
          <view class="lingyun-order-goods-variant__combo-footer">
            <view class="lingyun-order-goods-variant__combo-info">
              <view class="lingyun-order-goods-variant__combo-price">
                <text class="lingyun-order-goods-variant__combo-currency">{{ currency }}</text>
                <text class="lingyun-order-goods-variant__combo-amount">
                  {{ formatPrice(currentPrice) }}
                </text>
              </view>
              <text class="lingyun-order-goods-variant__combo-hint">{{ footerHint }}</text>
            </view>
            <lingyun-stepper
              v-if="comboQuantity > 0"
              class="lingyun-order-goods-variant__combo-stepper"
              :value="comboQuantity"
              :min="0"
              :max="lineMax"
              :step="step"
              :right-text="quantityUnitText"
              size="large"
              show-value
              @change="onComboQuantityChange"
            />
            <view
              v-else
              class="lingyun-order-goods-variant__combo-add"
              :class="{ 'lingyun-order-goods-variant__combo-add--disabled': !canAdd }"
              hover-class="lingyun-order-goods-variant__combo-add--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              @click="onAdd"
            >
              <text class="lingyun-order-goods-variant__combo-add-text">
                {{ item.soldOut ? soldOutText : addToCartText }}
              </text>
            </view>
          </view>
        </template>
      </view>
    </template>
  </lingyun-sheets>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  LingyunOrderAttributeGroup,
  LingyunOrderAttributeOption,
  LingyunOrderCart,
  LingyunOrderCartAttribute,
  LingyunOrderGoods,
  LingyunOrderSpec,
} from './types'
import {
  attributesOf,
  buildLineKey,
  findSpec,
  finiteStock,
  groupMax,
  groupSelectionValid,
  parseLineKey,
} from './cartKey'

type QuantityPayload = {
  item: LingyunOrderGoods
  key: string
  quantity: number
  spec?: LingyunOrderSpec
  attributes: LingyunOrderCartAttribute[]
}

/**
 * lingyun-order-goods-variant-sheet
 * @description 点单页专用的规格 / 属性选择 Sheet：
 * 只有规格时列出全部规格逐个加减；有属性时先单选规格（如有），再按分组选属性，
 * 底部对当前「规格 + 属性」组合加购 / 步进。数据只读，数量变化抛 quantity-change。
 */
export default defineComponent({
  name: 'LingyunOrderGoodsVariantSheet',
  emits: ['update:show', 'quantity-change'],
  props: {
    show: { type: Boolean, default: false },
    item: { type: Object as PropType<LingyunOrderGoods | null>, default: null },
    cart: {
      type: Object as PropType<LingyunOrderCart>,
      default: () => ({}),
    },
    currency: { type: String, default: '¥' },
    priceDecimals: { type: Number, default: -1 },
    maxCount: { type: Number, default: 99 },
    quantityUnit: { type: String, default: '' },
    accentColor: { type: String, default: '' },
    addToCartText: { type: String, default: '加入购物车' },
    soldOutText: { type: String, default: '商品已售罄' },
  },
  data() {
    return {
      selectedSpecKey: '',
      selection: {} as Record<string, Record<string, number>>,
      /** 视口宽度：宽屏 / 超宽屏的 Sheet 宽度与图片网格列数都按它计算 */
      windowWidth: 375,
      _onWindowResize: null as (() => void) | null,
    }
  },
  computed: {
    innerShow: {
      get(): boolean {
        return this.show
      },
      set(value: boolean) {
        this.$emit('update:show', value)
      },
    },
    specs(): LingyunOrderSpec[] {
      return this.item && Array.isArray(this.item.specs) ? this.item.specs : []
    },
    groups(): LingyunOrderAttributeGroup[] {
      return this.item && Array.isArray(this.item.attributeGroups)
        ? this.item.attributeGroups
        : []
    },
    /** 规格里有图时用图片卡片，否则退回文字胶囊 */
    specsHaveImages(): boolean {
      return this.specs.some((spec) => !!spec.image)
    },
    mode(): 'specs' | 'combo' {
      return this.groups.length ? 'combo' : 'specs'
    },
    title(): string {
      if (this.mode === 'specs') {
        return (this.item && this.item.name) || '选择规格'
      }
      return this.specs.length ? '选择规格与属性' : '选择属性'
    },
    detent(): string {
      return this.mode === 'combo' ? 'large' : 'medium'
    },
    accentStyle(): Record<string, string> {
      return {
        '--ly-og-accent': this.accentColor || 'var(--lingyun-system-blue, #0088ff)',
      }
    },
    selectedSpec(): LingyunOrderSpec | undefined {
      return findSpec(this.item, this.selectedSpecKey)
    },
    /** 按分组顺序取已选 `groupKey=optionKey*数量` token，保证组合行 key 稳定 */
    selectedOptionTokens(): string[] {
      const tokens: string[] = []
      this.groups.forEach((group) => {
        const selected = this.selection[group.key] || {}
        ;(group.options || []).forEach((option) => {
          const quantity = this.optionQuantity(group, option)
          if (quantity > 0) {
            tokens.push(`${group.key}=${option.key}*${quantity}`)
          }
        })
      })
      return tokens
    },
    selectedAttributes(): LingyunOrderCartAttribute[] {
      return attributesOf(this.item, this.selectedOptionTokens)
    },
    comboKey(): string {
      if (!this.item) return ''
      return buildLineKey(
        this.item.key,
        this.selectedSpec?.key || '',
        this.selectedOptionTokens,
      )
    },
    comboQuantity(): number {
      return this.quantityOf(this.comboKey)
    },
    itemMax(): number {
      const max = Number(this.item?.max)
      return Number.isFinite(max) && max > 0 ? Math.floor(max) : this.maxCount
    },
    lineMax(): number {
      const spec = this.selectedSpec
      const max = Number(spec?.max)
      const base =
        Number.isFinite(max) && max > 0 ? Math.floor(max) : this.itemMax
      const remaining = this.stockRemaining()
      if (remaining == null) return base
      return Math.max(this.comboQuantity, Math.min(base, remaining))
    },
    step(): number {
      const step = Number(this.item?.step)
      return Number.isFinite(step) && step > 0 ? Math.floor(step) : 1
    },
    quantityUnitText(): string {
      return (this.item && this.item.quantityUnit) || this.quantityUnit
    },
    canSubmit(): boolean {
      if (!this.item || this.item.soldOut) return false
      if (
        this.specs.length &&
        (!this.selectedSpec || this.isSpecSoldOut(this.selectedSpec))
      ) {
        return false
      }
      const valid = this.groups.every((group) =>
        groupSelectionValid(group, this.selection[group.key]),
      )
      if (!valid) return false
      const remaining = this.stockRemaining()
      return !(remaining != null && remaining <= 0 && this.comboQuantity <= 0)
    },
    hint(): string {
      if (!this.item) return ''
      if (this.specs.length && !this.selectedSpec) return '请选择规格'
      const missing = this.groups.find(
        (group) => group.required && this.groupTotalQuantity(group) < 1,
      )
      if (missing) return `请选择${missing.title}`
      if (this.selectedSpec && this.isSpecSoldOut(this.selectedSpec)) {
        return '该规格已售罄'
      }
      const remaining = this.stockRemaining()
      if (remaining != null && remaining <= 0 && this.comboQuantity <= 0) {
        return '库存不足'
      }
      return ''
    },
    /** 当前选择的一份价格（规格价优先，无规格用商品价） */
    currentPrice(): number {
      const spec = this.selectedSpec
      if (spec) return this.specPrice(spec)
      return Number(this.item?.price) || 0
    },
    /**
     * 有图选项的列数：Sheet 沿用 lingyun-sheets 默认宽度（宽屏面板上限 936），
     * 按面板可用宽度自动分列——每列至少约 170px，窄屏固定 3 列，最后一行左对齐。
     */
    gridColumns(): number {
      if (this.windowWidth < 690) return 3
      /* lingyun-sheets 宽屏面板宽度 = min(936, 视口 - 64)；内容区左右内边距 16×2 */
      const panel = Math.min(936, Math.max(320, this.windowWidth - 64))
      const grid = Math.max(0, panel - 32)
      const gap = 8
      const minCard = 170
      return Math.max(3, Math.min(8, Math.floor((grid + gap) / (minCard + gap))))
    },
    gridColsClass(): string {
      return this.gridColumns > 3
        ? `lingyun-order-goods-variant__option-grid--cols-${this.gridColumns}`
        : ''
    },
    /**
     * 纯规格列表的列数：宽屏面板足够宽时一行两个（每个至少约 420px），
     * 否则一行一个，最后一行左对齐。
     */
    specColumns(): number {
      if (this.windowWidth < 690) return 1
      /* lingyun-sheets 宽屏面板宽度 = min(936, 视口 - 64)；内容区左右内边距 16×2 */
      const panel = Math.min(936, Math.max(320, this.windowWidth - 64))
      const grid = Math.max(0, panel - 32)
      const gap = 12
      const minRow = 420
      return Math.max(1, Math.min(2, Math.floor((grid + gap) / (minRow + gap))))
    },
    canAdd(): boolean {
      return this.canSubmit && this.comboQuantity < this.lineMax
    },
    /** 左侧提示：校验/库存提示优先，其次显示当前组合已选数量 */
    footerHint(): string {
      if (this.hint) return this.hint
      if (this.comboQuantity > 0 && this.comboQuantity >= this.lineMax) {
        return '已达上限'
      }
      if (this.comboQuantity > 0) return `已选 ${this.comboQuantity} 件`
      return ''
    },
  },
  watch: {
    show: {
      immediate: true,
      handler(value: boolean) {
        if (value) this.resetSelection()
      },
    },
    item: {
      handler() {
        if (this.show) this.resetSelection()
      },
    },
  },
  mounted() {
    this.syncWindowWidth()
    const handler = () => this.syncWindowWidth()
    this._onWindowResize = handler
    try {
      if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
    } catch {
      /* 端不支持 */
    }
  },
  beforeUnmount() {
    const handler = this._onWindowResize
    try {
      if (handler && typeof uni.offWindowResize === 'function') {
        uni.offWindowResize(handler)
      }
    } catch {
      /* 端不支持 */
    }
    this._onWindowResize = null
  },
  methods: {
    syncWindowWidth(): void {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const width = Number(info && info.windowWidth)
        if (Number.isFinite(width) && width > 0) this.windowWidth = width
      } catch {
        /* 端不支持 */
      }
    },
    resetSelection(): void {
      const first =
        this.specs.find((spec) => !this.isSpecSoldOut(spec)) || this.specs[0]
      this.selectedSpecKey = first ? first.key : ''
      this.selection = this.ensureRequiredDefaults({})
    },
    /** 必选分组默认选中第一个可用选项，打开即可加购 */
    defaultOptionFor(
      group: LingyunOrderAttributeGroup,
    ): LingyunOrderAttributeOption | null {
      return (
        (group.options || []).find((option) => !this.optionDisabled(option)) || null
      )
    },
    ensureRequiredDefaults(
      selection: Record<string, Record<string, number>>,
    ): Record<string, Record<string, number>> {
      const next = { ...selection }
      this.groups.forEach((group) => {
        if (!group.required) return
        if (this.groupTotalQuantityFrom(next[group.key]) > 0) return
        const option = this.defaultOptionFor(group)
        if (option) next[group.key] = { [option.key]: 1 }
      })
      return next
    },
    quantityOf(key: string): number {
      if (!key) return 0
      const quantity = Number((this.cart || {})[key])
      return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
    },
    firstChar(value: unknown): string {
      const text = String(value == null ? '' : value).trim()
      return Array.from(text)[0] || '规'
    },
    specImage(spec: LingyunOrderSpec): string {
      return spec.image || (this.item && this.item.image) || ''
    },
    specCardImage(spec: LingyunOrderSpec): string {
      return this.specImage(spec)
    },
    isSpecSoldOut(spec: LingyunOrderSpec): boolean {
      return !!spec.soldOut || finiteStock(spec.stock) === 0
    },
    /** 规格库存扣掉购物车里同规格组合后的剩余数量 */
    specRemaining(spec: LingyunOrderSpec): number | null {
      const stock = finiteStock(spec.stock)
      if (stock == null) return null
      const item = this.item
      if (!item) return stock
      let used = 0
      Object.keys(this.cart || {}).forEach((key) => {
        const parsed = parseLineKey(key)
        if (parsed.itemKey !== item.key || parsed.specKey !== spec.key) return
        const quantity = Math.floor(Number((this.cart || {})[key]))
        if (Number.isFinite(quantity) && quantity > 0) used += quantity
      })
      return Math.max(0, stock - used)
    },
    specStockText(spec: LingyunOrderSpec): string {
      const stock = finiteStock(spec.stock)
      if (stock == null) return ''
      if (stock <= 0) return '售罄'
      const remaining = this.specRemaining(spec)
      return `剩 ${remaining == null ? stock : remaining}`
    },
    /** 当前选择的库存剩余：规格库存或商品库存（无规格时）减去其它组合行 */
    stockRemaining(): number | null {
      const item = this.item
      if (!item) return null
      const spec = this.selectedSpec
      const stock = spec
        ? finiteStock(spec.stock)
        : this.specs.length
          ? null
          : finiteStock(item.stock)
      if (stock == null) return null
      const currentKey = this.comboKey
      let used = 0
      Object.keys(this.cart || {}).forEach((key) => {
        if (key === currentKey) return
        const parsed = parseLineKey(key)
        if (parsed.itemKey !== item.key) return
        if (spec) {
          if (parsed.specKey !== spec.key) return
        } else if (parsed.specKey) {
          return
        }
        const quantity = Math.floor(Number((this.cart || {})[key]))
        if (Number.isFinite(quantity) && quantity > 0) used += quantity
      })
      return Math.max(0, stock - used)
    },
    /** 属性选项启用状态：后台可直接返回 enabled=false */
    optionDisabled(option: LingyunOrderAttributeOption): boolean {
      return !!option.disabled || option.enabled === false
    },
    /** 分组里任一选项有图时用图片卡片 */
    groupHasImages(group: LingyunOrderAttributeGroup): boolean {
      return (group.options || []).some((option) => !!option.image)
    },
    /** max<=1 为单选：卡片显示勾选圆点；>1 为多选：显示 + / 数量步进器 */
    isSingleGroup(group: LingyunOrderAttributeGroup): boolean {
      return groupMax(group) <= 1
    },
    specQuantity(spec: LingyunOrderSpec): number {
      if (!this.item) return 0
      return this.quantityOf(buildLineKey(this.item.key, spec.key))
    },
    specMax(spec: LingyunOrderSpec): number {
      const max = Number(spec.max)
      const base =
        Number.isFinite(max) && max > 0 ? Math.floor(max) : this.itemMax
      const stock = finiteStock(spec.stock)
      return stock == null ? base : Math.min(base, stock)
    },
    specPrice(spec: LingyunOrderSpec): number {
      const price = Number(spec.price)
      if (Number.isFinite(price)) return price
      return Number(this.item?.price) || 0
    },
    showSpecPrice(spec: LingyunOrderSpec): boolean {
      return this.specPrice(spec) > 0
    },
    /** 规格价和基础价不同时在文字胶囊上补价格；图片卡片始终显示价格 */
    specChipLabel(spec: LingyunOrderSpec): string {
      if (!this.showSpecPrice(spec)) return spec.text
      return `${spec.text} ${this.currency}${this.formatPrice(this.specPrice(spec))}`
    },
    formatPrice(value: unknown): string {
      const number = Number(value)
      const safe = Number.isFinite(number) ? number : 0
      if (this.priceDecimals >= 0) return safe.toFixed(this.priceDecimals)
      return String(Number(safe.toFixed(2)))
    },
    selectSpec(spec: LingyunOrderSpec): void {
      if (this.isSpecSoldOut(spec)) return
      this.selectedSpecKey = spec.key
    },
    isOptionSelected(
      group: LingyunOrderAttributeGroup,
      option: LingyunOrderAttributeOption,
    ): boolean {
      return this.optionQuantity(group, option) > 0
    },
    /** 某选项在当前组合里的数量 */
    optionQuantity(
      group: LingyunOrderAttributeGroup,
      option: LingyunOrderAttributeOption,
    ): number {
      const selected = this.selection[group.key] || {}
      const quantity = Number(selected[option.key])
      return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
    },
    /** 分组里已选数量合计（多选按数量计，不是不同选项数） */
    groupTotalQuantity(group: LingyunOrderAttributeGroup): number {
      return this.groupTotalQuantityFrom(this.selection[group.key])
    },
    groupTotalQuantityFrom(selected: Record<string, number> | undefined): number {
      const map = selected || {}
      return Object.keys(map).reduce((sum, key) => {
        const quantity = Math.floor(Number(map[key]))
        return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
      }, 0)
    },
    /** 多选组选满后禁止继续加 */
    isGroupFull(group: LingyunOrderAttributeGroup): boolean {
      const max = groupMax(group)
      return max > 1 && this.groupTotalQuantity(group) >= max
    },
    /** 点卡片：单选直接选 / 取消；多选未选中时加 1，已选中交给步进器 */
    onOptionTap(
      group: LingyunOrderAttributeGroup,
      option: LingyunOrderAttributeOption,
    ): void {
      if (this.optionDisabled(option)) return
      const max = groupMax(group)
      if (max <= 1) {
        if (this.optionQuantity(group, option) > 0) {
          if (!group.required) {
            this.selection = { ...this.selection, [group.key]: {} }
          }
          return
        }
        this.selection = { ...this.selection, [group.key]: { [option.key]: 1 } }
        return
      }
      if (this.optionQuantity(group, option) > 0) return
      this.addOption(group, option)
    },
    /** 多选：增加一个该选项；单选：直接选中 */
    addOption(
      group: LingyunOrderAttributeGroup,
      option: LingyunOrderAttributeOption,
    ): void {
      if (this.optionDisabled(option)) return
      const max = groupMax(group)
      if (max <= 1) {
        this.selection = { ...this.selection, [group.key]: { [option.key]: 1 } }
        return
      }
      if (this.groupTotalQuantity(group) >= max) {
        uni.showToast({ title: `最多选择 ${max} 个`, icon: 'none' })
        return
      }
      const current = { ...(this.selection[group.key] || {}) }
      const quantity = Number(current[option.key]) || 0
      current[option.key] = Math.min(this.maxCount, quantity + 1)
      this.selection = { ...this.selection, [group.key]: current }
    },
    /** 多选：减少一个；减到 0 自动取消该选项 */
    decreaseOption(
      group: LingyunOrderAttributeGroup,
      option: LingyunOrderAttributeOption,
    ): void {
      const current = { ...(this.selection[group.key] || {}) }
      const quantity = Number(current[option.key]) || 0
      if (quantity <= 0) return
      if (quantity <= 1) delete current[option.key]
      else current[option.key] = quantity - 1
      this.selection = { ...this.selection, [group.key]: current }
    },
    groupHint(group: LingyunOrderAttributeGroup): string {
      const max = groupMax(group)
      const scope = group.required ? '必选' : '可选'
      return `${scope} · ${max > 1 ? `最多选 ${max} 个` : '单选'}`
    },
    emitQuantity(
      key: string,
      quantity: number,
      spec?: LingyunOrderSpec,
      attributes: LingyunOrderCartAttribute[] = [],
    ): void {
      if (!this.item || !key) return
      const payload: QuantityPayload = {
        item: this.item,
        key,
        quantity,
        spec,
        attributes,
      }
      this.$emit('quantity-change', payload)
    },
    onSpecPlus(spec: LingyunOrderSpec): void {
      if (!this.item) return
      const key = buildLineKey(this.item.key, spec.key)
      const next = Math.min(this.specMax(spec), this.specQuantity(spec) + this.step)
      this.emitQuantity(key, next, spec, [])
    },
    onSpecQuantity(spec: LingyunOrderSpec, value: unknown): void {
      if (!this.item) return
      const raw = Math.floor(Number(value))
      if (!Number.isFinite(raw)) return
      const next = Math.max(0, Math.min(this.specMax(spec), raw))
      const key = buildLineKey(this.item.key, spec.key)
      this.emitQuantity(key, next, spec, [])
    },
    onAdd(): void {
      if (!this.item) return
      if (!this.canAdd) {
        const text = this.footerHint || this.hint
        if (text) uni.showToast({ title: text, icon: 'none' })
        return
      }
      const next = Math.min(this.lineMax, this.comboQuantity + this.step)
      this.emitQuantity(this.comboKey, next, this.selectedSpec, this.selectedAttributes)
      this.closeSheet()
    },
    onComboQuantityChange(value: unknown): void {
      if (!this.item) return
      const raw = Math.floor(Number(value))
      if (!Number.isFinite(raw)) return
      const next = Math.max(0, Math.min(this.lineMax, raw))
      this.emitQuantity(this.comboKey, next, this.selectedSpec, this.selectedAttributes)
    },
    closeSheet(): void {
      this.innerShow = false
    },
  },
})
</script>

<style lang="scss">
@import '../../../lingyun-ui/styles/variables.scss';

.lingyun-order-goods-variant {
  /* 宽度跟随 Sheet 面板：宽屏 / 超宽屏面板变宽，图片网格列数同步增加 */
  max-width: 100%;
  margin: 0 auto;
  padding-top: 4px;
  box-sizing: border-box;
}

/* ---------- 只有规格：整行加减 ---------- */

.lingyun-order-goods-variant__spec-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-height: 96px;
  padding: 10px 2px;
  box-sizing: border-box;
  border-bottom: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-order-goods-variant__spec-media {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods-variant__spec-media-img {
  width: 76px;
  height: 76px;
  display: block;
}

.lingyun-order-goods-variant__spec-media-char {
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods-variant__spec-row--last {
  border-bottom: 0;
}

/* 纯规格列表：宽屏一行两个、左对齐；面板不够宽时自动回到一行一个 */
.lingyun-order-goods-variant__spec-list--multi {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -6px;
}

/* 一行两个时改为卡片：去掉行分割线，每行各自圆角底色，不存在首行有线、末行没线的问题 */
.lingyun-order-goods-variant__spec-list--multi .lingyun-order-goods-variant__spec-row {
  width: calc(50% - 12px);
  margin: 0 6px 12px;
  padding: 10px 12px;
  box-sizing: border-box;
  border-bottom: 0;
  border-radius: 12px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods-variant__spec-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods-variant__spec-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods-variant__spec-price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-top: 2px;
}

.lingyun-order-goods-variant__currency {
  font-size: 12px;
  line-height: 16px;
  color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__amount {
  margin-left: 1px;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__original {
  margin-left: 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-decoration: line-through;
}

.lingyun-order-goods-variant__spec-stock {
  margin-left: 6px;
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods-variant__spec-action {
  flex-shrink: 0;
  align-self: center;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods-variant__soldout {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods-variant__plus {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
  transition: transform 0.16s ease;
}

.lingyun-order-goods-variant__plus--hover {
  transform: scale(0.92);
}

/* ---------- 规格 + 属性 ---------- */

.lingyun-order-goods-variant__section {
  margin-top: 18px;
}

.lingyun-order-goods-variant__section:first-child {
  margin-top: 4px;
}

.lingyun-order-goods-variant__section-head {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 0 2px 10px;
}

.lingyun-order-goods-variant__section-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods-variant__section-hint {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods-variant__chips {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

/* 有图的规格 / 属性：4:3 图片卡片；窄屏一行 3 个，宽屏按容器宽度增加列数 */
.lingyun-order-goods-variant__option-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.lingyun-order-goods-variant__option-card {
  width: calc((100% - 16px) / 3);
  box-sizing: border-box;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  border: 1.5px solid transparent;
  transition: border-color 0.16s ease;
}

/* 宽屏自动列数（列间距 8）：卡片更小、一行更多，最后一行左对齐 */
.lingyun-order-goods-variant__option-grid--cols-4
  .lingyun-order-goods-variant__option-card {
  width: calc((100% - 24px) / 4);
}

.lingyun-order-goods-variant__option-grid--cols-5
  .lingyun-order-goods-variant__option-card {
  width: calc((100% - 32px) / 5);
}

.lingyun-order-goods-variant__option-grid--cols-6
  .lingyun-order-goods-variant__option-card {
  width: calc((100% - 40px) / 6);
}

.lingyun-order-goods-variant__option-grid--cols-7
  .lingyun-order-goods-variant__option-card {
  width: calc((100% - 48px) / 7);
}

.lingyun-order-goods-variant__option-grid--cols-8
  .lingyun-order-goods-variant__option-card {
  width: calc((100% - 56px) / 8);
}

.lingyun-order-goods-variant__option-card--hover {
  opacity: 0.82;
}

.lingyun-order-goods-variant__option-card--active {
  border-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__option-card--disabled {
  opacity: 0.36;
}

.lingyun-order-goods-variant__option-media {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-order-goods-variant__option-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-order-goods-variant__option-char {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods-variant__option-stock {
  position: absolute;
  left: 4px;
  top: 4px;
  padding: 1px 5px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.55);
  font-size: 10px;
  line-height: 14px;
  color: #ffffff;
}

.lingyun-order-goods-variant__option-body {
  padding: 5px 8px 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 38px;
}

/* 名称压在图片底部半透明条上，单行截断，节约卡片高度 */
.lingyun-order-goods-variant__option-name-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 4px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 24px;
  background-color: rgba(0, 0, 0, 0.42);
}

.lingyun-order-goods-variant__option-name {
  width: 100%;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lingyun-order-goods-variant__option-price {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods-variant__option-check {
  width: 26px;
  height: 26px;
  margin-left: auto;
  flex-shrink: 0;
  box-sizing: border-box;
  border-radius: 50%;
  border: 1.5px solid var(--lingyun-label-quaternary, #{$lingyun-label-quaternary});
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-order-goods-variant__option-check--active {
  border-color: var(--ly-og-accent, #{$lingyun-system-blue});
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__option-plus {
  width: 30px;
  height: 30px;
  margin-left: auto;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__option-plus--disabled {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-order-goods-variant__option-stepper {
  margin-left: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}

.lingyun-order-goods-variant__option-step {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-order-goods-variant__option-step--minus {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-order-goods-variant__option-step--plus {
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__option-step--disabled {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-order-goods-variant__option-step-value {
  min-width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods-variant__text-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lingyun-order-goods-variant__text-option {
  min-height: 46px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  border: 1.5px solid transparent;
}

.lingyun-order-goods-variant__text-option--active {
  border-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__text-option--disabled {
  opacity: 0.36;
}

.lingyun-order-goods-variant__text-option-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lingyun-order-goods-variant__chip {
  height: 38px;
  max-width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  transition: background-color 0.16s ease;
}

.lingyun-order-goods-variant__chip--hover {
  opacity: 0.72;
}

.lingyun-order-goods-variant__chip--active {
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__chip--disabled {
  opacity: 0.36;
}

.lingyun-order-goods-variant__chip-text {
  max-width: 100%;
  font-size: 14px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lingyun-order-goods-variant__chip--active .lingyun-order-goods-variant__chip-text {
  color: #ffffff;
  font-weight: 600;
}

/* ---------- 底部操作区 ---------- */

.lingyun-order-goods-variant__footer {
  padding: 10px 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 组合底部：左侧价格 + 提示，右侧固定高度加购按钮 */
.lingyun-order-goods-variant__combo-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}

.lingyun-order-goods-variant__combo-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.lingyun-order-goods-variant__combo-price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  min-height: 24px;
}

.lingyun-order-goods-variant__combo-currency {
  font-size: 12px;
  line-height: 16px;
  color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__combo-amount {
  margin-left: 1px;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__combo-hint {
  min-height: 14px;
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lingyun-order-goods-variant__combo-add {
  flex: 0 0 auto;
  min-width: 132px;
  height: 44px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__combo-stepper {
  flex: 0 0 auto;
}

.lingyun-order-goods-variant__combo-add--disabled {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-order-goods-variant__combo-add--disabled .lingyun-order-goods-variant__combo-add-text {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods-variant__combo-add--hover {
  opacity: 0.72;
}

.lingyun-order-goods-variant__combo-add-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #ffffff;
}

.lingyun-order-goods-variant__cta {
  width: 100%;
  flex-shrink: 0;
  height: 46px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods-variant__cta--hover {
  opacity: 0.72;
}

.lingyun-order-goods-variant__cta-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #ffffff;
}
</style>

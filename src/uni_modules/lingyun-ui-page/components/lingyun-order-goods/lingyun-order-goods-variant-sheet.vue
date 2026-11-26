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
            <view
              v-if="showSpecPrice(spec) && (showAmount || specStockText(spec))"
              class="lingyun-order-goods-variant__spec-price"
            >
              <template v-if="showAmount">
                <text class="lingyun-order-goods-variant__currency">{{ currency }}</text>
                <text class="lingyun-order-goods-variant__amount">{{ formatPrice(specPrice(spec)) }}</text>
                <text v-if="spec.originalPrice" class="lingyun-order-goods-variant__original">
                  {{ currency }}{{ formatPrice(spec.originalPrice) }}
                </text>
              </template>
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
              <lingyun-icon type="plusempty" :size="20" color="#ffffff" />
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
                  v-if="showAmount && showSpecPrice(spec)"
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
                      type="plusempty"
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
                        type="plusempty"
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
                      type="plusempty"
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
                  type="plusempty"
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
              <view v-if="showAmount" class="lingyun-order-goods-variant__combo-price">
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

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type PropType } from 'vue'
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
 * @property {Boolean} showAmount 显示规格 / 组合价格；默认 true。隐藏后库存与数量提示保留
 */

defineOptions({
  name: 'LingyunOrderGoodsVariantSheet',
})

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object as PropType<LingyunOrderGoods | null>, default: null },
  cart: {
    type: Object as PropType<LingyunOrderCart>,
    default: () => ({}),
  },
  currency: { type: String, default: '¥' },
  priceDecimals: { type: Number, default: -1 },
  /** 隐藏规格 / 组合价格；库存与数量提示保留 */
  showAmount: { type: Boolean, default: true },
  maxCount: { type: Number, default: 99 },
  quantityUnit: { type: String, default: '' },
  accentColor: { type: String, default: '' },
  addToCartText: { type: String, default: '加入购物车' },
  soldOutText: { type: String, default: '商品已售罄' },
})

const emit = defineEmits(['update:show', 'quantity-change'])

const selectedSpecKey = ref<string>('')
const selection = ref<Record<string, Record<string, number>>>({})
/** 视口宽度：宽屏 / 超宽屏的 Sheet 宽度与图片网格列数都按它计算 */
const windowWidth = ref<number>(375)
const _onWindowResize = ref<(() => void) | null>(null)

const innerShow = computed({
  get(): boolean {
    return props.show
  },
  set(value: boolean) {
    emit('update:show', value)
  },
})

const specs = computed((): LingyunOrderSpec[] => {
  return props.item && Array.isArray(props.item.specs) ? props.item.specs : []
})

const groups = computed((): LingyunOrderAttributeGroup[] => {
  return props.item && Array.isArray(props.item.attributeGroups)
    ? props.item.attributeGroups
    : []
})

/** 规格里有图时用图片卡片，否则退回文字胶囊 */
const specsHaveImages = computed((): boolean => {
  return specs.value.some((spec) => !!spec.image)
})

const mode = computed((): 'specs' | 'combo' => {
  return groups.value.length ? 'combo' : 'specs'
})

const title = computed((): string => {
  if (mode.value === 'specs') {
    return (props.item && props.item.name) || '选择规格'
  }
  return specs.value.length ? '选择规格与属性' : '选择属性'
})

const detent = computed((): string => {
  return mode.value === 'combo' ? 'large' : 'medium'
})

const accentStyle = computed((): Record<string, string> => {
  return {
    '--ly-og-accent': props.accentColor || 'var(--lingyun-system-blue, #0088ff)',
  }
})

const itemMax = computed((): number => {
  const max = Number(props.item?.max)
  return Number.isFinite(max) && max > 0 ? Math.floor(max) : props.maxCount
})

const step = computed((): number => {
  const step = Number(props.item?.step)
  return Number.isFinite(step) && step > 0 ? Math.floor(step) : 1
})

const quantityUnitText = computed((): string => {
  return (props.item && props.item.quantityUnit) || props.quantityUnit
})

/**
 * 有图选项的列数：Sheet 沿用 lingyun-sheets 默认宽度（宽屏面板上限 936），
 * 按面板可用宽度自动分列——每列至少约 170px，窄屏固定 3 列，最后一行左对齐。
 */
const gridColumns = computed((): number => {
  if (windowWidth.value < 690) return 3
  /* lingyun-sheets 宽屏面板宽度 = min(936, 视口 - 64)；内容区左右内边距 16×2 */
  const panel = Math.min(936, Math.max(320, windowWidth.value - 64))
  const grid = Math.max(0, panel - 32)
  const gap = 8
  const minCard = 170
  return Math.max(3, Math.min(8, Math.floor((grid + gap) / (minCard + gap))))
})

const gridColsClass = computed((): string => {
  return gridColumns.value > 3
    ? `lingyun-order-goods-variant__option-grid--cols-${gridColumns.value}`
    : ''
})

/**
 * 纯规格列表的列数：宽屏面板足够宽时一行两个（每个至少约 420px），
 * 否则一行一个，最后一行左对齐。
 */
const specColumns = computed((): number => {
  if (windowWidth.value < 690) return 1
  /* lingyun-sheets 宽屏面板宽度 = min(936, 视口 - 64)；内容区左右内边距 16×2 */
  const panel = Math.min(936, Math.max(320, windowWidth.value - 64))
  const grid = Math.max(0, panel - 32)
  const gap = 12
  const minRow = 420
  return Math.max(1, Math.min(2, Math.floor((grid + gap) / (minRow + gap))))
})

function syncWindowWidth(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const width = Number(info && info.windowWidth)
    if (Number.isFinite(width) && width > 0) windowWidth.value = width
  } catch {
    /* 端不支持 */
  }
}

function firstChar(value: unknown): string {
  const text = String(value == null ? '' : value).trim()
  return Array.from(text)[0] || '规'
}

/** 属性选项启用状态：后台可直接返回 enabled=false */
function optionDisabled(option: LingyunOrderAttributeOption): boolean {
  return !!option.disabled || option.enabled === false
}

/** 某选项在当前组合里的数量 */
function optionQuantity(
  group: LingyunOrderAttributeGroup,
  option: LingyunOrderAttributeOption,
): number {
  const selected = selection.value[group.key] || {}
  const quantity = Number(selected[option.key])
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
}

function groupTotalQuantityFrom(selected: Record<string, number> | undefined): number {
  const map = selected || {}
  return Object.keys(map).reduce((sum, key) => {
    const quantity = Math.floor(Number(map[key]))
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
  }, 0)
}

/** 分组里已选数量合计（多选按数量计，不是不同选项数） */
function groupTotalQuantity(group: LingyunOrderAttributeGroup): number {
  return groupTotalQuantityFrom(selection.value[group.key])
}

function isSpecSoldOut(spec: LingyunOrderSpec): boolean {
  return !!spec.soldOut || finiteStock(spec.stock) === 0
}

function quantityOf(key: string): number {
  if (!key) return 0
  const quantity = Number((props.cart || {})[key])
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
}

function specPrice(spec: LingyunOrderSpec): number {
  const price = Number(spec.price)
  if (Number.isFinite(price)) return price
  return Number(props.item?.price) || 0
}

function formatPrice(value: unknown): string {
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : 0
  if (props.priceDecimals >= 0) return safe.toFixed(props.priceDecimals)
  return String(Number(safe.toFixed(2)))
}

/** 必选分组默认选中第一个可用选项，打开即可加购 */
function defaultOptionFor(
  group: LingyunOrderAttributeGroup,
): LingyunOrderAttributeOption | null {
  return (
    (group.options || []).find((option) => !optionDisabled(option)) || null
  )
}

function ensureRequiredDefaults(
  selection: Record<string, Record<string, number>>,
): Record<string, Record<string, number>> {
  const next = { ...selection }
  groups.value.forEach((group) => {
    if (!group.required) return
    if (groupTotalQuantityFrom(next[group.key]) > 0) return
    const option = defaultOptionFor(group)
    if (option) next[group.key] = { [option.key]: 1 }
  })
  return next
}

function specImage(spec: LingyunOrderSpec): string {
  return spec.image || (props.item && props.item.image) || ''
}

function specCardImage(spec: LingyunOrderSpec): string {
  return specImage(spec)
}

function selectSpec(spec: LingyunOrderSpec): void {
  if (isSpecSoldOut(spec)) return
  selectedSpecKey.value = spec.key
}

function resetSelection(): void {
  const first =
    specs.value.find((spec) => !isSpecSoldOut(spec)) || specs.value[0]
  selectedSpecKey.value = first ? first.key : ''
  selection.value = ensureRequiredDefaults({})
}

const selectedSpec = computed((): LingyunOrderSpec | undefined => {
  return findSpec(props.item, selectedSpecKey.value)
})

/** 按分组顺序取已选 `groupKey=optionKey*数量` token，保证组合行 key 稳定 */
const selectedOptionTokens = computed((): string[] => {
  const tokens: string[] = []
  groups.value.forEach((group) => {
    const selected = selection.value[group.key] || {}
    ;(group.options || []).forEach((option) => {
      const quantity = optionQuantity(group, option)
      if (quantity > 0) {
        tokens.push(`${group.key}=${option.key}*${quantity}`)
      }
    })
  })
  return tokens
})

const selectedAttributes = computed((): LingyunOrderCartAttribute[] => {
  return attributesOf(props.item, selectedOptionTokens.value)
})

const comboKey = computed((): string => {
  if (!props.item) return ''
  return buildLineKey(
    props.item.key,
    selectedSpec.value?.key || '',
    selectedOptionTokens.value,
  )
})

const comboQuantity = computed((): number => {
  return quantityOf(comboKey.value)
})

/** 规格库存扣掉购物车里同规格组合后的剩余数量 */
function specRemaining(spec: LingyunOrderSpec): number | null {
  const stock = finiteStock(spec.stock)
  if (stock == null) return null
  const item = props.item
  if (!item) return stock
  let used = 0
  Object.keys(props.cart || {}).forEach((key) => {
    const parsed = parseLineKey(key)
    if (parsed.itemKey !== item.key || parsed.specKey !== spec.key) return
    const quantity = Math.floor(Number((props.cart || {})[key]))
    if (Number.isFinite(quantity) && quantity > 0) used += quantity
  })
  return Math.max(0, stock - used)
}

function specStockText(spec: LingyunOrderSpec): string {
  const stock = finiteStock(spec.stock)
  if (stock == null) return ''
  if (stock <= 0) return '售罄'
  const remaining = specRemaining(spec)
  return `剩 ${remaining == null ? stock : remaining}`
}

/** 当前选择的库存剩余：规格库存或商品库存（无规格时）减去其它组合行 */
function stockRemaining(): number | null {
  const item = props.item
  if (!item) return null
  const spec = selectedSpec.value
  const stock = spec
    ? finiteStock(spec.stock)
    : specs.value.length
      ? null
      : finiteStock(item.stock)
  if (stock == null) return null
  const currentKey = comboKey.value
  let used = 0
  Object.keys(props.cart || {}).forEach((key) => {
    if (key === currentKey) return
    const parsed = parseLineKey(key)
    if (parsed.itemKey !== item.key) return
    if (spec) {
      if (parsed.specKey !== spec.key) return
    } else if (parsed.specKey) {
      return
    }
    const quantity = Math.floor(Number((props.cart || {})[key]))
    if (Number.isFinite(quantity) && quantity > 0) used += quantity
  })
  return Math.max(0, stock - used)
}

function specQuantity(spec: LingyunOrderSpec): number {
  if (!props.item) return 0
  return quantityOf(buildLineKey(props.item.key, spec.key))
}

function specMax(spec: LingyunOrderSpec): number {
  const max = Number(spec.max)
  const base =
    Number.isFinite(max) && max > 0 ? Math.floor(max) : itemMax.value
  const stock = finiteStock(spec.stock)
  return stock == null ? base : Math.min(base, stock)
}

function showSpecPrice(spec: LingyunOrderSpec): boolean {
  return specPrice(spec) > 0
}

/** 规格价和基础价不同时在文字胶囊上补价格；图片卡片始终显示价格 */
function specChipLabel(spec: LingyunOrderSpec): string {
  if (!showSpecPrice(spec)) return spec.text
  return `${spec.text} ${props.currency}${formatPrice(specPrice(spec))}`
}

function isOptionSelected(
  group: LingyunOrderAttributeGroup,
  option: LingyunOrderAttributeOption,
): boolean {
  return optionQuantity(group, option) > 0
}

/** 多选：增加一个该选项；单选：直接选中 */
function addOption(
  group: LingyunOrderAttributeGroup,
  option: LingyunOrderAttributeOption,
): void {
  if (optionDisabled(option)) return
  const max = groupMax(group)
  if (max <= 1) {
    selection.value = { ...selection.value, [group.key]: { [option.key]: 1 } }
    return
  }
  if (groupTotalQuantity(group) >= max) {
    uni.showToast({ title: `最多选择 ${max} 个`, icon: 'none' })
    return
  }
  const current = { ...(selection.value[group.key] || {}) }
  const quantity = Number(current[option.key]) || 0
  current[option.key] = Math.min(props.maxCount, quantity + 1)
  selection.value = { ...selection.value, [group.key]: current }
}

/** 多选组选满后禁止继续加 */
function isGroupFull(group: LingyunOrderAttributeGroup): boolean {
  const max = groupMax(group)
  return max > 1 && groupTotalQuantity(group) >= max
}

/** 多选：减少一个；减到 0 自动取消该选项 */
function decreaseOption(
  group: LingyunOrderAttributeGroup,
  option: LingyunOrderAttributeOption,
): void {
  const current = { ...(selection.value[group.key] || {}) }
  const quantity = Number(current[option.key]) || 0
  if (quantity <= 0) return
  if (quantity <= 1) delete current[option.key]
  else current[option.key] = quantity - 1
  selection.value = { ...selection.value, [group.key]: current }
}

/** max<=1 为单选：卡片显示勾选圆点；>1 为多选：显示 + / 数量步进器 */
function isSingleGroup(group: LingyunOrderAttributeGroup): boolean {
  return groupMax(group) <= 1
}

/** 分组里任一选项有图时用图片卡片 */
function groupHasImages(group: LingyunOrderAttributeGroup): boolean {
  return (group.options || []).some((option) => !!option.image)
}

function groupHint(group: LingyunOrderAttributeGroup): string {
  const max = groupMax(group)
  const scope = group.required ? '必选' : '可选'
  return `${scope} · ${max > 1 ? `最多选 ${max} 个` : '单选'}`
}

function emitQuantity(
  key: string,
  quantity: number,
  spec?: LingyunOrderSpec,
  attributes: LingyunOrderCartAttribute[] = [],
): void {
  if (!props.item || !key) return
  const payload: QuantityPayload = {
    item: props.item,
    key,
    quantity,
    spec,
    attributes,
  }
  emit('quantity-change', payload)
}

const lineMax = computed((): number => {
  const spec = selectedSpec.value
  const max = Number(spec?.max)
  const base =
    Number.isFinite(max) && max > 0 ? Math.floor(max) : itemMax.value
  const remaining = stockRemaining()
  if (remaining == null) return base
  return Math.max(comboQuantity.value, Math.min(base, remaining))
})

const canSubmit = computed((): boolean => {
  if (!props.item || props.item.soldOut) return false
  if (
    specs.value.length &&
    (!selectedSpec.value || isSpecSoldOut(selectedSpec.value))
  ) {
    return false
  }
  const valid = groups.value.every((group) =>
    groupSelectionValid(group, selection.value[group.key]),
  )
  if (!valid) return false
  const remaining = stockRemaining()
  return !(remaining != null && remaining <= 0 && comboQuantity.value <= 0)
})

const hint = computed((): string => {
  if (!props.item) return ''
  if (specs.value.length && !selectedSpec.value) return '请选择规格'
  const missing = groups.value.find(
    (group) => group.required && groupTotalQuantity(group) < 1,
  )
  if (missing) return `请选择${missing.title}`
  if (selectedSpec.value && isSpecSoldOut(selectedSpec.value)) {
    return '该规格已售罄'
  }
  const remaining = stockRemaining()
  if (remaining != null && remaining <= 0 && comboQuantity.value <= 0) {
    return '库存不足'
  }
  return ''
})

/** 当前选择的一份价格（规格价优先，无规格用商品价） */
const currentPrice = computed((): number => {
  const spec = selectedSpec.value
  if (spec) return specPrice(spec)
  return Number(props.item?.price) || 0
})

const canAdd = computed((): boolean => {
  return canSubmit.value && comboQuantity.value < lineMax.value
})

/** 左侧提示：校验/库存提示优先，其次显示当前组合已选数量 */
const footerHint = computed((): string => {
  if (hint.value) return hint.value
  if (comboQuantity.value > 0 && comboQuantity.value >= lineMax.value) {
    return '已达上限'
  }
  if (comboQuantity.value > 0) return `已选 ${comboQuantity.value} 件`
  return ''
})

/** 点卡片：单选直接选 / 取消；多选未选中时加 1，已选中交给步进器 */
function onOptionTap(
  group: LingyunOrderAttributeGroup,
  option: LingyunOrderAttributeOption,
): void {
  if (optionDisabled(option)) return
  const max = groupMax(group)
  if (max <= 1) {
    if (optionQuantity(group, option) > 0) {
      if (!group.required) {
        selection.value = { ...selection.value, [group.key]: {} }
      }
      return
    }
    selection.value = { ...selection.value, [group.key]: { [option.key]: 1 } }
    return
  }
  if (optionQuantity(group, option) > 0) return
  addOption(group, option)
}

function closeSheet(): void {
  innerShow.value = false
}

function onAdd(): void {
  if (!props.item) return
  if (!canAdd.value) {
    const text = footerHint.value || hint.value
    if (text) uni.showToast({ title: text, icon: 'none' })
    return
  }
  const next = Math.min(lineMax.value, comboQuantity.value + step.value)
  emitQuantity(comboKey.value, next, selectedSpec.value, selectedAttributes.value)
  closeSheet()
}

function onSpecPlus(spec: LingyunOrderSpec): void {
  if (!props.item) return
  const key = buildLineKey(props.item.key, spec.key)
  const next = Math.min(specMax(spec), specQuantity(spec) + step.value)
  emitQuantity(key, next, spec, [])
}

function onSpecQuantity(spec: LingyunOrderSpec, value: unknown): void {
  if (!props.item) return
  const raw = Math.floor(Number(value))
  if (!Number.isFinite(raw)) return
  const next = Math.max(0, Math.min(specMax(spec), raw))
  const key = buildLineKey(props.item.key, spec.key)
  emitQuantity(key, next, spec, [])
}

function onComboQuantityChange(value: unknown): void {
  if (!props.item) return
  const raw = Math.floor(Number(value))
  if (!Number.isFinite(raw)) return
  const next = Math.max(0, Math.min(lineMax.value, raw))
  emitQuantity(comboKey.value, next, selectedSpec.value, selectedAttributes.value)
}

watch(
  () => props.show,
  (value: boolean) => {
    if (value) resetSelection()
  },
  { immediate: true },
)

watch(
  () => props.item,
  () => {
    if (props.show) resetSelection()
  },
)

onMounted(() => {
  syncWindowWidth()
  const handler = () => syncWindowWidth()
  _onWindowResize.value = handler
  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
  } catch {
    /* 端不支持 */
  }
})

onBeforeUnmount(() => {
  const handler = _onWindowResize.value
  try {
    if (handler && typeof uni.offWindowResize === 'function') {
      uni.offWindowResize(handler)
    }
  } catch {
    /* 端不支持 */
  }
  _onWindowResize.value = null
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

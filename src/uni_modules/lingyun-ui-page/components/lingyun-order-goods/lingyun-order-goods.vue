<template>
  <lingyun-app-page
    :show-toolbar="showToolbar"
    :show-back="showToolbar ? showBack : false"
    :auto-back="autoBack"
    :show-nav="showNav"
    :show-tabbar="false"
    :title="title"
    :auto-top-inset="searchActive || autoTopInset || bannerHeight <= 0"
    :trailing-buttons="toolbarButtons"
    :trailing-menu-enabled="toolbarMenuEnabled"
    :searchable="searchable"
    :searching="searchActive"
    :search-value="searchText"
    :body-scroll="false"
    :page-scroll="false"
    @back="$emit('back')"
    @update:searching="onSearchingUpdate"
    @update:searchValue="onSearchValueUpdate"
  >
    <view class="lingyun-order-goods" :class="rootClass" :style="rootStyle">
      <!-- 店铺头：Banner + 店铺卡片 -->
      <view v-if="!searchActive" class="lingyun-order-goods__header">
        <view
          v-if="bannerHeight > 0"
          class="lingyun-order-goods__banner"
          :style="{ height: `${bannerHeight}px` }"
        >
          <slot name="banner">
            <image
              v-if="banner"
              class="lingyun-order-goods__banner-img"
              :src="banner"
              mode="aspectFill"
            />
            <view v-else class="lingyun-order-goods__banner-fallback" />
          </slot>
          <view
            v-if="toolbarScrimVisible"
            class="lingyun-order-goods__toolbar-scrim"
            :class="themeClass"
          />
          <view
            v-if="showBack && !showToolbar"
            class="lingyun-order-goods__back"
            hover-class="lingyun-order-goods__back--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="返回"
            @click="$emit('back')"
          >
            <lingyun-icon type="left" :size="28" color="var(--lingyun-label, #000)" />
          </view>
          <view v-if="!showToolbar" class="lingyun-order-goods__banner-actions">
            <slot name="banner-actions" />
          </view>
        </view>

        <view
          v-else-if="showBack && !showToolbar"
          class="lingyun-order-goods__back-row"
        >
          <view
            class="lingyun-order-goods__back"
            hover-class="lingyun-order-goods__back--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="返回"
            @click="$emit('back')"
          >
            <lingyun-icon type="left" :size="28" color="var(--lingyun-label, #000)" />
          </view>
        </view>

        <view
          v-if="showStore"
          class="lingyun-order-goods__store"
          :class="{ 'lingyun-order-goods__store--attached': bannerHeight > 0 }"
        >
          <view class="lingyun-order-goods__store-head">
            <view class="lingyun-order-goods__logo">
              <image
                v-if="store.logo"
                class="lingyun-order-goods__logo-img"
                :src="store.logo"
                mode="aspectFill"
              />
              <lingyun-icon
                v-else-if="store.icon"
                :type="store.icon"
                :size="26"
                color="var(--lingyun-label, #000)"
              />
              <text v-else class="lingyun-order-goods__logo-text">{{ storeMark() }}</text>
            </view>
            <view class="lingyun-order-goods__store-main">
              <text class="lingyun-order-goods__store-name">{{ store.name }}</text>
              <view class="lingyun-order-goods__store-meta">
                <view
                  v-if="store.rating !== undefined && store.rating !== ''"
                  class="lingyun-order-goods__rating"
                >
                  <lingyun-icon
                    type="star-filled"
                    :size="11"
                    color="var(--lingyun-system-orange, #ff8d28)"
                  />
                  <text class="lingyun-order-goods__rating-text">{{ store.rating }}</text>
                </view>
                <template v-for="(part, index) in storeMetaParts" :key="index">
                  <text
                    v-if="index > 0 || hasRating"
                    class="lingyun-order-goods__dot"
                  >·</text>
                  <text class="lingyun-order-goods__meta-text">{{ part }}</text>
                </template>
              </view>
            </view>
          </view>
          <view v-if="store.notice" class="lingyun-order-goods__notice">
            <text class="lingyun-order-goods__notice-text">{{ store.notice }}</text>
          </view>
          <slot name="store-extra" :store="store" />
        </view>
      </view>

      <!-- 还没有可点的商品：整块下方只留空态，不留分类栏和购物车 -->
      <view v-if="catalogEmpty" class="lingyun-order-goods__body lingyun-order-goods__body--empty">
        <slot name="empty">
          <lingyun-empty variant="plain" :title="emptyText" />
        </slot>
      </view>

      <!-- 左右布局：分类导航 + 商品列表 -->
      <view
        v-else
        class="lingyun-order-goods__body"
        :class="{ 'lingyun-order-goods__body--search': searchActive }"
        :style="wideBodyStyle"
      >
        <scroll-view
          v-if="!searchActive"
          class="lingyun-order-goods__rail"
          :scroll-y="!cartDetailOpen"
          scroll-with-animation
          :show-scrollbar="false"
          :scroll-into-view="railIntoId"
        >
          <view class="lingyun-order-goods__rail-inner">
            <view
              v-if="railIndicatorVisible"
              class="lingyun-order-goods__rail-indicator"
              :class="{ 'lingyun-order-goods__rail-indicator--ready': railIndicatorReady }"
              :style="{
                top: `${railIndicatorTop}px`,
                height: `${railIndicatorHeight}px`,
              }"
            >
              <view class="lingyun-order-goods__rail-indicator-bar" />
            </view>
            <view
              v-for="(category, index) in categories"
              :id="railIdOf(category)"
              :key="category.key"
              class="lingyun-order-goods__rail-item"
              :class="{ 'lingyun-order-goods__rail-item--active': category.key === activeKey }"
              hover-class="lingyun-order-goods__rail-item--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              @click="selectCategory(category, index)"
            >
              <view
                class="lingyun-order-goods__rail-content"
                :class="{
                  'lingyun-order-goods__rail-content--pulse': railPulseKey === category.key,
                }"
              >
                <view
                  v-if="category.iconSrc || category.icon"
                  class="lingyun-order-goods__rail-icon"
                >
                  <image
                    v-if="category.iconSrc"
                    class="lingyun-order-goods__rail-icon-image"
                    :src="category.iconSrc"
                    mode="aspectFit"
                  />
                  <lingyun-icon
                    v-else
                    :type="category.icon"
                    :size="14"
                    :color="category.iconColor || 'var(--lingyun-label-secondary, #8e8e93)'"
                  />
                </view>
                <text class="lingyun-order-goods__rail-text">{{ category.text }}</text>
              </view>
              <view
                v-if="hasCategoryBadge(category) && categoryQuantity(category) <= 0"
                class="lingyun-order-goods__rail-badge"
              >
                <lingyun-badge :text="category.badge" color="orange" size="small" />
              </view>
              <view
                v-if="categoryQuantity(category) > 0"
                class="lingyun-order-goods__rail-cart-badge"
              >
                <lingyun-badge :text="categoryQuantity(category)" :max="99" size="small" />
              </view>
            </view>
            <view class="lingyun-order-goods__rail-pad" :style="cartPadStyle" />
          </view>
        </scroll-view>

        <scroll-view
          class="lingyun-order-goods__list"
          :scroll-y="!cartDetailOpen"
          scroll-with-animation
          :show-scrollbar="false"
          :scroll-into-view="listIntoId"
          :lower-threshold="80"
          :upper-threshold="2"
          @scroll="onListScroll"
          @scrolltoupper="onListScrollUpper"
          @scrolltolower="onListScrollToLower"
        >
          <view class="lingyun-order-goods__list-inner">
            <view
              v-if="!searchActive && categoryMode && categoryLoading"
              class="lingyun-order-goods__list-loading"
            >
              <lingyun-activity-indicator size="large" />
              <text class="lingyun-order-goods__list-loading-text">{{ loadingText }}</text>
            </view>
            <view
              v-if="searchActive"
              :id="searchTopId"
              class="lingyun-order-goods__search-summary"
            >
              <text class="lingyun-order-goods__search-summary-text">
                <template v-if="!searchKeyword">{{ searchHintText }}</template>
                <template v-else-if="searchResultCount > 0">
                  找到 {{ searchResultCount }} 个结果
                </template>
                <template v-else>{{ searchEmptyText }}</template>
              </text>
            </view>
            <view
              v-for="category in displayCategories"
              :id="sectionIdOf(category)"
              :key="category.key"
              class="lingyun-order-goods__section"
            >
              <text class="lingyun-order-goods__section-title">
                {{ category.title || category.text }}
              </text>
              <view class="lingyun-order-goods__section-goods">
                <view
                  v-for="item in category.goods"
                  :key="item.key"
                  class="lingyun-order-goods__goods"
                  @click="onGoodsClick(item, category)"
                >
                <view class="lingyun-order-goods__media">
                  <image
                    v-if="item.image"
                    class="lingyun-order-goods__media-img"
                    :src="item.image"
                    mode="aspectFill"
                    lazy-load
                    @load="scheduleMeasure()"
                  />
                  <view v-else class="lingyun-order-goods__media-empty">
                    <text class="lingyun-order-goods__media-char">{{ firstChar(item.name) }}</text>
                  </view>
                </view>
                <view class="lingyun-order-goods__goods-main">
                  <view class="lingyun-order-goods__name-row">
                    <text class="lingyun-order-goods__name">{{ item.name }}</text>
                    <lingyun-badge
                      v-if="item.badge"
                      class="lingyun-order-goods__tag"
                      size="small"
                      color="orange"
                      :text="item.badge"
                    />
                  </view>
                  <text v-if="metaText(item)" class="lingyun-order-goods__meta">{{ metaText(item) }}</text>
                  <view
                    v-if="item.details && item.details.length"
                    class="lingyun-order-goods__details"
                  >
                    <text
                      v-for="(detail, detailIndex) in item.details"
                      :key="detailIndex"
                      class="lingyun-order-goods__detail"
                    >{{ detail }}</text>
                  </view>
                  <view class="lingyun-order-goods__bottom">
                    <view v-if="showAmount && showPrice(item)" class="lingyun-order-goods__price">
                      <text class="lingyun-order-goods__currency">{{ currency }}</text>
                      <text class="lingyun-order-goods__amount">{{ priceAmountText(item) }}</text>
                      <text v-if="item.priceUnit" class="lingyun-order-goods__price-unit">
                        {{ item.priceUnit }}
                      </text>
                      <text
                        v-if="item.originalPrice && !priceIsStarting(item)"
                        class="lingyun-order-goods__original"
                      >
                        {{ currency }}{{ formatPrice(item.originalPrice) }}
                      </text>
                    </view>
                    <view class="lingyun-order-goods__action" @click.stop>
                      <text
                        v-if="isItemSoldOut(item)"
                        class="lingyun-order-goods__soldout"
                      >{{ soldOutText }}</text>
                      <lingyun-stepper
                        v-else-if="quantityOf(item) > 0 && !isVariantItem(item) && !item.multiSpec"
                        :value="quantityOf(item)"
                        :min="0"
                        :max="itemMax(item)"
                        :step="itemStep(item)"
                        :right-text="quantityUnitOf(item)"
                        size="large"
                        show-value
                        @change="onItemQuantity(item, $event)"
                      />
                      <view
                        v-else-if="item.multiSpec"
                        class="lingyun-order-goods__spec-btn"
                        hover-class="lingyun-order-goods__spec-btn--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        :aria-label="specButtonText"
                        @click="onPlus(item, category)"
                      >
                        <text class="lingyun-order-goods__spec-btn-text">{{ specButtonText }}</text>
                        <view
                          v-if="quantityOf(item) > 0"
                          class="lingyun-order-goods__plus-count"
                        >
                          <text class="lingyun-order-goods__plus-count-text">
                            {{ quantityOf(item) }}
                          </text>
                        </view>
                      </view>
                      <view
                        v-else-if="isVariantItem(item)"
                        class="lingyun-order-goods__plus"
                        hover-class="lingyun-order-goods__plus--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        :aria-label="hasSpecs(item) ? specButtonText : attributeButtonText"
                        @click="onPlus(item, category)"
                      >
                        <lingyun-icon type="plusempty" :size="18" color="#ffffff" />
                        <view
                          v-if="quantityOf(item) > 0"
                          class="lingyun-order-goods__plus-count"
                        >
                          <text class="lingyun-order-goods__plus-count-text">
                            {{ quantityOf(item) }}
                          </text>
                        </view>
                      </view>
                      <view
                        v-else-if="item.multiSpec"
                        class="lingyun-order-goods__spec-btn"
                        hover-class="lingyun-order-goods__spec-btn--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        :aria-label="specButtonText"
                        @click="onPlus(item, category)"
                      >
                        <text class="lingyun-order-goods__spec-btn-text">{{ specButtonText }}</text>
                        <view
                          v-if="quantityOf(item) > 0"
                          class="lingyun-order-goods__plus-count"
                        >
                          <text class="lingyun-order-goods__plus-count-text">
                            {{ quantityOf(item) }}
                          </text>
                        </view>
                      </view>
                      <view
                        v-else
                        class="lingyun-order-goods__plus"
                        hover-class="lingyun-order-goods__plus--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        aria-label="加入购物车"
                        @click="onPlus(item, category)"
                      >
                        <lingyun-icon type="plusempty" :size="18" color="#ffffff" />
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              </view>
            </view>

            <view
              v-if="!searchActive && !(categoryMode && categoryLoading) && !hasVisibleGoods"
              class="lingyun-order-goods__empty"
            >
              <slot name="empty">
                <lingyun-empty variant="plain" :title="emptyText" />
              </slot>
            </view>
            <view class="lingyun-order-goods__list-pad" :style="cartPadStyle" />
          </view>
        </scroll-view>
      </view>

      <!-- 悬浮购物车：详情与购物车同一张卡，卡片浮在列表上方 -->
      <lingyun-goods-nav
        v-if="!catalogEmpty"
        variant="cart"
        detail
        :cart-count="cartCount"
        :total="cartTotal"
        :show-amount="showAmount"
        :min-price="minPrice"
        :delivery-fee="deliveryFee"
        :currency="currency"
        :empty-text="emptyCartText"
        :checkout-text="checkoutText"
        :price-decimals="priceDecimals"
        :accent-color="accentColor"
        :safe-area="safeArea"
        :detail-version="cartVersion"
        @checkout="onCheckout"
        @detail-open="onCartDetailOpen"
        @detail-close="onCartDetailClose"
      >
        <template #detail-header>
          <view class="lingyun-order-goods__cart-head">
            <view class="lingyun-order-goods__cart-head-main">
              <text class="lingyun-order-goods__cart-title">{{ cartTitle }}</text>
              <text class="lingyun-order-goods__cart-count">共 {{ cartCount }} 件</text>
            </view>
            <view
              v-if="cartLines.length"
              class="lingyun-order-goods__clear"
              hover-class="lingyun-order-goods__clear--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              @click="clearCart"
            >
              <lingyun-icon
                type="trash"
                :size="16"
                color="var(--lingyun-label-secondary, #8e8e93)"
              />
              <text class="lingyun-order-goods__clear-text">{{ clearText }}</text>
            </view>
          </view>
        </template>
        <template #detail>
          <view class="lingyun-order-goods__cart-sheet">
            <view
              v-for="line in cartLines"
              :key="line.key"
              class="lingyun-order-goods__cart-line"
            >
              <view class="lingyun-order-goods__cart-media">
                <image
                  v-if="cartLineImage(line)"
                  class="lingyun-order-goods__cart-media-img"
                  :src="cartLineImage(line)"
                  mode="aspectFill"
                  lazy-load
                />
                <view v-else class="lingyun-order-goods__cart-media-empty">
                  <text class="lingyun-order-goods__media-char">
                    {{ firstChar(line.item.name) }}
                  </text>
                </view>
              </view>
              <view class="lingyun-order-goods__cart-line-main">
                <text class="lingyun-order-goods__cart-line-name">{{ line.item.name }}</text>
                <view
                  v-if="cartLineSelections(line).length"
                  class="lingyun-order-goods__cart-line-options"
                >
                  <text
                    v-for="(option, optionIndex) in cartLineSelections(line)"
                    :key="optionIndex"
                    class="lingyun-order-goods__cart-line-option"
                  >{{ option }}</text>
                </view>
                <view v-if="showAmount" class="lingyun-order-goods__cart-line-price">
                  <text class="lingyun-order-goods__currency">{{ currency }}</text>
                  <text class="lingyun-order-goods__cart-line-amount">
                    {{ formatPrice(linePrice(line)) }}
                  </text>
                </view>
              </view>
              <lingyun-stepper
                :value="line.quantity"
                :min="0"
                :max="lineMax(line)"
                :step="itemStep(line.item)"
                :right-text="quantityUnitOf(line.item)"
                size="large"
                show-value
                @change="onCartLineQuantity(line, $event)"
              />
            </view>
            <lingyun-empty
              v-if="!cartLines.length"
              variant="plain"
              :title="emptyCartText"
            />
            <view class="lingyun-order-goods__sheet-pad" />
          </view>
        </template>
      </lingyun-goods-nav>

      <!-- 商品详情：点商品图 / 名称区域打开，使用大模式 Sheet -->
      <lingyun-sheets
        v-model:show="goodsDetailOpen"
        :title="goodsDetailBleedTop ? '' : goodsDetailTitle"
        detent="large"
        :bleed-top="goodsDetailBleedTop"
        :content-fill="goodsDetailWide"
        :z-index="1300"
      >
        <view
          v-if="goodsDetailItem"
          class="lingyun-order-goods__goods-detail"
          :class="{
            'lingyun-order-goods__goods-detail--bleed-top': goodsDetailBleedTop,
          }"
          :style="goodsDetailAccentStyle"
        >
          <view class="lingyun-order-goods__goods-detail-hero">
            <lingyun-swiper
              v-if="goodsDetailImages.length"
              v-model:current="goodsDetailImageIndex"
              :images="goodsDetailImages"
              :ratio="0.75"
              autoplay
              :interval="5000"
              :duration="360"
              circular
            />
            <view v-else class="lingyun-order-goods__goods-detail-ratio">
              <view class="lingyun-order-goods__goods-detail-image-empty">
                <text class="lingyun-order-goods__goods-detail-char">
                  {{ firstChar(goodsDetailItem.name) }}
                </text>
              </view>
            </view>
            <scroll-view
              v-if="goodsDetailImages.length > 1"
              class="lingyun-order-goods__goods-detail-thumbs"
              scroll-x
              scroll-with-animation
              :scroll-into-view="detailThumbInto"
              :show-scrollbar="false"
            >
              <view class="lingyun-order-goods__goods-detail-thumbs-inner">
                <view
                  v-for="(image, index) in goodsDetailImages"
                  :id="detailThumbIdOf(index)"
                  :key="index"
                  class="lingyun-order-goods__goods-detail-thumb"
                  :class="{
                    'lingyun-order-goods__goods-detail-thumb--active':
                      index === goodsDetailImageIndex,
                  }"
                  @click.stop="selectGoodsDetailImage(index)"
                >
                  <image
                    class="lingyun-order-goods__goods-detail-thumb-image"
                    :src="image"
                    mode="aspectFill"
                  />
                </view>
              </view>
            </scroll-view>
          </view>
          <view class="lingyun-order-goods__goods-detail-info">
            <view class="lingyun-order-goods__goods-detail-price-row">
              <view
                v-if="showAmount && showPrice(goodsDetailItem)"
                class="lingyun-order-goods__goods-detail-price"
              >
                <text class="lingyun-order-goods__goods-detail-currency">{{ currency }}</text>
                <text class="lingyun-order-goods__goods-detail-amount">
                  {{ priceAmountText(goodsDetailItem) }}
                </text>
                <text
                  v-if="goodsDetailItem.priceUnit"
                  class="lingyun-order-goods__goods-detail-unit"
                >{{ goodsDetailItem.priceUnit }}</text>
                <text
                  v-if="goodsDetailItem.originalPrice && !priceIsStarting(goodsDetailItem)"
                  class="lingyun-order-goods__goods-detail-original"
                >{{ currency }}{{ formatPrice(goodsDetailItem.originalPrice) }}</text>
              </view>
              <text
                v-else-if="!showPrice(goodsDetailItem)"
                class="lingyun-order-goods__goods-detail-price-spec"
              >
                {{ specButtonText }}
              </text>
              <text
                v-if="goodsDetailItem.salesText"
                class="lingyun-order-goods__goods-detail-sales"
              >{{ goodsDetailItem.salesText }}</text>
            </view>
            <view class="lingyun-order-goods__goods-detail-name-row">
              <view class="lingyun-order-goods__goods-detail-name-wrap">
                <text class="lingyun-order-goods__goods-detail-name">
                  {{ goodsDetailItem.name }}
                </text>
                <lingyun-badge
                  v-if="goodsDetailItem.badge"
                  class="lingyun-order-goods__goods-detail-badge"
                  size="small"
                  color="orange"
                  :text="goodsDetailItem.badge"
                />
              </view>
            </view>
          </view>
          <view class="lingyun-order-goods__goods-detail-intro">
            <text class="lingyun-order-goods__goods-detail-intro-title">商品介绍</text>
            <scroll-view
              class="lingyun-order-goods__goods-detail-intro-scroll"
              :scroll-y="goodsDetailWide"
              :show-scrollbar="false"
            >
              <text
                v-for="(line, index) in goodsDetailDescriptionLines"
                :key="index"
                class="lingyun-order-goods__goods-detail-desc"
              >{{ line }}</text>
              <view class="lingyun-order-goods__goods-detail-pad" />
            </scroll-view>
          </view>
        </view>
        <template #footer>
          <view
            v-if="goodsDetailItem"
            class="lingyun-order-goods__goods-detail-footer"
          >
            <lingyun-stepper
              v-if="goodsDetailShowStepper"
              :value="goodsDetailQuantity"
              :min="0"
              :max="itemMax(goodsDetailItem)"
              :step="itemStep(goodsDetailItem)"
              :right-text="quantityUnitOf(goodsDetailItem)"
              size="large"
              show-value
              @change="onItemQuantity(goodsDetailItem, $event)"
            />
            <view
              v-else
              class="lingyun-order-goods__goods-detail-add"
              :class="{
                'lingyun-order-goods__goods-detail-add--disabled': isItemSoldOut(goodsDetailItem),
              }"
              hover-class="lingyun-order-goods__goods-detail-add--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              @click="addFromGoodsDetail"
            >
              <text class="lingyun-order-goods__goods-detail-add-text">
                {{ goodsDetailAddLabel }}
              </text>
              <view
                v-if="(isVariantItem(goodsDetailItem) || goodsDetailItem.multiSpec) && goodsDetailQuantity > 0"
                class="lingyun-order-goods__plus-count"
              >
                <text class="lingyun-order-goods__plus-count-text">
                  {{ goodsDetailQuantity }}
                </text>
              </view>
            </view>
          </view>
        </template>
      </lingyun-sheets>

      <!-- 规格 / 属性选择：页面专用子组件 -->
      <lingyun-order-goods-variant-sheet
        v-model:show="variantOpen"
        :item="variantItem"
        :cart="cartMap"
        :currency="currency"
        :price-decimals="priceDecimals"
        :show-amount="showAmount"
        :title="variantSheetTitle"
        :spec-title="specTitle"
        :max-count="maxCount"
        :quantity-unit="quantityUnit"
        :accent-color="accentColor"
        :add-to-cart-text="addToCartText"
        :sold-out-text="soldOutText"
        @quantity-change="onVariantQuantityChange"
      />
    </view>

    <template #trailing-menu="scope">
      <slot
        name="toolbar-menu"
        :button="scope.button"
        :index="scope.index"
        :groupIndex="scope.groupIndex"
        :buttonIndex="scope.buttonIndex"
        :close="scope.close"
      />
    </template>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunAppPageScroll } from '../../../lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import { useLingyunTheme } from '../../../lingyun-ui/utils/theme'
import LingyunOrderGoodsVariantSheet from './lingyun-order-goods-variant-sheet.vue'
import { attributesOf, findSpec, finiteStock, parseLineKey } from './cartKey'
import type {
  LingyunOrderCart,
  LingyunOrderCartAttribute,
  LingyunOrderCartLine,
  LingyunOrderCategory,
  LingyunOrderCategoryChangePayload,
  LingyunOrderChangePayload,
  LingyunOrderCheckoutPayload,
  LingyunOrderGoods,
  LingyunOrderGoodsClickPayload,
  LingyunOrderSpec,
  LingyunOrderSpecPayload,
  LingyunOrderStore,
  LingyunOrderToolbarButtonGroups,
} from './types'

type ScrollEvent = {
  detail?: { scrollTop?: number }
}

type VariantQuantityPayload = {
  item: LingyunOrderGoods
  key: string
  quantity: number
  spec?: LingyunOrderSpec
  attributes?: LingyunOrderCartAttribute[]
  categoryKey?: string
}

const FALLBACK_ACCENT = 'var(--lingyun-system-blue, #0088ff)'

function sanitizeKey(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * lingyun-order-goods
 * @description 标准「订单商品加购」页：店铺头 + 左侧分类 + 右侧商品 + 底部悬浮购物车。
 * 点商品图 / 名称打开大模式商品详情 Sheet（商品介绍）；商品数据带 specs / attributeGroups 时
 * 自动进入规格列表或「规格 + 属性」组合选择；加购数量走 v-model，提交和跳转抛事件。
 * @see design/pages/demo/pages/order-goods.md
 *
 * @property {Object} store 店铺信息 { name, logo, rating, salesText, deliveryText, notice }
 * @property {Array} categories 分类与商品 [{ key, text, title, iconSrc, icon, iconColor, badge, goods }]；商品支持 image / images / details / description / priceUnit / quantityUnit / specs / attributeGroups / multiSpec / soldOut 等字段
 * @property {Object} modelValue 购物车 { [lineKey]: quantity }；无规格商品行 key 即商品 key，组合行 key 由组件生成
 * @property {String} banner 店铺 Banner 图；用 #banner 插槽可完全自定义
 * @property {Number} bannerHeight Banner 高度，0 时不显示
 * @property {Boolean} showStore 显示顶部店铺卡片（logo / 名称 / 评分 / 公告）；默认 true。隐藏后 Banner 与返回钮不受影响
 * @property {Boolean} showAmount 显示金额（商品价 / 详情价 / 规格价 / 购物车金额与合计）；默认 true。隐藏后数量、步进与结算按钮保留
 * @property {String} variantSheetTitle 规格 / 属性选择弹窗标题；空则按模式自动（商品名 / 选择规格与属性 / 选择属性）
 * @property {String} specTitle 规格分区标题；默认「规格」
 * @property {Boolean} showBack 显示 Banner 左上角返回钮（默认 true，点击抛 back）
 * @property {Boolean} showNav 透传给 lingyun-app-page；默认 true，宽屏保留应用导航列
 * @property {Boolean} showToolbar 透传给 lingyun-app-page；默认 false
 * @property {Boolean} autoTopInset 工具栏是否自动给页面加顶部安全区；false 时页面内容顶到顶部（Banner 垫在工具栏下）
 * @property {Array} toolbarButtons 顶部工具栏自定义按钮组（与主题钮同组），一维一组、二维多组
 * @property {Boolean} toolbarMenuEnabled 工具栏按钮点击弹出 #toolbar-menu 浮层；小程序需显式开启
 * @slot toolbar-menu 工具栏菜单内容，作用域 { button, index, close }；点击按钮后由工具栏弹出
 * @property {String} title 顶栏标题（showToolbar 为 true 时使用）
 * @property {Number} minPrice 起送价
 * @property {Number} deliveryFee 配送费
 * @property {String} currency 货币符号
 * @property {Number} maxCount 单个商品默认最大数量
 * @property {String} checkoutText 可结算时的按钮文案
 * @property {String} cartTitle 已选商品面板标题
 * @property {String} clearText 面板右上角清空文案
 * @property {String} emptyText 无商品时空态文案
 * @property {String} emptyCartText 购物车为空时的文案
 * @property {String} soldOutText 售罄商品在加购位置显示的文案
 * @property {String} specButtonText 规格选择按钮文案
 * @property {String} attributeButtonText 只有属性、没有规格时的按钮文案
 * @property {String} quantityUnit 步进器默认数量单位；商品上的 quantityUnit 优先
 * @property {Number} priceDecimals 价格小数位；-1 去掉多余的 0，2 固定两位
 * @property {String} accentColor 选中 / 加购 / 结算的主色；默认系统蓝
 * @property {Boolean} safeArea 购物车栏预留底部安全区
 * @property {Boolean} loadByCategory 按分类加载：只渲染当前分类，点击分类抛 category-change
 * @property {Boolean} categoryLoading 按分类加载时显示加载态
 * @property {String} loadingText 加载态文案
 * @property {Boolean} windowed 全量模式分段渲染，先渲染前 windowSize 个分类
 * @property {Number} windowSize 分段加载每次追加的分类数
 * @property {String} renderMode auto / all / windowed / category，默认 auto
 * @property {Number} windowedThreshold auto：超过该商品数启用分段加载
 * @property {Number} categoryThreshold auto：超过该商品数启用按分类加载
 * @property {Number} totalGoodsCount 商品总数，懒加载时传入
 * @property {Boolean} searchable 顶部工具栏显示搜索入口（需 showToolbar=true）；搜索时显示内置搜索视图
 * @property {String} searchHintText 搜索未输入关键字时的提示
 * @property {String} searchEmptyText 搜索无结果文案
 * @property {Boolean} goodsDetail 点商品图 / 名称打开内置商品详情 Sheet，默认 true
 * @property {String} goodsDetailTitle 商品详情 Sheet 标题（宽屏显示；移动端头图模式隐藏）
 * @property {String} addToCartText 商品详情加购按钮文案
 * @property {String} attributeButtonText 只有属性、没有规格的商品详情按钮文案
 * @event update:modelValue 加购数量变化
 * @event change 加购数量变化 { item, quantity, cart, count, totalPrice, key, spec, attributes }
 * @event category-change 左右联动切换分类 { key, index }
 * @event goods-click 点击商品 { item, categoryKey }；内置详情开启时同时打开 Sheet
 * @event search 搜索值变化 { value, count }
 * @event spec-request 旧用法：multiSpec 商品点 +；配置 specs / attributeGroups 后由内置 Sheet 处理
 * @event cart-clear 清空购物车
 * @event checkout 可结算时点结算 { cart, lines, count, totalPrice, deliveryFee }
 * @event back 点 Banner 返回钮
 */
defineOptions({
  name: 'LingyunOrderGoods',
})

const props = defineProps({
  store: {
    type: Object as PropType<LingyunOrderStore>,
    required: true,
  },
  categories: {
    type: Array as PropType<LingyunOrderCategory[]>,
    default: () => [],
  },
  modelValue: {
    type: Object as PropType<LingyunOrderCart>,
    default: () => ({}),
  },
  banner: { type: String, default: '' },
  bannerHeight: { type: Number, default: 140 },
  /** 隐藏顶部店铺卡片（logo / 名称 / 评分 / 公告）；banner 与返回钮不受影响 */
  showStore: { type: Boolean, default: true },
  /** 隐藏金额：商品价 / 详情价 / 规格价 / 购物车金额与合计；数量与结算按钮保留 */
  showAmount: { type: Boolean, default: true },
  /** 规格 / 属性选择弹窗标题；空则按模式自动（商品名 / 选择规格与属性 / 选择属性） */
  variantSheetTitle: { type: String, default: '' },
  /** 规格分区标题；默认「规格」 */
  specTitle: { type: String, default: '规格' },
  showBack: { type: [Boolean, String], default: 'auto' },
  /** 顶栏返回钮默认返回上一页；false 时只抛 back，由页面处理 */
  autoBack: { type: Boolean, default: true },
  showNav: { type: Boolean, default: true },
  showToolbar: { type: Boolean, default: false },
  /** 工具栏是否自动给页面加顶部安全区；false 时页面内容顶到顶部（Banner 垫在工具栏下） */
  autoTopInset: { type: Boolean, default: true },
  /** 顶部工具栏自定义按钮组，透传 lingyun-app-page 的 trailingButtons（与主题钮同一组） */
  toolbarButtons: {
    type: Array as PropType<LingyunOrderToolbarButtonGroups>,
    default: () => [],
  },
  /** 工具栏按钮点击弹出 #toolbar-menu 浮层；小程序需显式开启 */
  toolbarMenuEnabled: { type: Boolean, default: false },
  title: { type: String, default: '' },
  minPrice: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  currency: { type: String, default: '¥' },
  maxCount: { type: Number, default: 99 },
  checkoutText: { type: String, default: '去结算' },
  cartTitle: { type: String, default: '已选商品' },
  clearText: { type: String, default: '清空' },
  emptyText: { type: String, default: '暂无商品' },
  emptyCartText: { type: String, default: '未选购商品' },
  soldOutText: { type: String, default: '商品已售罄' },
  specButtonText: { type: String, default: '选规格' },
  /** 数量单位，如「件」；商品上的 quantityUnit 优先 */
  quantityUnit: { type: String, default: '' },
  /** 价格小数位；-1 去掉多余的 0，2 固定两位 */
  priceDecimals: { type: Number, default: -1 },
  accentColor: { type: String, default: '' },
  safeArea: { type: Boolean, default: true },
  /** 按分类加载：右侧只渲染当前分类，关闭滚动联动；点击分类抛 category-change 由宿主取数 */
  loadByCategory: { type: Boolean, default: false },
  /** 按分类加载时宿主正在取当前分类数据，显示加载态 */
  categoryLoading: { type: Boolean, default: false },
  loadingText: { type: String, default: '加载中…' },
  /** 全量模式下按分类分段渲染：先渲染前 N 个分类，滚到底部再追加，点击分类自动展开到目标 */
  windowed: { type: Boolean, default: false },
  /** windowed 每次追加的分类数 */
  windowSize: { type: Number, default: 2 },
  /** 渲染模式：auto 按商品总数自动选择；all / windowed / category 显式指定 */
  renderMode: { type: String, default: 'auto' },
  /** auto：商品数大于该值时启用分段加载 */
  windowedThreshold: { type: Number, default: 100 },
  /** auto：商品数大于该值时启用按分类加载 */
  categoryThreshold: { type: Number, default: 500 },
  /** 商品总数；宿主按分类懒加载、categories 里不是全量商品时传入，auto 判断更准确 */
  totalGoodsCount: { type: Number, default: 0 },
  /** 顶部工具栏显示搜索入口（需 showToolbar=true）；搜索时显示内置搜索视图 */
  searchable: { type: Boolean, default: true },
  /** 搜索未输入关键字时的提示 */
  searchHintText: { type: String, default: '输入商品名称 / 规格搜索' },
  /** 搜索无结果文案 */
  searchEmptyText: { type: String, default: '没有找到相关商品' },
  /** 点商品图 / 名称打开内置商品详情 Sheet；false 时只抛 goods-click */
  goodsDetail: { type: Boolean, default: true },
  /** 商品详情 Sheet 标题（宽屏显示；移动端头图模式隐藏） */
  goodsDetailTitle: { type: String, default: '商品详情' },
  /** 商品详情 Sheet 加购按钮文案 */
  addToCartText: { type: String, default: '加入购物车' },
  /** 只有属性、没有规格的商品，详情底部按钮文案 */
  attributeButtonText: { type: String, default: '选属性' },
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'category-change',
  'goods-click',
  'spec-request',
  'cart-clear',
  'checkout',
  'search',
  'back',
])

const instance = getCurrentInstance()

const reportScroll = useLingyunAppPageScroll()

const uid = `og${Math.random().toString(36).slice(2, 8)}`
const detailThumbUid = `ogd${Math.random().toString(36).slice(2, 8)}`

const activeKey = ref('')
const railIntoId = ref('')
const listIntoId = ref('')
const listScrollTop = ref(0)
const sectionTops = ref<number[]>([])
const offsetsReady = ref(false)
const spyLockedUntil = ref(0)
const railIndicatorTop = ref(0)
const railIndicatorHeight = ref(0)
const railIndicatorVisible = ref(false)
const railIndicatorReady = ref(false)
const railPulseKey = ref('')
const renderUntil = ref(0)
/** 已选商品快照：分类数据按需加载后，切换分类仍能保留其它分类的已选商品 */
const cartSnapshots = ref<Record<string, { item: LingyunOrderGoods; categoryKey: string }>>({})
/** 页面底部安全区；购物车悬浮在列表上方，列表尾部要留出让位高度 */
const safeBottom = ref(0)
/** 视口宽度；商品详情宽屏左右布局与移动端头图模式切换 */
const windowWidth = ref(375)
/** 宽屏卡片布局下商品列表的列数（按列表实际宽度测量，1–4） */
const listColumns = ref(1)
/** 商品详情 Sheet */
const goodsDetailOpen = ref(false)
const goodsDetailItem = ref<LingyunOrderGoods | null>(null)
const goodsDetailCategoryKey = ref('')
/** 商品详情当前大图下标 */
const goodsDetailImageIndex = ref(0)
/** 工具栏搜索 */
const searchActive = ref(false)
const searchText = ref('')
/** 商品详情缩略图横向滚动容器 / 目标 id */
const detailThumbInto = ref('')
/** 购物车详情展开时锁住列表 / 分类栏滚动，避免背景跟着滑动 */
const cartDetailOpen = ref(false)
/** 规格 / 属性选择 Sheet（页面专用子组件） */
const variantOpen = ref(false)
const variantItem = ref<LingyunOrderGoods | null>(null)
const variantCategoryKey = ref('')

let pulseTimer: ReturnType<typeof setTimeout> | null = null
let measureTimer: ReturnType<typeof setTimeout> | null = null
let columnsTimer: ReturnType<typeof setTimeout> | null = null
let spyTimers: ReturnType<typeof setTimeout>[] = []
let onWindowResize: (() => void) | null = null

function firstChar(value: unknown): string {
  const text = String(value == null ? '' : value).trim()
  return Array.from(text)[0] || '商'
}

function storeMark(): string {
  const mark = props.store && props.store.mark != null ? String(props.store.mark).trim() : ''
  return mark || firstChar(props.store && props.store.name)
}

function syncSafeBottom(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
    const width = Number(info && info.windowWidth)
    if (Number.isFinite(width) && width > 0) windowWidth.value = width
  } catch {
    safeBottom.value = 0
  }
}

function metaText(item: LingyunOrderGoods): string {
  return [item.specText || '', item.salesText || ''].filter(Boolean).join(' · ')
}

function formatPrice(value: unknown): string {
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : 0
  if (props.priceDecimals >= 0) return safe.toFixed(props.priceDecimals)
  return String(Number(safe.toFixed(2)))
}

function quantityUnitOf(item: LingyunOrderGoods): string {
  return item.quantityUnit || props.quantityUnit
}

function hasCategoryBadge(category: LingyunOrderCategory): boolean {
  const badge = category.badge
  return badge !== undefined && badge !== null && badge !== ''
}

function railIdOfKey(key: string): string {
  return `${uid}-cat-${sanitizeKey(key)}`
}

function railIdOf(category: LingyunOrderCategory): string {
  return railIdOfKey(category.key)
}

function sectionIdOf(category: LingyunOrderCategory): string {
  return `${uid}-sec-${sanitizeKey(category.key)}`
}

function detailThumbIdOf(index: number): string {
  return `${detailThumbUid}-thumb-${index}`
}

function isSpecSoldOut(spec: LingyunOrderSpec): boolean {
  return !!spec.soldOut || finiteStock(spec.stock) === 0
}

function hasSpecs(item: LingyunOrderGoods | null | undefined): boolean {
  return !!item && Array.isArray(item.specs) && item.specs.length > 0
}

function hasAttributes(item: LingyunOrderGoods | null | undefined): boolean {
  return (
    !!item &&
    Array.isArray(item.attributeGroups) &&
    item.attributeGroups.length > 0
  )
}

/** 有规格或属性：点 + 打开选择 Sheet，不再直接加购 */
function isVariantItem(item: LingyunOrderGoods | null | undefined): boolean {
  return !!item && (hasSpecs(item) || hasAttributes(item))
}

function itemStep(item: LingyunOrderGoods): number {
  return item.step != null && Number(item.step) > 0 ? Number(item.step) : 1
}

function linePrice(line: LingyunOrderCartLine): number {
  const price = Number(line.spec?.price)
  return Number.isFinite(price) ? price : Number(line.item.price) || 0
}

/** 规格价格区间：主列表 / 详情用区间价，避免只显示基础价造成误解 */
function specPriceRange(item: LingyunOrderGoods): {
  min: number
  max: number
  hasPrice: boolean
  range: boolean
} {
  const base = Number(item.price) || 0
  const specs = Array.isArray(item.specs) ? item.specs : []
  if (!specs.length) {
    return { min: base, max: base, hasPrice: base > 0, range: false }
  }
  const prices = specs
    .map((spec) => {
      const price = Number(spec.price)
      return Number.isFinite(price) ? price : base
    })
    .filter((price) => price > 0)
  if (!prices.length) {
    return { min: 0, max: 0, hasPrice: false, range: false }
  }
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return { min, max, hasPrice: true, range: max > min }
}

/** 多规格显示最低价 + 起；此时不显示划线原价，避免误导 */
function priceIsStarting(item: LingyunOrderGoods): boolean {
  if (!isVariantItem(item)) return false
  return (
    specPriceRange(item).hasPrice &&
    Array.isArray(item.specs) &&
    item.specs.length > 1
  )
}

function priceAmountText(item: LingyunOrderGoods): string {
  const stats = specPriceRange(item)
  if (isVariantItem(item) && stats.hasPrice) {
    const amount = formatPrice(stats.min)
    return priceIsStarting(item) ? `${amount}起` : amount
  }
  return formatPrice(item.price)
}

/** 单行上限：商品 / 规格 max；无规格商品再受库存限制。库存为规格 / 商品级，组合行按已占用数量扣减 */
function itemMax(item: LingyunOrderGoods): number {
  const base =
    item.max != null && Number.isFinite(Number(item.max))
      ? Number(item.max)
      : props.maxCount
  if (hasSpecs(item)) return base
  const stock = finiteStock(item.stock)
  return stock != null ? Math.min(base, stock) : base
}

/** 有规格 / 属性但没有任何价格时不画价格；普通商品保持原行为 */
function showPrice(item: LingyunOrderGoods): boolean {
  if (item.multiSpec) return Number(item.price) > 0
  if (isVariantItem(item)) return specPriceRange(item).hasPrice
  return true
}

function isItemSoldOut(item: LingyunOrderGoods): boolean {
  if (item.soldOut) return true
  if (hasSpecs(item)) {
    return (item.specs || []).every((spec) => isSpecSoldOut(spec))
  }
  const stock = finiteStock(item.stock)
  return stock != null && stock <= 0
}

function itemLookup(): Map<string, { item: LingyunOrderGoods; categoryKey: string }> {
  const lookup = new Map<string, { item: LingyunOrderGoods; categoryKey: string }>()
  props.categories.forEach((category) => {
    ;(category.goods || []).forEach((item) => {
      lookup.set(item.key, { item, categoryKey: category.key })
    })
  })
  return lookup
}

/** 把规格 / 属性行 key 还原成购物车行；找不到商品时回退到快照 */
function resolveCartLine(
  key: string,
  quantity: number,
  lookup: Map<string, { item: LingyunOrderGoods; categoryKey: string }>,
): LingyunOrderCartLine | null {
  const parsed = parseLineKey(key)
  const current = lookup.get(parsed.itemKey)
  const snapshot = cartSnapshots.value[key]
  const item = current ? current.item : snapshot ? snapshot.item : null
  if (!item) return null
  return {
    key,
    item,
    categoryKey: current ? current.categoryKey : snapshot?.categoryKey || '',
    quantity,
    spec: findSpec(item, parsed.specKey),
    attributes: attributesOf(item, parsed.optionTokens),
  }
}

/** 同一商品内按规格顺序、属性分组顺序排列组合行 */
function compareItemLines(a: LingyunOrderCartLine, b: LingyunOrderCartLine): number {
  const item = a.item
  const specIndex = (line: LingyunOrderCartLine): number => {
    const key = line.spec?.key || ''
    if (!key) return -1
    return (item.specs || []).findIndex((spec) => spec.key === key)
  }
  const specDiff = specIndex(a) - specIndex(b)
  if (specDiff) return specDiff
  const attributeKey = (line: LingyunOrderCartLine): string =>
    (line.attributes || [])
      .map((attribute) => {
        const groupIndex = (item.attributeGroups || []).findIndex(
          (group) => group.key === attribute.groupKey,
        )
        const group = (item.attributeGroups || [])[groupIndex]
        const optionIndex = group
          ? (group.options || []).findIndex(
              (option) => option.key === attribute.optionKey,
            )
          : -1
        return `${groupIndex}:${optionIndex}`
      })
      .join(',')
  return attributeKey(a).localeCompare(attributeKey(b))
}

/** 生成购物车行：按分类 / 商品 / 规格 / 属性顺序，快照行排在最后 */
function buildCartLines(cart: LingyunOrderCart): LingyunOrderCartLine[] {
  const lookup = itemLookup()
  const byItem = new Map<string, LingyunOrderCartLine[]>()
  Object.keys(cart).forEach((key) => {
    const quantity = Number(cart[key])
    if (!Number.isFinite(quantity) || quantity <= 0) return
    const line = resolveCartLine(key, Math.floor(quantity), lookup)
    if (!line) return
    const list = byItem.get(line.item.key)
    if (list) list.push(line)
    else byItem.set(line.item.key, [line])
  })
  const lines: LingyunOrderCartLine[] = []
  props.categories.forEach((category) => {
    ;(category.goods || []).forEach((item) => {
      const list = byItem.get(item.key)
      if (!list) return
      list.sort((a, b) => compareItemLines(a, b))
      lines.push(...list)
      byItem.delete(item.key)
    })
  })
  const orphan: LingyunOrderCartLine[] = []
  byItem.forEach((list) => orphan.push(...list))
  orphan.sort((a, b) =>
    a.categoryKey === b.categoryKey
      ? a.item.key.localeCompare(b.item.key)
      : a.categoryKey.localeCompare(b.categoryKey),
  )
  lines.push(...orphan)
  return lines
}

function countOf(cart: LingyunOrderCart): number {
  return buildCartLines(cart).reduce((sum, line) => sum + line.quantity, 0)
}

function totalOf(cart: LingyunOrderCart): number {
  const total = buildCartLines(cart).reduce(
    (sum, line) => sum + linePrice(line) * line.quantity,
    0,
  )
  return Math.round(total * 100) / 100
}

/** 购物车行按「每行一个选择」排列：规格一行，每个已选属性选项各一行 */
function cartLineSelections(line: LingyunOrderCartLine): string[] {
  const lines: string[] = []
  if (line.spec?.text) lines.push(`规格：${line.spec.text}`)
  ;(line.attributes || []).forEach((attribute) => {
    const quantity = Math.floor(Number(attribute.quantity))
    const suffix = Number.isFinite(quantity) && quantity > 1 ? ` ×${quantity}` : ''
    lines.push(`${attribute.groupTitle}：${attribute.optionText}${suffix}`)
  })
  if (!lines.length && line.item.specText) lines.push(line.item.specText)
  return lines
}

/** 购物车行缩略图：优先第一个有图的属性选项，其次规格图，最后商品图 */
function cartLineImage(line: LingyunOrderCartLine): string {
  const attribute = (line.attributes || []).find((entry) => entry.optionImage)
  if (attribute && attribute.optionImage) return attribute.optionImage
  if (line.spec?.image) return line.spec.image
  return line.item.image || ''
}

function categoryKeyOf(item: LingyunOrderGoods): string {
  for (const category of props.categories) {
    if ((category.goods || []).some((entry) => entry.key === item.key)) {
      return category.key
    }
  }
  return ''
}

function initActive(): void {
  const list = props.categories || []
  if (!list.length) {
    activeKey.value = ''
    return
  }
  if (list.some((category) => category.key === activeKey.value)) return
  activeKey.value = list[0].key
}

const cartMap = computed((): LingyunOrderCart => props.modelValue || {})

function quantityOfKey(key: string): number {
  const quantity = Number(cartMap.value[key])
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
}

function syncCartSnapshots(): void {
  const cart = cartMap.value
  const next: Record<string, { item: LingyunOrderGoods; categoryKey: string }> = {}
  /* 先保留已选但当前分类数据还没加载回来的快照 */
  Object.keys(cartSnapshots.value).forEach((key) => {
    if (quantityOfKey(key) > 0) next[key] = cartSnapshots.value[key]
  })
  const lookup = itemLookup()
  Object.keys(cart).forEach((key) => {
    const quantity = Number(cart[key])
    if (!Number.isFinite(quantity) || quantity <= 0) return
    const parsed = parseLineKey(key)
    const found = lookup.get(parsed.itemKey)
    if (!found) return
    next[key] = {
      item: { ...found.item },
      categoryKey: found.categoryKey,
    }
  })
  cartSnapshots.value = next
}

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch (e) {
    return 'theme-light'
  }
})

const hasRating = computed((): boolean => {
  return props.store.rating !== undefined && props.store.rating !== ''
})

const storeMetaParts = computed((): string[] => {
  return [props.store.salesText || '', props.store.deliveryText || ''].filter(Boolean)
})

/** 宽屏：左右两栏各自成为悬浮卡片，商品列表按实际宽度分多列 */
const wideLayout = computed((): boolean => {
  return windowWidth.value >= 690
})

const rootStyle = computed((): Record<string, string> => {
  return {
    '--ly-og-accent': props.accentColor || FALLBACK_ACCENT,
  }
})

const rootClass = computed((): Record<string, boolean> => {
  const multi = wideLayout.value && listColumns.value > 1
  return {
    'lingyun-order-goods--no-banner': props.bannerHeight <= 0,
    'lingyun-order-goods--wide': wideLayout.value,
    'lingyun-order-goods--multi': multi,
    'lingyun-order-goods--cols-2': multi && listColumns.value === 2,
    'lingyun-order-goods--cols-3': multi && listColumns.value === 3,
    'lingyun-order-goods--cols-4': multi && listColumns.value >= 4,
  }
})

/** 内容顶到工具栏下时，Banner 顶部加一层主题色渐隐，保证工具栏文字可读 */
const toolbarScrimVisible = computed((): boolean => {
  return props.showToolbar && !props.autoTopInset && !searchActive.value && props.bannerHeight > 0
})

const cartLines = computed((): LingyunOrderCartLine[] => {
  return buildCartLines(cartMap.value)
})

/** 每个商品（含所有规格 / 属性组合行）的已选总数量 */
const cartItemTotals = computed((): Record<string, number> => {
  const totals: Record<string, number> = {}
  cartLines.value.forEach((line) => {
    totals[line.item.key] = (totals[line.item.key] || 0) + line.quantity
  })
  return totals
})

/** 商品下所有规格 / 属性组合行的数量合计 */
function quantityOf(item: LingyunOrderGoods): number {
  return cartItemTotals.value[item.key] || 0
}

const cartCount = computed((): number => {
  return cartLines.value.reduce((sum, line) => sum + line.quantity, 0)
})

const cartTotal = computed((): number => {
  const total = cartLines.value.reduce(
    (sum, line) => sum + linePrice(line) * line.quantity,
    0,
  )
  return Math.round(total * 100) / 100
})

function categoryQuantity(category: LingyunOrderCategory): number {
  return cartLines.value.reduce(
    (total, line) => (line.categoryKey === category.key ? total + line.quantity : total),
    0,
  )
}

/** 当前行允许的最大数量：受 max 与库存限制；库存按规格 / 商品扣减其它组合行 */
function lineMax(line: LingyunOrderCartLine): number {
  const spec = line.spec
  const specMax = Number(spec?.max)
  const base =
    Number.isFinite(specMax) && specMax > 0
      ? Math.floor(specMax)
      : itemMax(line.item)
  let stock: number | null = null
  if (spec) stock = finiteStock(spec.stock)
  else if (!hasSpecs(line.item)) stock = finiteStock(line.item.stock)
  if (stock == null) return base
  const usedOther = cartLines.value.reduce((sum, other) => {
    if (other.key === line.key) return sum
    if (other.item.key !== line.item.key) return sum
    if (spec) {
      if (!other.spec || other.spec.key !== spec.key) return sum
    } else if (other.spec) {
      return sum
    }
    return sum + other.quantity
  }, 0)
  return Math.max(line.quantity, Math.min(base, stock - usedOther))
}

/** 列表 / 分类栏尾部预留：底栏 62 + 底部 8 + 顶部间隙 8 + 安全区 */
const cartClearance = computed((): number => {
  return 78 + (props.safeArea ? safeBottom.value : 0)
})

const cartPadStyle = computed((): Record<string, string> => {
  return {
    height: `${wideLayout.value ? 12 : cartClearance.value}px`,
  }
})

/** 宽屏卡片底部停在悬浮购物车上方，不再被购物车盖住圆角 */
const wideBodyStyle = computed((): Record<string, string> => {
  if (!wideLayout.value) return {}
  /*
   * cartClearance(78) = 8 底部 + 62 栏高 + 8 内容缓冲；
   * 购物车玻璃描边约 2，卡片与购物车之间再留与页面上方一致的 12，故 +6。
   */
  return {
    paddingBottom: `${cartClearance.value + 6}px`,
  }
})

const goodsTotal = computed((): number => {
  if (Number(props.totalGoodsCount) > 0) return Number(props.totalGoodsCount)
  return props.categories.reduce(
    (sum, category) => sum + (category.goods || []).length,
    0,
  )
})

const effectiveRenderMode = computed((): 'all' | 'windowed' | 'category' => {
  const mode = String(props.renderMode || 'auto')
  if (mode === 'all' || mode === 'windowed' || mode === 'category') return mode
  if (props.loadByCategory) return 'category'
  if (props.windowed) return 'windowed'
  const total = goodsTotal.value
  if (total > Number(props.categoryThreshold) || 0) return 'category'
  if (total > Number(props.windowedThreshold) || 0) return 'windowed'
  return 'all'
})

const categoryMode = computed((): boolean => {
  return effectiveRenderMode.value === 'category'
})

const windowedMode = computed((): boolean => {
  return effectiveRenderMode.value === 'windowed'
})

const activeCategory = computed((): LingyunOrderCategory | null => {
  const list = props.categories || []
  return list.find((category) => category.key === activeKey.value) || list[0] || null
})

/** windowed：当前已展开的分类数量；点击靠后的分类会自动展开到目标 */
const renderedCount = computed((): number => {
  const length = props.categories.length
  if (!windowedMode.value) return length
  const size = Math.max(1, Number(props.windowSize) || 1)
  const activeIndex = props.categories.findIndex(
    (category) => category.key === activeKey.value,
  )
  const activeNeed = activeIndex >= 0 ? activeIndex + size : 0
  return Math.min(
    length,
    Math.max(Number(renderUntil.value) || 0, activeNeed, size),
  )
})

/** 默认渲染全部分类；按分类加载时只渲染当前分类；windowed 按分类分段渲染 */
const visibleCategories = computed((): LingyunOrderCategory[] => {
  if (categoryMode.value) {
    if (props.categoryLoading) return []
    return activeCategory.value ? [activeCategory.value] : []
  }
  if (!windowedMode.value) return props.categories
  return props.categories.slice(0, renderedCount.value)
})

const hasVisibleGoods = computed((): boolean => {
  return visibleCategories.value.some(
    (category) => (category.goods || []).length > 0,
  )
})

/** 分类还没到：整块下方只留空态。搜索中、按分类加载中不算空 */
const catalogEmpty = computed((): boolean => {
  if (searchActive.value) return false
  if (categoryMode.value && props.categoryLoading) return false
  return !(props.categories || []).length
})

const searchKeyword = computed((): string => {
  return String(searchText.value || '').trim().toLowerCase()
})

/** 搜索结果按原分类分组，保留原始 categoryKey 供规格 / 快照使用 */
const searchCategories = computed((): LingyunOrderCategory[] => {
  const keyword = searchKeyword.value
  if (!keyword) return []
  const result: LingyunOrderCategory[] = []
  props.categories.forEach((category) => {
    const goods = (category.goods || []).filter((item) => {
      const specTexts = (item.specs || []).map((spec) => spec.text)
      const attributeTexts = (item.attributeGroups || []).reduce<string[]>(
        (texts, group) => [
          ...texts,
          group.title,
          ...(group.options || []).map((option) => option.text),
        ],
        [],
      )
      const haystack = [
        item.name,
        item.specText,
        ...(item.details || []),
        ...specTexts,
        ...attributeTexts,
        category.text,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
    if (goods.length) result.push({ ...category, goods })
  })
  return result
})

const searchResultCount = computed((): number => {
  return searchCategories.value.reduce(
    (sum, category) => sum + (category.goods || []).length,
    0,
  )
})

const displayCategories = computed((): LingyunOrderCategory[] => {
  return searchActive.value ? searchCategories.value : visibleCategories.value
})

const searchTopId = computed((): string => {
  return `${uid}-search-top`
})

/** 购物车详情内容版本：行 key / 数量 / 选择变化会触发重新测高 */
const cartVersion = computed((): string => {
  return cartLines.value
    .map(
      (line) =>
        `${line.key}:${line.quantity}:${cartLineSelections(line).join('/')}`,
    )
    .join('|')
})

/** 商品详情 Sheet 在 body 端会脱离页面变量作用域，用行内变量带上主色 */
const goodsDetailAccentStyle = computed((): Record<string, string> => {
  return {
    '--ly-og-detail-accent': props.accentColor || FALLBACK_ACCENT,
  }
})

/** 移动端头图延伸到 Sheet 顶部；宽屏改为左右布局，不再穿透顶栏 */
const goodsDetailBleedTop = computed((): boolean => {
  return windowWidth.value > 0 && windowWidth.value < 690
})

const goodsDetailWide = computed((): boolean => {
  return windowWidth.value >= 690
})

/** 详情图集：优先 images，没有时回退到单张 image */
const goodsDetailImages = computed((): string[] => {
  const item = goodsDetailItem.value
  if (!item) return []
  const list = Array.isArray(item.images)
    ? item.images.map((image) => String(image || '')).filter(Boolean)
    : []
  if (list.length) return list
  return item.image ? [String(item.image)] : []
})

const goodsDetailDescriptionLines = computed((): string[] => {
  const item = goodsDetailItem.value
  if (!item) return []
  const raw = String(item.description || '').trim()
  const lines = raw
    ? raw.split(/\r?\n/)
    : (item.details || []).map((line) => String(line))
  const filtered = lines.map((line) => line.trim()).filter(Boolean)
  return filtered.length ? filtered : ['暂无更多商品介绍']
})

/** 详情当前商品数量，与外面列表共用购物车 */
const goodsDetailQuantity = computed((): number => {
  const item = goodsDetailItem.value
  return item ? quantityOf(item) : 0
})

/** 已加购的普通商品在详情底部显示步进器；规格 / 属性商品打开选择 Sheet */
const goodsDetailShowStepper = computed((): boolean => {
  const item = goodsDetailItem.value
  return (
    !!item &&
    !isItemSoldOut(item) &&
    !item.multiSpec &&
    !isVariantItem(item) &&
    goodsDetailQuantity.value > 0
  )
})

const goodsDetailAddLabel = computed((): string => {
  const item = goodsDetailItem.value
  if (!item) return props.addToCartText
  if (isItemSoldOut(item)) return props.soldOutText
  if (hasSpecs(item)) return props.specButtonText
  if (hasAttributes(item)) return props.attributeButtonText
  if (item.multiSpec) return props.specButtonText
  return props.addToCartText
})

function setQuantity(item: LingyunOrderGoods, value: unknown): void {
  if (isItemSoldOut(item) || isVariantItem(item)) return
  const raw = Number(value)
  const safe = Number.isFinite(raw) ? Math.floor(raw) : 0
  const quantity = Math.max(0, Math.min(itemMax(item), safe))
  if (quantity === quantityOf(item)) return
  const cart: LingyunOrderCart = { ...cartMap.value }
  if (quantity > 0) {
    cart[item.key] = quantity
    cartSnapshots.value[item.key] = {
      item: { ...item },
      categoryKey: categoryKeyOf(item),
    }
  } else {
    delete cart[item.key]
    delete cartSnapshots.value[item.key]
  }
  emit('update:modelValue', cart)
  const payload: LingyunOrderChangePayload = {
    item,
    quantity,
    cart,
    count: countOf(cart),
    totalPrice: totalOf(cart),
    key: item.key,
  }
  emit('change', payload)
}

/** 打开规格 / 属性选择 Sheet（页面专用子组件） */
function openVariantSheet(item: LingyunOrderGoods, categoryKey: string): void {
  if (isItemSoldOut(item)) return
  variantItem.value = { ...item }
  variantCategoryKey.value = categoryKey
  variantOpen.value = true
}

/** 规格 / 属性行的统一写回：更新 cart、快照并抛事件 */
function applyLineQuantity(payload: VariantQuantityPayload): void {
  const item = payload.item
  const key = payload.key
  if (!item || !key) return
  const raw = Math.floor(Number(payload.quantity))
  if (!Number.isFinite(raw)) return
  const spec = payload.spec
  const specMax = Number(spec?.max)
  const base =
    Number.isFinite(specMax) && specMax > 0
      ? Math.floor(specMax)
      : itemMax(item)
  let limit = base
  let stock: number | null = null
  if (spec) stock = finiteStock(spec.stock)
  else if (!hasSpecs(item)) stock = finiteStock(item.stock)
  if (stock != null) {
    const parsed = parseLineKey(key)
    let usedOther = 0
    Object.keys(cartMap.value).forEach((otherKey) => {
      if (otherKey === key) return
      const otherQuantity = Math.floor(Number(cartMap.value[otherKey]))
      if (!Number.isFinite(otherQuantity) || otherQuantity <= 0) return
      const otherParsed = parseLineKey(otherKey)
      if (otherParsed.itemKey !== parsed.itemKey) return
      if (spec) {
        if (otherParsed.specKey !== spec.key) return
      } else if (otherParsed.specKey) {
        return
      }
      usedOther += otherQuantity
    })
    limit = Math.min(base, Math.max(0, stock - usedOther))
    const currentQuantity = quantityOfKey(key)
    if (currentQuantity > limit) limit = currentQuantity
  }
  const quantity = Math.max(0, Math.min(limit, raw))
  if (quantity === quantityOfKey(key)) return
  const cart: LingyunOrderCart = { ...cartMap.value }
  if (quantity > 0) {
    cart[key] = quantity
    cartSnapshots.value[key] = {
      item: { ...item },
      categoryKey: payload.categoryKey || categoryKeyOf(item),
    }
  } else {
    delete cart[key]
    delete cartSnapshots.value[key]
  }
  emit('update:modelValue', cart)
  const change: LingyunOrderChangePayload = {
    item,
    quantity,
    cart,
    count: countOf(cart),
    totalPrice: totalOf(cart),
    key,
    spec: payload.spec,
    attributes: payload.attributes || [],
  }
  emit('change', change)
}

function onVariantQuantityChange(payload: VariantQuantityPayload): void {
  applyLineQuantity({
    ...payload,
    categoryKey: variantCategoryKey.value,
  })
}

/** 购物车详情里直接调整某一行的数量 */
function onCartLineQuantity(line: LingyunOrderCartLine, value: unknown): void {
  applyLineQuantity({
    item: line.item,
    key: line.key,
    quantity: Number(value),
    spec: line.spec,
    attributes: line.attributes || [],
    categoryKey: line.categoryKey,
  })
}

function onPlus(item: LingyunOrderGoods, category: LingyunOrderCategory): void {
  if (isItemSoldOut(item)) return
  if (item.multiSpec) {
    const payload: LingyunOrderSpecPayload = { item, categoryKey: category.key }
    emit('spec-request', payload)
    return
  }
  if (isVariantItem(item)) {
    openVariantSheet(item, category.key)
    return
  }
  setQuantity(item, quantityOf(item) + itemStep(item))
}

function onItemQuantity(item: LingyunOrderGoods, value: unknown): void {
  setQuantity(item, value)
}

function onGoodsClick(item: LingyunOrderGoods, category: LingyunOrderCategory): void {
  goodsDetailItem.value = { ...item }
  goodsDetailCategoryKey.value = category.key
  goodsDetailImageIndex.value = 0
  if (props.goodsDetail) goodsDetailOpen.value = true
  const payload: LingyunOrderGoodsClickPayload = { item, categoryKey: category.key }
  emit('goods-click', payload)
}

function resetSearchListScroll(): void {
  if (!searchActive.value) return
  listIntoId.value = ''
  nextTick(() => {
    listIntoId.value = searchTopId.value
  })
}

/** 工具栏搜索开关：搜索时切到搜索结果视图，关闭后回到列表 */
function onSearchingUpdate(value: boolean): void {
  const active = !!value
  if (active === searchActive.value) return
  searchActive.value = active
  if (active) {
    searchText.value = ''
    resetSearchListScroll()
    emit('search', { value: '', count: 0 })
    return
  }
  searchText.value = ''
  listIntoId.value = ''
  const category = activeCategory.value
  if (category) {
    nextTick(() => {
      listIntoId.value = sectionIdOf(category)
    })
  }
}

function onSearchValueUpdate(value: unknown): void {
  const text = String(value == null ? '' : value)
  if (text === searchText.value) return
  searchText.value = text
  emit('search', { value: text, count: searchResultCount.value })
  resetSearchListScroll()
}

/** 商品详情缩略图切换大图 */
function selectGoodsDetailImage(index: number): void {
  const safe = Math.floor(Number(index))
  if (!Number.isFinite(safe)) return
  if (safe < 0 || safe >= goodsDetailImages.value.length) return
  goodsDetailImageIndex.value = safe
}

/** 缩略图横向列表平滑滚到当前项 */
function syncDetailThumbInto(): void {
  const index = Math.max(0, Math.floor(Number(goodsDetailImageIndex.value) || 0))
  detailThumbInto.value = ''
  nextTick(() => {
    detailThumbInto.value = detailThumbIdOf(index)
  })
}

/** 商品详情内加购：规格 / 属性商品先收起详情再打开选择 Sheet */
function addFromGoodsDetail(): void {
  const item = goodsDetailItem.value
  if (!item || isItemSoldOut(item)) return
  if (item.multiSpec) {
    const payload: LingyunOrderSpecPayload = {
      item,
      categoryKey: goodsDetailCategoryKey.value,
    }
    goodsDetailOpen.value = false
    emit('spec-request', payload)
    return
  }
  if (isVariantItem(item)) {
    const categoryKey = goodsDetailCategoryKey.value
    goodsDetailOpen.value = false
    openVariantSheet(item, categoryKey)
    return
  }
  setQuantity(item, quantityOf(item) + itemStep(item))
}

function clearCart(): void {
  const cart: LingyunOrderCart = {}
  emit('update:modelValue', cart)
  emit('cart-clear', { cart, count: 0, totalPrice: 0 })
}

function onCartDetailOpen(): void {
  cartDetailOpen.value = true
}

function onCartDetailClose(): void {
  cartDetailOpen.value = false
}

function onCheckout(): void {
  const payload: LingyunOrderCheckoutPayload = {
    cart: { ...cartMap.value },
    lines: cartLines.value,
    count: cartCount.value,
    totalPrice: cartTotal.value,
    deliveryFee: props.deliveryFee,
  }
  emit('checkout', payload)
}

/** 按分类加载：切分类后右侧回到顶部 */
function resetListScroll(): void {
  const category = activeCategory.value
  if (!category) return
  const target = sectionIdOf(category)
  listIntoId.value = ''
  nextTick(() => {
    listIntoId.value = target
  })
}

/** 点击分类时文字做一次轻微回弹，和 tabbar 选中反馈一致 */
function pulseRail(key: string): void {
  clearTimeout(pulseTimer ?? undefined)
  railPulseKey.value = ''
  nextTick(() => {
    railPulseKey.value = key
    pulseTimer = setTimeout(() => {
      railPulseKey.value = ''
      pulseTimer = null
    }, 360)
  })
}

/** 左侧选中背景：测量当前分类位置，切换时滑动过去 */
function syncRailIndicator(animate = true): void {
  if (!activeKey.value) return
  nextTick(() => {
    try {
      const query = uni.createSelectorQuery().in(instance?.proxy as never)
      query.select('.lingyun-order-goods__rail-inner').boundingClientRect()
      query.select(`#${railIdOfKey(activeKey.value)}`).boundingClientRect()
      query.exec((res) => {
        const inner = res && res[0]
        const item = res && res[1]
        if (!inner || !item || !item.height) return
        railIndicatorTop.value = Number(item.top) - Number(inner.top)
        railIndicatorHeight.value = Number(item.height)
        if (!railIndicatorVisible.value) {
          railIndicatorVisible.value = true
          railIndicatorReady.value = false
          nextTick(() => {
            setTimeout(() => {
              railIndicatorReady.value = true
            }, 20)
          })
          return
        }
        if (!animate) {
          railIndicatorReady.value = false
          nextTick(() => {
            setTimeout(() => {
              railIndicatorReady.value = true
            }, 20)
          })
        }
      })
    } catch {
      /* 初始未布局时测不到，等下一次切换再测 */
    }
  })
}

function reportPageScroll(top: number): void {
  if (typeof reportScroll === 'function') reportScroll(top)
}

function applyActive(
  category: LingyunOrderCategory,
  index: number,
  emitEvent: boolean,
): void {
  if (!category || category.key === activeKey.value) return
  activeKey.value = category.key
  railIntoId.value = railIdOf(category)
  if (emitEvent) {
    const payload: LingyunOrderCategoryChangePayload = {
      key: category.key,
      index,
    }
    emit('category-change', payload)
  }
}

function syncActiveFromScroll(top: number): void {
  const tops = sectionTops.value
  if (!tops.length) return
  let index = 0
  for (let i = 0; i < tops.length; i += 1) {
    if (tops[i] <= top + 8) index = i
    else break
  }
  const category = props.categories[index]
  if (!category || category.key === activeKey.value) return
  applyActive(category, index, true)
}

function onListScroll(event: ScrollEvent): void {
  const top = Number(event && event.detail && event.detail.scrollTop)
  if (!Number.isFinite(top) || top < 0) return
  reportPageScroll(top)
  if (searchActive.value || categoryMode.value) return
  listScrollTop.value = top
  if (!offsetsReady.value || Date.now() < spyLockedUntil.value) return
  syncActiveFromScroll(top)
}

function onListScrollUpper(): void {
  reportPageScroll(0)
}

function measureSections(): void {
  if (searchActive.value || categoryMode.value || !props.categories.length) return
  const categories = visibleCategories.value
  nextTick(() => {
    try {
      const query = uni.createSelectorQuery().in(instance?.proxy as never)
      query.select('.lingyun-order-goods__list').boundingClientRect()
      categories.forEach((category) => {
        query.select(`#${sectionIdOf(category)}`).boundingClientRect()
      })
      query.exec((result) => {
        const list = result && result[0]
        if (!list || typeof list.top !== 'number') {
          offsetsReady.value = false
          return
        }
        const tops: number[] = []
        for (let i = 0; i < categories.length; i += 1) {
          const rect = result[i + 1]
          tops.push(
            rect
              ? Math.max(0, Number(rect.top) - Number(list.top) + listScrollTop.value)
              : 0,
          )
        }
        sectionTops.value = tops
        offsetsReady.value = true
      })
    } catch {
      offsetsReady.value = false
    }
  })
}

function scheduleMeasure(): void {
  if (categoryMode.value) return
  clearTimeout(measureTimer ?? undefined)
  measureTimer = setTimeout(() => {
    measureTimer = null
    measureSections()
  }, 90)
}

function onListScrollToLower(): void {
  if (searchActive.value || categoryMode.value || !windowedMode.value) return
  const size = Math.max(1, Number(props.windowSize) || 1)
  const next = Math.min(props.categories.length, renderedCount.value + size)
  if (next <= renderedCount.value) return
  renderUntil.value = next
  nextTick(() => {
    scheduleMeasure()
    setTimeout(() => measureSections(), 60)
  })
}

/** 按商品列表实际宽度决定列数：每列至少约 300px，最多 4 列 */
function syncListColumns(): void {
  if (!wideLayout.value) {
    listColumns.value = 1
    return
  }
  nextTick(() => {
    try {
      const query = uni.createSelectorQuery().in(instance?.proxy as never)
      query.select('.lingyun-order-goods__list').boundingClientRect()
      query.exec((result) => {
        const rect = result && result[0]
        const width = Number(rect && rect.width)
        if (!Number.isFinite(width) || width <= 0) return
        const gap = 10
        const minColumn = 300
        /* 列表内边距左右各 12，列间距按 margin 计算 */
        const inner = Math.max(0, width - 24)
        let columns = Math.floor((inner + gap) / (minColumn + gap))
        columns = Math.max(1, Math.min(4, columns))
        if (columns === listColumns.value) return
        listColumns.value = columns
        /* 列数变化会大幅改变分组高度，重新测滚动联动位置 */
        offsetsReady.value = false
        scheduleMeasure()
        setTimeout(() => measureSections(), 80)
      })
    } catch {
      /* 初始未布局时测不到，等 resize / 搜索切换再测 */
    }
  })
}

function scheduleListColumns(): void {
  clearTimeout(columnsTimer ?? undefined)
  columnsTimer = setTimeout(() => {
    columnsTimer = null
    syncListColumns()
  }, 120)
}

function selectCategory(category: LingyunOrderCategory, index: number): void {
  applyActive(category, index, true)
  pulseRail(category.key)
  if (categoryMode.value) {
    resetListScroll()
    return
  }
  const target = sectionIdOf(category)
  /* 同一个分类重复点击也要能回到顶部：先清空再下一帧写入 */
  listIntoId.value = ''
  nextTick(() => {
    listIntoId.value = target
  })
  spyLockedUntil.value = Date.now() + 460
  if (windowedMode.value) {
    nextTick(() => {
      scheduleMeasure()
      setTimeout(() => measureSections(), 80)
    })
  }
}

function bindCartResize(): void {
  if (onWindowResize) return
  const handler = () => {
    syncSafeBottom()
    scheduleListColumns()
  }
  onWindowResize = handler
  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
  } catch {
    /* 端不支持 */
  }
}

function unbindCartResize(): void {
  const handler = onWindowResize
  try {
    if (handler && typeof uni.offWindowResize === 'function') {
      uni.offWindowResize(handler)
    }
  } catch {
    /* 端不支持 */
  }
  onWindowResize = null
}

watch(windowWidth, () => {
  scheduleListColumns()
})

watch(searchActive, () => {
  /* 搜索态隐藏分类栏，列表宽度变化，重新分列 */
  nextTick(() => scheduleListColumns())
})

watch(
  () => props.categories,
  () => {
    initActive()
    syncCartSnapshots()
    scheduleMeasure()
    syncRailIndicator(false)
  },
  { immediate: true, deep: true },
)

watch(
  () => props.modelValue,
  () => {
    syncCartSnapshots()
  },
  { deep: true },
)

watch(activeKey, (key: string) => {
  if (key) railIntoId.value = railIdOfKey(key)
  syncRailIndicator(true)
  if (categoryMode.value) resetListScroll()
})

watch(categoryMode, (value: boolean) => {
  if (value) {
    offsetsReady.value = false
    resetListScroll()
    return
  }
  scheduleMeasure()
  setTimeout(() => measureSections(), 120)
})

watch(windowedMode, (value: boolean) => {
  if (value) {
    renderUntil.value = Math.max(
      renderUntil.value,
      Math.max(1, Number(props.windowSize) || 1),
    )
  }
  nextTick(() => {
    scheduleMeasure()
    setTimeout(() => measureSections(), 80)
  })
})

watch(goodsDetailImageIndex, () => {
  if (goodsDetailOpen.value) syncDetailThumbInto()
})

watch(goodsDetailOpen, (value: boolean) => {
  if (!value) {
    detailThumbInto.value = ''
    return
  }
  nextTick(() => {
    setTimeout(() => syncDetailThumbInto(), 120)
  })
})

onMounted(() => {
  initActive()
  syncSafeBottom()
  bindCartResize()
  scheduleMeasure()
  scheduleListColumns()
  syncRailIndicator(false)
  setTimeout(() => syncRailIndicator(false), 160)
  spyTimers = [120, 420].map((delay) =>
    setTimeout(() => measureSections(), delay),
  )
})

onBeforeUnmount(() => {
  clearTimeout(pulseTimer ?? undefined)
  clearTimeout(measureTimer ?? undefined)
  clearTimeout(columnsTimer ?? undefined)
  spyTimers.forEach((timer) => clearTimeout(timer))
  unbindCartResize()
  pulseTimer = null
  measureTimer = null
  columnsTimer = null
  spyTimers = []
})
</script>

<style lang="scss">
@import '../../../lingyun-ui/styles/variables.scss';

.lingyun-order-goods {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

/*
 * 小程序 page 默认高度由内容撑开，height: 100% 链会断掉，
 * 导致内部 scroll-view 高度等于内容高度而无法滚动，这里直接吃满视口。
 */
/* #ifdef MP */
.lingyun-order-goods {
  height: 100vh;
  min-height: 100vh;
}
/* #endif */

/* ---------- 店铺头 ---------- */

.lingyun-order-goods__header {
  flex-shrink: 0;
}

.lingyun-order-goods__banner {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.lingyun-order-goods__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-order-goods__banner-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(128deg, rgba(0, 136, 255, 0.3), rgba(94, 92, 230, 0.2));
}

/* 工具栏透明垫在 Banner 上时，顶部用主题色渐隐托住标题与按钮 */
.lingyun-order-goods__toolbar-scrim {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: calc(var(--lingyun-app-page-bar, 60px) + 40px);
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.78) 0%,
    rgba(255, 255, 255, 0.42) 48%,
    rgba(255, 255, 255, 0) 100%
  );
}

.lingyun-order-goods__toolbar-scrim.theme-dark {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.26) 48%,
    rgba(0, 0, 0, 0) 100%
  );
}

.lingyun-order-goods__back {
  position: absolute;
  top: 8px;
  left: 16px;
  width: 44px;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @include lingyun-glass-control;
}

/* 没有 Banner 时给返回钮一条与工具栏同高的顶行 */
.lingyun-order-goods__back-row {
  height: 60px;
  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__back-row .lingyun-order-goods__back {
  position: static;
}

.lingyun-order-goods__back--hover {
  transform: scale(0.94);
}

.lingyun-order-goods__banner-actions {
  position: absolute;
  top: 8px;
  right: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lingyun-order-goods__store {
  position: relative;
  margin: 0 12px;
  padding: 14px 14px 12px;
  box-sizing: border-box;
  border-radius: 18px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.lingyun-order-goods__store--attached {
  margin-top: -28px;
}

.lingyun-order-goods--no-banner .lingyun-order-goods__store {
  margin-top: 12px;
}

.lingyun-order-goods__store-head {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__logo {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__logo-img {
  width: 52px;
  height: 52px;
  display: block;
}

.lingyun-order-goods__logo-text {
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__store-main {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
}

.lingyun-order-goods__store-name {
  display: block;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__store-meta {
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.lingyun-order-goods__rating {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__rating-text {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__dot {
  margin: 0 5px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__meta-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__notice {
  margin-top: 10px;
  padding: 6px 8px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-order-goods__notice-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 左右布局 ---------- */

.lingyun-order-goods__body {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.lingyun-order-goods__body--empty {
  align-items: center;
  justify-content: center;
}

/* 搜索视图：隐藏店铺头 / 分类栏，列表占满 */
.lingyun-order-goods__body--search {
  margin-top: 0;
}

.lingyun-order-goods__search-summary {
  padding: 16px 2px 6px;
}

.lingyun-order-goods__search-summary-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__rail {
  flex-shrink: 0;
  width: 88px;
  height: 100%;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-order-goods__rail-inner {
  position: relative;
  padding: 0 0 18px;
  box-sizing: border-box;
}

/* 选中背景：切换分类时上下滑动，形状始终是圆角 */
.lingyun-order-goods__rail-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  border-radius: 0 12px 12px 0;
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
  pointer-events: none;
  will-change: top, height;
}

.lingyun-order-goods__rail-indicator--ready {
  transition:
    top 0.32s cubic-bezier(0.32, 1.24, 0.6, 1),
    height 0.32s cubic-bezier(0.32, 1.24, 0.6, 1);
}

.lingyun-order-goods__rail-indicator-bar {
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 18px;
  margin-top: -9px;
  border-radius: 0 2px 2px 0;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods__rail-item {
  position: relative;
  z-index: 1;
  min-height: 54px;
  padding: 8px 8px 8px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 0 12px 12px 0;
  transition: background-color 0.16s ease;
}

.lingyun-order-goods__rail-item--hover {
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-order-goods__rail-content {
  flex: 1;
  min-width: 0;
  /* 图标作为行内元素和文字一起换行，最多两行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: normal;
  line-height: 18px;
}

.lingyun-order-goods__rail-icon {
  display: inline-flex;
  vertical-align: -2px;
  width: 14px;
  height: 14px;
  margin-right: 2px;
  align-items: center;
  justify-content: center;
}

.lingyun-order-goods__rail-icon-image {
  width: 14px;
  height: 14px;
  display: block;
}

.lingyun-order-goods__rail-text {
  display: inline;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  white-space: normal;
}

.lingyun-order-goods__rail-item--active .lingyun-order-goods__rail-text {
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__rail-badge {
  flex-shrink: 0;
  margin-left: 2px;
  display: flex;
  align-items: center;
}

/* 分类已加购数量：右上角数字角标 */
.lingyun-order-goods__rail-cart-badge {
  position: absolute;
  top: 2px;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
}

.lingyun-order-goods__rail-content--pulse {
  animation: lingyun-order-goods-rail-pop 0.34s cubic-bezier(0.32, 0.72, 0, 1);
  transform-origin: left center;
}

@keyframes lingyun-order-goods-rail-pop {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

.lingyun-order-goods__list {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
}

.lingyun-order-goods__list-inner {
  padding: 0 12px;
  box-sizing: border-box;
}

/* ---------- 宽屏：左右两栏悬浮卡片 + 商品多列 ---------- */

.lingyun-order-goods--wide .lingyun-order-goods__body {
  margin-top: 12px;
  padding: 0 12px 12px;
  box-sizing: border-box;
}

.lingyun-order-goods--wide .lingyun-order-goods__body--search {
  margin-top: 0;
  padding-top: 12px;
}

/* 左侧分类栏：独立悬浮卡片，和店铺卡片同圆角 / 投影 */
.lingyun-order-goods--wide .lingyun-order-goods__rail {
  margin-right: 10px;
  border-radius: 18px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

/* 卡片内选中背景左右内缩，四角圆角 */
.lingyun-order-goods--wide .lingyun-order-goods__rail-indicator {
  left: 4px;
  right: 4px;
  border-radius: 12px;
}

/* 卡片内数量角标向内收，避免被卡片圆角和右边缘裁切 */
.lingyun-order-goods--wide .lingyun-order-goods__rail-cart-badge {
  right: 6px;
}

.lingyun-order-goods--wide .lingyun-order-goods__rail-item {
  border-radius: 12px;
}

/* 右侧商品列表：独立悬浮卡片 */
.lingyun-order-goods--wide .lingyun-order-goods__list {
  border-radius: 18px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

/* 多列：分组内自动换行，每件商品是一块独立小卡片 */
.lingyun-order-goods--multi .lingyun-order-goods__section-goods {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -5px;
}

.lingyun-order-goods--multi .lingyun-order-goods__goods {
  margin: 0 5px 10px;
  padding: 12px;
  box-sizing: border-box;
  border-bottom: 0;
  border-radius: 14px;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.theme-dark .lingyun-order-goods--multi .lingyun-order-goods__goods {
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
}

.lingyun-order-goods--cols-2 .lingyun-order-goods__goods {
  width: calc(50% - 10px);
}

.lingyun-order-goods--cols-3 .lingyun-order-goods__goods {
  width: calc(33.3333% - 10px);
}

.lingyun-order-goods--cols-4 .lingyun-order-goods__goods {
  width: calc(25% - 10px);
}

.lingyun-order-goods__section {
  padding-top: 2px;
}

.lingyun-order-goods__section-title {
  display: block;
  padding: 12px 2px 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods {
  display: flex;
  flex-direction: row;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-order-goods__media {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
}

.lingyun-order-goods__media-img {
  width: 76px;
  height: 76px;
  display: block;
}

.lingyun-order-goods__media-empty {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__media-char {
  font-size: 26px;
  font-weight: 600;
  line-height: 30px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__goods-main {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__name-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.lingyun-order-goods__name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lingyun-order-goods__tag {
  flex-shrink: 0;
  margin-left: 6px;
  margin-top: 1px;
}

.lingyun-order-goods__meta {
  margin-top: 3px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__details {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__detail {
  font-size: 12px;
  line-height: 17px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__bottom {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.lingyun-order-goods__price {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-order-goods__currency {
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__amount {
  margin-left: 1px;
  font-size: 19px;
  font-weight: 600;
  line-height: 24px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__price-unit {
  margin-left: 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__original {
  margin-left: 5px;
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-decoration: line-through;
}

.lingyun-order-goods__action {
  flex-shrink: 0;
  height: 30px;
  margin-left: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__plus {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
}

.lingyun-order-goods__plus-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-order-goods__plus-count-text {
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
  color: #ffffff;
}

.lingyun-order-goods__plus--hover {
  transform: scale(0.92);
}

.lingyun-order-goods__spec-btn {
  position: relative;
  height: 28px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
}

.lingyun-order-goods__spec-btn--hover {
  transform: scale(0.94);
}

.lingyun-order-goods__spec-btn-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: #ffffff;
  white-space: nowrap;
}

.lingyun-order-goods__soldout {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-system-orange, #{$lingyun-system-orange});
  white-space: nowrap;
}

.lingyun-order-goods__empty {
  padding: 48px 0;
}

.lingyun-order-goods__list-loading {
  padding: 72px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lingyun-order-goods__list-loading-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__list-pad {
  height: 24px;
}

/* ---------- 悬浮购物车（列表延伸到页面底部，购物车浮在上面） ---------- */

.lingyun-order-goods__rail-pad {
  width: 100%;
}

/* ---------- 购物车详情（lingyun-goods-nav 的 #detail-header / #detail 插槽） ---------- */

.lingyun-order-goods__cart-head {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lingyun-order-goods__cart-head-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-order-goods__cart-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__cart-count {
  margin-left: 8px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__clear {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
}

.lingyun-order-goods__clear--hover {
  opacity: 0.6;
}

.lingyun-order-goods__clear-text {
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__cart-sheet {
  padding: 0 16px;
  box-sizing: border-box;
}

.lingyun-order-goods__cart-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-order-goods__cart-media {
  width: 56px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.lingyun-order-goods__cart-media-img {
  width: 56px;
  height: 42px;
  display: block;
}

.lingyun-order-goods__cart-media-empty {
  width: 56px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__cart-line-main {
  flex: 1;
  min-width: 0;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__cart-line-name {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__cart-line-options {
  margin-top: 2px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__cart-line-option {
  display: block;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  word-break: break-all;
}

.lingyun-order-goods__cart-line-price {
  margin-top: 3px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-order-goods__cart-line-amount {
  margin-left: 1px;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__sheet-pad {
  height: 16px;
}

/* ---------- 商品详情（大模式 Sheet） ---------- */

.lingyun-order-goods__goods-detail {
  /* 抵消 sheets body 的 8 / 16 内边距，让头图铺满整宽 */
  margin: -8px -16px 0;
  box-sizing: border-box;
}

/* 移动端头图穿透顶栏：body 顶部内边距为 0，不再上提 */
.lingyun-order-goods__goods-detail--bleed-top {
  margin-top: 0;
}

/* 4:3 头图：内层按自身宽度撑出 75%，宽屏左列固定宽度时也保持 4:3 */
.lingyun-order-goods__goods-detail-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* 多图：大图下方缩略图居中排列，底为 Sheet 背景，不再出现灰条 */
.lingyun-order-goods__goods-detail-thumbs {
  width: 100%;
  height: 42px;
  margin-top: 8px;
  box-sizing: border-box;
  white-space: nowrap;
}

.lingyun-order-goods__goods-detail-thumbs-inner {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  min-width: 100%;
  gap: 8px;
}

.lingyun-order-goods__goods-detail-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 42px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.72;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  transition:
    border-color 0.24s ease,
    opacity 0.24s ease;
}

.lingyun-order-goods__goods-detail-thumb--active {
  border-color: var(--ly-og-detail-accent, #{$lingyun-system-blue});
  opacity: 1;
}

.lingyun-order-goods__goods-detail-thumb-image {
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-order-goods__goods-detail-ratio {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 75%;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__goods-detail-image-empty {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-order-goods__goods-detail-char {
  font-size: 64px;
  font-weight: 600;
  line-height: 72px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__goods-detail-info {
  padding: 16px 16px 0;
  box-sizing: border-box;
}

.lingyun-order-goods__goods-detail-intro {
  padding: 0 16px;
  box-sizing: border-box;
}

.lingyun-order-goods__goods-detail-intro-title {
  display: block;
  margin-top: 22px;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__goods-detail-intro-scroll {
  width: 100%;
  box-sizing: border-box;
}

/* 底部操作区：加入购物车固定在 Sheet 底部，移动端 / 宽屏一致 */
.lingyun-order-goods__goods-detail-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  padding: 12px 16px;
  box-sizing: border-box;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 宽屏：左侧图片 + 图下商品介绍，右侧信息列；图片列固定 42% */
@media (min-width: 690px) {
  .lingyun-order-goods__goods-detail {
    height: 100%;
    display: grid;
    grid-template-columns: 42% minmax(0, 1fr);
    grid-template-areas:
      'hero info'
      'intro info';
    grid-template-rows: auto minmax(0, 1fr);
    align-items: stretch;
    /* 与右侧文字对齐：图片左距 = 右侧文字右距 = 32（body 16 + 这里 16） */
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;
    padding-left: 16px;
    box-sizing: border-box;
  }

  .lingyun-order-goods__goods-detail-hero {
    grid-area: hero;
    width: 100%;
  }

  .lingyun-order-goods__goods-detail-info {
    grid-area: info;
    min-width: 0;
    padding: 28px 16px 8px 32px;
  }

  .lingyun-order-goods__goods-detail-intro {
    grid-area: intro;
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* 与上方图片同宽：左右都不再内缩；高度自动填满剩余空间 */
    padding: 0;
    overflow: hidden;
  }

  .lingyun-order-goods__goods-detail-intro-title {
    flex-shrink: 0;
    margin-top: 22px;
  }

  .lingyun-order-goods__goods-detail-intro-scroll {
    flex: 1;
    height: 0;
    min-height: 0;
  }
}

.lingyun-order-goods__goods-detail-price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.lingyun-order-goods__goods-detail-price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  min-width: 0;
}

.lingyun-order-goods__goods-detail-currency {
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__goods-detail-amount {
  margin-left: 2px;
  font-size: 28px;
  font-weight: 700;
  line-height: 34px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__goods-detail-unit {
  margin-left: 2px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods-detail-original {
  margin-left: 6px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-decoration: line-through;
}

.lingyun-order-goods__goods-detail-price-spec {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods-detail-sales {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods-detail-name-row {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.lingyun-order-goods__goods-detail-name-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.lingyun-order-goods__goods-detail-name {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__goods-detail-badge {
  flex-shrink: 0;
}

.lingyun-order-goods__goods-detail-add {
  position: relative;
  flex-shrink: 0;
  height: 40px;
  min-width: 112px;
  padding: 0 18px;
  box-sizing: border-box;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-detail-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods__goods-detail-add--hover {
  transform: scale(0.97);
}

.lingyun-order-goods__goods-detail-add--disabled {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__goods-detail-add-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #ffffff;
  white-space: nowrap;
}

.lingyun-order-goods__goods-detail-add--disabled .lingyun-order-goods__goods-detail-add-text {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__goods-detail-desc {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods-detail-pad {
  height: 32px;
}

/* 深色模式下加购钮阴影弱一些 */
.theme-dark .lingyun-order-goods__plus {
  box-shadow: none;
}
</style>

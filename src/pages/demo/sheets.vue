<template>
  <lingyun-app-page title="Sheets">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Sheets</text>
        <text class="hero__desc">lingyun-sheets · Sketch Sheets · iPhone</text>
      </view>

      <lingyun-section title="Present" hint="固定档位；Grabber 下滑关闭；宽屏自动居中卡片">
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="glass"
            size="large"
            block
            text="Open Medium"
            @click="openMedium"
          />
          <lingyun-button
            variant="borderedProminent"
            size="large"
            block
            text="Open Large"
            @click="openLarge"
          />
        </view>
        <view class="mask-row">
          <view class="mask-row__text">
            <text class="mask-row__label">点遮罩关闭</text>
            <text class="mask-row__hint">maskClosable · 关闭后点遮罩抖动 + 震动；仍可点关闭钮或下滑收起</text>
          </view>
          <lingyun-switch v-model="maskClosable" />
        </view>
      </lingyun-section>

      <lingyun-section title="Toolbar actions" hint="右侧支持自定义插槽，也支持内置 icon / icon + 文字">
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="圆钮 · Close + Title + Share"
            @click="openCircleActions"
          />
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="文字 · Cancel + Title + Done"
            @click="openTextActions"
          />
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="内置 · Icon + 文字"
            @click="openTrailing(true)"
          />
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="内置 · 仅 Icon"
            @click="openTrailing(false)"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Wide size" hint="宽屏（≥690）居中卡片尺寸；窄屏仍按 detent">
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="宽屏 · 520 × 420"
            @click="openWide(520, 420)"
          />
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="宽屏 · 720 × 560"
            @click="openWide(720, 560)"
          />
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="宽屏 · 默认上限"
            @click="openWide(0, 0)"
          />
        </view>
      </lingyun-section>

      <lingyun-section
        title="Portal"
        hint="组件写在 section（overflow: hidden）内，浮层仍须盖满视口"
        is-last
      >
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="bordered"
            size="large"
            block
            text="从 section 内打开"
            @click="nestedOpen = true"
          />
          <lingyun-sheets v-model:show="nestedOpen" title="Nested" detent="medium">
            <view class="sheet-block">
              <text class="sheet-block__title">section 内挂载</text>
              <text class="sheet-block__desc">
                本组件实例写在 lingyun-section 内部。H5 走 Teleport → body、微信小程序走 root-portal，
                因此不会被卡片的 overflow 裁切。
              </text>
            </view>
          </lingyun-sheets>
        </view>
      </lingyun-section>
    </view>

    <lingyun-sheets
      v-model:show="sheetOpen"
      :title="sheetTitle"
      :detent="sheetDetent"
      :show-close="sheetShowClose"
      :show-trailing="sheetShowTrailing"
      :mask-closable="maskClosable"
      :trailing-icon="sheetTrailingIcon"
      :trailing-text="sheetTrailingText"
      :width="sheetWidth"
      :height="sheetHeight"
      @close="onSheetClose"
      @trailing="onSheetTrailing"
    >
      <template v-if="sheetChrome === 'text'" #leading>
        <lingyun-button
          variant="borderless"
          size="mini"
          text="Cancel"
          @click="onSheetCancel"
        />
      </template>

      <template v-if="sheetChrome === 'text'" #trailing>
        <lingyun-button
          variant="borderless"
          size="mini"
          text="Done"
          @click="onSheetDone"
        />
      </template>

      <view class="sheet-block">
        <text class="sheet-block__title">Sheet content</text>
        <text class="sheet-block__desc">
          Detent：{{ sheetDetent }}。
          <text v-if="sheetTrailingIcon">顶栏右侧：内置 {{ sheetTrailingText ? 'icon + ' + sheetTrailingText : '仅 icon' }} 按钮。</text>
          <text v-if="sheetWidth || sheetHeight">宽屏卡片：{{ sheetWidth }} × {{ sheetHeight }} px（≥690 生效）。</text>
          <text v-if="sheetChrome === 'circle'">顶栏：左 Close 圆钮、中 Title、右 Share 圆钮。</text>
          <text v-else-if="sheetChrome === 'text'">顶栏：左 Cancel、中 Title、右 Done。</text>
          <text v-else>Medium 为四周内缩 8 的悬浮玻璃卡片；Large 贴边贴底、顶角 38 且不透明。</text>
          宽屏（iPad / 桌面）收成居中卡片，默认 ≤936×770（可用 width / height 调整），四角 32，不出 Grabber。
          点遮罩{{ maskClosable ? '关闭' : '不关闭' }}；可在 Grabber / 顶栏区向下滑关闭。
        </text>
        <view class="sheet-block__actions">
          <lingyun-button
            variant="bordered"
            size="medium"
            block
            :text="sheetDetent === 'medium' ? '切换到 Large' : '切换到 Medium'"
            @click="toggleDetent"
          />
        </view>
      </view>
    </lingyun-sheets>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  type SheetChrome = 'none' | 'circle' | 'text'

  const sheetOpen = ref(false)
  const sheetDetent = ref<'medium' | 'large'>('medium')
  const sheetTitle = ref('Sheet')
  const sheetChrome = ref<SheetChrome>('none')
  const sheetShowClose = ref(true)
  const sheetShowTrailing = ref(false)
  const nestedOpen = ref(false)
  const maskClosable = ref(true)
  const sheetTrailingIcon = ref('')
  const sheetTrailingText = ref('')
  const sheetWidth = ref(0)
  const sheetHeight = ref(0)

  function resetTrailing(): void {
    sheetTrailingIcon.value = ''
    sheetTrailingText.value = ''
  }

  function resetSheetSize(): void {
    sheetWidth.value = 0
    sheetHeight.value = 0
  }

  function openMedium(): void {
    resetTrailing()
    resetSheetSize()
    sheetDetent.value = 'medium'
    sheetTitle.value = 'Medium'
    sheetChrome.value = 'none'
    sheetShowClose.value = true
    sheetShowTrailing.value = false
    sheetOpen.value = true
  }

  function openLarge(): void {
    resetTrailing()
    resetSheetSize()
    sheetDetent.value = 'large'
    sheetTitle.value = 'Large'
    sheetChrome.value = 'none'
    sheetShowClose.value = true
    sheetShowTrailing.value = false
    sheetOpen.value = true
  }

  function openCircleActions(): void {
    resetTrailing()
    resetSheetSize()
    sheetDetent.value = 'medium'
    sheetTitle.value = 'Title'
    sheetChrome.value = 'circle'
    sheetShowClose.value = true
    sheetShowTrailing.value = true
    sheetOpen.value = true
  }

  function openTextActions(): void {
    resetTrailing()
    resetSheetSize()
    sheetDetent.value = 'medium'
    sheetTitle.value = 'Title'
    sheetChrome.value = 'text'
    sheetShowClose.value = false
    sheetShowTrailing.value = false
    sheetOpen.value = true
  }

  /** 内置 trailing：icon + 最多 2 字；withText=false 时仅 icon */
  function openTrailing(withText: boolean): void {
    resetSheetSize()
    sheetDetent.value = 'medium'
    sheetTitle.value = 'Trailing'
    sheetChrome.value = 'none'
    sheetShowClose.value = true
    sheetShowTrailing.value = false
    sheetTrailingIcon.value = 'upload'
    sheetTrailingText.value = withText ? '分享' : ''
    sheetOpen.value = true
  }

  /** 宽屏卡片尺寸示例；0 表示用默认上限 */
  function openWide(width: number, height: number): void {
    resetTrailing()
    sheetWidth.value = width
    sheetHeight.value = height
    sheetDetent.value = 'medium'
    sheetTitle.value = width && height ? `Wide ${width}×${height}` : 'Wide default'
    sheetChrome.value = 'none'
    sheetShowClose.value = true
    sheetShowTrailing.value = false
    sheetOpen.value = true
  }

  function toggleDetent(): void {
    sheetDetent.value = sheetDetent.value === 'medium' ? 'large' : 'medium'
    if (sheetChrome.value === 'none') {
      sheetTitle.value = sheetDetent.value === 'medium' ? 'Medium' : 'Large'
    }
  }

  function onSheetClose(): void {
    /* v-model 已关 */
  }

  function onSheetTrailing(): void {
    uni.showToast({ title: 'Share', icon: 'none' })
  }

  function onSheetCancel(): void {
    sheetOpen.value = false
  }

  function onSheetDone(): void {
    uni.showToast({ title: 'Done', icon: 'none' })
    sheetOpen.value = false
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .sheet-block {
    margin-bottom: 12px;
  }

  .mask-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 8px 16px;
  }

  .mask-row__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mask-row__label {
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .mask-row__hint {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .sheet-block__title {
    display: block;
    font-size: 17px;
    font-weight: 600;
    color: var(--lingyun-label, #1c1c1e);
  }

  .sheet-block__desc {
    display: block;
    margin-top: 6px;
    font-size: 15px;
    line-height: 22px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .sheet-block__actions {
    margin-top: 16px;
  }
</style>

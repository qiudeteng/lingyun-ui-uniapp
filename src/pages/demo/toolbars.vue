<template>
  <lingyun-app-page title="Toolbars">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Toolbars</text>
        <text class="hero__desc">lingyun-toolbars · 窄屏 iPhone 60；宽屏 iPad 54；Mac 显示窗口按钮</text>
      </view>

      <lingyun-section title="Standard · Title（60）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title="Title"
            @back="toast('back')"
            @trailing="toast('trailing')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Large（111）">
        <view class="preview">
          <lingyun-toolbars :safe-area="false" title-style="large" title="Title" @back="toast('back')" />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2Line"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line Left">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2LineLeft"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line Large（131）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2LineLarge"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Sheet · Title（76 · Grabber）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            placement="sheet"
            title="Title"
            @close="toast('close')"
            @trailing="toast('trailing')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Sheet · Large（127）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            placement="sheet"
            title-style="large"
            title="Title"
            @close="toast('close')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Custom trailing">
        <view class="preview">
          <lingyun-toolbars :safe-area="false" title="Edit">
            <template #trailing>
              <lingyun-button variant="borderless" size="mini" text="Done" />
            </template>
          </lingyun-toolbars>
        </view>
      </lingyun-section>

      <lingyun-section title="Grouped trailing buttons" hint="二维数组 · 多组胶囊">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title="Groups"
            :trailing-buttons="groupedButtons"
            @trailing-action="onGroupedAction"
          />
        </view>
        <text class="grouped-hint">最近点击：{{ groupedAction }}</text>
      </lingyun-section>

      <lingyun-section title="Right action group" hint="trailing-buttons + trailing-menu" is-last>
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title="Actions"
            :trailing-buttons="actionButtons"
            trailing-menu-enabled
            @trailing-action="onAction"
          >
            <template #trailing-menu="{ button, close }">
              <view class="action-menu">
                <view class="action-menu__item" @click="pickMenu(button, 'Action One', close)">
                  Action One
                </view>
                <view class="action-menu__item" @click="pickMenu(button, 'Action Two', close)">
                  Action Two
                </view>
              </view>
            </template>
          </lingyun-toolbars>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const actionButtons = [
    { key: 'search', icon: 'search', label: 'Search' },
    { key: 'more', icon: 'more', label: 'More' },
  ]

  const groupedButtons = [
    [
      { key: 'search', icon: 'search', label: 'Search' },
      { key: 'share', icon: 'upload', label: 'Share' },
    ],
    [{ key: 'filter', icon: 'tune', label: 'Filter' }],
  ]
  const groupedAction = ref('—')

  function onGroupedAction(payload: {
    key?: string
    groupIndex?: number
    buttonIndex?: number
  }): void {
    groupedAction.value = `第 ${(payload.groupIndex ?? 0) + 1} 组 / 第 ${(payload.buttonIndex ?? 0) + 1} 个 · ${payload.key || '—'}`
  }

  function toast(msg: string): void {
    uni.showToast({ title: msg, icon: 'none' })
  }

  function onAction(payload: { key?: string }): void {
    toast(`action: ${payload?.key || ''}`)
  }

  function pickMenu(button: { key?: string } | null, text: string, close: () => void): void {
    toast(`${button?.key || 'menu'}: ${text}`)
    close()
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
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

  .preview {
    margin: 0 -12px -16px;
    border-radius: 0 0 14px 14px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.12)),
      repeating-linear-gradient(
        -24deg,
        rgba(147, 197, 253, 0.35) 0 12px,
        rgba(167, 243, 208, 0.25) 12px 24px
      );
  }

  .action-menu {
    padding: 4px 0;
  }

  .grouped-hint {
    display: block;
    margin-top: 12px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .action-menu__item {
    min-height: 44px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1a1a1a);
  }
</style>

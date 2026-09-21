<template>
  <!-- 横向 swipe 需要临时关 scroll-y，页面级滚动没有可锁的 scroller → 退回内层 scroll-view -->
  <lingyun-app-page title="Swipe Actions" :page-scroll="false">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Swipe Actions</text>
        <text class="hero__desc">lingyun-swipe-action · Sketch Lists · Rows with Swipe Actions</text>
      </view>

      <lingyun-section
        title="Trailing · Symbol + Label"
        hint="左滑：胶囊 84×44、间距 10、外侧贴边（Sketch Trailing）"
        is-last
      />

      <lingyun-swipe-action>
        <lingyun-list header="Mail" header-type="nested">
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item title="Inbox" detail="12" accessory="disclosure" @click="tap('Inbox')" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item
              title="VIP"
              note="Important senders"
              accessory="disclosure"
              @click="tap('VIP')"
            />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item title="Flagged" detail="3" accessory="disclosure" @click="tap('Flagged')" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item title="Drafts" detail="2" accessory="disclosure" @click="tap('Drafts')" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item
              title="Sent"
              note="Including scheduled"
              accessory="disclosure"
              @click="tap('Sent')"
            />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="mailRight" @click="onSwipe">
            <lingyun-list-item title="Trash" detail="8" accessory="disclosure" @click="tap('Trash')" />
          </lingyun-swipe-action-item>
        </lingyun-list>
      </lingyun-swipe-action>

      <lingyun-section
        title="Leading + Trailing"
        hint="左右都可滑；同组互斥只开一项"
      />

      <lingyun-swipe-action>
        <lingyun-list header="Messages" header-type="nested">
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="Alice" note="Hey, are you free?" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="Bob" note="Sent a photo" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="Carol" note="Meeting at 3?" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="David" note="Thanks!" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="Eve" note="Shared a location" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item
            :left-options="msgLeft"
            :right-options="msgRight"
            @click="onSwipe"
          >
            <lingyun-list-item title="Frank" note="Voice message" accessory="disclosure" />
          </lingyun-swipe-action-item>
        </lingyun-list>
      </lingyun-swipe-action>

      <lingyun-section title="Symbol Only" hint="仅图标；最小宽 52" />

      <lingyun-swipe-action>
        <lingyun-list header="Files" header-type="nested" footer="与 lingyun-list-item 组合，不侵入 list 本体">
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Report.pdf" detail="2.1 MB" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Design.sketch" detail="18 MB" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Notes.txt" detail="12 KB" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Budget.xlsx" detail="540 KB" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Photo.png" detail="3.4 MB" accessory="disclosure" />
          </lingyun-swipe-action-item>
          <lingyun-swipe-action-item :right-options="iconOnlyRight" @click="onSwipe">
            <lingyun-list-item title="Archive.zip" detail="26 MB" accessory="disclosure" />
          </lingyun-swipe-action-item>
        </lingyun-list>
      </lingyun-swipe-action>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  type SwipeOption = {
    text?: string
    icon?: string
    iconType?: string
    key?: string
    role?: string
  }

  const mailRight: SwipeOption[] = [
    { text: 'Flag', iconType: 'flag-filled', key: 'flag', role: 'orange' },
    { text: 'More', iconType: 'more-filled', key: 'more', role: 'blue' },
    { text: 'Delete', iconType: 'trash-filled', key: 'delete', role: 'destructive' },
  ]

  const msgLeft: SwipeOption[] = [
    { text: 'Unread', iconType: 'eye-filled', key: 'unread', role: 'blue' },
    { text: 'Pin', iconType: 'hand-up-filled', key: 'pin', role: 'purple' },
  ]

  const msgRight: SwipeOption[] = [
    { text: 'Mute', iconType: 'micoff-filled', key: 'mute', role: 'orange' },
    { text: 'Delete', iconType: 'trash-filled', key: 'delete', role: 'destructive' },
  ]

  const iconOnlyRight: SwipeOption[] = [
    { iconType: 'star-filled', key: 'star', role: 'orange' },
    { iconType: 'redo-filled', key: 'share', role: 'blue' },
    { iconType: 'trash-filled', key: 'delete', role: 'destructive' },
  ]

  function tap(name: string): void {
    uni.showToast({ title: name, icon: 'none' })
  }

  function onSwipe(e: { key?: string; content?: SwipeOption; position?: string }): void {
    const name = e.key || (e.content && e.content.text) || e.position || 'action'
    uni.showToast({ title: String(name), icon: 'none' })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .page {
    padding: 0 0 40px;
    box-sizing: border-box;
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
</style>

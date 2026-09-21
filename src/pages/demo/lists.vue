<template>
  <lingyun-app-page title="Lists">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Lists</text>
        <text class="hero__desc">lingyun-list · Sketch Lists · Grouped</text>
      </view>

      <lingyun-section
        title="Grouped Lists"
        hint="下方为通栏列表材质（非玻璃卡片），对齐 iOS Grouped"
        is-last
      />

      <lingyun-list
        header="Header"
        header-type="extraProminent"
        header-action="Action"
        footer="This is some footer text to see how well the footer symbol wraps to two lines."
        @action="onAction"
      >
        <lingyun-list-item title="Title" detail="Detail" accessory="disclosure" @click="tap('Title')" />
      </lingyun-list>

      <lingyun-list
        header="Icons · 30×30"
        header-type="nested"
        footer="无 Subtitle → 自动小图标"
      >
        <lingyun-list-item
          title="Settings"
          accessory="disclosure"
          @click="tap('Settings')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--gray">
              <uni-icons type="gear-filled" :size="18" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Mail"
          detail="3 Unread"
          accessory="disclosure"
          @click="tap('Mail')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--blue">
              <uni-icons type="email-filled" :size="16" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Photos"
          accessory="disclosure"
          @click="tap('Photos')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--orange">
              <uni-icons type="image-filled" :size="16" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Focus"
          accessory="toggle"
          v-model:switch-checked="focusOn"
        >
          <template #icon>
            <view class="demo-icon demo-icon--indigo">
              <uni-icons type="eye-filled" :size="18" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Calendar"
          accessory="disclosure"
          @click="tap('Calendar')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--red">
              <uni-icons type="calendar-filled" :size="16" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
      </lingyun-list>

      <lingyun-list
        header="Icons · 42×42"
        header-type="nested"
        footer="有 Subtitle → 自动大图标"
      >
        <lingyun-list-item
          title="Notifications"
          note="Banners, Sounds, Badges"
          accessory="disclosure"
          @click="tap('Notifications')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--red">
              <uni-icons type="notification-filled" :size="22" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Alice"
          note="Last seen recently"
          accessory="disclosure"
          @click="tap('Alice')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--blue">
              <text class="demo-icon__initial">A</text>
            </view>
          </template>
        </lingyun-list-item>
        <lingyun-list-item
          title="Library"
          note="12 Albums"
          accessory="disclosure"
          @click="tap('Library')"
        >
          <template #icon>
            <view class="demo-icon demo-icon--orange">
              <uni-icons type="image-filled" :size="22" color="#ffffff" />
            </view>
          </template>
        </lingyun-list-item>
      </lingyun-list>

      <lingyun-list
        header="Header"
        header-type="nested"
        footer="Footer"
      >
        <lingyun-list-item title="Title" detail="Detail" />
        <lingyun-list-item title="Title" note="Note" detail="Detail" />
        <lingyun-list-item title="Title" accessory="popup" @click="tap('Popup')" />
        <lingyun-list-item
          title="Title"
          accessory="stepper"
          v-model:stepper-value="stepper"
        />
        <lingyun-list-item
          title="Title"
          accessory="toggle"
          v-model:switch-checked="toggleOn"
        />
        <lingyun-list-item
          title="Title"
          accessory="toggle"
          v-model:switch-checked="toggleOff"
        />
        <lingyun-list-item accessory="slider" v-model:slider-value="brightness" />
      </lingyun-list>

      <lingyun-list>
        <lingyun-list-item role="destructive" title="Destructive Button" @click="tap('Delete')" />
      </lingyun-list>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const stepper = ref(0)
  const toggleOn = ref(true)
  const toggleOff = ref(false)
  const focusOn = ref(false)
  const brightness = ref(42)

  function tap(name: string): void {
    uni.showToast({ title: name, icon: 'none' })
  }

  function onAction(): void {
    uni.showToast({ title: 'Action', icon: 'none' })
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

  /* 尺寸由 list-item leading 容器驱动（有 Subtitle → 42，否则 30） */
  .demo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    box-sizing: border-box;
  }

  .demo-icon__initial {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1;
  }

  .demo-icon--blue {
    background-color: var(--lingyun-system-blue, #007aff);
  }

  .demo-icon--red {
    background-color: var(--lingyun-system-red, #ff3b30);
  }

  .demo-icon--orange {
    background-color: var(--lingyun-system-orange, #ff9500);
  }

  .demo-icon--indigo {
    background-color: var(--lingyun-system-indigo, #5856d6);
  }

  .demo-icon--gray {
    background-color: var(--lingyun-system-gray, #8e8e93);
  }
</style>

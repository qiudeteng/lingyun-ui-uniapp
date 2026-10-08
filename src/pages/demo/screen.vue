<template>
  <lingyun-app-page title="Screen">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Screen</text>
        <text class="hero__desc">lingyun · 拉窗口、旋转或折叠后，下面的值会变</text>
      </view>

      <lingyun-list header="当前值" footer="模板里直接写 lingyun.screen == 'pad'">
        <lingyun-list-item title="屏幕档" note="lingyun.screen" :detail="token(lingyun.screen)" />
        <lingyun-list-item title="操作系统" note="lingyun.os" :detail="token(lingyun.os)" />
        <lingyun-list-item title="硬件" note="lingyun.device" :detail="token(lingyun.device)" />
        <lingyun-list-item title="是否折叠屏" note="lingyun.foldable" :detail="token(lingyun.foldable)" />
        <lingyun-list-item title="折叠状态" note="lingyun.fold" :detail="token(lingyun.fold)" />
        <lingyun-list-item title="窗口" note="宽 × 高" :detail="sizeText" />
      </lingyun-list>

      <lingyun-section title="按这个分支" is-last>
        <view class="stack">
          <text v-if="lingyun.os == 'ios'" class="line">操作系统是 iOS</text>
          <text v-else-if="lingyun.os == 'android'" class="line">操作系统是安卓</text>
          <text v-else class="line">操作系统是 {{ token(lingyun.os) }}</text>

          <text v-if="lingyun.fold == 'folded'" class="line">折叠屏：折叠</text>
          <text v-else-if="lingyun.fold == 'expanded'" class="line">折叠屏：展开</text>
          <text v-else-if="lingyun.fold == 'half'" class="line">折叠屏：半折叠</text>
          <text v-else class="line">不是折叠屏</text>

          <text v-if="lingyun.device == 'phone' && lingyun.screen == 'pad'" class="line">
            硬件是手机，当前窗口已到平板档
          </text>
          <text v-else-if="lingyun.screen == 'pc'" class="line">当前窗口是电脑档</text>
          <text v-else-if="lingyun.screen == 'pad'" class="line">当前窗口是平板档</text>
          <text v-else class="line">当前窗口是手机档</text>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onUnload } from '@dcloudio/uni-app'
  import { lingyun } from '@/uni_modules/lingyun-ui'

  const width = ref(0)
  const height = ref(0)

  const sizeText = computed(() => `${width.value} × ${height.value}`)

  function token(value: string): string {
    return value || "''"
  }

  function readSize(): void {
    try {
      const win =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
      width.value = Number(win.windowWidth) || 0
      height.value = Number(win.windowHeight) || 0
    } catch {
      width.value = 0
      height.value = 0
    }
  }

  function onResize(): void {
    readSize()
  }

  readSize()
  if (typeof uni.onWindowResize === 'function') {
    uni.onWindowResize(onResize)
  }

  onUnload(() => {
    if (typeof uni.offWindowResize === 'function') {
      uni.offWindowResize(onResize)
    }
  })
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

  .stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }

  .line {
    display: block;
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>

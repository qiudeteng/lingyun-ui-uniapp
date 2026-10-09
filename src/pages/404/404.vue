<template>
  <lingyun-app-page title="404">
    <view class="miss">
      <lingyun-empty
        fill
        variant="plain"
        title="404"
        :description="description"
      >
        <template #action>
          <lingyun-button variant="borderedProminent" text="返回首页" @click="goHome" />
        </template>
      </lingyun-empty>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { LINGYUN_PAGE_NAV_HOME } from '@/router/pageNav'

  const missing = ref('')
  const description = computed(() =>
    missing.value ? `当前应用没有这个页面\n${missing.value}` : '当前应用没有这个页面',
  )

  onLoad((query) => {
    const from = query?.from
    missing.value = from ? safeDecode(String(from)) : ''
  })

  function safeDecode(value: string): string {
    let next = value
    for (let i = 0; i < 2; i += 1) {
      try {
        const decoded = decodeURIComponent(next)
        if (decoded === next) break
        next = decoded
      } catch {
        break
      }
    }
    return next
  }

  function goHome(): void {
    uni.redirectTo({ url: LINGYUN_PAGE_NAV_HOME })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .miss {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .miss .lingyun-empty__desc {
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>

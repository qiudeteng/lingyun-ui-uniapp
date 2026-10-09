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
  import { computed, ref, watch } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { LINGYUN_PAGE_NAV_HOME } from '@/router/pageNav'
  import { openLingyunHostedPage, pageHostState } from '@/router/pageHost'

  const missing = ref('')
  const description = computed(() =>
    missing.value ? `当前应用没有这个页面\n${missing.value}` : '当前应用没有这个页面',
  )

  onLoad((query) => {
    const from = query?.from
    if (from) missing.value = safeDecode(String(from))
  })

  watch(
    () => pageHostState.url,
    (url) => {
      if (!url) return
      const from = queryValue(url, 'from')
      if (from) missing.value = safeDecode(from)
    },
    { immediate: true },
  )

  function queryValue(url: string, key: string): string {
    const query = url.split('?')[1] || ''
    const part = query.split('&').find((item) => item.startsWith(`${key}=`))
    return part ? part.slice(key.length + 1) : ''
  }

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
    if (openLingyunHostedPage(LINGYUN_PAGE_NAV_HOME)) return
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

<template>
  <lingyun-login
    :logo="logo"
    :enterprise-name="enterpriseName"
    :copyright="copyright"
    :booting="booting"
    @submit="onSubmit"
  />
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useAuthStore } from '@/stores/auth'
  import { appConfig } from '@/config'
  import { getBackUrl } from '@/utils/auth'

  const appStore = useAppStore()
  const authStore = useAuthStore()
  const booting = ref(false)

  const logo = computed(() => appStore.enterprise?.enterprise_logo || '')
  const enterpriseName = computed(() => appStore.enterprise?.enterprise_name || '')
  const copyright = computed(() => {
    const name = enterpriseName.value.trim()
    if (!name) return ''
    return `© ${new Date().getFullYear()} ${name}`
  })

  function goBack(): void {
    let backUrl = getBackUrl()
    if (!backUrl) {
      backUrl = appConfig.homePath
    } else if (!backUrl.startsWith('/')) {
      backUrl = `/${backUrl}`
    }
    uni.reLaunch({
      url: backUrl,
      fail: () => {
        uni.reLaunch({ url: appConfig.homePath })
      },
    })
  }

  function onSubmit(payload: { username: string; password: string }): void {
    authStore.login(payload, (ok) => {
      if (ok) goBack()
    })
  }

  onMounted(() => {
    if (!appStore.enterprise) {
      appStore.getEnterprise()
    }
    if (authStore.isLogin) {
      goBack()
      return
    }
    /* #ifdef MP-WEIXIN */
    booting.value = true
    authStore.loginByCode((ok) => {
      booting.value = false
      if (ok) goBack()
    })
    /* #endif */
  })
</script>

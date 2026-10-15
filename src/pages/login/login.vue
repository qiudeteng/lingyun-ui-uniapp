<template>
  <lingyun-login
    enterprise-name="凌云UI"
    copyright="© 凌云UI Demo"
    demo-text="组件演示"
    @submit="goHome"
    @demo="goDemo"
  />
</template>

<script setup lang="ts">
  import { appConfig } from '@/config'

  function goHome(): void {
    uni.reLaunch({ url: appConfig.homePath })
  }

  function goDemo(): void {
    uni.navigateTo({ url: '/pages/demo/demo' })
  }
</script>

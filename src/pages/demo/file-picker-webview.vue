<template>
  <web-view :src="url" @message="onMessage" @error="onError" />
</template>

<script setup lang="ts">
/**
 * 真机请改成已配置业务域名的 HTTPS 地址；
 * 微信开发者工具需勾选「不校验合法域名、web-view（业务域名）」。
 */
const url = 'http://localhost:5175/system-file-picker.html'

function onMessage(event: { detail?: { data?: unknown } }) {
  const raw = event.detail?.data
  const payload = Array.isArray(raw) ? raw[raw.length - 1] : raw
  if (payload && typeof payload === 'object') {
    uni.setStorageSync('lingyun-system-file-pick', payload)
  }
}

function onError(event: { detail?: { errMsg?: string } }) {
  uni.showToast({
    title: event.detail?.errMsg || 'web-view 加载失败',
    icon: 'none',
  })
}
</script>

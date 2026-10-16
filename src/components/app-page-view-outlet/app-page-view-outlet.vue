<template>
  <lingyun-page-miss :from="path" />
</template>

<script setup lang="ts">
/**
 * 后台动态菜单的宽屏组件出口。
 * 微信小程序不支持运行时动态组件；业务视图需在本文件静态导入并按 path 增加分支。
 */
defineProps<{
  path: string
}>()
</script>

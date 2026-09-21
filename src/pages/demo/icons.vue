<template>
  <lingyun-app-page title="Icons">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Icons</text>
        <text class="hero__desc">lingyun-icon · 点按复制 type 名</text>
      </view>

      <lingyun-section title="语义色">
        <view class="lingyun-section-row size-row">
          <lingyun-icon
            v-for="c in semanticColors"
            :key="c"
            type="heart-filled"
            :size="22"
            :color="c"
          />
        </view>
        <view class="color-labels">
          <text v-for="c in semanticColors" :key="`l-${c}`" class="color-labels__item">{{ c }}</text>
        </view>
      </lingyun-section>

      <lingyun-section title="自定义色">
        <view class="lingyun-section-row size-row">
          <lingyun-icon type="star-filled" :size="22" color="#AF52DE" />
          <lingyun-icon type="star-filled" :size="22" color="rgb(255, 149, 0)" />
          <lingyun-icon type="star-filled" :size="22" color="var(--lingyun-system-teal, #00c3d0)" />
        </view>
      </lingyun-section>

      <lingyun-section title="尺寸">
        <view class="lingyun-section-row size-row">
          <lingyun-icon type="heart-filled" :size="16" color="primary" />
          <lingyun-icon type="heart-filled" :size="22" color="primary" />
          <lingyun-icon type="heart-filled" :size="28" color="primary" />
          <lingyun-icon type="heart-filled" :size="36" color="primary" />
        </view>
      </lingyun-section>

      <lingyun-section
        v-for="(group, index) in iconGroups"
        :key="group.title"
        :title="group.title"
        :hint="`${group.icons.length} 个`"
        :is-last="index === iconGroups.length - 1"
      >
        <view class="icon-grid">
          <view
            v-for="name in group.icons"
            :key="name"
            class="icon-cell"
            hover-class="icon-cell--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="onCopy(name)"
          >
            <lingyun-icon :type="name" :size="28" color="label" />
            <text class="icon-cell__name">{{ name }}</text>
          </view>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { fontData } from '@/uni_modules/lingyun-ui/components/lingyun-icon/icons'

  const semanticColors = [
    'label',
    'secondary',
    'primary',
    'success',
    'warning',
    'error',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'purple',
    'pink',
    'gray',
  ]

  /** 分组规则：按前缀/关键词归类；未命中进「其它」 */
  const GROUP_RULES: { title: string; test: RegExp }[] = [
    {
      title: '箭头 / 导航',
      test: /^(arrow-|left$|right$|up$|down$|top$|bottom$|back$|forward$|navigate|pulldown|redo|undo|reload|refresh|loop|bars$|list$)/,
    },
    {
      title: '操作 / 编辑',
      test: /^(plus|minus|clear|close|compose|trash|tune|gear|settings|color|font|checkbox|checkmark|circle|smallcircle|more|scan|search|link$|paperclip)/,
    },
    {
      title: '媒体 / 通讯',
      test: /^(camera|image|images|videocam|mic|sound|headphones|phone|email|mail|chat|contact|notification|spinner)/,
    },
    {
      title: '人物 / 社交',
      test: /^(person|staff|auth|vip|weixin|weibo|qq|pyq|hand-|heart|star|medal|gift|fire|flag)/,
    },
    {
      title: '位置 / 地图',
      test: /^(location|map|home|shop|cart|wallet)/,
    },
    {
      title: '文件 / 云端',
      test: /^(folder|cloud|upload|download|paperplane|calendar|locked)/,
    },
    {
      title: '状态 / 提示',
      test: /^(eye|info|help)/,
    },
  ]

  const allNames = fontData.map((item) => item.font_class).filter(Boolean)

  const iconGroups = computed(() => {
    const used = new Set<string>()
    const groups: { title: string; icons: string[] }[] = []

    for (const rule of GROUP_RULES) {
      const icons = allNames
        .filter((n) => rule.test.test(n) && !used.has(n))
        .sort((a, b) => a.localeCompare(b))
      icons.forEach((n) => used.add(n))
      if (icons.length) groups.push({ title: rule.title, icons })
    }

    const rest = allNames.filter((n) => !used.has(n)).sort((a, b) => a.localeCompare(b))
    if (rest.length) groups.push({ title: '其它', icons: rest })
    return groups
  })

  function onCopy(name: string): void {
    // #ifdef H5
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      void navigator.clipboard.writeText(name).then(() => {
        uni.showToast({ title: name, icon: 'none' })
      })
      return
    }
    // #endif
    uni.setClipboardData({
      data: name,
      success: () => uni.showToast({ title: name, icon: 'none' }),
    })
  }
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

  .icon-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0 -4px;
  }

  .icon-cell {
    width: 25%;
    box-sizing: border-box;
    padding: 10px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .icon-cell--hover {
    opacity: 0.7;
  }

  .icon-cell__name {
    font-size: 10px;
    line-height: 12px;
    text-align: center;
    color: var(--lingyun-label-secondary, #6a6a6a);
    word-break: break-all;
  }

  .size-row {
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .color-labels {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .color-labels__item {
    font-size: 10px;
    line-height: 12px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>

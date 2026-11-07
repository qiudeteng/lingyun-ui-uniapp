<template>
  <lingyun-app-page title="Date Text">
    <view class="page">
      <view class="hero">
        <text class="hero__title">日期显示</text>
        <text class="hero__desc">
          lingyun-date-text · 今天 / 昨天 / 明天 · 今年 MM-DD · 跨年 YYYY-MM-DD
        </text>
      </view>

      <lingyun-section title="相对日期">
        <view class="date-row">
          <text class="date-row__label">昨天</text>
          <lingyun-date-text type="subheadline" :value="yesterday" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">今天</text>
          <lingyun-date-text type="subheadline" :value="now" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">明天</text>
          <lingyun-date-text type="subheadline" :value="tomorrow" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">今天 · 到分</text>
          <lingyun-date-text type="subheadline" :value="now" precision="minute" />
        </view>
      </lingyun-section>

      <lingyun-section title="普通日期">
        <view class="date-row">
          <text class="date-row__label">今年 · 到天</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">今年 · 到秒</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="second" />
        </view>
        <view class="date-row">
          <text class="date-row__label">去年 · 到天</text>
          <lingyun-date-text type="subheadline" :value="lastYear" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">去年 · 到分</text>
          <lingyun-date-text type="subheadline" :value="lastYear" precision="minute" />
        </view>
      </lingyun-section>

      <lingyun-section title="精度">
        <view class="date-row">
          <text class="date-row__label">到天</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="day" />
        </view>
        <view class="date-row">
          <text class="date-row__label">到时</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="hour" />
        </view>
        <view class="date-row">
          <text class="date-row__label">到分</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="minute" />
        </view>
        <view class="date-row">
          <text class="date-row__label">到秒</text>
          <lingyun-date-text type="subheadline" :value="sameYear" precision="second" />
        </view>
      </lingyun-section>

      <lingyun-section title="文字样式">
        <view class="date-row">
          <text class="date-row__label">大号加粗</text>
          <lingyun-date-text
            :value="now"
            precision="minute"
            type="title3"
            color="link"
            bold
          />
        </view>
        <view class="date-row">
          <text class="date-row__label">小号次要色</text>
          <lingyun-date-text
            :value="sameYear"
            precision="day"
            type="footnote"
          />
        </view>
        <view class="date-row">
          <text class="date-row__label">默认 body</text>
          <lingyun-date-text :value="sameYear" precision="second" />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义 / 兜底" is-last>
        <view class="date-row">
          <text class="date-row__label">自定义今天文案</text>
          <lingyun-date-text
            type="subheadline"
            :value="now"
            precision="minute"
            today-text="今日"
          />
        </view>
        <view class="date-row">
          <text class="date-row__label">空值兜底</text>
          <lingyun-date-text type="subheadline" value="" fallback="—" />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const now = new Date()
  const DAY = 24 * 60 * 60 * 1000
  const yesterday = new Date(now.getTime() - DAY)
  const tomorrow = new Date(now.getTime() + DAY)
  /* 取一个当年的其它日期，避免和今天的相对日期重合 */
  const sameYear = new Date(now.getFullYear(), (now.getMonth() + 6) % 12, 15, 14, 8, 9)
  const lastYear = new Date(now.getFullYear() - 1, 10, 6, 9, 5, 3)
</script>

<style lang="scss">
  .page {
    min-height: 100%;
    padding-bottom: 24px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(0, 136, 255, 0.16), transparent 55%),
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
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .date-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
  }

  .date-row__label {
    flex-shrink: 0;
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>

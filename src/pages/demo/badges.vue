<template>
  <lingyun-app-page title="Badges">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Badges</text>
        <text class="hero__desc">lingyun-badge · App Icons / Badge</text>
      </view>

      <lingyun-section title="Color（默认 Red）">
        <view class="lingyun-section-row badge-row">
          <lingyun-badge text="247" />
          <lingyun-badge color="green" text="3" />
          <lingyun-badge color="orange" text="12" />
          <lingyun-badge color="gray" text="8" />
        </view>
      </lingyun-section>

      <lingyun-section title="Count / Max">
        <view class="lingyun-section-row badge-row">
          <lingyun-badge text="1" />
          <lingyun-badge text="9" />
          <lingyun-badge text="99" />
          <lingyun-badge :text="120" :max="99" />
          <lingyun-badge :text="120" :max="0" />
        </view>
      </lingyun-section>

      <lingyun-section title="Dot">
        <view class="lingyun-section-row badge-row">
          <lingyun-badge dot />
          <lingyun-badge color="green" dot />
          <lingyun-badge color="orange" dot />
          <lingyun-badge color="gray" dot />
        </view>
      </lingyun-section>

      <lingyun-section title="On avatar" is-last>
        <view class="lingyun-section-row badge-row">
          <view class="avatar">
            <text class="avatar__letter">A</text>
            <view class="avatar__badge">
              <lingyun-badge text="3" />
            </view>
          </view>
          <view class="avatar">
            <text class="avatar__letter">B</text>
            <view class="avatar__badge">
              <lingyun-badge color="green" text="12" />
            </view>
          </view>
          <view class="avatar">
            <text class="avatar__letter">C</text>
            <view class="avatar__badge avatar__badge--dot">
              <lingyun-badge color="orange" dot />
            </view>
          </view>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

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

  .badge-row {
    gap: 12px;
  }

  .avatar {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--lingyun-fill, rgba(120, 120, 128, 0.16));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar__letter {
    font-size: 18px;
    font-weight: 600;
    color: var(--lingyun-label, #1c1c1e);
  }

  .avatar__badge {
    position: absolute;
    top: -6px;
    right: -8px;
  }

  .avatar__badge--dot {
    top: -2px;
    right: -2px;
  }
</style>

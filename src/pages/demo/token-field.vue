<template>
  <lingyun-app-page title="Token Field">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Token Field</lingyun-text>
        <lingyun-text type="subtitle" block>
          多选标签输入 · 建议 / 去重 / 上限
        </lingyun-text>
      </view>

      <lingyun-section title="标签输入" hint="suggestions · max=5">
        <lingyun-token-field
          v-model="tags"
          label="商品标签"
          :suggestions="suggestions"
          :max="5"
          show-count
          placeholder="输入标签后按回车"
          @add="onAdd"
          @remove="onRemove"
          @invalid="onInvalid"
        />
        <lingyun-text type="caption" color="secondary" block class="hint">
          已选 {{ tags.length }} 个：{{ tags.join(' / ') || '无' }}
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="仅允许建议项" hint="allowCustom=false">
        <lingyun-token-field
          v-model="allowedTags"
          label="活动类型"
          :suggestions="suggestions"
          :allow-custom="false"
          placeholder="从建议中选择"
          @invalid="onInvalid"
        />
      </lingyun-section>

      <lingyun-section title="只读 / 禁用" hint="readonly · disabled">
        <lingyun-token-field
          :model-value="readonlyTags"
          label="只读"
          readonly
        />
        <view class="spacer" />
        <lingyun-token-field
          :model-value="readonlyTags"
          label="禁用"
          disabled
        />
      </lingyun-section>

      <lingyun-section
        v-if="lastAction"
        title="最近操作"
        :hint="lastAction"
        is-last
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  LingyunTokenFieldAddPayload,
  LingyunTokenFieldInvalidPayload,
  LingyunTokenFieldRemovePayload,
} from '@/uni_modules/lingyun-ui/components/lingyun-token-field/types'

const suggestions = ['招牌', '新品', '低糖', '生日', '节日', '下午茶']
const tags = ref<string[]>(['招牌'])
const allowedTags = ref<string[]>([])
const readonlyTags = ['招牌', '低糖']
const lastAction = ref('')

function onAdd(payload: LingyunTokenFieldAddPayload) {
  lastAction.value = `添加：${payload.token}`
}

function onRemove(payload: LingyunTokenFieldRemovePayload) {
  lastAction.value = `移除：${payload.token}`
}

function onInvalid(payload: LingyunTokenFieldInvalidPayload) {
  const reasonMap: Record<string, string> = {
    duplicate: '标签已存在',
    max: '已达标签上限',
    custom: '只能选择建议项',
  }
  lastAction.value = `${reasonMap[payload.reason] || '无效标签'}：${payload.value}`
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
    var(--lingyun-bg-grouped, #f2f2f7);
}

.hero {
  padding: 24px 20px 8px;
}

.hint {
  padding-top: 8px;
}

.spacer {
  height: 12px;
}
</style>

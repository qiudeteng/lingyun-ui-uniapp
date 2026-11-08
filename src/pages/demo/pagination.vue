<template>
  <lingyun-app-page title="Pagination">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Pagination</lingyun-text>
        <lingyun-text type="subtitle" block>
          分页 · 页码窗口 / 总数 / 简单模式 / 小尺寸
        </lingyun-text>
      </view>

      <lingyun-section title="基础分页" hint="total=126 · pageSize=10">
        <lingyun-pagination
          v-model="page"
          :total="126"
          :page-size="10"
          @change="onChange"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            第 {{ page }} / {{ pageCount }} 页
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="小尺寸 · 简单模式" hint="size=small · simple">
        <lingyun-pagination
          v-model="smallPage"
          :total="48"
          :page-size="10"
          size="small"
          simple
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="隐藏单页" hint="hideOnSinglePage · total=8">
        <lingyun-pagination
          v-model="singlePage"
          :total="8"
          :page-size="10"
          hide-on-single-page
          @change="onChange"
        />
        <lingyun-text type="caption" color="secondary" block>
          数据不足一页时整块隐藏。
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="无总数" hint="showTotal=false · total=200">
        <lingyun-pagination
          v-model="noTotalPage"
          :total="200"
          :page-size="20"
          :show-total="false"
          @change="onChange"
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
import { computed, ref } from 'vue'
import type { LingyunPaginationChangePayload } from '@/uni_modules/lingyun-ui/components/lingyun-pagination/types'

const page = ref(5)
const smallPage = ref(2)
const singlePage = ref(1)
const noTotalPage = ref(3)
const lastAction = ref('')
const pageCount = computed(() => Math.max(1, Math.ceil(126 / 10)))

function onChange(payload: LingyunPaginationChangePayload) {
  lastAction.value = `切换到第 ${payload.page} / ${payload.pageCount} 页`
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
  padding: 8px 4px 15px;
}

.result {
  padding-top: 10px;
}
</style>

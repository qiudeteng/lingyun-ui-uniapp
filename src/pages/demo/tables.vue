<template>
  <lingyun-app-page title="Tables">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Tables</text>
        <text class="hero__desc">lingyun-table · 分组卡片表格</text>
      </view>


      <lingyun-section title="外层高度" hint="外层 320px。表格跟上外层，不把外层撑开。筛选和翻页走服务端。">
        <view class="table-frame">
        <lingyun-table
          remote
          :loading="serverLoading"
          :columns="columns"
          :data="serverRows"
          :total="serverTotal"
          row-key="id"
          stripe
          border
          :page-size="5"
          v-model:page="serverPage"
          @query-change="loadServer"
        >
          <template #cell="{ row, column, value }">
            <lingyun-tag
              v-if="column.key === 'status'"
              :text="String(value)"
              :color="value === '售罄' ? 'red' : 'green'"
            />
            <text v-else class="cell-text">{{ value }}</text>
          </template>
        </lingyun-table>
        </view>
        <text class="picked">已返回第 {{ serverPage }} 页，共 {{ serverTotal }} 条</text>
      </lingyun-section>

      <lingyun-section title="固定高度" hint="height=240，表体上下滚，表头不动。菜品固定在左，操作固定在右。">
        <lingyun-table :columns="scrollColumns" :data="rows" row-key="id" :height="240" stripe border @row-click="onRow">
          <template #cell="{ column, value, row }">
            <text
              v-if="column.key === 'action'"
              class="cell-link"
              @touchstart.stop
              @mousedown.stop
              @click.stop="onDetail(row)"
            >详情</text>
            <text v-else class="cell-text">{{ value }}</text>
          </template>
        </lingyun-table>
      </lingyun-section>

      <lingyun-section title="序号列" hint="标题栏：图标、标题、刷新、选列、导出 Excel，右侧还能放自定义按钮。">
        <view class="table-frame">
          <lingyun-table
            title="菜品"
            icon="list"
            show-refresh
            column-picker
            export-excel
            :columns="indexColumns"
            :data="rows"
            row-key="id"
            stripe
            border
            :page-size="5"
            v-model:page="indexPage"
            @refresh="onTableRefresh"
          >
            <template #tools>
              <view class="table-tool" @click="onCustomTool">
                <lingyun-icon type="compose" :size="18" color="secondary" />
              </view>
            </template>
          </lingyun-table>
        </view>
      </lingyun-section>

      <lingyun-section title="空数据" hint="外层 200px，空态留在这块高度里" is-last>
        <view class="table-frame table-frame--empty">
          <lingyun-table :columns="columns" :data="[]" empty-text="没有订单" />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { LingyunTableColumn, LingyunTableQuery, LingyunTableRow } from '@/uni_modules/lingyun-ui/components/lingyun-table/lingyun-table.vue'

  const columns: LingyunTableColumn[] = [
    { key: 'name', title: '菜品', width: 128, fixed: 'left', sortable: true },
    {
      key: 'category',
      title: '分类',
      width: 96,
      filters: [
        { text: '热菜', value: '热菜' },
        { text: '凉菜', value: '凉菜' },
        { text: '饮品', value: '饮品' },
      ],
    },
    { key: 'count', title: '数量', width: 80, align: 'right', sortable: true },
    { key: 'price', title: '单价', width: 88, align: 'right', sortable: true },
    {
      key: 'status',
      title: '状态',
      width: 96,
      filters: [
        { text: '在售', value: '在售' },
        { text: '售罄', value: '售罄' },
      ],
    },
    { key: 'note', title: '备注', width: 180 },
  ]

  const scrollColumns: LingyunTableColumn[] = [
    { key: 'name', title: '菜品', width: 128, fixed: 'left', sortable: true },
    { key: 'category', title: '分类', width: 96 },
    { key: 'count', title: '数量', width: 80, align: 'right', sortable: true },
    { key: 'price', title: '单价', width: 88, align: 'right', sortable: true },
    { key: 'note', title: '备注', width: 200 },
    { key: 'action', title: '操作', width: 72, fixed: 'right', align: 'center' },
  ]

  const indexColumns: LingyunTableColumn[] = [
    { key: 'no', title: '序号', type: 'index', width: 64, align: 'center', fixed: 'left' },
    { key: 'name', title: '菜品', width: 140, sortable: true },
    { key: 'category', title: '分类', width: 96 },
    { key: 'count', title: '数量', width: 80, align: 'right', sortable: true },
    { key: 'price', title: '单价', width: 88, align: 'right' },
    { key: 'note', title: '备注', width: 180 },
  ]

  const menu = ['宫保鸡丁', '清蒸鲈鱼', '凉拌黄瓜', '酸梅汤', '红烧肉', '拍黄瓜', '柠檬茶', '鱼香肉丝', '白灼虾', '杨枝甘露', '麻婆豆腐', '冰粉']
  const categories = ['热菜', '热菜', '凉菜', '饮品']

  const rows: LingyunTableRow[] = menu.map((name, index) => ({
    id: String(index + 1),
    name,
    category: categories[index % categories.length],
    count: (index % 5) + 1,
    price: 12 + index * 3,
    status: index % 4 === 3 ? '售罄' : '在售',
    note: index % 2 === 0 ? '少辣' : '常规',
    action: '详情',
  }))

  const page = ref(1)
  const indexPage = ref(1)
  const selected = ref<string[]>([])
  const serverPage = ref(1)
  const serverRows = ref<LingyunTableRow[]>([])
  const serverTotal = ref(0)
  const serverLoading = ref(true)
  let serverTicket = 0

  function loadServer(query: LingyunTableQuery): void {
    const ticket = ++serverTicket
    serverLoading.value = true
    setTimeout(() => {
      if (ticket !== serverTicket) return
      let list = rows.slice()
      const filters = query.filters || {}
      Object.keys(filters).forEach((key) => {
        const picked = filters[key]
        if (!picked || !picked.length) return
        list = list.filter((row) => picked.indexOf(String(row[key] ?? '')) >= 0)
      })
      if (query.sortKey && query.sortOrder) {
        const dir = query.sortOrder === 'asc' ? 1 : -1
        const key = query.sortKey
        list.sort((a, b) => {
          const av = a[key]
          const bv = b[key]
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
          return String(av ?? '').localeCompare(String(bv ?? ''), 'zh') * dir
        })
      }
      serverTotal.value = list.length
      const size = query.pageSize > 0 ? query.pageSize : 5
      const start = (Math.max(1, query.page) - 1) * size
      serverRows.value = list.slice(start, start + size)
      serverLoading.value = false
    }, 500)
  }

  function onRow(row: LingyunTableRow): void {
    uni.showToast({ title: String(row.name || ''), icon: 'none' })
  }

  function onDetail(row: LingyunTableRow): void {
    uni.showToast({ title: `详情 ${String(row.name || '')}`, icon: 'none' })
  }

  function onTableRefresh(): void {
    uni.showToast({ title: '已刷新', icon: 'none' })
  }

  function onCustomTool(): void {
    uni.showToast({ title: '自定义', icon: 'none' })
  }
</script>

<style lang="scss">
  .page {
    padding: 0 0 40px;
    box-sizing: border-box;
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

  .cell-text {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .cell-link {
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-link, #0088ff);
  }

  .table-frame {
    height: 320px;
  }

  .table-frame--empty {
    height: 200px;
  }

  .table-tool {
    width: 32px;
    height: 32px;
    margin-left: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .picked {
    display: block;
    margin-top: 8px;
    padding: 0 4px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>

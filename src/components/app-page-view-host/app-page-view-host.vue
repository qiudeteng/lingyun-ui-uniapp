<template>
  <buttons-page v-if="currentPath === 'pages/demo/buttons'" />
  <guide-start-page v-else-if="currentPath === 'pages/guide/start'" />
  <icons-page v-else-if="currentPath === 'pages/demo/icons'" />
  <badges-page v-else-if="currentPath === 'pages/demo/badges'" />
  <segmented-controls-page v-else-if="currentPath === 'pages/demo/segmented-controls'" />
  <tags-page v-else-if="currentPath === 'pages/demo/tags'" />
  <texts-page v-else-if="currentPath === 'pages/demo/texts'" />
  <images-page v-else-if="currentPath === 'pages/demo/images'" />
  <avatars-page v-else-if="currentPath === 'pages/demo/avatars'" />
  <page-controls-page v-else-if="currentPath === 'pages/demo/page-controls'" />
  <forms-page v-else-if="currentPath === 'pages/demo/forms'" />
  <text-fields-page v-else-if="currentPath === 'pages/demo/text-fields'" />
  <switches-page v-else-if="currentPath === 'pages/demo/switches'" />
  <checks-page v-else-if="currentPath === 'pages/demo/checks'" />
  <sliders-page v-else-if="currentPath === 'pages/demo/sliders'" />
  <pickers-page v-else-if="currentPath === 'pages/demo/pickers'" />
  <date-time-pickers-page v-else-if="currentPath === 'pages/demo/date-time-pickers'" />
  <toolbars-page v-else-if="currentPath === 'pages/demo/toolbars'" />
  <screen-page v-else-if="currentPath === 'pages/demo/screen'" />
  <responsive-page v-else-if="currentPath === 'pages/demo/responsive'" />
  <app-page-page v-else-if="currentPath === 'pages/demo/app-page'" />
  <workbench-page v-else-if="currentPath === 'pages/demo/workbench'" />
  <tabbars-page v-else-if="currentPath === 'pages/demo/tabbars'" />
  <sidebars-page v-else-if="currentPath === 'pages/demo/sidebars'" />
  <search-bar-page v-else-if="currentPath === 'pages/demo/search-bar'" />
  <lists-page v-else-if="currentPath === 'pages/demo/lists'" />
  <tables-page v-else-if="currentPath === 'pages/demo/tables'" />
  <grid-page v-else-if="currentPath === 'pages/demo/grid'" />
  <layout-page v-else-if="currentPath === 'pages/demo/layout'" />
  <indexed-list-page v-else-if="currentPath === 'pages/demo/indexed-list'" />
  <sections-page v-else-if="currentPath === 'pages/demo/sections'" />
  <swipe-actions-page v-else-if="currentPath === 'pages/demo/swipe-actions'" />
  <empty-page v-else-if="currentPath === 'pages/demo/empty'" />
  <skeletons-page v-else-if="currentPath === 'pages/demo/skeletons'" />
  <refresh-page v-else-if="currentPath === 'pages/demo/refresh'" />
  <activity-indicator-page v-else-if="currentPath === 'pages/demo/activity-indicator'" />
  <progress-page v-else-if="currentPath === 'pages/demo/progress'" />
  <toasts-page v-else-if="currentPath === 'pages/demo/toasts'" />
  <alerts-page v-else-if="currentPath === 'pages/demo/alerts'" />
  <sheets-page v-else-if="currentPath === 'pages/demo/sheets'" />
  <action-sheets-page v-else-if="currentPath === 'pages/demo/action-sheets'" />
  <activity-views-page v-else-if="currentPath === 'pages/demo/activity-views'" />
  <popovers-page v-else-if="currentPath === 'pages/demo/popovers'" />
  <menus-page v-else-if="currentPath === 'pages/demo/menus'" />
  <fab-page v-else-if="currentPath === 'pages/demo/fab'" />
  <goods-nav-page v-else-if="currentPath === 'pages/demo/goods-nav'" />
  <charts-column-page v-else-if="currentPath === 'pages/demo/charts/column'" />
  <charts-stack-page v-else-if="currentPath === 'pages/demo/charts/stack'" />
  <charts-bar-page v-else-if="currentPath === 'pages/demo/charts/bar'" />
  <charts-line-page v-else-if="currentPath === 'pages/demo/charts/line'" />
  <charts-curve-page v-else-if="currentPath === 'pages/demo/charts/curve'" />
  <charts-area-page v-else-if="currentPath === 'pages/demo/charts/area'" />
  <charts-pie-page v-else-if="currentPath === 'pages/demo/charts/pie'" />
  <charts-ring-page v-else-if="currentPath === 'pages/demo/charts/ring'" />
  <charts-rose-page v-else-if="currentPath === 'pages/demo/charts/rose'" />
  <charts-funnel-page v-else-if="currentPath === 'pages/demo/charts/funnel'" />
  <charts-radar-page v-else-if="currentPath === 'pages/demo/charts/radar'" />
  <charts-gauge-page v-else-if="currentPath === 'pages/demo/charts/gauge'" />
  <charts-arcbar-page v-else-if="currentPath === 'pages/demo/charts/arcbar'" />
  <charts-mount-page v-else-if="currentPath === 'pages/demo/charts/mount'" />
  <charts-mix-page v-else-if="currentPath === 'pages/demo/charts/mix'" />
  <charts-scatter-page v-else-if="currentPath === 'pages/demo/charts/scatter'" />
  <charts-bubble-page v-else-if="currentPath === 'pages/demo/charts/bubble'" />
  <charts-candle-page v-else-if="currentPath === 'pages/demo/charts/candle'" />
  <charts-word-page v-else-if="currentPath === 'pages/demo/charts/word'" />
  <charts-map-page v-else-if="currentPath === 'pages/demo/charts/map'" />
  <charts-tline-page v-else-if="currentPath === 'pages/demo/charts/tline'" />
  <charts-tarea-page v-else-if="currentPath === 'pages/demo/charts/tarea'" />
  <app-page-view-outlet v-else-if="currentPath" :path="currentPath" />
  <slot v-else />
  <!-- #ifdef MP-WEIXIN -->
  <demo-theme-switch />
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import ButtonsPage from '@/pages/demo/buttons.vue'
import GuideStartPage from '@/pages/guide/start.vue'
import IconsPage from '@/pages/demo/icons.vue'
import BadgesPage from '@/pages/demo/badges.vue'
import SegmentedControlsPage from '@/pages/demo/segmented-controls.vue'
import TagsPage from '@/pages/demo/tags.vue'
import TextsPage from '@/pages/demo/texts.vue'
import ImagesPage from '@/pages/demo/images.vue'
import AvatarsPage from '@/pages/demo/avatars.vue'
import PageControlsPage from '@/pages/demo/page-controls.vue'
import FormsPage from '@/pages/demo/forms.vue'
import TextFieldsPage from '@/pages/demo/text-fields.vue'
import SwitchesPage from '@/pages/demo/switches.vue'
import ChecksPage from '@/pages/demo/checks.vue'
import SlidersPage from '@/pages/demo/sliders.vue'
import PickersPage from '@/pages/demo/pickers.vue'
import DateTimePickersPage from '@/pages/demo/date-time-pickers.vue'
import ToolbarsPage from '@/pages/demo/toolbars.vue'
import ScreenPage from '@/pages/demo/screen.vue'
import ResponsivePage from '@/pages/demo/responsive.vue'
import AppPagePage from '@/pages/demo/app-page.vue'
import WorkbenchPage from '@/pages/demo/workbench.vue'
import TabbarsPage from '@/pages/demo/tabbars.vue'
import SidebarsPage from '@/pages/demo/sidebars.vue'
import SearchBarPage from '@/pages/demo/search-bar.vue'
import ListsPage from '@/pages/demo/lists.vue'
import TablesPage from '@/pages/demo/tables.vue'
import GridPage from '@/pages/demo/grid.vue'
import LayoutPage from '@/pages/demo/layout.vue'
import IndexedListPage from '@/pages/demo/indexed-list.vue'
import SectionsPage from '@/pages/demo/sections.vue'
import SwipeActionsPage from '@/pages/demo/swipe-actions.vue'
import EmptyPage from '@/pages/demo/empty.vue'
import SkeletonsPage from '@/pages/demo/skeletons.vue'
import RefreshPage from '@/pages/demo/refresh.vue'
import ActivityIndicatorPage from '@/pages/demo/activity-indicator.vue'
import ProgressPage from '@/pages/demo/progress.vue'
import ToastsPage from '@/pages/demo/toasts.vue'
import AlertsPage from '@/pages/demo/alerts.vue'
import SheetsPage from '@/pages/demo/sheets.vue'
import ActionSheetsPage from '@/pages/demo/action-sheets.vue'
import ActivityViewsPage from '@/pages/demo/activity-views.vue'
import PopoversPage from '@/pages/demo/popovers.vue'
import MenusPage from '@/pages/demo/menus.vue'
import FabPage from '@/pages/demo/fab.vue'
import GoodsNavPage from '@/pages/demo/goods-nav.vue'
import ChartsColumnPage from '@/pages/demo/charts/column.vue'
import ChartsStackPage from '@/pages/demo/charts/stack.vue'
import ChartsBarPage from '@/pages/demo/charts/bar.vue'
import ChartsLinePage from '@/pages/demo/charts/line.vue'
import ChartsCurvePage from '@/pages/demo/charts/curve.vue'
import ChartsAreaPage from '@/pages/demo/charts/area.vue'
import ChartsPiePage from '@/pages/demo/charts/pie.vue'
import ChartsRingPage from '@/pages/demo/charts/ring.vue'
import ChartsRosePage from '@/pages/demo/charts/rose.vue'
import ChartsFunnelPage from '@/pages/demo/charts/funnel.vue'
import ChartsRadarPage from '@/pages/demo/charts/radar.vue'
import ChartsGaugePage from '@/pages/demo/charts/gauge.vue'
import ChartsArcbarPage from '@/pages/demo/charts/arcbar.vue'
import ChartsMountPage from '@/pages/demo/charts/mount.vue'
import ChartsMixPage from '@/pages/demo/charts/mix.vue'
import ChartsScatterPage from '@/pages/demo/charts/scatter.vue'
import ChartsBubblePage from '@/pages/demo/charts/bubble.vue'
import ChartsCandlePage from '@/pages/demo/charts/candle.vue'
import ChartsWordPage from '@/pages/demo/charts/word.vue'
import ChartsMapPage from '@/pages/demo/charts/map.vue'
import ChartsTlinePage from '@/pages/demo/charts/tline.vue'
import ChartsTareaPage from '@/pages/demo/charts/tarea.vue'
import { normalizeLingyunPagePath } from '@/router/pageNav'
import { pageHostState } from '@/router/pageHost'

const currentPath = computed(() => normalizeLingyunPagePath(pageHostState.path))

watch(currentPath, () => {
  nextTick(() => {
    uni.pageScrollTo({ scrollTop: 0, duration: 0 })
  })
})
</script>

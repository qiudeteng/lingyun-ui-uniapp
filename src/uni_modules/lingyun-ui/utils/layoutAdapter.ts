/**
 * 设备形态适配。宿主可以把自己的机型判断方法接进来；
 * 没有接入时使用 screenResolve 的 fallback（Duo 按机型 + fold 状态）。
 */
import { ref } from 'vue'
import type {
  LingyunDuoPose,
  LingyunEnv,
  LingyunFormFactor,
} from './screenResolve'

export type LingyunLayoutAdapter = {
  getFormFactor?: () => LingyunFormFactor | ''
  getDuoPose?: () => LingyunDuoPose | ''
}

export type LingyunLayoutOverride = {
  formFactor?: LingyunFormFactor
  duoPose?: LingyunDuoPose
}

let adapter: LingyunLayoutAdapter = {}
let override: LingyunLayoutOverride | null = null
const version = ref(0)

/* 小程序暂不做 Duo 专属布局：回到按窗口宽度的标准方案 */
let duoSupported = true
// #ifdef MP-WEIXIN
duoSupported = false
// #endif

export function configureLingyunLayout(next: LingyunLayoutAdapter): void {
  adapter = next || {}
  version.value += 1
}

export function setLingyunLayoutOverride(next: LingyunLayoutOverride | null): void {
  override = next ? { ...next } : null
  version.value += 1
}

export function getLingyunLayoutOverride(): LingyunLayoutOverride | null {
  return override
}

export function setLingyunDuoSupported(value: boolean): void {
  duoSupported = !!value
  version.value += 1
}

export function isLingyunDuoSupported(): boolean {
  return duoSupported
}

function fallbackFormFactor(
  env: LingyunEnv,
  formFactor: LingyunFormFactor,
): LingyunFormFactor {
  if (formFactor !== 'duo') return formFactor
  if (env.screen === 'pc') return 'desktop'
  if (env.screen === 'pad') return 'tablet'
  return 'mobile'
}

/** 读取一次当前形态；组件 computed 依赖 version，宿主改配置后能刷新 */
export function resolveLingyunFormFactor(env: LingyunEnv): {
  formFactor: LingyunFormFactor
  duoPose: LingyunDuoPose
} {
  version.value
  const overriddenPose = override && override.duoPose
  const adapterPose = adapter.getDuoPose?.() || ''
  const formFactor =
    (override && override.formFactor) ||
    adapter.getFormFactor?.() ||
    (overriddenPose || adapterPose ? 'duo' : env.formFactor)
  const duoPose = overriddenPose || adapterPose || env.duoPose
  if (!duoSupported && formFactor === 'duo') {
    return { formFactor: fallbackFormFactor(env, formFactor), duoPose: '' }
  }
  return { formFactor, duoPose: formFactor === 'duo' ? duoPose : '' }
}

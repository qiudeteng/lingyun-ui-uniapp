/**
 * Pinia 实例创建入口（TypeScript）
 *
 * 选择「Pinia + 持久化」时自动注册 pinia-plugin-persistedstate，
 * 状态将同步到本地存储。
 */
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
/** 创建 pinia 实例 */
export function createPiniaStore() {
  const pinia = createPinia()
  pinia.use(piniaPersist)

  return pinia
}
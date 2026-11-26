export function nextLingyunUid(scope: string): number {
  const g = globalThis as unknown as Record<string, number>
  const key = `__lingyunUid_${scope}`
  const next = (g[key] || 0) + 1
  g[key] = next
  return next
}

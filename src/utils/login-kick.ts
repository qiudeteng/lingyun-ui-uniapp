type LoginKick = () => void

let kick: LoginKick | null = null

export function bindLoginKick(fn: LoginKick): void {
  kick = fn
}

export function runLoginKick(): boolean {
  if (!kick) return false
  kick()
  return true
}

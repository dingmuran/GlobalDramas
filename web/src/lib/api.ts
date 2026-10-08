import type { HealthState } from '@gload-dramas/contracts'

// 前台尚未接入观众认证，不调用后台登录或后台业务接口。
export async function checkHealth(signal: AbortSignal): Promise<HealthState> {
  const response = await fetch('/api/health', { signal, cache: 'no-store' })
  if (!response.ok || await response.json() !== 'ok') throw new Error('服务暂不可用')
  return 'available'
}

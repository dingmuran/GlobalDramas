import type { ApiResponse } from '@gload-dramas/contracts';
import { env } from '@/config/env';

/** 仅预留公开目录请求；观众会话接入后再扩展认证，不使用管理员 Token。 */
export async function api<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!env.apiBaseUrl) throw new Error('尚未配置 EXPO_PUBLIC_API_BASE_URL');
  const response = await fetch(`${env.apiBaseUrl}${path}`, { headers: { Accept: 'application/json' }, credentials: 'omit', signal });
  if (!response.ok) throw new Error(`请求失败（HTTP ${response.status}）`);
  const result: unknown = await response.json();
  if (typeof result !== 'object' || result === null || !('code' in result) || typeof result.code !== 'number' || !('data' in result) || !('msg' in result) || typeof result.msg !== 'string') {
    throw new Error('接口响应格式不正确');
  }
  const envelope = result as ApiResponse<T>;
  if (envelope.code !== 0) throw new Error(envelope.msg || '请求失败');
  return envelope.data;
}

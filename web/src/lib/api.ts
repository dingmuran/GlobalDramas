import type {
  ApiResponse,
  HealthState,
  PageResult,
  ViewerDrama,
  ViewerEpisode,
  ViewerHealth,
  ViewerPageQuery,
} from '@gload-dramas/contracts';

const VIEWER_API = '/api/viewer/v1';

// Public viewer requests deliberately do not attach the administrator session.
async function viewerRequest<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${VIEWER_API}${path}`, {
    signal,
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) throw new Error('服务暂不可用');
  const result = (await response.json()) as ApiResponse<T>;
  if (result.code !== 0) throw new Error(result.msg || '请求失败');
  return result.data;
}

function query(p: ViewerPageQuery = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(p)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params.size ? `?${params}` : '';
}

export async function checkHealth(signal: AbortSignal): Promise<HealthState> {
  const result = await viewerRequest<ViewerHealth>('/health', signal);
  if (result.status !== 'available') throw new Error('服务暂不可用');
  return 'available';
}

export const getDramas = (p?: ViewerPageQuery, signal?: AbortSignal) =>
  viewerRequest<PageResult<ViewerDrama>>(`/dramas${query(p)}`, signal);
export const getDrama = (id: number, signal?: AbortSignal) =>
  viewerRequest<ViewerDrama>(`/dramas/${id}`, signal);
export const getEpisodes = (
  id: number,
  p?: Pick<ViewerPageQuery, 'page' | 'pageSize'>,
  signal?: AbortSignal,
) =>
  viewerRequest<PageResult<ViewerEpisode>>(
    `/dramas/${id}/episodes${query(p)}`,
    signal,
  );

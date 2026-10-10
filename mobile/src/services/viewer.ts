import type { PageResult, ViewerDrama, ViewerEpisode, ViewerHealth, ViewerPageQuery } from '@gload-dramas/contracts';
import { api } from './api';

function queryString(query: ViewerPageQuery) {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.search !== undefined) params.set('search', query.search);
  return params.size > 0 ? `?${params}` : '';
}
export const viewerApi = {
  health: (signal?: AbortSignal) => api<ViewerHealth>('/viewer/v1/health', signal),
  dramas: (query: ViewerPageQuery = {}, signal?: AbortSignal) => api<PageResult<ViewerDrama>>(`/viewer/v1/dramas${queryString(query)}`, signal),
  drama: (id: number, signal?: AbortSignal) => api<ViewerDrama>(`/viewer/v1/dramas/${id}`, signal),
  episodes: (id: number, query: Pick<ViewerPageQuery, 'page' | 'pageSize'> = {}, signal?: AbortSignal) => api<PageResult<ViewerEpisode>>(`/viewer/v1/dramas/${id}/episodes${queryString(query)}`, signal),
};

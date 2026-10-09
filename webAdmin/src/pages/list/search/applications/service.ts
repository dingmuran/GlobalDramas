import { request } from '@/services/templateRequest';
import type { ListItemDataType, Params } from './data.d';

export async function queryFakeList(
  params: Params,
): Promise<{ data: { list: ListItemDataType[] } }> {
  return request('/api/fake_list', {
    params,
  });
}

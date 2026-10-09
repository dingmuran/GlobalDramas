import { request } from '@/services/templateRequest';
import type { BasicGood, BasicProgress } from './data.d';

export async function queryBasicProfile(): Promise<{
  data: {
    basicProgress: BasicProgress[];
    basicGoods: BasicGood[];
  };
}> {
  return request('/api/profile/basic');
}

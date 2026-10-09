import { request } from '@/services/templateRequest';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

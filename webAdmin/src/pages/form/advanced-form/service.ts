import { request } from '@/services/templateRequest';

export async function fakeSubmitForm(params: any) {
  return request('/api/advancedForm', {
    method: 'POST',
    data: params,
  });
}

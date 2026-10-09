import type {
  ApiResponse,
  CreateBackofficeAccount,
  PageQuery,
  PageResult,
} from '@gload-dramas/contracts';
import { type RequestOptions, request } from '@umijs/max';
import type {
  Action,
  Menu,
  Overview,
  Resource,
  Row,
  User,
} from '@/types/platform';
export async function api<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const result = await request<ApiResponse<T>>(url, {
    ...options,
    getResponse: false,
  });
  if (result.code !== 0) throw new Error(result.msg || '操作失败');
  return result.data;
}
export const schema = () => api<Resource[]>('/dramas/schema');
export const overview = () => api<Overview>('/dramas/overview');
export const records = (key: string, params: PageQuery = {}) =>
  api<PageResult<Row>>(`/dramas/records/${key}`, { params });
export const saveRecord = (
  key: string,
  data: Record<string, unknown>,
  id?: number,
) =>
  api<Row>(`/dramas/records/${key}${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    data,
  });
export const deleteRecord = (key: string, id: number) =>
  api(`/dramas/records/${key}/${id}`, { method: 'DELETE' });
export const action = (key: string, id: number, data: Action) =>
  api(`/dramas/actions/${key}/${id}`, { method: 'POST', data });
export const preview = (params: { dramaId: number; at?: string }) =>
  api<Record<string, unknown>>('/dramas/preview', { params });
export const accounts = () => api<User[]>('/dramas/accounts');
export const createAccount = (data: CreateBackofficeAccount) =>
  api<User>('/dramas/accounts', { method: 'POST', data });
export function importBills(file: File) {
  const data = new FormData();
  data.append('file', file);
  return api<{ imported: number }>('/dramas/bills/import', {
    method: 'POST',
    data,
  });
}
export const currentUser = () => api<{ userInfo: User }>('/user/getUserInfo');
export const menus = () =>
  api<{ menus: Menu[] }>('/menu/getMenu', { method: 'POST' });
export interface Captcha {
  captchaId: string;
  picPath: string;
  captchaLength: number;
  openCaptcha: boolean;
}
export const captcha = () => api<Captcha>('/base/captcha', { method: 'POST' });
export const login = (data: {
  username: string;
  password: string;
  captcha?: string;
  captchaId?: string;
}) =>
  api<{ user: User; token: string }>('/base/login', { method: 'POST', data });
export const logout = (token?: string) =>
  api('/jwt/jsonInBlacklist', {
    method: 'POST',
    ...(token ? { headers: { 'x-token': token } } : {}),
  });

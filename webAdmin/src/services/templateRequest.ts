import { request as umiRequest, type RequestOptions } from '@umijs/max';
// 官方示例请求不携带后台令牌，也不使用 Go 接口前缀。
export function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> { return umiRequest<T>(url, {...options, baseURL: '', headers: {'x-template-demo': 'true'}, getResponse: false}); }

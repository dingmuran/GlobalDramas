/** 接口类型不授予权限，Go 服务负责实际鉴权和参数校验。 */
export interface ApiResponse<T> { code: number; data: T; msg: string }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number }
export interface PageQuery { page?: number; pageSize?: number; search?: string; status?: string; dramaId?: number; id?: number }
export type BackofficeRole = 300 | 888
export type HealthState = 'checking' | 'available' | 'unavailable'
/** Go 的 json:",string" 金额以十进制字符串返回；不要用浮点数计算。 */
export type MoneyMinor = string
export type DateTime = string
export interface CreateBackofficeAccount { username: string; password: string; nickName?: string; role: BackofficeRole }

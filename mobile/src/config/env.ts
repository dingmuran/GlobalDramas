/** EXPO_PUBLIC_* 会打包到客户端，只允许存放公开配置。 */
export const env = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
} as const;

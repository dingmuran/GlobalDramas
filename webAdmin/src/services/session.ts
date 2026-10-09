const KEY = 'gload.backoffice.token.v1';
export function getToken() {
  const current = sessionStorage.getItem(KEY);
  if (current) return current;
  // Migrate the existing Vue session once, while the server still verifies JWT.
  const previous =
    localStorage.getItem('token') ||
    document.cookie
      .split('; ')
      .find((part) => part.startsWith('x-token='))
      ?.slice(8) ||
    '';
  if (previous) {
    sessionStorage.setItem(KEY, decodeURIComponent(previous));
    localStorage.removeItem('token');
  }
  return sessionStorage.getItem(KEY) || '';
}
export function setToken(token: string) {
  sessionStorage.setItem(KEY, token);
}
export function clearSession() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem('token');
  // biome-ignore lint/suspicious/noDocumentCookie: 清除旧版登录cookie，兼容尚无Cookie Store的浏览器
  document.cookie = 'x-token=; Max-Age=0; path=/';
}

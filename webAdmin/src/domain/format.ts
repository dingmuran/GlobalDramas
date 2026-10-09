export const statuses: Record<string, string> = {
  draft: '草稿',
  pending: '待处理',
  pending_review: '待审核',
  approved: '审核通过',
  rejected: '已拒绝',
  published: '已发布',
  offline: '已下架',
  active: '已生效',
  inactive: '已停用',
  recorded: '已记录',
  attempted: '已尝试',
  failed: '失败',
  rewarded: '已发奖',
  granted: '已补偿',
  paid: '已支付',
  refunded: '已退款',
  received: '已到账',
  reconciled: '已对账',
  resolved: '已处理',
  revoked: '已撤销',
};
export const labels: Record<string, string> = {
  apple: 'Apple',
  google: 'Google',
  web: 'Web',
  episode: '单集购买',
  membership: '会员首购',
  renewal: '会员续费',
  copyright: '版权方',
  producer: '制片方',
  both: '版权方与制片方',
  content: '内容',
  payment: '支付',
  playback: '播放',
  ad: '广告',
  other: '其他',
  info: '提示',
  warning: '警告',
  critical: '严重',
  no_fill: '无广告填充',
  timeout: '超时',
  network: '网络错误',
  cancelled: '用户取消',
  provider_error: '平台错误',
  play: '播放开始',
  complete: '播放完成',
  buffer: '卡顿事件',
  error: '播放失败',
  progress: '观看进度',
};
export function money(value: unknown, currency = 'CNY') {
  const raw = String(value ?? '0');
  if (!/^-?\d+$/.test(raw)) return '—';
  const sign = raw.startsWith('-') ? '-' : '';
  const digits = raw.replace(/^-/, '');
  const padded = currency === 'JPY' ? digits : digits.padStart(3, '0');
  const whole = currency === 'JPY' ? padded : padded.slice(0, -2);
  return `${currency} ${sign}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${currency === 'JPY' ? '' : `.${padded.slice(-2)}`}`;
}
export function date(value: unknown) {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('zh-CN', { hour12: false });
}
export function percent(n: number | null, d: number) {
  return n === null ? '观察中' : d ? `${((n / d) * 100).toFixed(1)}%` : '—';
}
export function statusColor(s: string) {
  return [
    'published',
    'active',
    'approved',
    'paid',
    'received',
    'resolved',
    'rewarded',
  ].includes(s)
    ? 'success'
    : ['failed', 'rejected', 'revoked'].includes(s)
      ? 'error'
      : ['pending', 'pending_review', 'attempted'].includes(s)
        ? 'warning'
        : 'default';
}

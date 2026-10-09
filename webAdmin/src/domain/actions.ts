import type { Resource, Row } from '@/types/platform';
export interface BusinessAction {
  key: string;
  label: string;
}
export function canEdit(resource: Resource, row: Row) {
  return (
    (resource.canEdit ?? resource.canWrite) &&
    !['orders', 'refunds', 'ads'].includes(resource.key) &&
    !(
      resource.key === 'dramas' &&
      !['draft', 'rejected', 'offline'].includes(row.status)
    ) &&
    !(
      ['bills', 'settlements', 'compensations'].includes(resource.key) &&
      row.status !== 'draft'
    )
  );
}
export function rowActions(
  key: string,
  row: Row,
  role: number,
  canWrite: boolean,
): BusinessAction[] {
  const st = row.status,
    out: BusinessAction[] = [];
  const add = (key: string, label: string) => out.push({ key, label });
  if (key === 'dramas') {
    if (['draft', 'rejected', 'offline'].includes(st)) {
      add('submit', '提交审核');
      add('batch', '批量创建单集');
    }
    add('version', '保存内容版本');
    if (st === 'pending_review' && role === 888) {
      add('approve', '审核通过');
      add('reject', '审核拒绝');
    }
    if (st === 'approved') add('publish', '发布');
    if (st === 'published') add('offline', '下架');
  }
  if (['plans', 'policies'].includes(key) && role === 888)
    add(
      st === 'active' ? 'disable' : 'activate',
      st === 'active' ? '停用 / 下架' : '启用 / 上架',
    );
  if (
    ['orders', 'refunds', 'ads', 'compensations', 'settlements'].includes(
      key,
    ) &&
    role === 888 &&
    ['pending', 'draft', 'attempted'].includes(st)
  )
    add('request', '提交凭据并申请审批');
  if (key === 'orders' && st === 'paid' && role === 888)
    add('refund', '申请退款');
  if (key === 'approvals' && st === 'pending' && role === 888)
    add('decide', '审批申请');
  if (key === 'feedback' && st !== 'resolved' && role === 888)
    add('resolve', '回复并处理');
  if (key === 'alerts' && st !== 'resolved' && role === 888)
    add('resolve', '记录恢复并关闭告警');
  if (key === 'bills' && st === 'draft' && role === 888)
    add('reconcile', '对账与差异处理');
  if (key === 'ads' && st === 'attempted' && role === 888)
    add('fail', '标记广告失败');
  if (
    ['dramas', 'episodes', 'versions'].includes(key) &&
    st === 'draft' &&
    canWrite
  )
    add('delete', '删除草稿');
  return out;
}

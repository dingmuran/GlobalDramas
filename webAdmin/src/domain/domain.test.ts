import { describe, expect, it } from 'vitest';
import type { InitialState, Resource, Row } from '@/types/platform';
import { buildAccess } from './access';
import { canEdit, rowActions } from './actions';
import { money, percent } from './format';

const state = (role: 300 | 888, names: string[]): InitialState => ({
  currentUser: {
    ID: 1,
    userName: 'test',
    nickName: '测试',
    authorityId: role,
    authority: { authorityId: role, authorityName: '测试', defaultRouter: '' },
    enable: 1,
  },
  menus: names.map((name, index) => ({
    ID: index + 1,
    name,
    path: name,
    parentId: 0,
    meta: { title: name },
  })),
  schema: [],
});
describe('后台权限边界', () => {
  it('版权方即使收到管理员菜单也不能打开审核和财务', () => {
    const access = buildAccess(
      state(300, ['GDStudio', 'GDReviews', 'GDFinance']),
    );
    expect(access.GDStudio).toBe(true);
    expect(access.GDReviews).toBe(false);
    expect(access.GDFinance).toBe(false);
    expect(access.canAdmin).toBe(false);
  });
  it('没有菜单授权时不能靠角色打开业务页面', () => {
    expect(buildAccess(state(888, [])).GDOverview).toBe(false);
    expect(buildAccess().signedIn).toBe(false);
  });
  it('版权方没有审核、付款审批和广告发奖入口', () => {
    const pending = { id: 1, status: 'pending_review' } as Row;
    expect(
      rowActions('dramas', pending, 300, true).map((a) => a.key),
    ).not.toContain('approve');
    expect(
      rowActions('orders', { id: 1, status: 'pending' }, 300, false),
    ).toEqual([]);
  });
  it('已发布内容不可编辑，待审核内容不显示删除和发布', () => {
    const resource = { key: 'dramas', canWrite: true } as Resource;
    expect(canEdit(resource, { id: 1, status: 'published' })).toBe(false);
    const keys = rowActions(
      'dramas',
      { id: 1, status: 'pending_review' },
      888,
      true,
    ).map((a) => a.key);
    expect(keys).toContain('approve');
    expect(keys).not.toContain('delete');
    expect(keys).not.toContain('publish');
  });
});
describe('财务与统计契约', () => {
  it('超出JS安全整数的金额按字符串精确展示', () => {
    expect(money('900719925474099312', 'USD')).toBe(
      'USD 9,007,199,254,740,993.12',
    );
    expect(money('-105', 'CNY')).toBe('CNY -1.05');
  });
  it('日元不除以100，非法金额不伪装成收入', () => {
    expect(money('1500', 'JPY')).toBe('JPY 1,500');
    expect(money('invalid')).toBe('—');
  });
  it('尚未到观察期的留存不显示为0%', () => {
    expect(percent(null, 10)).toBe('观察中');
    expect(percent(0, 10)).toBe('0.0%');
  });
});

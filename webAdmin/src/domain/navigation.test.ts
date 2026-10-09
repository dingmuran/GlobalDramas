import { describe, expect, it } from 'vitest';
import type { InitialState, Menu } from '@/types/platform';
import { buildAccess } from './access';
import { navigation } from './navigation';

const menu = (name: string, extra: Partial<Menu> = {}): Menu => ({
  ID: 1,
  parentId: 0,
  name,
  path: name,
  meta: { title: name },
  ...extra,
});
describe('Go分组菜单', () => {
  it('保留二级结构和系统管理入口，不显示空目录或隐藏项', () => {
    const result = navigation([
      menu('系统管理', {
        component: 'Layout',
        children: [
          menu('角色管理', { path: 'system/roles' }),
          menu('菜单管理', { path: 'system/menus' }),
        ],
      }),
      menu('空目录', { component: 'Layout' }),
      menu('隐藏', { hidden: true }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].children?.map((m) => m.path)).toEqual([
      '/system/roles',
      '/system/menus',
    ]);
  });
  it('自定义标题、顺序与路径来自服务端', () => {
    expect(
      navigation([
        menu('Custom', {
          meta: { title: '自定义标题' },
          path: '/system/menus',
        }),
      ])[0],
    ).toMatchObject({ name: '自定义标题', path: '/system/menus' });
  });
  it('菜单别名允许已有页面，仍不能跨后台角色越权', () => {
    const menus = [menu('Custom', { path: 'GDDramas' })];
    const state = {
      currentUser: {
        ID: 1,
        userName: 'test',
        nickName: '测试',
        enable: 1,
        authorityId: 300,
        authority: {
          authorityId: 300,
          authorityName: '版权方',
          defaultRouter: 'GDStudio',
        },
      },
      menus,
      schema: [],
    } as InitialState;
    expect(buildAccess(state).GDDramas).toBe(true);
    expect(buildAccess(state).GDReviews).toBe(false);
    expect(buildAccess(state).canAdmin).toBe(false);
  });
});

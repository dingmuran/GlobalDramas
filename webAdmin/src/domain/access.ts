import type { InitialState, Menu } from '@/types/platform';
import { businessPages } from './pages';
export function flattenMenus(menus: Menu[]): Menu[] {
  return menus.flatMap((menu) => [menu, ...flattenMenus(menu.children || [])]);
}
export function buildAccess(state?: InitialState): Record<string, boolean> {
  const role = state?.currentUser?.authorityId;
  const names = new Set(
    flattenMenus(state?.menus || []).map((menu) => menu.name),
  );
  const paths = new Set(
    flattenMenus(state?.menus || []).map((m) => m.path.replace(/^\//, '')),
  );
  return {
    canUser: role === 300 || role === 888,
    canEditor: role === 888,
    canRoute: role === 300 || role === 888,
    signedIn: role === 300 || role === 888,
    canAdmin: role === 888,
    ...Object.fromEntries(
      businessPages.map((page) => [
        page.key,
        role === page.role && (names.has(page.key) || paths.has(page.key)),
      ]),
    ),
  };
}

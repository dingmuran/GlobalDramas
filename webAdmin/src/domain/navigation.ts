import type { Menu } from '@/types/platform';
import { businessPages } from './pages';
export interface NavigationItem {
  key: string;
  name: string;
  path?: string;
  icon?: string;
  children?: NavigationItem[];
}
export function navigation(menus: Menu[], role?: number): NavigationItem[] {
  return menus
    .filter((m) => !m.hidden)
    .flatMap<NavigationItem>((m) => {
      const children = navigation(m.children || [], role);
      if (m.component === 'Layout' || (m.children || []).length)
        return children.length
          ? [{ key: m.name, name: m.meta.title, icon: m.meta.icon, children }]
          : [];
      const page = businessPages.find(
        (p) => p.key === m.path.replace(/^\//, ''),
      );
      if (
        role &&
        ((page && page.role !== role) ||
          (m.path.startsWith('system/') && role !== 888))
      )
        return [];
      return [
        {
          key: m.name,
          name: m.meta.title,
          path: `/${m.path.replace(/^\//, '')}`,
          icon: m.meta.icon,
        },
      ];
    });
}

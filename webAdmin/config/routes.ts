import { businessPages } from '../src/domain/pages';
export default [
  { path: '/user/login', component: './Login', layout: false },
  { path: '/', component: './Home', hideInMenu: true },
  { path: '/dashboard/analysis', component: './Home', hideInMenu: true },
  ...businessPages.map((p) => ({
    path: `/${p.key}`,
    name: p.title,
    component: './Workspace',
    access: p.key,
  })),
  {
    path: '/system/roles',
    name: '角色管理',
    component: './Roles',
    access: 'canAdmin',
  },
  {
    path: '/system/menus',
    name: '菜单管理',
    component: './Menus',
    access: 'canAdmin',
  },
  {
    path: '/system/users',
    name: '用户管理',
    component: './SystemUsers',
    access: 'canAdmin',
  },
  ...['apis', 'dictionaries', 'params', 'tokens', 'versions'].map((key) => ({
    path: `/system/${key}`,
    component: './SystemRecords',
    access: 'canAdmin',
  })),
  ...['login', 'operation', 'error'].map((key) => ({
    path: `/system/logs/${key}`,
    component: './Logs',
    access: 'canAdmin',
  })),
  {
    path: '/system/logs',
    redirect: '/system/logs/operation',
    hideInMenu: true,
  },
  {
    path: '/system/assets',
    name: '素材文件',
    component: './Assets',
    access: 'canAdmin',
  },
  {
    path: '/profile',
    name: '个人设置',
    component: './BusinessProfile',
    hideInMenu: true,
    access: 'signedIn',
  },
  { path: '/*', component: './exception/404' },
];

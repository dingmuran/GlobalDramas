import {
  AccountBookOutlined,
  BarChartOutlined,
  ControlOutlined,
  DashboardOutlined,
  FolderOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

import { SettingDrawer } from '@ant-design/pro-components';
import { QueryClientProvider } from '@tanstack/react-query';
import type {
  RequestConfig,
  RequestOptions,
  RunTimeLayoutConfig,
} from '@umijs/max';
import { history, Link } from '@umijs/max';
import { message } from 'antd';
import type { ReactNode } from 'react';
import { AvatarDropdown, LangDropdown } from '@/components';
import { type NavigationItem, navigation } from '@/domain/navigation';
import { currentUser, menus, schema } from '@/services/api';
import { queryClient } from '@/services/query';
import { clearSession, getToken, setToken } from '@/services/session';
import type { InitialState } from '@/types/platform';
import settings from '../config/defaultSettings';

const icons: Record<string, ReactNode> = {
  setting: <SettingOutlined />,
  team: <TeamOutlined />,
  videoCamera: <VideoCameraOutlined />,
  control: <ControlOutlined />,
  accountBook: <AccountBookOutlined />,
  barChart: <BarChartOutlined />,
  safety: <SafetyOutlined />,
  dashboard: <DashboardOutlined />,
  folder: <FolderOutlined />,
};
function toProMenus(items: NavigationItem[]): any[] {
  return items.map((item) => ({
    ...item,
    icon: item.icon ? icons[item.icon] : undefined,
    children: item.children ? toProMenus(item.children) : undefined,
  }));
}
export async function getInitialState(): Promise<InitialState> {
  if (!getToken()) return { menus: [], schema: [] };
  try {
    const [{ userInfo }, menuData, resources] = await Promise.all([
      currentUser(),
      menus(),
      schema(),
    ]);
    if (![300, 888].includes(userInfo.authorityId)) {
      clearSession();
      return { menus: [], schema: [] };
    }
    return {
      currentUser: {
        ...userInfo,
        name: userInfo.nickName,
        avatar: userInfo.headerImg,
        userid: String(userInfo.ID),
      },
      menus: menuData.menus || [],
      schema: resources,
    };
  } catch {
    clearSession();
    return { menus: [], schema: [] };
  }
}
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => ({
  ...settings,
  ...initialState?.settings,
  childrenRender: (children) => (
    <>
      {children}
      <SettingDrawer
        hideHintAlert
        drawerProps={{
          title: '主题设置',
          closable: true,
          onClose: () =>
            setInitialState((prev) => ({
              ...(prev || { menus: [], schema: [] }),
              settingDrawerOpen: false,
            })),
        }}
        disableUrlParams
        onCollapseChange={(open) =>
          setInitialState((prev) => ({
            ...(prev || { menus: [], schema: [] }),
            settingDrawerOpen: open,
          }))
        }
        collapse={initialState?.settingDrawerOpen}
        enableDarkTheme
        settings={initialState?.settings || settings}
        onSettingChange={(next) =>
          setInitialState((prev) => ({
            ...(prev || { menus: [], schema: [] }),
            settings: next,
          }))
        }
      />
    </>
  ),
  footerRender: false,
  menu: {
    locale: false,
    params: { menus: initialState?.menus },
    request: async () =>
      toProMenus(
        navigation(
          initialState?.menus || [],
          initialState?.currentUser?.authorityId,
        ),
      ),
  },
  menuItemRender: (item, dom) =>
    item.path ? <Link to={item.path}>{dom}</Link> : dom,
  actionsRender: () => [<LangDropdown key="language" />],
  avatarProps: {
    src: initialState?.currentUser?.headerImg,
    title: initialState?.currentUser?.nickName || '账号',
    render: (_props, dom) => <AvatarDropdown>{dom}</AvatarDropdown>,
  },
  onPageChange: () => {
    if (
      !initialState?.currentUser &&
      history.location.pathname !== '/user/login'
    )
      history.replace('/user/login');
  },
});
export const request: RequestConfig = {
  baseURL: '/api',
  timeout: 20_000,
  withCredentials: true,
  requestInterceptors: [
    (config: RequestOptions) => {
      config.headers = { ...config.headers };
      if (!config.headers['x-template-demo'])
        config.headers['x-token'] ??= getToken();
      return config;
    },
  ],
  responseInterceptors: [
    (response) => {
      const token = response.headers['new-token'];
      if (token && getToken()) setToken(String(token));
      const body = response.data as { code?: number; msg?: string };
      if (body?.code === 401) {
        clearSession();
        queryClient.clear();
        history.replace('/user/login');
      }
      if (body?.code !== undefined && body.code !== 0)
        throw new Error(body.msg || '请求失败');
      return response;
    },
  ],
  errorConfig: {
    errorThrower: (data) => {
      if (data.code !== undefined && data.code !== 0) {
        const error = new Error(data.msg || '请求失败');
        throw error;
      }
    },
    errorHandler: (error) => {
      if ('response' in error && error.response?.status === 401) {
        clearSession();
        queryClient.clear();
        history.replace('/user/login');
      }
      message.error(error.message || '网络请求失败，请稍后重试');
    },
  },
};
export function rootContainer(container: ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>{container}</QueryClientProvider>
  );
}

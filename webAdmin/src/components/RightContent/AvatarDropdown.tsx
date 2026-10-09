import {
  LogoutOutlined,
  SettingOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Spin } from 'antd';
import React from 'react';
import { logout as outLogin } from '@/services/api';
import { queryClient } from '@/services/query';
import { clearSession, getToken } from '@/services/session';
import HeaderDropdown from '../HeaderDropdown';

type GlobalHeaderRightProps = {
  children?: React.ReactNode;
};

const menuItems: MenuProps['items'] = [
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '个人设置',
  },
  {
    key: 'theme',
    icon: <SkinOutlined />,
    label: '主题设置',
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
];

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  children,
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      const token = getToken();
      clearSession();
      queryClient.clear();
      void setInitialState({ menus: [], schema: [], settingDrawerOpen: false });
      history.replace('/user/login');
      // Revoke the captured token without delaying local sign-out.
      void outLogin(token).catch(() => {});
      return;
    }
    if (key === 'theme') {
      setInitialState((s) => ({
        ...(s || { menus: [], schema: [] }),
        settingDrawerOpen: true,
      }));
      return;
    }
    history.push('/profile');
  };

  if (!initialState) {
    return <Spin size="small" />;
  }

  const { currentUser } = initialState;

  if (!currentUser) {
    return <Spin size="small" />;
  }

  return (
    <HeaderDropdown
      placement="bottomRight"
      trigger={['click']}
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
      arrow
    >
      <button
        type="button"
        aria-label="账号菜单"
        className="account-menu-trigger"
      >
        {children}
      </button>
    </HeaderDropdown>
  );
};

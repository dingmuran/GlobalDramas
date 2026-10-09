import {
  PageContainer,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Card, message, Tabs } from 'antd';
import { api, currentUser, logout } from '@/services/api';
import { queryClient } from '@/services/query';
import { clearSession } from '@/services/session';
export default function Profile() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const user = initialState?.currentUser;
  return (
    <PageContainer title="个人设置" subTitle="更新资料与登录密码">
      <Card style={{ maxWidth: 700 }}>
        <Tabs
          items={[
            {
              key: 'info',
              label: '个人资料',
              children: (
                <ProForm
                  initialValues={user}
                  onFinish={async (values) => {
                    try {
                      await api('/user/setSelfInfo', {
                        method: 'PUT',
                        data: {
                          nickName: values.nickName,
                          phone: values.phone,
                          email: values.email,
                          headerImg: user?.headerImg || '/gload-dramas.svg',
                        },
                      });
                      const { userInfo } = await currentUser();
                      await setInitialState((s) => ({
                        ...(s || { menus: [], schema: [] }),
                        currentUser: userInfo,
                      }));
                      message.success('资料已更新');
                      return true;
                    } catch {
                      return false;
                    }
                  }}
                >
                  <ProFormText
                    name="nickName"
                    label="显示名称"
                    rules={[{ required: true }]}
                  />
                  <ProFormText name="phone" label="联系电话" />
                  <ProFormText
                    name="email"
                    label="邮箱"
                    rules={[{ type: 'email' }]}
                  />
                </ProForm>
              ),
            },
            {
              key: 'password',
              label: '修改密码',
              children: (
                <ProForm
                  onFinish={async (values) => {
                    try {
                      await api('/user/changePassword', {
                        method: 'POST',
                        data: {
                          password: values.password,
                          newPassword: values.newPassword,
                        },
                      });
                      try {
                        await logout();
                      } catch {}
                      clearSession();
                      queryClient.clear();
                      await setInitialState({ menus: [], schema: [] });
                      message.success('密码已更新，请重新登录');
                      history.replace('/user/login');
                      return true;
                    } catch {
                      return false;
                    }
                  }}
                >
                  <ProFormText.Password
                    name="password"
                    label="当前密码"
                    rules={[{ required: true }]}
                    fieldProps={{ autoComplete: 'current-password' }}
                  />
                  <ProFormText.Password
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true },
                      {
                        validator: (_rule, value) => {
                          const n = new TextEncoder().encode(
                            value || '',
                          ).length;
                          return n >= 12 && n <= 72
                            ? Promise.resolve()
                            : Promise.reject(new Error('密码须为12至72字节'));
                        },
                      },
                    ]}
                    fieldProps={{ autoComplete: 'new-password' }}
                  />
                </ProForm>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}

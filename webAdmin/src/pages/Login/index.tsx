import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { history, useModel } from '@umijs/max';
import { Alert, Button, message, Spin } from 'antd';
import { useState } from 'react';
import { captcha, currentUser, login, menus, schema } from '@/services/api';
import { queryClient } from '@/services/query';
import { clearSession, setToken } from '@/services/session';
export default function Login() {
  const { setInitialState } = useModel('@@initialState');
  const [error, setError] = useState('');
  const challenge = useQuery({
    queryKey: ['captcha'],
    queryFn: captcha,
    staleTime: 0,
  });
  return (
    <main className="login-shell">
      <section className="login-form-panel">
        <LoginForm
          logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          title="Gload Dramas"
          subTitle="使用已授权的后台账号继续"
          submitter={{ searchConfig: { submitText: '登录' } }}
          onFinish={async (values) => {
            setError('');
            try {
              const result = await login({
                username: String(values.username),
                password: String(values.password),
                captcha: values.captcha,
                captchaId: challenge.data?.captchaId,
              });
              queryClient.clear();
              setToken(result.token);
              const [{ userInfo }, menuData, resources] = await Promise.all([
                currentUser(),
                menus(),
                schema(),
              ]);
              if (![300, 888].includes(userInfo.authorityId)) {
                clearSession();
                setError('此账号无后台管理权限');
                return false;
              }
              await setInitialState({
                currentUser: {
                  ...userInfo,
                  name: userInfo.nickName,
                  avatar: userInfo.headerImg,
                  userid: String(userInfo.ID),
                },
                menus: menuData.menus || [],
                schema: resources,
              });
              message.success('登录成功');
              history.replace('/');
              return true;
            } catch (e) {
              clearSession();
              setError(e instanceof Error ? e.message : '登录失败');
              await challenge.refetch();
              return false;
            }
          }}
        >
          {error && (
            <Alert
              type="error"
              showIcon
              title={error}
              style={{ marginBottom: 20 }}
            />
          )}
          <ProFormText
            name="username"
            label="登录账号"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
              autoComplete: 'username',
            }}
            placeholder="请输入账号"
            rules={[{ required: true, message: '请输入账号' }]}
          />
          <ProFormText.Password
            name="password"
            label="密码"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
              autoComplete: 'current-password',
            }}
            placeholder="请输入密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
          {challenge.isPending ? (
            <Spin />
          ) : challenge.isError ? (
            <Alert
              type="error"
              title="验证码服务连接失败"
              action={<Button onClick={() => challenge.refetch()}>重试</Button>}
            />
          ) : challenge.data?.openCaptcha ? (
            <div className="captcha-row">
              <ProFormText
                name="captcha"
                label="验证码"
                fieldProps={{
                  prefix: <SafetyCertificateOutlined />,
                  maxLength: challenge.data.captchaLength,
                }}
                rules={[{ required: true, message: '请输入验证码' }]}
              />
              <Button
                type="text"
                aria-label="刷新验证码"
                onClick={() => challenge.refetch()}
              >
                <img alt="登录验证码" src={challenge.data.picPath} />
              </Button>
            </div>
          ) : null}
        </LoginForm>
        <p className="login-note">仅限超级管理员与版权方 / 制片方使用</p>
      </section>
    </main>
  );
}

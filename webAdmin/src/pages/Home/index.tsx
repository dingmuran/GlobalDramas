import { Navigate, useModel } from '@umijs/max';
import { Result } from 'antd';
import { buildAccess } from '@/domain/access';
import { businessPages } from '@/domain/pages';
export default function Home() {
  const { initialState } = useModel('@@initialState');
  if (!initialState?.currentUser) return <Navigate to="/user/login" replace />;
  const access = buildAccess(initialState);
  const home = businessPages.find((p) => access[p.key]);
  return home ? (
    <Navigate to={`/${home.key}`} replace />
  ) : (
    <Result status="403" title="暂无可访问页面，请检查角色菜单授权" />
  );
}

import { ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useModel } from '@umijs/max';
import { Alert, Button, Result, Spin, Tabs } from 'antd';
import { useState } from 'react';
import { Analytics, Revenue, Summary } from '@/components/Metrics';
import ResourceTable from '@/components/ResourceTable';
import { businessPages } from '@/domain/pages';
import { overview } from '@/services/api';
import type { Resource } from '@/types/platform';
export default function Workspace() {
  const location = useLocation();
  const { initialState } = useModel('@@initialState');
  const client = useQueryClient();
  const [selected, setSelected] = useState('');
  const page = businessPages.find((p) => `/${p.key}` === location.pathname);
  const role = initialState?.currentUser?.authorityId || 0;
  const stats = useQuery({
    queryKey: ['overview', initialState?.currentUser?.ID, role],
    queryFn: overview,
    enabled: !!page && (!!page.dashboard || !!page.analytics || !!page.revenue),
  });
  if (!page) return <Result status="404" title="页面不存在" />;
  const schema = initialState?.schema || [];
  const resources = page.resources.flatMap((key) => {
    if (key === 'accounts' && role === 888)
      return [
        {
          key,
          title: '用户账号',
          fields: [],
          canWrite: true,
          role: 888,
        } as Resource,
      ];
    const resource = schema.find((s) => s.key === key);
    return resource ? [resource] : [];
  });
  const active = resources.find((r) => r.key === selected) || resources[0];
  return (
    <PageContainer
      title={page.title}
      subTitle={page.description}
      extra={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() =>
            client.invalidateQueries({
              queryKey: ['overview', initialState?.currentUser?.ID, role],
            })
          }
        >
          刷新统计
        </Button>,
      ]}
    >
      {(page.dashboard || page.analytics || page.revenue) &&
        (stats.isPending ? (
          <div className="loading-panel">
            <Spin />
          </div>
        ) : stats.isError ? (
          <Alert
            type="error"
            showIcon
            title="统计加载失败"
            action={<Button onClick={() => stats.refetch()}>重试</Button>}
          />
        ) : stats.data ? (
          <>
            {page.dashboard && (
              <Summary data={stats.data} role={role} schema={schema} />
            )}{' '}
            {page.analytics && <Analytics data={stats.data} />}{' '}
            {page.revenue && <Revenue data={stats.data} />}
          </>
        ) : null)}
      {resources.length > 0 && (
        <div className="resource-section">
          <Tabs
            activeKey={active?.key}
            onChange={setSelected}
            items={resources.map((r) => ({ key: r.key, label: r.title }))}
          />
          {active && (
            <ResourceTable
              key={`${page.key}:${active.key}`}
              resource={active}
              onChange={() =>
                client.invalidateQueries({
                  queryKey: ['overview', initialState?.currentUser?.ID, role],
                })
              }
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}

import { PageContainer } from '@ant-design/pro-components';
import ResourceTable from '@/components/ResourceTable';
export default function SystemUsers() {
  return (
    <PageContainer title="用户管理" subTitle="后台账号、角色与启用状态">
      <ResourceTable
        resource={{
          key: 'accounts',
          title: '用户账号',
          fields: [],
          canWrite: true,
          role: 888,
        }}
        onChange={() => {}}
      />
    </PageContainer>
  );
}

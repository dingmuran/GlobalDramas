import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { PageResult } from '@gload-dramas/contracts';
import { useLocation } from '@umijs/max';
import { Button, Drawer } from 'antd';
import { useState } from 'react';
import { date } from '@/domain/format';
import { api } from '@/services/api';

type Log = { ID: number; [key: string]: unknown };
const definitions: Record<
  string,
  { title: string; path: string; fields: [string, string][] }
> = {
  login: {
    title: '登录日志',
    path: '/sysLoginLog/getLoginLogList',
    fields: [
      ['username', '登录账号'],
      ['ip', 'IP'],
      ['status', '登录成功'],
      ['errorMessage', '结果说明'],
      ['agent', '客户端'],
    ],
  },
  operation: {
    title: '操作日志',
    path: '/sysOperationRecord/getSysOperationRecordList',
    fields: [
      ['userID', '账号ID'],
      ['path', '请求路径'],
      ['method', '方法'],
      ['status', 'HTTP状态'],
      ['ip', 'IP'],
      ['latency', '耗时'],
    ],
  },
  error: {
    title: '错误日志',
    path: '/sysError/getSysErrorList',
    fields: [
      ['form', '来源'],
      ['info', '错误信息'],
      ['status', '处理状态'],
    ],
  },
};
export default function Logs() {
  const location = useLocation();
  const active = location.pathname.split('/').pop() || 'operation';
  const [detail, setDetail] = useState<Log>();
  const def = definitions[active] || definitions.operation;
  const columns: ProColumns<Log>[] = [
    { title: 'ID', dataIndex: 'ID', width: 80 },
    {
      title: '记录时间',
      dataIndex: 'CreatedAt',
      width: 180,
      render: (_dom, row) => date(row.CreatedAt),
    },
    ...def.fields.map(([dataIndex, title]) => ({
      title,
      dataIndex,
      ellipsis: true,
      render: (_dom: unknown, row: Log) =>
        typeof row[dataIndex] === 'boolean'
          ? row[dataIndex]
            ? '是'
            : '否'
          : String(row[dataIndex] ?? '—'),
    })),
    {
      title: '详情',
      valueType: 'option',
      render: (_dom, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          查看记录
        </Button>
      ),
    },
  ];
  return (
    <PageContainer title={def.title} subTitle="查询真实登录、操作及错误记录">
      <ProTable<Log>
        key={active}
        rowKey="ID"
        headerTitle={def.title}
        search={false}
        columns={columns}
        scroll={{ x: 1000 }}
        request={async (params) => {
          const data = await api<PageResult<Log>>(def.path, {
            params: { page: params.current, pageSize: params.pageSize },
          });
          return { data: data.list, total: data.total, success: true };
        }}
      />
      <Drawer
        title="日志详情"
        open={!!detail}
        onClose={() => setDetail(undefined)}
        width={640}
      >
        <pre className="detail-value">{JSON.stringify(detail, null, 2)}</pre>
      </Drawer>
    </PageContainer>
  );
}

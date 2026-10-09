import { DownOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Dropdown,
  message,
  Popconfirm,
  Space,
  Tag,
  Upload,
} from 'antd';
import { useRef, useState } from 'react';
import type { BusinessAction } from '@/domain/actions';
import { canEdit, rowActions } from '@/domain/actions';
import { date, labels, money, statusColor, statuses } from '@/domain/format';
import { accounts, deleteRecord, importBills, records } from '@/services/api';
import type { Field, Resource, Row, User } from '@/types/platform';
import AccountEdit from './AccountEdit';
import AccountForm from './AccountForm';
import ActionForm from './ActionForm';
import PolicyPreview from './PolicyPreview';
import RecordForm from './RecordForm';

function cell(value: unknown, field: Field, row: Row) {
  if (value === null || value === undefined || value === '') return '—';
  if (field.key.endsWith('Minor')) return money(value, row.currency);
  if (field.type === 'datetime' || field.key.endsWith('At')) return date(value);
  if (field.type === 'boolean') return value ? '开启' : '关闭';
  return typeof value === 'object'
    ? JSON.stringify(value)
    : labels[String(value)] || String(value);
}
export default function ResourceTable({
  resource,
  onChange,
}: {
  resource: Resource;
  onChange: () => void;
}) {
  const { initialState } = useModel('@@initialState');
  const role = initialState?.currentUser?.authorityId || 0;
  const actionRef = useRef<ActionType>(null);
  const [editing, setEditing] = useState<{ row?: Row } | null>(null);
  const [chosen, setChosen] = useState<{
    row: Row;
    item: BusinessAction;
  } | null>(null);
  const [accountEditing, setAccountEditing] = useState<User>();
  const [detail, setDetail] = useState<Row | User>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const isAccount = resource.key === 'accounts';
  const reload = () => {
    actionRef.current?.reload();
    onChange();
  };
  const columns: ProColumns<Row | User>[] = [
    {
      title: '搜索',
      dataIndex: 'search',
      hideInTable: true,
      fieldProps: { placeholder: '搜索当前资源' },
    },
    {
      title: 'ID',
      dataIndex: isAccount ? 'ID' : 'id',
      width: 80,
      search: false,
    },
  ];
  if (isAccount) {
    columns.push(
      { title: '登录账号', dataIndex: 'userName', search: false },
      { title: '昵称', dataIndex: 'nickName', search: false },
      {
        title: '角色',
        search: false,
        render: (_dom, row) =>
          'authority' in row
            ? (row as User).authority?.authorityName || '前台用户（无后台权限）'
            : '—',
      },
      {
        title: '账号状态',
        search: false,
        render: (_dom, row) => (
          <Tag color={row.enable === 1 ? 'success' : 'error'}>
            {row.enable === 1 ? '正常' : '冻结'}
          </Tag>
        ),
      },
    );
  } else {
    for (const field of resource.fields.filter(
      (f) =>
        ![
          'snapshot',
          'videoUrl',
          'coverUrl',
          'copyrightProof',
          'documentUrl',
          'proofUrl',
        ].includes(f.key),
    ))
      columns.push({
        title: field.label,
        dataIndex: field.key,
        search: false,
        width: field.type === 'textarea' ? 240 : 160,
        ellipsis: true,
        render: (_dom, row) =>
          cell(row[field.key as keyof typeof row], field, row as Row),
      });
    columns.push(
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        width: 130,
        valueEnum: Object.fromEntries(
          Object.entries(statuses).map(([key, text]) => [key, { text }]),
        ),
        render: (_dom, row) => (
          <Tag color={statusColor(String((row as Row).status))}>
            {statuses[String((row as Row).status)] ||
              String((row as Row).status)}
          </Tag>
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        search: false,
        width: 180,
        render: (_dom, row) => date((row as Row).updatedAt),
      },
    );
  }
  columns.push({
    title: '操作',
    valueType: 'option',
    fixed: 'right',
    width: 230,
    render: (_dom, value) => {
      const row = value as Row;
      const actions = isAccount
        ? []
        : rowActions(
            resource.key,
            row,
            role,
            resource.canDelete ?? resource.canWrite,
          )
            .filter((item) =>
              item.key === 'delete'
                ? resource.canDelete !== false
                : resource.canAction !== false,
            )
            .filter(
              (item) =>
                item.key !== 'decide' ||
                row.userId !== initialState?.currentUser?.ID,
            );
      const nonDelete = actions.filter((a) => a.key !== 'delete');
      return (
        <Space>
          <Button type="link" size="small" onClick={() => setDetail(value)}>
            详情
          </Button>
          {isAccount && (
            <Button
              type="link"
              size="small"
              onClick={() => setAccountEditing(value as User)}
            >
              编辑
            </Button>
          )}
          {!isAccount && canEdit(resource, row) && (
            <Button
              type="link"
              size="small"
              onClick={() => setEditing({ row })}
            >
              编辑
            </Button>
          )}
          {nonDelete.length > 0 && (
            <Dropdown
              menu={{
                items: nonDelete.map((a) => ({ key: a.key, label: a.label })),
                onClick: ({ key }) => {
                  const item = nonDelete.find((a) => a.key === key);
                  if (item) setChosen({ row, item });
                },
              }}
            >
              <Button type="link" size="small">
                业务操作 <DownOutlined />
              </Button>
            </Dropdown>
          )}
          {actions.some((a) => a.key === 'delete') && (
            <Popconfirm
              title="删除这条草稿？"
              description="有关联记录时，服务端会拒绝删除。"
              onConfirm={async () => {
                await deleteRecord(resource.key, row.id);
                reload();
              }}
            >
              <Button danger type="link" size="small">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      );
    },
  });
  return (
    <>
      {resource.key === 'bills' && role === 888 && (
        <Alert
          className="table-hint"
          type="info"
          title="CSV表头：externalId,platform,dramaId,period,currency,grossMinor,feeMinor"
          description="金额为最小货币单位；单次最多2MB、2000行，重复或无效记录会拒绝整批导入。"
        />
      )}
      <ProTable<Row | User>
        actionRef={actionRef}
        headerTitle={resource.title}
        rowKey={isAccount ? 'ID' : 'id'}
        columns={columns}
        scroll={{ x: 'max-content' }}
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        pagination={{
          defaultPageSize: 20,
          pageSizeOptions: [20, 50, 100],
          showSizeChanger: true,
        }}
        options={{ density: true, reload: true, setting: true }}
        request={async (params) => {
          if (isAccount) {
            const rows = (await accounts()).filter(
              (u) =>
                !params.search ||
                `${u.userName} ${u.nickName}`.includes(String(params.search)),
            );
            const size = params.pageSize || 20;
            const start = ((params.current || 1) - 1) * size;
            return {
              data: rows.slice(start, start + size),
              total: rows.length,
              success: true,
            };
          }
          const data = await records(resource.key, {
            page: params.current,
            pageSize: params.pageSize,
            search: params.search,
            status: params.status,
          });
          return { data: data.list, total: data.total, success: true };
        }}
        toolBarRender={() => [
          ...(resource.canWrite
            ? [
                <Button
                  key="new"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setEditing({})}
                >
                  {isAccount ? '创建后台账号' : `新增${resource.title}`}
                </Button>,
              ]
            : []),
          ...(resource.key === 'bills' && role === 888
            ? [
                <Upload
                  key="import"
                  accept=".csv"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    if (file.size > 2 * 1024 * 1024) {
                      message.error('文件不能超过2MB');
                      return false;
                    }
                    setImporting(true);
                    try {
                      const result = await importBills(file);
                      message.success(`已导入 ${result.imported} 行`);
                      reload();
                    } catch {
                    } finally {
                      setImporting(false);
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={importing}>
                    导入CSV
                  </Button>
                </Upload>,
              ]
            : []),
          ...(resource.key === 'policies'
            ? [
                <Button key="preview" onClick={() => setPreviewOpen(true)}>
                  影响预览
                </Button>,
              ]
            : []),
        ]}
      />
      {editing &&
        (isAccount ? (
          <AccountForm
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        ) : (
          <RecordForm
            resource={resource}
            row={editing.row}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        ))}
      {chosen && (
        <ActionForm
          resource={resource.key}
          row={chosen.row}
          item={chosen.item}
          onClose={() => setChosen(null)}
          onSaved={() => {
            setChosen(null);
            reload();
          }}
        />
      )}
      <Drawer
        title="记录详情"
        open={!!detail}
        onClose={() => setDetail(undefined)}
        width={640}
      >
        <Descriptions
          column={1}
          bordered
          items={Object.entries(detail || {}).map(([key, value]) => ({
            key,
            label:
              resource.fields.find((f) => f.key === key)?.label ||
              (
                {
                  id: 'ID',
                  ID: '账号ID',
                  createdAt: '创建时间',
                  updatedAt: '更新时间',
                  ownerId: '所属账号',
                  userId: '用户账号',
                  status: '状态',
                  userName: '登录账号',
                  nickName: '昵称',
                  authority: '当前角色',
                  authorities: '可用角色',
                } as Record<string, string>
              )[key] ||
              key,
            children: (
              <pre className="detail-value">
                {typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : String(value ?? '—')}
              </pre>
            ),
          }))}
        />
      </Drawer>
      {accountEditing && (
        <AccountEdit
          user={accountEditing}
          currentId={initialState?.currentUser?.ID}
          onClose={() => setAccountEditing(undefined)}
          onSaved={() => {
            setAccountEditing(undefined);
            reload();
          }}
        />
      )}
      {previewOpen && <PolicyPreview onClose={() => setPreviewOpen(false)} />}
    </>
  );
}

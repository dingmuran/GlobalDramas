import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { PageResult } from '@gload-dramas/contracts';
import { useLocation } from '@umijs/max';
import { Button, Input, Modal, message, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { date } from '@/domain/format';
import { accounts, api } from '@/services/api';
import type { User } from '@/types/platform';

type RecordRow = { ID: number; [key: string]: any };
type Field = {
  key: string;
  title: string;
  type?: 'text' | 'textarea' | 'number' | 'bool' | 'method';
  required?: boolean;
};
type Def = {
  title: string;
  list: string;
  post?: boolean;
  create?: string;
  edit?: string;
  remove: string;
  fields: Field[];
};
const defs: Record<string, Def> = {
  apis: {
    title: 'API管理',
    list: '/api/getApiList',
    post: true,
    create: '/api/createApi',
    edit: '/api/updateApi',
    remove: '/api/deleteApi',
    fields: [
      { key: 'path', title: '请求路径', required: true },
      { key: 'method', title: '请求方法', type: 'method', required: true },
      { key: 'apiGroup', title: '接口分组', required: true },
      { key: 'description', title: '说明', required: true },
    ],
  },
  dictionaries: {
    title: '字典管理',
    list: '/sysDictionary/getSysDictionaryList',
    create: '/sysDictionary/createSysDictionary',
    edit: '/sysDictionary/updateSysDictionary',
    remove: '/sysDictionary/deleteSysDictionary',
    fields: [
      { key: 'name', title: '字典名称', required: true },
      { key: 'type', title: '字典标识', required: true },
      { key: 'status', title: '启用', type: 'bool' },
      { key: 'desc', title: '说明', type: 'textarea' },
    ],
  },
  details: {
    title: '字典项',
    list: '/sysDictionaryDetail/getSysDictionaryDetailList',
    create: '/sysDictionaryDetail/createSysDictionaryDetail',
    edit: '/sysDictionaryDetail/updateSysDictionaryDetail',
    remove: '/sysDictionaryDetail/deleteSysDictionaryDetail',
    fields: [
      { key: 'label', title: '显示名称', required: true },
      { key: 'value', title: '字典值', required: true },
      { key: 'extend', title: '扩展值' },
      { key: 'sort', title: '排序', type: 'number' },
      { key: 'status', title: '启用', type: 'bool' },
      { key: 'parentID', title: '父级字典项ID', type: 'number' },
    ],
  },
  params: {
    title: '参数管理',
    list: '/sysParams/getSysParamsList',
    create: '/sysParams/createSysParams',
    edit: '/sysParams/updateSysParams',
    remove: '/sysParams/deleteSysParams',
    fields: [
      { key: 'name', title: '参数名称', required: true },
      { key: 'key', title: '参数键', required: true },
      { key: 'value', title: '参数值', type: 'textarea', required: true },
      { key: 'desc', title: '说明', type: 'textarea' },
    ],
  },
  tokens: {
    title: 'API Token',
    list: '/sysApiToken/getApiTokenList',
    post: true,
    create: '/sysApiToken/createApiToken',
    remove: '/sysApiToken/deleteApiToken',
    fields: [
      { key: 'userId', title: '账号ID', type: 'number', required: true },
      { key: 'authorityId', title: '角色ID', type: 'number', required: true },
      { key: 'status', title: '有效', type: 'bool' },
      { key: 'expiresAt', title: '过期时间' },
      { key: 'remark', title: '备注' },
    ],
  },
  versions: {
    title: '版本管理',
    list: '/sysVersion/getSysVersionList',
    remove: '/sysVersion/deleteSysVersion',
    fields: [
      { key: 'versionName', title: '版本名称' },
      { key: 'versionCode', title: '版本号' },
      { key: 'description', title: '说明', type: 'textarea' },
    ],
  },
};
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SystemRecords() {
  const location = useLocation();
  const base = location.pathname.split('/').pop() || 'apis';
  return <Records key={base} base={base} />;
}
function Records({ base }: { base: string }) {
  const [dictionary, setDictionary] = useState<RecordRow>();
  const key = base === 'dictionaries' && dictionary ? 'details' : base;
  const def = defs[key];
  const action = useRef<ActionType>(null);
  const [editing, setEditing] = useState<RecordRow>();
  const [creating, setCreating] = useState(false);
  const [token, setToken] = useState('');
  const [tokenUsers, setTokenUsers] = useState<User[]>([]);
  const [extra, setExtra] = useState<
    'import' | 'version' | 'sync' | undefined
  >();
  const [sync, setSync] = useState<any>();
  if (!def) return null;
  const query = async (params: any) => {
    const payload = {
      ...params,
      page: params.current || 1,
      pageSize: params.pageSize || 20,
      ...(dictionary ? { sysDictionaryID: dictionary.ID } : {}),
    };
    const data = await api<PageResult<RecordRow> | RecordRow[]>(
      def.list,
      def.post ? { method: 'POST', data: payload } : { params: payload },
    );
    return Array.isArray(data)
      ? {
          data:
            key === 'dictionaries' ? data.filter((row) => !row.parentID) : data,
          total: data.length,
          success: true,
        }
      : { data: data.list || [], total: data.total, success: true };
  };
  const columns: ProColumns<RecordRow>[] = [
    { title: 'ID', dataIndex: 'ID', search: false, width: 70 },
    ...def.fields.map((f) => ({
      title: f.title,
      dataIndex: f.key,
      search: key === 'apis' && ['path', 'apiGroup', 'method'].includes(f.key),
      ellipsis: true,
      render: (_: unknown, row: RecordRow) =>
        f.type === 'bool'
          ? row[f.key]
            ? '是'
            : '否'
          : f.key === 'expiresAt'
            ? date(row[f.key])
            : String(row[f.key] ?? '—'),
    })),
    {
      title: '操作',
      valueType: 'option',
      render: (_, row) => (
        <Space wrap>
          {def.edit && (
            <Button type="link" onClick={() => setEditing(row)}>
              编辑
            </Button>
          )}
          {key === 'dictionaries' && (
            <>
              <Button type="link" onClick={() => setDictionary(row)}>
                字典项
              </Button>
              <Button
                type="link"
                onClick={async () =>
                  download(
                    await api('/sysDictionary/exportSysDictionary', {
                      params: { ID: row.ID },
                    }),
                    `dictionary-${row.ID}.json`,
                  )
                }
              >
                导出
              </Button>
            </>
          )}
          {key === 'versions' && (
            <Button
              type="link"
              onClick={() => {
                try {
                  download(
                    JSON.parse(row.versionData || '{}'),
                    `version-${row.ID}.json`,
                  );
                } catch {
                  message.error('版本数据格式错误');
                }
              }}
            >
              下载JSON
            </Button>
          )}
          <Popconfirm
            title={key === 'tokens' ? '作废此Token？' : '删除这条系统记录？'}
            onConfirm={async () => {
              await api(
                def.remove,
                key === 'apis' || key === 'tokens'
                  ? { method: 'POST', data: { ID: row.ID, id: row.ID } }
                  : {
                      method: 'DELETE',
                      ...(key === 'dictionaries' || key === 'details'
                        ? { data: { ID: row.ID } }
                        : { params: { ID: row.ID } }),
                    },
              );
              action.current?.reload();
            }}
          >
            <Button type="link" danger>
              {key === 'tokens' ? '作废' : '删除'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer
      title={def.title}
      subTitle={
        dictionary ? `${dictionary.name} / ${dictionary.type}` : undefined
      }
    >
      {dictionary && (
        <Button onClick={() => setDictionary(undefined)}>返回字典列表</Button>
      )}
      <ProTable<RecordRow>
        key={`${key}:${dictionary?.ID || 0}`}
        actionRef={action}
        rowKey="ID"
        headerTitle={def.title}
        columns={columns}
        search={key === 'apis' ? {} : false}
        scroll={{ x: 1100 }}
        request={query}
        toolBarRender={() => [
          ...(def.create
            ? [
                <Button
                  key="create"
                  type="primary"
                  onClick={async () => {
                    if (key === 'tokens') setTokenUsers(await accounts());
                    setCreating(true);
                  }}
                >
                  新增{key === 'tokens' ? 'Token' : ''}
                </Button>,
              ]
            : []),
          ...(['dictionaries', 'versions'].includes(key)
            ? [
                <Button key="import" onClick={() => setExtra('import')}>
                  导入JSON
                </Button>,
              ]
            : []),
          ...(key === 'versions'
            ? [
                <Button
                  key="version"
                  type="primary"
                  onClick={() => setExtra('version')}
                >
                  创建版本快照
                </Button>,
              ]
            : []),
          ...(key === 'apis'
            ? [
                <Button
                  key="sync"
                  onClick={async () => {
                    setSync(await api('/api/syncApi'));
                    setExtra('sync');
                  }}
                >
                  同步已注册接口
                </Button>,
              ]
            : []),
        ]}
      />
      {(creating || editing) && (
        <ModalForm
          key={`${key}:${editing?.ID || 'new'}`}
          title={editing ? '编辑记录' : `新增${def.title}`}
          open
          initialValues={
            editing || { status: true, sort: 0, parentID: 0, days: 30 }
          }
          modalProps={{
            destroyOnHidden: true,
            onCancel: () => {
              setEditing(undefined);
              setCreating(false);
            },
          }}
          onFinish={async (values) => {
            try {
              const body = {
                ...editing,
                ...values,
                ...(dictionary ? { sysDictionaryID: dictionary.ID } : {}),
              };
              if (key === 'tokens') {
                const result = await api<{ token: string }>(
                  '/sysApiToken/createApiToken',
                  {
                    method: 'POST',
                    data: body,
                  },
                );
                setToken(result.token);
              } else
                await api((editing ? def.edit : def.create) || '', {
                  method: editing ? (key === 'apis' ? 'POST' : 'PUT') : 'POST',
                  data: body,
                });
              setEditing(undefined);
              setCreating(false);
              action.current?.reload();
              message.success('已保存');
              return true;
            } catch {
              return false;
            }
          }}
        >
          {key === 'tokens' ? (
            <>
              <ProFormSelect
                name="userId"
                label="所属账号"
                options={tokenUsers
                  .filter((u) => [300, 888].includes(u.authorityId))
                  .map((u) => ({
                    value: u.ID,
                    label: `${u.ID} · ${u.userName}`,
                  }))}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                name="authorityId"
                label="授权角色"
                options={[
                  { value: 300, label: '版权方 / 制片方' },
                  { value: 888, label: '超级管理员' },
                ]}
                rules={[{ required: true }]}
              />
              <ProFormDigit
                name="days"
                label="有效天数"
                min={1}
                max={365}
                fieldProps={{ precision: 0 }}
                rules={[{ required: true }]}
              />
              <ProFormText name="remark" label="备注" />
            </>
          ) : (
            def.fields.map((f) => {
              const props = {
                name: f.key,
                label: f.title,
                rules: f.required ? [{ required: true }] : [],
              };
              return f.type === 'bool' ? (
                <ProFormSwitch key={f.key} {...props} />
              ) : f.type === 'number' ? (
                <ProFormDigit
                  key={f.key}
                  {...props}
                  min={0}
                  fieldProps={{ precision: 0 }}
                />
              ) : f.type === 'textarea' ? (
                <ProFormTextArea key={f.key} {...props} />
              ) : f.type === 'method' ? (
                <ProFormSelect
                  key={f.key}
                  {...props}
                  options={[
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE',
                    'PATCH',
                    'HEAD',
                    'OPTIONS',
                  ].map((value) => ({ value, label: value }))}
                />
              ) : (
                <ProFormText key={f.key} {...props} />
              );
            })
          )}
        </ModalForm>
      )}
      <Modal
        title="新签发的API Token"
        open={!!token}
        onCancel={() => setToken('')}
        footer={<Button onClick={() => setToken('')}>关闭</Button>}
      >
        <Input.TextArea readOnly rows={5} value={token} />
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(token);
            message.success('已复制');
          }}
        >
          复制Token
        </Button>
      </Modal>
      {extra && (
        <ModalForm
          title={
            extra === 'import'
              ? '导入JSON'
              : extra === 'sync'
                ? '同步接口定义'
                : '创建版本快照'
          }
          open
          modalProps={{
            destroyOnHidden: true,
            onCancel: () => setExtra(undefined),
          }}
          onFinish={async (values) => {
            try {
              if (extra === 'import') {
                const json = JSON.parse(values.json);
                await api(
                  key === 'dictionaries'
                    ? '/sysDictionary/importSysDictionary'
                    : '/sysVersion/importVersion',
                  {
                    method: 'POST',
                    data:
                      key === 'dictionaries'
                        ? { json: JSON.stringify(json) }
                        : json,
                  },
                );
              } else if (extra === 'version') {
                const [apis, menus, dictionaries] = await Promise.all([
                  api<{ apis: RecordRow[] }>('/api/getAllApis', {
                    method: 'POST',
                  }),
                  api<{ menus: RecordRow[] }>('/menu/getBaseMenuTree', {
                    method: 'POST',
                  }),
                  api<{ list: RecordRow[] }>(
                    '/sysDictionary/getSysDictionaryList',
                    { params: { page: 1, pageSize: 10000 } },
                  ),
                ]);
                const flatten = (rows: RecordRow[]): number[] =>
                  rows.flatMap((row) => [
                    row.ID,
                    ...flatten(row.children || []),
                  ]);
                await api('/sysVersion/exportVersion', {
                  method: 'POST',
                  data: {
                    ...values,
                    apiIds: apis.apis.map((a) => a.ID),
                    menuIds: flatten(menus.menus),
                    dictIds: flatten(dictionaries.list),
                  },
                });
              } else
                await api('/api/enterSyncApi', { method: 'POST', data: sync });
              message.success('操作成功');
              setExtra(undefined);
              action.current?.reload();
              return true;
            } catch {
              return false;
            }
          }}
        >
          {extra === 'import' ? (
            <ProFormTextArea
              name="json"
              label="JSON内容"
              fieldProps={{ rows: 12 }}
              rules={[{ required: true }]}
            />
          ) : extra === 'version' ? (
            <>
              <ProFormText
                name="versionName"
                label="版本名称"
                rules={[{ required: true }]}
              />
              <ProFormText
                name="versionCode"
                label="版本号"
                rules={[{ required: true }]}
              />
              <ProFormTextArea name="description" label="说明" />
            </>
          ) : (
            <pre className="detail-value">{JSON.stringify(sync, null, 2)}</pre>
          )}
        </ModalForm>
      )}
    </PageContainer>
  );
}

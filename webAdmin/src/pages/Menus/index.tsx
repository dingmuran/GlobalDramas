import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useModel } from '@umijs/max';
import { Button, message, Popconfirm } from 'antd';
import { useState } from 'react';
import { flattenMenus } from '@/domain/access';
import { businessPages } from '@/domain/pages';
import { api, menus as myMenus } from '@/services/api';
import type { Menu } from '@/types/platform';

interface FullMenu extends Menu {
  parameters?: unknown[];
  menuBtn?: unknown[];
}
const systemPaths = [
  'system/roles',
  'system/menus',
  'system/apis',
  'system/users',
  'system/dictionaries',
  'system/params',
  'system/tokens',
  'system/versions',
  'system/logs/operation',
  'system/logs/login',
  'system/logs/error',
  'system/assets',
];
export default function Menus() {
  const { setInitialState } = useModel('@@initialState');
  const tree = useQuery({
    queryKey: ['system-menu-tree'],
    queryFn: () =>
      api<{ menus: FullMenu[] }>('/menu/getBaseMenuTree', { method: 'POST' }),
  });
  const [editing, setEditing] = useState<FullMenu>();
  const [creating, setCreating] = useState(false);
  const all = flattenMenus(tree.data?.menus || []);
  const refresh = async () => {
    await tree.refetch();
    const m = await myMenus();
    await setInitialState((s) => ({
      ...(s || { menus: [], schema: [] }),
      menus: m.menus || [],
    }));
  };
  const excludes = new Set(
    editing
      ? flattenMenus([all.find((m) => m.ID === editing.ID) || editing]).map(
          (m) => m.ID,
        )
      : [],
  );
  return (
    <PageContainer
      title="菜单管理"
      subTitle="维护分组、标题、排序、显示与页面入口；角色授权在角色管理中配置"
    >
      <ProTable<FullMenu>
        rowKey="ID"
        dataSource={tree.data?.menus || []}
        loading={tree.isPending}
        search={false}
        pagination={false}
        scroll={{ x: 1000 }}
        options={{ reload: () => tree.refetch() }}
        toolBarRender={() => [
          <Button key="new" type="primary" onClick={() => setCreating(true)}>
            新增菜单
          </Button>,
        ]}
        columns={[
          { title: '菜单名称', dataIndex: ['meta', 'title'] },
          { title: '名称标识', dataIndex: 'name' },
          { title: '页面路径', dataIndex: 'path' },
          { title: '排序', dataIndex: 'sort' },
          { title: '显示', render: (_, m) => (m.hidden ? '隐藏' : '显示') },
          {
            title: '操作',
            valueType: 'option',
            render: (_, m) => [
              <Button
                key="edit"
                type="link"
                onClick={async () => {
                  try {
                    const data = await api<{ menu: FullMenu }>(
                      '/menu/getBaseMenuById',
                      { method: 'POST', data: { id: m.ID } },
                    );
                    setEditing({ ...m, ...data.menu });
                  } catch {}
                }}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="删除菜单及其角色关联？存在子菜单或角色首页时服务端会拒绝。"
                onConfirm={async () => {
                  await api('/menu/deleteBaseMenu', {
                    method: 'POST',
                    data: { id: m.ID },
                  });
                  await refresh();
                }}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>,
            ],
          },
        ]}
      />
      {(creating || editing) && (
        <ModalForm
          key={editing?.ID || 'new'}
          title={editing ? '编辑菜单' : '新增菜单'}
          open
          initialValues={
            editing
              ? {
                  ...editing,
                  title: editing.meta.title,
                  icon: editing.meta.icon,
                }
              : { parentId: 0, component: 'Layout', hidden: false, sort: 0 }
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
              const path = String(values.path).replace(/^\//, '');
              if (
                values.component !== 'Layout' &&
                !systemPaths.includes(path) &&
                !businessPages.some((p) => p.key === path)
              ) {
                message.error(
                  '请选择已实现的页面路径，新增业务页面需先注册React路由',
                );
                return false;
              }
              await api(
                editing ? '/menu/updateBaseMenu' : '/menu/addBaseMenu',
                {
                  method: 'POST',
                  data: {
                    ...editing,
                    ...values,
                    path,
                    ID: editing?.ID,
                    meta: {
                      ...editing?.meta,
                      title: values.title,
                      icon: values.icon,
                    },
                    parameters: editing?.parameters || [],
                    menuBtn: editing?.menuBtn || [],
                  },
                },
              );
              await refresh();
              setEditing(undefined);
              setCreating(false);
              message.success('菜单已保存');
              return true;
            } catch {
              return false;
            }
          }}
        >
          <ProFormText
            name="title"
            label="菜单标题"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="name"
            label="唯一名称标识"
            disabled={!!editing}
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
                message: '使用字母、数字和下划线',
              },
            ]}
          />
          <ProFormSelect
            name="parentId"
            label="上级菜单"
            options={[
              { label: '顶级菜单', value: 0 },
              ...all
                .filter((m) => m.component === 'Layout' && !excludes.has(m.ID))
                .map((m) => ({
                  label: `${m.meta.title} · ${m.name}`,
                  value: m.ID,
                })),
            ]}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="component"
            label="页面类型"
            options={[
              'Layout',
              'pages/Workspace',
              'pages/Roles',
              'pages/Menus',
              'pages/SystemUsers',
              'pages/SystemRecords',
              'pages/Logs',
              'pages/Assets',
            ].map((value) => ({
              value,
              label: value === 'Layout' ? '目录分组' : value,
            }))}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="path"
            label="路由路径"
            tooltip="分组使用唯一目录路径；页面使用GDReviews、system/menus等已注册路径"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="icon"
            label="图标"
            placeholder="setting / team / videoCamera"
          />
          <ProFormDigit
            name="sort"
            label="排序"
            fieldProps={{ precision: 0 }}
            rules={[{ required: true }]}
          />
          <ProFormSwitch name="hidden" label="隐藏菜单" />
        </ModalForm>
      )}
    </PageContainer>
  );
}

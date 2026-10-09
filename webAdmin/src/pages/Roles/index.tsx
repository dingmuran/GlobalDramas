import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  List,
  message,
  Result,
  Select,
  Space,
  Spin,
  Tabs,
  Tree,
} from 'antd';
import { useState } from 'react';
import { flattenMenus } from '@/domain/access';
import { accounts, api } from '@/services/api';
import type { Authority, Menu, User } from '@/types/platform';

interface Policy {
  path: string;
  method: string;
}
interface SystemApi extends Policy {
  ID: number;
  description: string;
  apiGroup: string;
}
interface RoleData {
  menus: Menu[];
  assignedMenus: Menu[];
  apis: SystemApi[];
  policies: Policy[];
  users: User[];
  userIds: number[];
}
const mandatory = [
  'GET /user/getUserInfo',
  'POST /menu/getMenu',
  'GET /dramas/schema',
  'POST /jwt/jsonInBlacklist',
];
const policyKey = (p: Policy) => `${p.method} ${p.path}`;
function RoleEditor({
  role,
  data,
  onSaved,
}: {
  role: Authority;
  data: RoleData;
  onSaved: () => void;
}) {
  const [menuIds, setMenuIds] = useState<number[]>(
    flattenMenus(data.assignedMenus).map((m) => m.menuId || m.ID),
  );
  const [policyIds, setPolicyIds] = useState<string[]>(
    data.policies.map(policyKey),
  );
  const [userIds, setUserIds] = useState(data.userIds);
  const [saving, setSaving] = useState(false);
  const readonly = role.authorityId === 888;
  interface TreeNode {
    title: string;
    key: number;
    children: TreeNode[];
  }
  const menuTree = (menus: Menu[]): TreeNode[] =>
    menus.map((m) => ({
      title: m.meta.title,
      key: m.ID,
      children: menuTree(m.children || []),
    }));
  const save = async (callback: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await callback();
      message.success('权限已保存，下次登录生效');
      onSaved();
    } catch {
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card
      title={role.authorityName}
      extra={<span>角色ID {role.authorityId}</span>}
    >
      <Alert
        type="info"
        showIcon
        title={
          readonly
            ? '超级管理员拥有完整平台权限'
            : '前端菜单控制展示，Go后端独立校验每个请求'
        }
        description={
          readonly
            ? '管理员权限为固定全量授权。通过用户与机构创建管理员账号，避免误撤销管理权限。'
            : '版权方的数据归属与敏感操作规则不能通过菜单或API授权绕过。'
        }
        style={{ marginBottom: 20 }}
      />
      <Tabs
        items={[
          {
            key: 'menus',
            label: '页面菜单',
            children: (
              <>
                <Tree
                  checkable
                  checkStrictly
                  defaultExpandAll
                  disabled={readonly}
                  treeData={menuTree(data.menus)}
                  checkedKeys={menuIds}
                  onCheck={(keys) =>
                    setMenuIds(
                      (Array.isArray(keys) ? keys : keys.checked).map(Number),
                    )
                  }
                />
                {!readonly && (
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={() =>
                      save(() =>
                        api('/menu/addMenuAuthority', {
                          method: 'POST',
                          data: {
                            authorityId: role.authorityId,
                            menus: flattenMenus(data.menus)
                              .filter(
                                (m) =>
                                  menuIds.includes(m.ID) ||
                                  flattenMenus(m.children || []).some((child) =>
                                    menuIds.includes(child.ID),
                                  ),
                              )
                              .map(({ ID }) => ({ ID })),
                          },
                        }),
                      )
                    }
                  >
                    保存菜单权限
                  </Button>
                )}
              </>
            ),
          },
          {
            key: 'apis',
            label: '接口权限',
            children: (
              <>
                <Checkbox.Group
                  value={policyIds}
                  disabled={readonly}
                  onChange={(values) => setPolicyIds(values.map(String))}
                >
                  <List
                    dataSource={data.apis}
                    renderItem={(item) => (
                      <List.Item>
                        <Checkbox
                          value={policyKey(item)}
                          disabled={
                            readonly || mandatory.includes(policyKey(item))
                          }
                        >
                          {item.description}{' '}
                          <span className="section-note">
                            {policyKey(item)}
                          </span>
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </Checkbox.Group>
                {!readonly && (
                  <div>
                    <Button
                      type="primary"
                      loading={saving}
                      onClick={() =>
                        save(() =>
                          api('/casbin/updateCasbin', {
                            method: 'POST',
                            data: {
                              authorityId: role.authorityId,
                              casbinInfos: data.apis
                                .filter(
                                  (p) =>
                                    policyIds.includes(policyKey(p)) ||
                                    mandatory.includes(policyKey(p)),
                                )
                                .map(({ path, method }) => ({ path, method })),
                            },
                          }),
                        )
                      }
                    >
                      保存接口权限
                    </Button>
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'users',
            label: '关联账号',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  mode="multiple"
                  optionFilterProp="label"
                  disabled={readonly}
                  style={{ width: '100%' }}
                  value={userIds}
                  onChange={setUserIds}
                  options={data.users
                    .filter(
                      (u) => u.authorityId === 300 || u.authorityId === 888,
                    )
                    .map((u) => ({
                      value: u.ID,
                      label: `${u.ID} · ${u.userName} / ${u.nickName}`,
                    }))}
                />
                {!readonly && (
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={() =>
                      save(() =>
                        api('/authority/setRoleUsers', {
                          method: 'POST',
                          data: { authorityId: role.authorityId, userIds },
                        }),
                      )
                    }
                  >
                    保存关联账号
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
export default function Roles() {
  const [roleId, setRoleId] = useState(300);
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () =>
      api<Authority[]>('/authority/getAuthorityList', {
        method: 'POST',
        data: { page: 1, pageSize: 100 },
      }),
  });
  const flatten = (rows: Authority[]): Authority[] =>
    rows.flatMap((r) => [r, ...flatten(r.children || [])]);
  const role = flatten(roles.data || []).find((r) => r.authorityId === roleId);
  const data = useQuery({
    queryKey: ['role-settings', roleId],
    queryFn: async () => {
      const [all, assigned, apis, policies, users, userIds] = await Promise.all(
        [
          api<{ menus: Menu[] }>('/menu/getBaseMenuTree', { method: 'POST' }),
          api<{ menus: Menu[] }>('/menu/getMenuAuthority', {
            method: 'POST',
            data: { authorityId: roleId },
          }),
          api<{ apis: SystemApi[] }>('/api/getAllApis', { method: 'POST' }),
          api<{ paths: Policy[] }>('/casbin/getPolicyPathByAuthorityId', {
            method: 'POST',
            data: { authorityId: roleId },
          }),
          accounts(),
          api<number[]>('/authority/getUsersByAuthority', {
            params: { authorityId: roleId },
          }),
        ],
      );
      return {
        menus: all.menus || [],
        assignedMenus: assigned.menus || [],
        apis: apis.apis || [],
        policies: policies.paths || [],
        users,
        userIds: userIds || [],
      };
    },
  });
  return (
    <PageContainer
      title="角色与权限"
      subTitle="管理两类后台角色的菜单、接口与账号授权"
    >
      <div className="role-layout">
        <Card title="后台角色">
          <List
            dataSource={flatten(roles.data || []).filter((r) =>
              [300, 888].includes(r.authorityId),
            )}
            renderItem={(r) => (
              <List.Item>
                <Button
                  block
                  type={r.authorityId === roleId ? 'primary' : 'text'}
                  onClick={() => setRoleId(r.authorityId)}
                >
                  {r.authorityName}
                </Button>
              </List.Item>
            )}
          />
        </Card>
        {data.isPending || roles.isPending ? (
          <Spin />
        ) : data.isError || roles.isError ? (
          <Result
            status="error"
            title="权限加载失败"
            extra={
              <Button
                onClick={() => {
                  data.refetch();
                  roles.refetch();
                }}
              >
                重试
              </Button>
            }
          />
        ) : role && data.data ? (
          <RoleEditor
            key={`${roleId}:${data.dataUpdatedAt}`}
            role={role}
            data={data.data}
            onSaved={() => data.refetch()}
          />
        ) : (
          <Result status="warning" title="角色不存在" />
        )}
      </div>
    </PageContainer>
  );
}

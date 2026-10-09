import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { api } from '@/services/api';
import type { User } from '@/types/platform';
export default function AccountEdit({
  user,
  currentId,
  onClose,
  onSaved,
}: {
  user: User;
  currentId?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <ModalForm
      title={`编辑账号 · ${user.userName}`}
      open
      width={520}
      initialValues={{ ...user, role: user.authorityId }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onFinish={async (values) => {
        try {
          await api('/user/setUserInfo', {
            method: 'PUT',
            data: {
              ID: user.ID,
              nickName: values.nickName,
              phone: values.phone,
              email: values.email,
              enable: user.ID === currentId ? 1 : values.enable,
              headerImg: user.headerImg || '/gload-dramas.svg',
              ...([300, 888].includes(user.authorityId)
                ? {
                    authorityIds: [
                      user.ID === currentId ? user.authorityId : values.role,
                    ],
                  }
                : {}),
            },
          });
          message.success('账号已更新');
          onSaved();
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
      <ProFormText name="email" label="邮箱" rules={[{ type: 'email' }]} />
      {[300, 888].includes(user.authorityId) && (
        <ProFormSelect
          name="role"
          label="后台角色"
          disabled={user.ID === currentId}
          options={[
            { value: 300, label: '版权方 / 制片方' },
            { value: 888, label: '超级管理员' },
          ]}
          rules={[{ required: true }]}
        />
      )}
      <ProFormSelect
        name="enable"
        label="账号状态"
        disabled={user.ID === currentId}
        options={[
          { value: 1, label: '正常' },
          { value: 2, label: '冻结' },
        ]}
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
}

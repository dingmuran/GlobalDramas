import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { CreateBackofficeAccount } from '@gload-dramas/contracts';
import { message } from 'antd';
import { createAccount } from '@/services/api';
export default function AccountForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <ModalForm<CreateBackofficeAccount>
      title="创建后台账号"
      open
      width={480}
      initialValues={{ role: 300 }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onFinish={async (values) => {
        try {
          await createAccount(values);
          message.success('账号已创建');
          onSaved();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="username"
        label="登录账号"
        rules={[
          { required: true },
          { pattern: /^\S{3,60}$/, message: '请输入3至60个非空白字符' },
        ]}
      />
      <ProFormText.Password
        name="password"
        label="初始密码"
        fieldProps={{ autoComplete: 'new-password' }}
        rules={[
          { required: true },
          {
            validator: (_rule, value) => {
              const length = new TextEncoder().encode(value || '').length;
              return length >= 12 && length <= 72
                ? Promise.resolve()
                : Promise.reject(new Error('密码须为12至72字节'));
            },
          },
        ]}
      />
      <ProFormText name="nickName" label="显示名称" />
      <ProFormSelect
        name="role"
        label="角色"
        rules={[{ required: true }]}
        options={[
          { value: 300, label: '版权方 / 制片方' },
          { value: 888, label: '超级管理员' },
        ]}
      />
    </ModalForm>
  );
}

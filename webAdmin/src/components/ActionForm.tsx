import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Alert, message } from 'antd';
import type { BusinessAction } from '@/domain/actions';
import { action, saveRecord } from '@/services/api';
import type { Action, Row } from '@/types/platform';
export default function ActionForm({
  resource,
  row,
  item,
  onClose,
  onSaved,
}: {
  resource: string;
  row: Row;
  item: BusinessAction;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <ModalForm<Action>
      title={item.label}
      open
      width={560}
      initialValues={{
        action: item.key,
        note: '',
        evidence: '',
        decision: true,
        start: 1,
        count: 1,
      }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onFinish={async (values) => {
        try {
          if (item.key === 'refund')
            await saveRecord('refunds', {
              orderId: row.id,
              reason: values.note,
            });
          else await action(resource, row.id, { ...values, action: item.key });
          message.success('操作已记录');
          onSaved();
          return true;
        } catch {
          return false;
        }
      }}
    >
      {item.key === 'request' && (
        <Alert
          type="info"
          showIcon
          title="另一位超级管理员需核对凭据并审批"
          description="此操作登记真实外部结果，不会发起实际扣款、退款或转账。"
          style={{ marginBottom: 20 }}
        />
      )}
      {item.key === 'batch' && (
        <>
          <ProFormDigit
            name="start"
            label="起始集数"
            min={1}
            max={1000}
            fieldProps={{ precision: 0 }}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="count"
            label="批量数量"
            min={1}
            max={200}
            fieldProps={{ precision: 0 }}
            rules={[{ required: true }]}
          />
        </>
      )}
      {item.key === 'decide' && (
        <ProFormRadio.Group
          name="decision"
          label="审批结果"
          options={[
            { label: '通过并执行', value: true },
            { label: '拒绝', value: false },
          ]}
        />
      )}
      <ProFormTextArea
        name="note"
        label="操作说明 / 审核意见"
        fieldProps={{ rows: 4, maxLength: 20000 }}
        rules={
          [
            'request',
            'refund',
            'reject',
            'resolve',
            'decide',
            'version',
            'reconcile',
          ].includes(item.key)
            ? [{ required: true, message: '请填写说明' }]
            : []
        }
      />
      {(item.key === 'request' || resource === 'alerts') && (
        <ProFormText
          name="evidence"
          label="外部流水 / 验证凭据"
          rules={
            item.key === 'request'
              ? [{ required: true, message: '请填写已核对的凭据' }]
              : []
          }
        />
      )}
    </ModalForm>
  );
}

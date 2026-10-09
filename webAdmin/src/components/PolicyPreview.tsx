import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { preview } from '@/services/api';
export default function PolicyPreview({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState<Record<string, unknown>>();
  return (
    <ModalForm
      title="策略影响预览"
      open
      width={600}
      initialValues={{ at: dayjs() }}
      submitter={{ searchConfig: { submitText: '计算影响' } }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onFinish={async (values) => {
        try {
          setResult(
            await preview({
              dramaId: Number(values.dramaId),
              at: dayjs(values.at).toISOString(),
            }),
          );
        } catch {}
        return false;
      }}
    >
      <ProFormDigit
        name="dramaId"
        label="剧集ID"
        min={1}
        fieldProps={{ precision: 0 }}
        rules={[{ required: true }]}
      />
      <ProFormDateTimePicker
        name="at"
        label="预览时间"
        rules={[{ required: true }]}
      />
      {result && (
        <Descriptions
          title="生效结果"
          column={1}
          bordered
          items={Object.entries(result).map(([key, value]) => ({
            key,
            label:
              (
                {
                  policy: '生效策略',
                  freeEpisodes: '免费集数',
                  adsEnabled: '广告开关',
                  memberFree: '会员覆盖',
                  drama: '剧集',
                } as Record<string, string>
              )[key] || key,
            children:
              typeof value === 'object' ? (
                <pre className="detail-value">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                String(value)
              ),
          }))}
        />
      )}
    </ModalForm>
  );
}

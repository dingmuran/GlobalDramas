import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { message } from 'antd';
import dayjs from 'dayjs';
import { labels } from '@/domain/format';
import { records, saveRecord } from '@/services/api';
import type { Resource, Row } from '@/types/platform';

interface Props {
  resource: Resource;
  row?: Row;
  onClose: () => void;
  onSaved: () => void;
}
export default function RecordForm({ resource, row, onClose, onSaved }: Props) {
  const { initialState } = useModel('@@initialState');
  const refs = new Set(initialState?.schema.map((s) => s.key));
  const fields = resource.fields.filter(
    (f) =>
      f.type !== 'readonly' &&
      !(f.key === 'reply' && initialState?.currentUser?.authorityId !== 888),
  );
  const initial = Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.type === 'datetime'
        ? row?.[f.key]
          ? dayjs(String(row[f.key]))
          : undefined
        : ['number', 'integer'].includes(f.type)
          ? Number(row?.[f.key] ?? 0)
          : (row?.[f.key] ?? (f.type === 'boolean' ? false : '')),
    ]),
  );
  return (
    <DrawerForm<Record<string, unknown>>
      title={`${row ? '编辑' : '新增'}${resource.title}`}
      open
      width={720}
      grid
      initialValues={initial}
      drawerProps={{ destroyOnHidden: true, onClose }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onFinish={async (values) => {
        const data: Record<string, unknown> = {};
        for (const f of fields) {
          const value = values[f.key];
          data[f.key] =
            f.type === 'datetime'
              ? value
                ? dayjs(String(value)).toISOString()
                : null
              : ['number', 'integer'].includes(f.type)
                ? (value ?? 0)
                : (value ?? (f.type === 'boolean' ? false : ''));
        }
        try {
          await saveRecord(resource.key, data, row?.id);
          message.success('已保存');
          onSaved();
          return true;
        } catch {
          return false;
        }
      }}
    >
      {fields.map((f) => {
        const props = {
          name: f.key,
          label: f.label,
          rules: f.required
            ? [{ required: true, message: `请填写${f.label}` }]
            : [],
          colProps: { span: f.type === 'textarea' ? 24 : 12 },
        };
        if (f.ref && refs.has(f.ref))
          return (
            <ProFormSelect
              key={f.key}
              {...props}
              showSearch
              debounceTime={300}
              fieldProps={{ filterOption: false }}
              request={async ({ keyWords }) => {
                const result = await records(f.ref, {
                  pageSize: 100,
                  search: keyWords,
                });
                const options = result.list.map((item) => ({
                  value: item.id,
                  label: `${item.id} · ${item.title || item.name || item.subject || item.externalId || item.kind || item.status}`,
                }));
                return !f.required
                  ? [
                      {
                        value: 0,
                        label:
                          f.key === 'dramaId'
                            ? '全局 / 不指定剧集'
                            : '不关联记录',
                      },
                      ...options,
                    ]
                  : options;
              }}
            />
          );
        if (f.type === 'boolean')
          return <ProFormSwitch key={f.key} {...props} />;
        if (['number', 'integer'].includes(f.type))
          return (
            <ProFormDigit
              key={f.key}
              {...props}
              min={f.type === 'number' ? 0 : undefined}
              max={Number.MAX_SAFE_INTEGER}
              fieldProps={{ precision: 0 }}
              rules={[
                ...props.rules,
                {
                  validator: (_rule: unknown, value: number | undefined) =>
                    value === undefined || Number.isSafeInteger(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error('请输入安全范围内的整数')),
                },
              ]}
            />
          );
        if (f.type === 'datetime')
          return (
            <ProFormDateTimePicker
              key={f.key}
              {...props}
              fieldProps={{ format: 'YYYY-MM-DD HH:mm:ss' }}
            />
          );
        if (f.options?.length)
          return (
            <ProFormSelect
              key={f.key}
              {...props}
              options={f.options.map((value) => ({
                value,
                label: labels[value] || value,
              }))}
            />
          );
        if (f.type === 'textarea')
          return (
            <ProFormTextArea
              key={f.key}
              {...props}
              fieldProps={{ rows: 4, maxLength: 20000 }}
            />
          );
        return (
          <ProFormText
            key={f.key}
            {...props}
            fieldProps={{ maxLength: 20000 }}
            rules={[
              ...props.rules,
              ...(f.type === 'url'
                ? [{ type: 'url' as const, message: '请输入完整的URL' }]
                : []),
            ]}
          />
        );
      })}
    </DrawerForm>
  );
}

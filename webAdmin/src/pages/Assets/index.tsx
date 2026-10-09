import { UploadOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { PageResult } from '@gload-dramas/contracts';
import { Button, message, Popconfirm, Upload } from 'antd';
import { useRef, useState } from 'react';
import { date } from '@/domain/format';
import { api } from '@/services/api';

interface Asset {
  ID: number;
  name: string;
  url: string;
  tag: string;
  CreatedAt: string;
}
export default function Assets() {
  const actionRef = useRef<ActionType>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <PageContainer
      title="素材文件"
      subTitle="管理已上传文件，剧集表单可填写对应素材地址"
    >
      <ProTable<Asset>
        actionRef={actionRef}
        rowKey="ID"
        headerTitle="素材列表"
        columns={[
          { title: '文件名称', dataIndex: 'name' },
          { title: '类型', dataIndex: 'tag', search: false },
          {
            title: '文件地址',
            dataIndex: 'url',
            search: false,
            copyable: true,
            ellipsis: true,
          },
          {
            title: '上传时间',
            dataIndex: 'CreatedAt',
            search: false,
            render: (_dom, row) => date(row.CreatedAt),
          },
          {
            title: '操作',
            valueType: 'option',
            render: (_dom, row) => (
              <Popconfirm
                title="删除这个文件？"
                description="请先确认业务记录不再使用此素材。"
                onConfirm={async () => {
                  await api('/fileUploadAndDownload/deleteFile', {
                    method: 'POST',
                    data: {
                      ID: row.ID,
                      url: row.url,
                      name: row.name,
                      tag: row.tag,
                    },
                  });
                  actionRef.current?.reload();
                }}
              >
                <Button danger type="link">
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]}
        request={async (params) => {
          const data = await api<PageResult<Asset>>(
            '/fileUploadAndDownload/getFileList',
            {
              method: 'POST',
              data: {
                page: params.current,
                pageSize: params.pageSize,
                keyword: params.name,
              },
            },
          );
          return { data: data.list, total: data.total, success: true };
        }}
        toolBarRender={() => [
          <Upload
            key="upload"
            showUploadList={false}
            beforeUpload={async (file) => {
              const data = new FormData();
              data.append('file', file);
              setUploading(true);
              try {
                await api('/fileUploadAndDownload/upload', {
                  method: 'POST',
                  data,
                  timeout: 120000,
                });
                message.success('文件已上传');
                actionRef.current?.reload();
              } catch {
              } finally {
                setUploading(false);
              }
              return false;
            }}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
            >
              上传素材
            </Button>
          </Upload>,
        ]}
      />
    </PageContainer>
  );
}

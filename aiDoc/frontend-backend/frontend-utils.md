# 后台复用入口

- `src/services/api.ts`：真实Go接口、统一响应与分页。
- `src/services/session.ts`：JWT会话与旧会话迁移。
- `src/services/query.ts`：React Query客户端。
- `src/services/templateRequest.ts`：官方示例请求，不携带业务JWT。
- `src/domain/format.ts`：精确金额、日期、状态与留存显示。
- `src/domain/actions.ts`：业务状态动作与角色入口。
- `src/components/RecordForm.tsx`：基于Go字段元数据生成编辑表单。
- `src/components/ResourceTable.tsx`：业务查询、详情、编辑、动作与导入。

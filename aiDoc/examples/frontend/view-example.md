# 页面

参考 `webAdmin/src/pages/Workspace/index.tsx`：PageContainer包装页面，ProTable查询真实列表，DrawerForm编辑schema允许的字段；使用后端canWrite/canEdit/canDelete/canAction控制按钮。发布、退款、发奖与结算调用状态接口，不通过通用CRUD覆盖状态。

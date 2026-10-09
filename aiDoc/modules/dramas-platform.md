# Global Dramas 业务模块

PostgreSQL专用插件，启动时自动迁移28张 `gd_*` 表和中文字段注释，注册两种后台角色、15个业务页面、11个API定义与角色菜单。系统账号沿用sys_users；不创建演示用户或演示内容。

模型和字段元数据集中在model/models.go、registry.go；API仅绑定与响应，service执行字段验证、账号归属范围、业务状态、事务和审计；router挂现有JWT/Casbin。initialize负责迁移、引用保护、唯一索引、菜单与每分钟授权到期任务。数据库引用由非零ID约束触发器保护，删除被引用的父记录会拒绝。

前端pages/Workspace/index.tsx依据路由展示角色工作台、统计、财务、资源表单和审批等视图。字段类型、必填与读写由schema接口提供；后端独立鉴权，不信任前端菜单或canWrite/canEdit/canDelete/canAction。

后台角色为300版权方/制片方、888超级管理员。启动时事务清理历史角色200的菜单、账号角色关联与Casbin权限，保留sys_users身份及全部gd_*数据；后台登录与业务路由限制300/888。200仅为保留服务中的H5观众身份标记。播放和观看事件服务保留供H5独立认证接入，当前后台不注册其HTTP端点。

全量数据库字段与关系见docs/DRAMAS-DATABASE.md；API契约与外部平台边界见aiDoc/frontend-backend/dramas-contract.md；人工流程见docs/GLOBAL-DRAMAS-GUIDE.md。

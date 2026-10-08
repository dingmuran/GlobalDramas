# Global Dramas 业务模块

PostgreSQL专用插件，启动时自动迁移28张 `gd_*` 表和中文字段注释，注册三种角色、21个业务页面、13个API定义与角色菜单。系统账号沿用sys_users；不创建演示用户或演示内容。

模型和字段元数据集中在model/models.go、registry.go；API仅绑定与响应，service执行字段验证、账号归属范围、业务状态、事务和审计；router挂现有JWT/Casbin。initialize负责迁移、引用保护、唯一索引、菜单与每分钟授权到期任务。数据库引用由非零ID约束触发器保护，删除被引用的父记录会拒绝。

前端workspace.vue依据路由展示观众发现页/播放器、角色工作台、统计、财务、资源表单和审批等视图。字段类型、必填与读写由schema接口提供；后端独立鉴权，不信任前端菜单或canWrite。

全量数据库字段与关系见docs/DRAMAS-DATABASE.md；API契约与外部平台边界见aiDoc/frontend-backend/dramas-contract.md；人工流程见docs/GLOBAL-DRAMAS-GUIDE.md。

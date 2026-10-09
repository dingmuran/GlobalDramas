# Gload Dramas 项目结构

根目录 `/Users/zhangxinzheng/Downloads/GloadDramas`。

|目录|职责|技术栈|
|---|---|---|
|webAdmin|后台业务与系统管理|Ant Design Pro 6 / React / TypeScript / Umi Max / Ant Design 6|
|web|观众H5基础工程|React / Vite / TypeScript|
|server|统一业务后端|Go / Gin / GORM / PostgreSQL|
|packages/contracts|共享接口类型|TypeScript|

后台8080，前台8081，Go8888，PostgreSQL本机15432。所有运行时在 Docker 中，保留现有数据库卷。

后台保留官方默认样式，移除无关演示路由并关闭 Mock；业务与系统管理调用真实 Go 接口。两个前端认证、路由和依赖独立。H5独立观众认证、播放与订单仍待接入。

CRUD代码生成器、AI生成工作流、生成模板和关联MCP代码已删除。`deploy/generate-contracts.py` 仅同步 Go 模型的 TypeScript 类型，不生成业务代码，继续保留。金额响应为十进制字符串，可空日期为null。旧生成器历史表不再被运行代码使用，未破坏性删除。

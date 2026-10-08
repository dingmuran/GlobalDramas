# 项目命名与前后台目录拆分

- 日期：2026-10-08
- 用户确认名称：Gload Dramas；目录使用GloadDramas。
- 当前根目录：`/Users/zhangxinzheng/Downloads/GloadDramas`。原外层Global Dramas目录为空后已删除，保留完整项目和Git历史。
- 后台：原web迁移到webAdmin，继续使用Vue，不执行Next.js重构。
- 前台：新增web，React + Vite + TypeScript基础工程，只接入真实公共健康检查，不添加演示业务数据。
- 优化：packages/contracts提供共享类型，Go模型生成28个业务类型；代码生成器、Docker挂载、依赖卷、文档和品牌名称同步。
- 运行：后台8080、前台8081、Go后端8888；PostgreSQL和原数据卷保留。
- 验证：前后台生产构建通过，两端代理健康检查返回ok；数据库保留1个实际账号和28张业务表。
- 发布：本地修改，未自动提交或推送。

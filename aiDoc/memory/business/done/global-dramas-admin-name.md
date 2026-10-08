# Global Dramas Admin 项目名称

- 日期：2026-10-08
- 状态：已完成
- 用户需求：项目名称使用 `Global Dramas Admin`。
- 实现：统一前端 appName、浏览器标题、npm 包名、项目 README、Docker Compose 项目名、后端启动名称与 Go 模块路径。Go 模块使用 `github.com/dingmuran/GlobalDramasAdmin/server`。原框架许可证与来源记录保留在 LICENSE、NOTICE 和 README.upstream.md。
- 仓库：`https://github.com/dingmuran/GlobalDramasAdmin`。
- 验证：Docker 内后端编译、PostgreSQL 业务集成测试和前端生产构建通过。
- 本地兼容：忽略的 `.env` 保留现有 Compose 项目名与数据库卷；新环境默认名称为 `global-dramas-admin`。真实密码、上传文件、数据库文件和构建产物不提交。
- 运行位置：`/Users/zhangxinzheng/Downloads/Global Dramas/gin-vue-admin`。
- 运行方式：Docker Compose，前后端运行时均位于容器。

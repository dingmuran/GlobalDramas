# Global Dramas Admin

基于 Gin + Vue 3 的短剧管理平台，使用 PostgreSQL，Go 和前端运行在 Docker 中。

支持三类角色：观众、版权方/制片方、超级管理员。包含内容与审核、策略、会员、用户、订单、广告记录、财务、数据分析、审批审计与异常恢复，共21个业务页面、28张业务表，表及333个字段均有中文注释。

## 本地启动

需要 Docker Desktop 和 Python 3，不需要在本机安装 Go。

```sh
git clone https://github.com/dingmuran/GlobalDramasAdmin.git
cd GlobalDramasAdmin
python3 deploy/init-local-config.py
docker compose -f compose.local.yaml up -d
```

前端：http://localhost:8080/ 。首次安装打开 http://localhost:8080/#/init ，自定义管理员密码并初始化数据库：

- 类型：pgsql
- host：postgres；port：5432（容器内部地址）
- userName：global_dramas
- password：本地生成的 `.env.local` 中的 POSTGRES_PASSWORD
- dbName：global_dramas_admin

初始化完成后登录 `admin`。本机数据库工具使用 `127.0.0.1:15432`。实际配置、凭据、数据库与上传文件均不提交。

已配置的环境直接执行 Docker 启动命令，无需再次生成配置或初始化。当前项目已有运行数据时请保留其 `.env` 和 Docker 数据卷。

## 文档

- [Docker开发环境](LOCAL-DOCKER.md)
- [业务操作说明](docs/GLOBAL-DRAMAS-GUIDE.md)
- [中文表字段字典](docs/DRAMAS-DATABASE.md)
- [PostgreSQL结构SQL](docs/DRAMAS-SCHEMA.sql)
- [接口契约](aiDoc/frontend-backend/dramas-contract.md)

当前版提供内部业务管理、真实凭据核对与双人审批。支付渠道、广告SDK、订阅实时同步、私有媒体与转码需要对应平台接入信息；不会自动发起实际扣款、退款或转账。

## 验证

```sh
docker compose -f compose.local.yaml exec -T -e GD_INTEGRATION=1 -e GVA_CONFIG=/workspace/server/config.local.yaml server go test ./plugin/dramas/...
docker compose -f compose.local.yaml exec -T web npm run build
```

集成测试使用事务回滚，不留下演示数据。

## 来源与许可证

项目由 [gin-vue-admin](https://github.com/flipped-aurora/gin-vue-admin) 二次开发。原许可证与源码声明保留，见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [原项目说明](README.upstream.md)。本仓库新增三角色短剧业务模块、PostgreSQL业务结构和 Global Dramas Admin 界面与运行配置。

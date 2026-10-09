# Gload Dramas

短剧平台项目，后端为 Go + Gin，数据库为 PostgreSQL。后台采用 Ant Design Pro 官方完整模板（React + TypeScript + Umi Max + Ant Design 6），H5 前台基础工程采用 React + Vite + TypeScript，全部运行在 Docker 中。后台保留官方默认布局和页面风格，真实短剧业务使用Go接口。

后台仅支持两类角色：版权方/制片方、超级管理员。观众体验由 TK 小程序的 H5 前台承接。后台包含内容与审核、策略、会员、用户、订单、广告记录、财务、数据分析、审批审计与异常恢复，共15个业务页面、28张业务表，表及333个字段均有中文注释。

## 目录

- `server/`：Go 后端。
- `webAdmin/`：Ant Design Pro 官方模板与真实短剧后台业务。
- `web/`：React + Vite + TypeScript 观众前台基础工程。
- `packages/contracts/`：两端共享接口类型，由真实 Go 模型生成。

## 本地启动

需要 Docker Desktop 和 Python 3，不需要在本机安装 Go。

```sh
git clone https://github.com/dingmuran/GlobalDramasAdmin.git GloadDramas
cd GloadDramas
python3 deploy/init-local-config.py
docker compose -f compose.local.yaml up -d
```

后台管理：http://localhost:8080/；React H5 基础工程：http://localhost:8081/ 。首次安装启动后执行 `python3 deploy/bootstrap-local-database.py`，交互输入管理员密码，通过现有Go初始化接口创建数据库。当前已初始化环境无需执行。

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
docker compose -f compose.local.yaml exec -T webAdmin npm run build
python3 deploy/generate-contracts.py
```

集成测试使用事务回滚，不留下演示数据。

## 来源与许可证

项目由 [gin-vue-admin](https://github.com/flipped-aurora/gin-vue-admin) 二次开发。原许可证与源码声明保留，见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [原项目说明](README.upstream.md)。本仓库新增短剧后台业务模块、PostgreSQL业务结构和 Gload Dramas 界面与运行配置。

后台已移除发现、播放器、收藏与购买等观众入口。观众身份、观看记录、收藏、权益、订阅、订单、钱包与反馈的表和业务服务保留，管理员继续查询处理。H5 前台、独立观众认证及前台 API 尚待接入；角色200仅保留为服务中的观众身份标记，不再授予后台权限。

无关演示菜单与路由已移除，Mock 已关闭。系统管理包含角色、菜单、API、用户、字典、参数、Token、版本、三类日志与素材。导航读取 Go 授权菜单树，支持分组、排序、隐藏及标题配置。详情见 [后台说明](webAdmin/README.md)。

# Global Dramas Admin 本地 Docker 开发环境

首次克隆先运行 `python3 deploy/init-local-config.py`，生成私密配置；启动后打开 `http://localhost:8080/#/init` 完成首次初始化。已初始化环境不要覆盖配置。

在当前项目目录运行：

```sh
docker compose -f compose.local.yaml up -d
```

前端：http://localhost:8080

后端：http://localhost:8888

Go 和 Node.js 均在容器中运行，依赖使用 Docker 卷缓存。前端通过 Docker 服务名 `server` 代理后端。

首次启动需要下载镜像、安装前端依赖并编译后端。查看进度：

```sh
docker compose -f compose.local.yaml logs -f
```

数据库使用 Docker 中的 PostgreSQL 17，数据持久化到 Docker 项目对应的 `pg-data` 卷（新环境默认为 `global-dramas-admin_pg-data`；现有环境通过忽略提交的 `.env` 保留 `unitok-gva_pg-data`）。后端使用 `pgsql` 数据库类型，连接 Docker 服务 `postgres:5432`。本机数据库端口为 `127.0.0.1:15432`，数据库名为 `global_dramas_admin`。数据库账号及密码保存在忽略提交的 `.env.local`，后端配置保存在 `server/config.local.yaml`。

初始化只创建 `admin` 超级管理员及系统必需的接口、权限、菜单和字典，不创建测试账号、测试角色或示例图片。仪表盘显示业务数据空状态。旧 SQLite 数据库与配置备份位于 `server/uploads/backups/`。

源码修改可直接用于容器开发；后端源码修改后执行：

```sh
docker compose -f compose.local.yaml restart server
```

停止服务（保留数据库和依赖）：

```sh
docker compose -f compose.local.yaml down
```

本地配置文件和数据库不应提交到 Git。

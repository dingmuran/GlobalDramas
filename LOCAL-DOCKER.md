# Gload Dramas 本地 Docker 开发环境

首次克隆先运行 `python3 deploy/init-local-config.py`，生成私密配置；启动后执行 `python3 deploy/bootstrap-local-database.py` 交互完成首次初始化。已初始化环境不要覆盖配置。

在当前项目目录运行：

```sh
docker compose -f compose.local.yaml up -d
```

后台管理（webAdmin）：http://localhost:8080

H5 前台基础工程（web）：http://localhost:8081

后端：http://localhost:8888

Go 和 Node.js 均在容器中运行，依赖使用 Docker 卷缓存。前端通过 Docker 服务名 `server` 代理后端。

## 容器内编辑与类型识别

前端依赖仅安装在 Docker 卷，本机 node_modules 为空是正常情况。本机编辑器直接打开源码无法读取这些卷，会提示缺少 react/jsx-runtime 或 JSX.IntrinsicElements；这不表示容器缺少依赖。

使用支持 Dev Containers 的编辑器，执行“Dev Containers: Attach to Running Container”，选择当前 webAdmin 容器并打开 `/workspace`。该容器同时挂载前后台依赖卷，支持两个前端的类型识别。连接后若仍显示旧诊断，执行“TypeScript: Restart TS Server”。

也可通过 `.devcontainer/devcontainer.json` 执行“Dev Containers: Reopen in Container”，启动前应完成本地配置初始化。附加已有容器可以沿用当前运行环境。

无需在本机安装 Go 或前端依赖。编辑器不支持容器连接时，可以在 Docker 内运行 typecheck/build，但本机诊断仍无法解析容器依赖。

首次启动需要下载镜像、安装前端依赖并编译后端。查看进度：

```sh
docker compose -f compose.local.yaml logs -f
```

数据库使用 Docker 中的 PostgreSQL 17，数据持久化到 Docker 项目对应的 `pg-data` 卷（新环境默认为 `gload-dramas_pg-data`；现有环境通过忽略提交的 `.env` 保留 `unitok-gva_pg-data`）。后端使用 `pgsql` 数据库类型，连接 Docker 服务 `postgres:5432`。本机数据库端口为 `127.0.0.1:15432`，数据库名为 `global_dramas_admin`。数据库账号及密码保存在忽略提交的 `.env.local`，后端配置保存在 `server/config.local.yaml`。

前后台分别使用依赖卷 `backoffice-pro-modules` 和 `frontend-modules`，后台为Ant Design Pro，前台为React Vite，依赖与构建输出独立。CRUD代码生成器已删除。前台当前只检查公开健康接口，没有接入后台登录；观众认证与业务页面待后续实现。

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

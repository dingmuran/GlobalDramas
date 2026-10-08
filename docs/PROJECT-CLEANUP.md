# 项目文件清理记录

日期：2026-10-08。当前运行入口为 `compose.local.yaml`，数据库为PostgreSQL，后端与前端均运行在Docker。

## 分析依据

检查了根目录、前后端源码、插件注册、数据库菜单、代码生成模板、Vite动态导入、静态资源与部署入口。运行中的权限、上传、系统配置、代码生成、MCP、公告和插件管理均有实际注册或菜单入口，因此保留，不能仅按文件名含example或未出现静态import判断无用。

## 已清理

- 5个AI工具规则副本目录：`.aone_copilot`、`.claude`、`.codex`、`.cursor`、`.trae`。项目规则统一保留在AGENT.MD与aiDoc。
- 上游GitHub CI、赞助和Issue模板；过时的贡献/安全联络说明、英文旧README与本地Go调试工作区。
- 旧MySQL Compose、Kubernetes、旧Docker镜像构建文件及Makefile。保留当前PostgreSQL Compose和私密配置初始化脚本。
- Vue CLI/Babel遗留配置、Windows内存修补脚本、启动时自动打开上游官网的脚本。
- 未被路由、数据库菜单或组件引用的旧首页演示组件、静态假数据图表及其专用图表组件和hook。
- 无运行引用的演示QA入口、商业链接配置、16张旧素材和2个旧公共品牌资源。保留初始化页和二维码组件仍引用的图片。
- 13个无用直接npm依赖；重新安装实际移除809个依赖包。

后台技能服务的读取操作不再自动创建工具目录；明确保存技能时仍正常创建所需目录。

## 保留

- `.git`、LICENSE、NOTICE与README.upstream.md：版本历史、许可证和来源记录。
- `.env`、`.env.local`、server/config.local.yaml、PostgreSQL数据卷、上传及运行日志：本地运行和业务数据。
- 前后端业务与系统模块、数据库表/注释、业务测试、代码生成模板和有效开发配置。
- 动态加载的SVG图标、所有仍注册或被引用的页面，以及模板引用的按钮权限工具。
- 服务端默认配置与安全配置模板：分别支撑首次启动、生成本地配置和配置管理。

## 文件清单

删除文件数：67；源码及素材体积约645 KiB。

- `.aone_copilot/rules/project_rules.md`
- `.claude/rules/project_rules.md`
- `.codex/rules/project_rules.md`
- `.cursor/rules/project_rules.md`
- `.github/FUNDING.yml`
- `.github/ISSUE_TEMPLATE/bug_report.yaml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yaml`
- `.github/workflows/ci.yaml`
- `.trae/rules/project_rules.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `Makefile`
- `README-en.md`
- `SECURITY.md`
- `deploy/docker-compose/docker-compose.yaml`
- `deploy/docker/Dockerfile`
- `deploy/docker/entrypoint.sh`
- `deploy/kubernetes/server/gva-server-configmap.yaml`
- `deploy/kubernetes/server/gva-server-deployment.yaml`
- `deploy/kubernetes/server/gva-server-service.yaml`
- `deploy/kubernetes/web/gva-web-configmap.yaml`
- `deploy/kubernetes/web/gva-web-deploymemt.yaml`
- `deploy/kubernetes/web/gva-web-ingress.yaml`
- `deploy/kubernetes/web/gva-web-service.yaml`
- `gin-vue-admin.code-workspace`
- `server/Dockerfile`
- `web/.docker-compose/nginx/conf.d/my.conf`
- `web/.docker-compose/nginx/conf.d/nginx.conf`
- `web/.dockerignore`
- `web/Dockerfile`
- `web/README.md`
- `web/babel.config.js`
- `web/limit.js`
- `web/openDocument.js`
- `web/public/favicon.ico`
- `web/public/logo.png`
- `webAdmin/src/assets/background.svg`
- `webAdmin/src/assets/banner2.jpg`
- `webAdmin/src/assets/dashboard.png`
- `webAdmin/src/assets/docs.png`
- `webAdmin/src/assets/flipped-aurora.png`
- `webAdmin/src/assets/github.png`
- `webAdmin/src/assets/kefu.png`
- `webAdmin/src/assets/login_background.jpg`
- `webAdmin/src/assets/login_background.svg`
- `webAdmin/src/assets/login_left.svg`
- `webAdmin/src/assets/logo.jpg`
- `webAdmin/src/assets/logo_login.png`
- `webAdmin/src/assets/nav_logo.png`
- `webAdmin/src/assets/notFound.png`
- `webAdmin/src/assets/qm.png`
- `webAdmin/src/assets/video.png`
- `webAdmin/src/components/charts/index.vue`
- `webAdmin/src/config/external-links.js`
- `webAdmin/src/hooks/use-windows-resize.js`
- `webAdmin/src/qa-licensed-demo.js`
- `webAdmin/src/view/dashboard/components/banner.vue`
- `webAdmin/src/view/dashboard/components/charts-content-numbers.vue`
- `webAdmin/src/view/dashboard/components/charts-people-numbers.vue`
- `webAdmin/src/view/dashboard/components/charts.vue`
- `webAdmin/src/view/dashboard/components/index.js`
- `webAdmin/src/view/dashboard/components/notice.vue`
- `webAdmin/src/view/dashboard/components/pluginTable.vue`
- `webAdmin/src/view/dashboard/components/table.vue`
- `webAdmin/src/view/dashboard/components/wiki.vue`
- `web/vitePlugin/secret/index.js`

## 移除的直接依赖

`echarts`, `install`, `npm`, `path`, `vue-echarts`, `@babel/eslint-parser`, `@vue/cli-plugin-babel`, `@vue/cli-plugin-eslint`, `@vue/cli-plugin-router`, `@vue/cli-plugin-vuex`, `@vue/cli-service`, `babel-plugin-import`, `vite-plugin-importer`

## 验证结果

- 前端生产构建通过，后端Docker内编译通过。
- 技能读取不重建目录、明确保存技能仍可用的测试通过。
- 数据库所有有效内部菜单组件仍存在；动态SVG与代码生成权限工具保留。
- 当前前端代理到后台的元数据、菜单和权限检查通过；PostgreSQL及业务服务保持运行。
- 清理阶段按用户要求只修改本地；后续用户明确要求发布时，再提交和推送，并使用中文标题及详细说明。

# 系统关系

- 后端：`server/plugin/dramas/{router,api,service,model,initialize}`，保持Router → API → Service → Model。
- 后台：`webAdmin/config/routes.ts` → `src/pages/` → `src/components/` → `src/services/api.ts` → Go接口。权限入口 `src/access.ts`、`src/domain/access.ts`，会话 `services/session.ts`，缓存 `services/query.ts`。
- 系统管理：角色、菜单、API、用户、字典、参数、Token、版本、三类日志与素材，使用真实 Go 接口。无关模板演示路由移除，Mock 关闭。
- 前台：`web/`，React + Vite，尚无观众业务接口接入。
- 契约：`packages/contracts/`，共享纯类型。
- 运行：`compose.local.yaml`，Go、Node、PostgreSQL容器。

Go元数据保留中文字段、可写能力和菜单；组件路径已迁移为React页。版权方自定义菜单和接口授权不会在重启时被恢复为全量。界面能力不替代Go鉴权或归属校验。

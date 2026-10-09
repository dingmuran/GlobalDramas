# Gload Dramas 后台

采用 Ant Design Pro 官方模板 6.0.3，来源提交 24de7e34b8f035553cbe82639ee86292df71b14a。保留官方布局、ProTable/ModalForm 页面风格与主题设置，移除无关演示菜单及路由。默认蓝色、混合布局。

`src/pages/Login` 使用真实账号、密码及验证码，`src/services/api.ts` 访问 Go 的统一响应，JWT 与 Casbin 继续生效。短剧业务与系统管理接入真实数据；导航读取 Go 授权菜单树。Mock 已关闭，原模板示例源码仅供参考，不注册路由。系统管理恢复角色、菜单、API、用户、字典、参数、Token、版本、三类日志与素材。菜单编辑即时刷新导航，循环引用被拒绝；初始化保留自定义菜单、标题、排序与分组。

Docker 中执行：

```sh
docker compose -f compose.local.yaml exec -T webAdmin npm run typecheck
docker compose -f compose.local.yaml exec -T webAdmin npm run test
docker compose -f compose.local.yaml exec -T webAdmin npm run build
```

后台入口 http://localhost:8080/#/dashboard/analysis ，无会话时跳转真实 Go 登录页。H5 `../web` 继续使用 React + Vite，独立运行于8081。

`.npmrc` 使用 legacy-peer-deps，避免当前官方依赖范围触发 npm10 的 Arborist peer 解析故障。锁文件固定实际依赖。保留官方 MIT 声明 `LICENSE.ant-design-pro`。

验证记录（2026-10-09）：TypeScript、Biome、10项业务与导航测试、生产构建、Go全量测试、PostgreSQL业务与菜单权限集成测试通过。登录后核对系统管理各入口的实际数据与页面。

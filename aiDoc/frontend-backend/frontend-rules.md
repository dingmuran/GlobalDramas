# 前端约束

后台基于Ant Design Pro官方模板，使用React + TypeScript + Umi Max；H5使用React + Vite。不得新增Vue、Pinia或Element Plus代码。

后台真实业务请求统一在 `src/services/api.ts`，认证在 `services/session.ts`，请求拦截器在 `app.tsx`。共享类型引用 `@gload-dramas/contracts`。使用React Query进行服务端缓存，账号与角色参与数据查询键；退出时清除缓存。

保持官方风格，移除无关演示路由并关闭 Mock；不得写入示例金额、趋势或账号。业务与系统管理表格采用 ProTable，表单采用 ProForm，导航读取 Go 授权菜单树，权限按钮使用服务端 schema 能力；后端独立鉴权。

金额响应保留字符串，编辑请求为安全整数；日期保留null。使用语义按钮、中文标签、宽表横向滚动和移动端布局。复杂动作确认后调用Go状态接口；财务与审核规则由服务端负责。

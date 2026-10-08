# Gload Dramas H5 前台

React + Vite + TypeScript 的独立观众前台基础工程，入口为 `src/main.tsx`。

- 本地地址：`http://localhost:8081`。
- Docker：`docker compose -f compose.local.yaml up -d web`。
- 构建：`docker compose -f compose.local.yaml exec -T web npm run build`。
- 接口类型：使用 `@gload-dramas/contracts`，源码位于 `../packages/contracts/src`。
- `/api` 代理至 Go，目前仅检查公开健康接口；不使用管理员登录代替观众认证。

本次只建立基础工程，未实现观众登录、剧集列表、播放、收藏、会员、支付或订单页面。需要独立观众接口和 TK H5 授权信息后再接入；不提供演示内容。

# 前后台共用 Go 服务，接口独立

`server` 保持前后台共用后端名称，`webAdmin` 为管理端，`web` 为 PC、手机浏览器与 TikTok H5 共用观众前台。

## 已实现的入口

- 管理端：现有系统接口与 `/dramas/*`，继续使用管理员 JWT + Casbin，路径保持兼容。
- 观众端：`/viewer/v1/*`，独立 Router、API、ViewerService 和返回 DTO。
- 前台代理地址：`/api/viewer/v1/*`，Vite 去掉 `/api` 后转发到同一个 Go 服务；生产部署需提供对应反向代理。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /viewer/v1/health | 观众接口可达检查，不代表数据库健康 |
| GET | /viewer/v1/dramas | 已发布且在授权期内的剧集，page/pageSize/search |
| GET | /viewer/v1/dramas/:id | 公开剧集详情，隐藏内容返回统一业务错误 |
| GET | /viewer/v1/dramas/:id/episodes | 分页选集，按集数排序，无视频 URL |

统一响应 `{code,data,msg}`，分页 `{list,total,page,pageSize}`。page 默认1，最多100000；pageSize 默认20，最多100；search 最多100字符。公开目录不需要身份，仅返回专用白名单字段；不会根据管理员 Token 扩大可见范围。草稿、未到授权期和过期内容不可读，审核意见、归属、版权证明、处理反馈及视频地址不对外返回。

## 共用与隔离

共用 PostgreSQL 业务表、发布与授权可见性规则、现有策略及权益服务。不同端分别组织 API 和 DTO，不向前台开放后台通用 CRUD。纯类型由 `packages/contracts/src/viewer.ts` 共享，前台请求封装在 `web/src/lib/api.ts`。

## 后续观众身份接口

本次仅接通公共目录入口；尚未实现观众登录、播放授权、收藏、历史、会员、支付、订单 HTTP 接口，前台业务页面也待开发。

观众认证需独立账号/平台身份映射与会话，服务端校验 audience、账号状态和 Token 有效性，不接收管理员 Token 代替观众身份。TikTok 平台凭证交换、支付回调及广告验证在 Go 处理。普通浏览器登录和购买渠道需要另行确定。

后续私有接口在 `/viewer/v1` 下独立注册观众认证中间件，严格限定本人数据；不得直接复用管理员登录或后台 Casbin 角色200。播放接口校验权益后签发短时播放地址，不能将选集元数据当作播放授权。

## 验证

PostgreSQL 事务测试覆盖内容可见性、私有字段隔离、参数校验和拒绝公开写操作，结束后回滚数据；前台生产构建及原有管理业务集成测试通过。

## 原生 App 预留

`mobile/` 使用同一公开观众目录与共享 contracts，封装入口为 `mobile/src/services/viewer.ts`。API 根地址由 `EXPO_PUBLIC_API_BASE_URL` 提供，直接调用 `/viewer/v1`；不依赖 Web 的 Vite 代理。当前页面为离线骨架，尚未接通观众身份、播放授权或个人数据。

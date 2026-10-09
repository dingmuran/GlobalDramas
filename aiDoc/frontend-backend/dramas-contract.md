# Global Dramas 业务接口契约

入口：`server/plugin/dramas` → initialize → router → api → service → model；前端 `webAdmin/src/services/api.ts`、`src/pages/Workspace/index.tsx`。

所有后台接口均使用现有 JWT + Casbin。后台角色：300 版权方/制片方、888 超级管理员。200仅为保留服务中的H5观众身份标记，不注册后台角色、菜单或API权限，不能登录后台。公开观众目录使用独立 `/viewer/v1` 入口，具体接口与后续独立身份边界见 [观众接口契约](viewer-api.md)。

统一响应 `{code,data,msg}`；code=0 成功，code=7 业务失败。分页 `{list,total,page,pageSize}`。新业务模型 JSON 使用 `id/createdAt/updatedAt`，现有系统账号沿用 `ID/userName`。时间使用 RFC3339，金额在数据库/Go中为带币种的 int64 最小货币单位；金额响应字段使用十进制字符串避免JavaScript解析丢失精度，前端直接拆分十进制字符串格式化。表单请求用整数，服务端也限制到JS安全整数范围；CSV输入同样校验。

| 方法 | 路径 | 请求 / 返回 |
|---|---|---|
| GET | /dramas/schema | 角色可见资源、中文字段、类型、必填、关联、canWrite/canEdit/canDelete/canAction（结合实际Casbin权限）；服务端仍独立鉴权 |
| GET | /dramas/overview | 记录数、来源、播放事件、按剧表现(dramaStats)、质量、留存、按币种净收入、30天授权提醒 |
| GET | /dramas/records/:resource | page、pageSize≤100、search、status、dramaId、id；分页列表 |
| POST | /dramas/records/:resource | 资源可写字段；创建后返回完整记录 |
| PUT | /dramas/records/:resource/:id | 资源可写字段；编辑后返回完整记录 |
| DELETE | /dramas/records/:resource/:id | 后台仅允许删除草稿内容；引用存在时拒绝 |
| POST | /dramas/actions/:resource/:id | action、note、evidence、decision、start、count |
| GET | /dramas/preview | dramaId、at(RFC3339)；按时间预览已激活策略，管理员专用 |
| GET / POST | /dramas/accounts | 管理员查询后台/前台账号 / 创建 username、password(12–72字节)、nickName、role（仅300/888） |
| POST | /dramas/bills/import | multipart file；CSV原子导入，≤2MB、≤2000行 |

资源与可写字段完整清单见 `docs/dramas-resources.json` 和 `docs/DRAMAS-DATABASE.md`。归属、用户、状态、计算金额、履约、发奖结果不可通过通用保存接口修改。

## 归属与状态

保留的H5业务服务：只读已发布且在授权期内的剧集和单集、已上架套餐；其历史、收藏、权益、订单、订阅、退款、广告、钱包和反馈限制为本人。已发布独立前台公共剧集与选集HTTP接口，专用DTO隐藏视频地址和后台字段；私有观众HTTP接口尚待认证接入，不能通过后台路由调用。版权方：限制 owner_id 为当前账号。管理员：可查看全量数据，敏感动作仍需审批。

后台已移除观众发现、播放器、收藏、购买及观看事件UI；播放/事件HTTP端点不再注册。底层服务、模型与历史数据保留，H5需接入独立观众认证、专用前台API和支付/广告平台验证。启动迁移幂等清理角色200及关联菜单、数据权限和Casbin权限，不删除sys_users或gd_*业务记录，不将观众升级为管理员。

剧集：draft/rejected/offline → submit → pending_review → 管理员 approve/reject → approved/rejected → publish → published → offline。发布前核对授权、计划集数、素材与100%处理进度；待审核及发布内容禁止编辑单集。授权到期按分钟自动下架并告警，播放接口即时校验期限。version 保存快照；batch 在可编辑状态下创建最多200集，不重复创建现有集数。

plans/policies：activate/disable 控制上架与启用；策略按 effectiveAt 生效、expiresAt 失效，优先按剧覆盖，再回退全局。freeEpisodes=-1 表示全免。会员播放要求 memberFree 且订阅在有效期。

订单、退款、广告、补偿、结算：管理员 request 提交说明和外部凭据 → approvals pending → 另一位管理员 decide。重复审批拒绝。通过后执行内部履约、撤权、发奖或记录到账。拒绝可重新申请。审批本身不能被通用CRUD修改。

首购/续费服务端取套餐价格与有效期；单集订单服务端取单集价格。续费从当前同套餐订阅到期时间延长。退款撤销该订单产生的权益/订阅，记录钱包流水。结算只允许同账号、账期、币种已对账净收入扣除已到账金额后的范围，使用数据库事务与账号锁避免重复支付。

feedback resolve 记录客服回复；alerts resolve 同时生成恢复记录；bills reconcile 记录差异处理说明。财务与审计流水不提供删除接口。

## 外部系统边界

当前运行版支持真实本地业务记录、人工核对凭据和双人审批，不会发起实际扣款、退款或转账。Apple/Google支付、订阅实时同步、广告SDK和服务端验签、转码/上传/CDN尚未接入；需要相应平台账号与密钥才能上线。syncs/recoveries 提供实际人工查询结果登记，不能当作平台已完成实时同步。视频URL权限只控制接口披露，生产素材需私有存储与短时签名URL。

保留的播放事件服务面向H5观众，属于客户端上报指标，不能替代支付/广告平台凭据；当前观众认证和事件HTTP接口待H5接入。后台观看历史、收藏、订单和广告尝试不提供通用创建或编辑，超级管理员仅查询并执行核验、审批与售后动作。留存按首次播放日分组，尚未到观察日期的 D1/D7 显示“观察中”。事件汇总不将 progress 当作新播放。没有业务数据时显示0或空列表，不写入演示数据。

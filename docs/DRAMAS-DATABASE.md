# Global Dramas PostgreSQL 数据字典

金额字段均为最小货币单位整数，禁止跨币种相加。CNY/USD/EUR/GBP 的单位为分；JPY 为日元。时间为带时区时间戳。账号引用现有 sys_users；后台角色为300版权方/制片方、888超级管理员。200仅为保留服务中的H5观众身份标记，不注册后台角色；观众账号与业务数据保留，H5认证待接入。

## gd_dramas — 剧集

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| title | text | 剧名 |
| synopsis | text | 剧情简介 |
| cover_url | text | 封面地址 |
| genre | text | 题材 |
| language | text | 语言 |
| region | text | 地区 |
| total_episodes | bigint | 计划集数 |
| organization_id | bigint | 机构ID；引用 gd_organizations |
| license_start | timestamptz | 授权开始 |
| license_end | timestamptz | 授权截止 |
| copyright_proof | text | 版权证明地址 |
| review_note | text | 审核反馈 |

## gd_episodes — 单集

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |
| number | bigint | 集数 |
| title | text | 单集名称 |
| video_url | text | 视频地址 |
| duration_seconds | bigint | 时长（秒） |
| price_minor | bigint | 单集价格（最小货币单位） |
| currency | text | 币种 |
| processing_progress | bigint | 处理进度（%） |
| processing_error | text | 处理反馈 |

## gd_versions — 内容版本

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |
| version | text | 版本号 |
| change_note | text | 变更说明 |
| snapshot | text | 内容快照（JSON） |

## gd_reviews — 审核记录

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |
| decision | text | 审核结论 |
| note | text | 审核反馈 |
| reviewer_id | bigint | 审核人ID |

## gd_licenses — 授权合同

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |
| licensor | text | 授权方 |
| territories | text | 授权地区 |
| starts_at | timestamptz | 起始时间 |
| expires_at | timestamptz | 到期时间 |
| document_url | text | 合同地址 |
| remind_days | bigint | 提前提醒天数 |

## gd_policies — 访问策略

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| name | text | 策略名称 |
| drama_id | bigint | 覆盖剧集ID（0为全局）；引用 gd_dramas |
| free_episodes | bigint | 免费集数（-1全部免费） |
| ads_enabled | boolean | 广告开关 |
| member_free | boolean | 会员覆盖 |
| effective_at | timestamptz | 生效时间 |
| expires_at | timestamptz | 失效时间 |

## gd_plans — 会员套餐

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| name | text | 套餐名称 |
| platform | text | 平台 |
| platform_product_id | text | 平台商品ID |
| benefits | text | 权益说明 |
| price_minor | bigint | 价格（最小货币单位） |
| currency | text | 币种 |
| duration_days | bigint | 有效天数 |

## gd_subscriptions — 会员订阅

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| plan_id | bigint | 套餐ID；引用 gd_plans |
| platform | text | 会员来源 |
| provider_subscription_id | text | 平台订阅号 |
| starts_at | timestamptz | 开始时间 |
| expires_at | timestamptz | 到期时间 |
| sync_result | text | 同步结果 |

## gd_syncs — 平台同步记录

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| subscription_id | bigint | 订阅ID；引用 gd_subscriptions |
| platform | text | 平台 |
| provider_reference | text | 平台查询编号 |
| result | text | 同步结果 |
| checked_at | timestamptz | 同步时间 |

## gd_organizations — 版权方与制片机构

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| account_id | bigint | 所属制片方账号ID |
| name | text | 机构名称 |
| kind | text | 机构类型 |
| contact | text | 联系人 |
| email | text | 联系邮箱 |
| registration_number | text | 登记编号 |
| proof_url | text | 资质地址 |

## gd_profiles — 用户业务档案

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| account_id | bigint | 系统账号ID |
| organization_id | bigint | 机构ID；引用 gd_organizations |
| source | text | 注册来源 |
| notes | text | 备注 |

## gd_history — 观看历史

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| episode_id | bigint | 单集ID；引用 gd_episodes |
| position_seconds | bigint | 播放位置（秒） |
| watched_seconds | bigint | 累计观看（秒） |
| source | text | 流量来源 |

## gd_favorites — 用户收藏

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |

## gd_entitlements — 单集权益

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| episode_id | bigint | 单集ID；引用 gd_episodes |
| source | text | 权益来源 |
| reference | text | 来源记录ID |
| expires_at | timestamptz | 到期时间 |

## gd_feedback — 用户反馈

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| category | text | 反馈类型 |
| subject | text | 反馈主题 |
| message | text | 反馈内容 |
| order_id | bigint | 关联订单ID；引用 gd_orders |
| reply | text | 客服回复 |

## gd_wallet — 钱包流水

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| amount_minor | bigint | 金额（最小货币单位） |
| currency | text | 币种 |
| direction | text | 收支方向 |
| reference | text | 关联编号 |
| description | text | 说明 |

## gd_orders — 订单

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| kind | text | 订单类型 |
| episode_id | bigint | 单集ID；引用 gd_episodes |
| plan_id | bigint | 套餐ID；引用 gd_plans |
| currency | text | 币种 |
| amount_minor | bigint | 订单金额（最小货币单位） |
| provider | text | 支付平台 |
| provider_reference | text | 支付流水 |
| fulfillment | text | 履约状态 |
| issue_id | bigint | 问题反馈ID；引用 gd_feedback |

## gd_refunds — 退款请求

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| order_id | bigint | 订单ID；引用 gd_orders |
| reason | text | 退款原因 |
| amount_minor | bigint | 退款金额（最小货币单位） |
| provider_reference | text | 平台退款流水 |

## gd_recoveries — 查询与恢复记录

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| order_id | bigint | 订单ID；引用 gd_orders |
| provider_reference | text | 平台查询编号 |
| result | text | 查询或恢复结果 |
| evidence_url | text | 凭据地址 |

## gd_ads — 广告尝试

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| episode_id | bigint | 目标单集ID；引用 gd_episodes |
| network | text | 广告平台 |
| placement | text | 广告位 |
| failure_category | text | 失败分类 |
| provider_reference | text | 验证回执 |
| completed_at | timestamptz | 完成时间 |

## gd_compensations — 客服补偿

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| target_user_id | bigint | 补偿用户ID |
| episode_id | bigint | 补偿单集ID；引用 gd_episodes |
| ad_id | bigint | 关联广告尝试ID；引用 gd_ads |
| reason | text | 补偿原因 |

## gd_bills — 财务账单

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| external_id | text | 账单行编号 |
| platform | text | 账单平台 |
| drama_id | bigint | 剧集ID；引用 gd_dramas |
| period | text | 账期 |
| currency | text | 币种 |
| gross_minor | bigint | 总收入（最小货币单位） |
| fee_minor | bigint | 费用（最小货币单位） |
| net_minor | bigint | 净收入（最小货币单位） |
| source | text | 获取来源 |
| difference_minor | bigint | 差异金额（最小货币单位） |
| resolution | text | 差异处理说明 |

## gd_settlements — 结算记录

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| organization_id | bigint | 机构ID；引用 gd_organizations |
| period | text | 结算账期 |
| currency | text | 币种 |
| amount_minor | bigint | 结算金额（最小货币单位） |
| bank_reference | text | 到账流水 |
| received_at | timestamptz | 到账时间 |
| note | text | 结算说明 |

## gd_events — 行为与播放质量

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| drama_id | bigint | 剧集ID |
| episode_id | bigint | 单集ID |
| event | text | 事件类型 |
| source | text | 流量来源 |
| session_id | text | 播放会话 |
| startup_ms | bigint | 首帧时间（毫秒） |
| buffer_ms | bigint | 卡顿时间（毫秒） |
| error_code | text | 播放错误码 |

## gd_approvals — 敏感操作审批

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| resource | text | 操作资源 |
| target_id | bigint | 目标记录ID |
| action | text | 审批操作 |
| reason | text | 申请说明 |
| reviewer_id | bigint | 审批人ID |
| decision_note | text | 审批意见 |
| evidence | text | 外部流水或凭据 |

## gd_audits — 操作审计

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| resource | text | 操作资源 |
| target_id | bigint | 记录ID |
| action | text | 操作名称 |
| detail | text | 变更内容 |

## gd_alerts — 异常告警

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| category | text | 异常类型 |
| severity | text | 严重程度 |
| subject | text | 告警标题 |
| detail | text | 告警内容 |
| recovery_note | text | 恢复说明 |
| resolved_at | timestamptz | 恢复时间 |

## gd_restores — 异常恢复记录

| 字段 | 类型 | 中文注解 |
|---|---|---|
| id | bigint 主键 | 主键ID |
| owner_id | bigint 索引 | 内容所属账号ID |
| user_id | bigint 索引 | 业务所属用户ID |
| status | varchar(32) 索引 | 业务状态 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| alert_id | bigint | 告警ID；引用 gd_alerts |
| operation | text | 恢复操作 |
| result | text | 恢复结果 |
| evidence | text | 恢复凭据 |

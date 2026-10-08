// 根据 Go 业务模型生成；修改模型后运行 python3 deploy/generate-contracts.py。
import type { DateTime, MoneyMinor } from './common'

export interface Base {
  /** 主键ID */
  id: number
  /** 内容所属账号ID */
  ownerId: number
  /** 业务所属用户ID */
  userId: number
  /** 业务状态 */
  status: string
  /** 创建时间 */
  createdAt: DateTime
  /** 更新时间 */
  updatedAt: DateTime
}

export interface Dramas extends Base {
  /** 剧名 */
  title: string
  /** 剧情简介 */
  synopsis: string
  /** 封面地址 */
  coverUrl: string
  /** 题材 */
  genre: string
  /** 语言 */
  language: string
  /** 地区 */
  region: string
  /** 计划集数 */
  totalEpisodes: number
  /** 机构ID */
  organizationId: number
  /** 授权开始 */
  licenseStart: DateTime | null
  /** 授权截止 */
  licenseEnd: DateTime | null
  /** 版权证明地址 */
  copyrightProof: string
  /** 审核反馈 */
  reviewNote: string
}

export interface Episodes extends Base {
  /** 剧集ID */
  dramaId: number
  /** 集数 */
  number: number
  /** 单集名称 */
  title: string
  /** 视频地址 */
  videoUrl: string
  /** 时长（秒） */
  durationSeconds: number
  /** 单集价格（最小货币单位） */
  priceMinor: MoneyMinor
  /** 币种 */
  currency: string
  /** 处理进度（%） */
  processingProgress: number
  /** 处理反馈 */
  processingError: string
}

export interface Versions extends Base {
  /** 剧集ID */
  dramaId: number
  /** 版本号 */
  version: string
  /** 变更说明 */
  changeNote: string
  /** 内容快照（JSON） */
  snapshot: string
}

export interface Reviews extends Base {
  /** 剧集ID */
  dramaId: number
  /** 审核结论 */
  decision: string
  /** 审核反馈 */
  note: string
  /** 审核人ID */
  reviewerId: number
}

export interface Licenses extends Base {
  /** 剧集ID */
  dramaId: number
  /** 授权方 */
  licensor: string
  /** 授权地区 */
  territories: string
  /** 起始时间 */
  startsAt: DateTime | null
  /** 到期时间 */
  expiresAt: DateTime | null
  /** 合同地址 */
  documentUrl: string
  /** 提前提醒天数 */
  remindDays: number
}

export interface Policies extends Base {
  /** 策略名称 */
  name: string
  /** 覆盖剧集ID（0为全局） */
  dramaId: number
  /** 免费集数（-1全部免费） */
  freeEpisodes: number
  /** 广告开关 */
  adsEnabled: boolean
  /** 会员覆盖 */
  memberFree: boolean
  /** 生效时间 */
  effectiveAt: DateTime | null
  /** 失效时间 */
  expiresAt: DateTime | null
}

export interface Plans extends Base {
  /** 套餐名称 */
  name: string
  /** 平台 */
  platform: string
  /** 平台商品ID */
  platformProductId: string
  /** 权益说明 */
  benefits: string
  /** 价格（最小货币单位） */
  priceMinor: MoneyMinor
  /** 币种 */
  currency: string
  /** 有效天数 */
  durationDays: number
}

export interface Subscriptions extends Base {
  /** 套餐ID */
  planId: number
  /** 会员来源 */
  platform: string
  /** 平台订阅号 */
  providerSubscriptionId: string
  /** 开始时间 */
  startsAt: DateTime | null
  /** 到期时间 */
  expiresAt: DateTime | null
  /** 同步结果 */
  syncResult: string
}

export interface Syncs extends Base {
  /** 订阅ID */
  subscriptionId: number
  /** 平台 */
  platform: string
  /** 平台查询编号 */
  providerReference: string
  /** 同步结果 */
  result: string
  /** 同步时间 */
  checkedAt: DateTime | null
}

export interface Organizations extends Base {
  /** 所属制片方账号ID */
  accountId: number
  /** 机构名称 */
  name: string
  /** 机构类型 */
  kind: string
  /** 联系人 */
  contact: string
  /** 联系邮箱 */
  email: string
  /** 登记编号 */
  registrationNumber: string
  /** 资质地址 */
  proofUrl: string
}

export interface Profiles extends Base {
  /** 系统账号ID */
  accountId: number
  /** 机构ID */
  organizationId: number
  /** 注册来源 */
  source: string
  /** 备注 */
  notes: string
}

export interface History extends Base {
  /** 单集ID */
  episodeId: number
  /** 播放位置（秒） */
  positionSeconds: number
  /** 累计观看（秒） */
  watchedSeconds: number
  /** 流量来源 */
  source: string
}

export interface Favorites extends Base {
  /** 剧集ID */
  dramaId: number
}

export interface Entitlements extends Base {
  /** 单集ID */
  episodeId: number
  /** 权益来源 */
  source: string
  /** 来源记录ID */
  reference: string
  /** 到期时间 */
  expiresAt: DateTime | null
}

export interface Feedback extends Base {
  /** 反馈类型 */
  category: string
  /** 反馈主题 */
  subject: string
  /** 反馈内容 */
  message: string
  /** 关联订单ID */
  orderId: number
  /** 客服回复 */
  reply: string
}

export interface Wallet extends Base {
  /** 金额（最小货币单位） */
  amountMinor: MoneyMinor
  /** 币种 */
  currency: string
  /** 收支方向 */
  direction: string
  /** 关联编号 */
  reference: string
  /** 说明 */
  description: string
}

export interface Orders extends Base {
  /** 订单类型 */
  kind: string
  /** 单集ID */
  episodeId: number
  /** 套餐ID */
  planId: number
  /** 币种 */
  currency: string
  /** 订单金额（最小货币单位） */
  amountMinor: MoneyMinor
  /** 支付平台 */
  provider: string
  /** 支付流水 */
  providerReference: string
  /** 履约状态 */
  fulfillment: string
  /** 问题反馈ID */
  issueId: number
}

export interface Refunds extends Base {
  /** 订单ID */
  orderId: number
  /** 退款原因 */
  reason: string
  /** 退款金额（最小货币单位） */
  amountMinor: MoneyMinor
  /** 平台退款流水 */
  providerReference: string
}

export interface Recoveries extends Base {
  /** 订单ID */
  orderId: number
  /** 平台查询编号 */
  providerReference: string
  /** 查询或恢复结果 */
  result: string
  /** 凭据地址 */
  evidenceUrl: string
}

export interface Ads extends Base {
  /** 目标单集ID */
  episodeId: number
  /** 广告平台 */
  network: string
  /** 广告位 */
  placement: string
  /** 失败分类 */
  failureCategory: string
  /** 验证回执 */
  providerReference: string
  /** 完成时间 */
  completedAt: DateTime | null
}

export interface Compensations extends Base {
  /** 补偿用户ID */
  targetUserId: number
  /** 补偿单集ID */
  episodeId: number
  /** 关联广告尝试ID */
  adId: number
  /** 补偿原因 */
  reason: string
}

export interface Bills extends Base {
  /** 账单行编号 */
  externalId: string
  /** 账单平台 */
  platform: string
  /** 剧集ID */
  dramaId: number
  /** 账期 */
  period: string
  /** 币种 */
  currency: string
  /** 总收入（最小货币单位） */
  grossMinor: MoneyMinor
  /** 费用（最小货币单位） */
  feeMinor: MoneyMinor
  /** 净收入（最小货币单位） */
  netMinor: MoneyMinor
  /** 获取来源 */
  source: string
  /** 差异金额（最小货币单位） */
  differenceMinor: MoneyMinor
  /** 差异处理说明 */
  resolution: string
}

export interface Settlements extends Base {
  /** 机构ID */
  organizationId: number
  /** 结算账期 */
  period: string
  /** 币种 */
  currency: string
  /** 结算金额（最小货币单位） */
  amountMinor: MoneyMinor
  /** 到账流水 */
  bankReference: string
  /** 到账时间 */
  receivedAt: DateTime | null
  /** 结算说明 */
  note: string
}

export interface Events extends Base {
  /** 剧集ID */
  dramaId: number
  /** 单集ID */
  episodeId: number
  /** 事件类型 */
  event: string
  /** 流量来源 */
  source: string
  /** 播放会话 */
  sessionId: string
  /** 首帧时间（毫秒） */
  startupMs: number
  /** 卡顿时间（毫秒） */
  bufferMs: number
  /** 播放错误码 */
  errorCode: string
}

export interface Approvals extends Base {
  /** 操作资源 */
  resource: string
  /** 目标记录ID */
  targetId: number
  /** 审批操作 */
  action: string
  /** 申请说明 */
  reason: string
  /** 审批人ID */
  reviewerId: number
  /** 审批意见 */
  decisionNote: string
  /** 外部流水或凭据 */
  evidence: string
}

export interface Audits extends Base {
  /** 操作资源 */
  resource: string
  /** 记录ID */
  targetId: number
  /** 操作名称 */
  action: string
  /** 变更内容 */
  detail: string
}

export interface Alerts extends Base {
  /** 异常类型 */
  category: string
  /** 严重程度 */
  severity: string
  /** 告警标题 */
  subject: string
  /** 告警内容 */
  detail: string
  /** 恢复说明 */
  recoveryNote: string
  /** 恢复时间 */
  resolvedAt: DateTime | null
}

export interface Restores extends Base {
  /** 告警ID */
  alertId: number
  /** 恢复操作 */
  operation: string
  /** 恢复结果 */
  result: string
  /** 恢复凭据 */
  evidence: string
}

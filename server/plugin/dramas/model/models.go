package model

import "time"

type Base struct {
	ID        uint      `json:"id" gorm:"primaryKey;comment:主键ID"`
	OwnerID   uint      `json:"ownerId" gorm:"index;not null;default:0;comment:内容所属账号ID"`
	UserID    uint      `json:"userId" gorm:"index;not null;default:0;comment:业务所属用户ID"`
	Status    string    `json:"status" gorm:"size:32;index;not null;default:draft;comment:业务状态"`
	CreatedAt time.Time `json:"createdAt" gorm:"comment:创建时间"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"comment:更新时间"`
}
type Dramas struct {
	Base
	Title          string     `json:"title" gorm:"comment:剧名"`
	Synopsis       string     `json:"synopsis" gorm:"comment:剧情简介"`
	CoverUrl       string     `json:"coverUrl" gorm:"comment:封面地址"`
	Genre          string     `json:"genre" gorm:"comment:题材"`
	Language       string     `json:"language" gorm:"comment:语言"`
	Region         string     `json:"region" gorm:"comment:地区"`
	TotalEpisodes  int64      `json:"totalEpisodes" gorm:"comment:计划集数;not null;default:0"`
	OrganizationId int64      `json:"organizationId" gorm:"comment:机构ID;not null;default:0;index"`
	LicenseStart   *time.Time `json:"licenseStart" gorm:"comment:授权开始"`
	LicenseEnd     *time.Time `json:"licenseEnd" gorm:"comment:授权截止"`
	CopyrightProof string     `json:"copyrightProof" gorm:"comment:版权证明地址"`
	ReviewNote     string     `json:"reviewNote" gorm:"comment:审核反馈"`
}

func (Dramas) TableName() string { return "gd_dramas" }

type Episodes struct {
	Base
	DramaId            int64  `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	Number             int64  `json:"number" gorm:"comment:集数;not null;default:0"`
	Title              string `json:"title" gorm:"comment:单集名称"`
	VideoUrl           string `json:"videoUrl" gorm:"comment:视频地址"`
	DurationSeconds    int64  `json:"durationSeconds" gorm:"comment:时长（秒）;not null;default:0"`
	PriceMinor         int64  `json:"priceMinor,string" gorm:"comment:单集价格（最小货币单位）;not null;default:0"`
	Currency           string `json:"currency" gorm:"comment:币种"`
	ProcessingProgress int64  `json:"processingProgress" gorm:"comment:处理进度（%）;not null;default:0"`
	ProcessingError    string `json:"processingError" gorm:"comment:处理反馈"`
}

func (Episodes) TableName() string { return "gd_episodes" }

type Versions struct {
	Base
	DramaId    int64  `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	Version    string `json:"version" gorm:"comment:版本号"`
	ChangeNote string `json:"changeNote" gorm:"comment:变更说明"`
	Snapshot   string `json:"snapshot" gorm:"comment:内容快照（JSON）"`
}

func (Versions) TableName() string { return "gd_versions" }

type Reviews struct {
	Base
	DramaId    int64  `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	Decision   string `json:"decision" gorm:"comment:审核结论"`
	Note       string `json:"note" gorm:"comment:审核反馈"`
	ReviewerId int64  `json:"reviewerId" gorm:"comment:审核人ID;not null;default:0;index"`
}

func (Reviews) TableName() string { return "gd_reviews" }

type Licenses struct {
	Base
	DramaId     int64      `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	Licensor    string     `json:"licensor" gorm:"comment:授权方"`
	Territories string     `json:"territories" gorm:"comment:授权地区"`
	StartsAt    *time.Time `json:"startsAt" gorm:"comment:起始时间"`
	ExpiresAt   *time.Time `json:"expiresAt" gorm:"comment:到期时间"`
	DocumentUrl string     `json:"documentUrl" gorm:"comment:合同地址"`
	RemindDays  int64      `json:"remindDays" gorm:"comment:提前提醒天数;not null;default:0"`
}

func (Licenses) TableName() string { return "gd_licenses" }

type Policies struct {
	Base
	Name         string     `json:"name" gorm:"comment:策略名称"`
	DramaId      int64      `json:"dramaId" gorm:"comment:覆盖剧集ID（0为全局）;not null;default:0;index"`
	FreeEpisodes int64      `json:"freeEpisodes" gorm:"comment:免费集数（-1全部免费）;not null;default:0"`
	AdsEnabled   bool       `json:"adsEnabled" gorm:"comment:广告开关;not null;default:false"`
	MemberFree   bool       `json:"memberFree" gorm:"comment:会员覆盖;not null;default:false"`
	EffectiveAt  *time.Time `json:"effectiveAt" gorm:"comment:生效时间"`
	ExpiresAt    *time.Time `json:"expiresAt" gorm:"comment:失效时间"`
}

func (Policies) TableName() string { return "gd_policies" }

type Plans struct {
	Base
	Name              string `json:"name" gorm:"comment:套餐名称"`
	Platform          string `json:"platform" gorm:"comment:平台"`
	PlatformProductId string `json:"platformProductId" gorm:"comment:平台商品ID;index"`
	Benefits          string `json:"benefits" gorm:"comment:权益说明"`
	PriceMinor        int64  `json:"priceMinor,string" gorm:"comment:价格（最小货币单位）;not null;default:0"`
	Currency          string `json:"currency" gorm:"comment:币种"`
	DurationDays      int64  `json:"durationDays" gorm:"comment:有效天数;not null;default:0"`
}

func (Plans) TableName() string { return "gd_plans" }

type Subscriptions struct {
	Base
	PlanId                 int64      `json:"planId" gorm:"comment:套餐ID;not null;default:0;index"`
	Platform               string     `json:"platform" gorm:"comment:会员来源"`
	ProviderSubscriptionId string     `json:"providerSubscriptionId" gorm:"comment:平台订阅号;index"`
	StartsAt               *time.Time `json:"startsAt" gorm:"comment:开始时间"`
	ExpiresAt              *time.Time `json:"expiresAt" gorm:"comment:到期时间"`
	SyncResult             string     `json:"syncResult" gorm:"comment:同步结果"`
}

func (Subscriptions) TableName() string { return "gd_subscriptions" }

type Syncs struct {
	Base
	SubscriptionId    int64      `json:"subscriptionId" gorm:"comment:订阅ID;not null;default:0;index"`
	Platform          string     `json:"platform" gorm:"comment:平台"`
	ProviderReference string     `json:"providerReference" gorm:"comment:平台查询编号"`
	Result            string     `json:"result" gorm:"comment:同步结果"`
	CheckedAt         *time.Time `json:"checkedAt" gorm:"comment:同步时间"`
}

func (Syncs) TableName() string { return "gd_syncs" }

type Organizations struct {
	Base
	AccountId          int64  `json:"accountId" gorm:"comment:所属制片方账号ID;not null;default:0;index"`
	Name               string `json:"name" gorm:"comment:机构名称"`
	Kind               string `json:"kind" gorm:"comment:机构类型"`
	Contact            string `json:"contact" gorm:"comment:联系人"`
	Email              string `json:"email" gorm:"comment:联系邮箱"`
	RegistrationNumber string `json:"registrationNumber" gorm:"comment:登记编号"`
	ProofUrl           string `json:"proofUrl" gorm:"comment:资质地址"`
}

func (Organizations) TableName() string { return "gd_organizations" }

type Profiles struct {
	Base
	AccountId      int64  `json:"accountId" gorm:"comment:系统账号ID;not null;default:0;index"`
	OrganizationId int64  `json:"organizationId" gorm:"comment:机构ID;not null;default:0;index"`
	Source         string `json:"source" gorm:"comment:注册来源"`
	Notes          string `json:"notes" gorm:"comment:备注"`
}

func (Profiles) TableName() string { return "gd_profiles" }

type History struct {
	Base
	EpisodeId       int64  `json:"episodeId" gorm:"comment:单集ID;not null;default:0;index"`
	PositionSeconds int64  `json:"positionSeconds" gorm:"comment:播放位置（秒）;not null;default:0"`
	WatchedSeconds  int64  `json:"watchedSeconds" gorm:"comment:累计观看（秒）;not null;default:0"`
	Source          string `json:"source" gorm:"comment:流量来源"`
}

func (History) TableName() string { return "gd_history" }

type Favorites struct {
	Base
	DramaId int64 `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
}

func (Favorites) TableName() string { return "gd_favorites" }

type Entitlements struct {
	Base
	EpisodeId int64      `json:"episodeId" gorm:"comment:单集ID;not null;default:0;index"`
	Source    string     `json:"source" gorm:"comment:权益来源"`
	Reference string     `json:"reference" gorm:"comment:来源记录ID"`
	ExpiresAt *time.Time `json:"expiresAt" gorm:"comment:到期时间"`
}

func (Entitlements) TableName() string { return "gd_entitlements" }

type Feedback struct {
	Base
	Category string `json:"category" gorm:"comment:反馈类型"`
	Subject  string `json:"subject" gorm:"comment:反馈主题"`
	Message  string `json:"message" gorm:"comment:反馈内容"`
	OrderId  int64  `json:"orderId" gorm:"comment:关联订单ID;not null;default:0;index"`
	Reply    string `json:"reply" gorm:"comment:客服回复"`
}

func (Feedback) TableName() string { return "gd_feedback" }

type Wallet struct {
	Base
	AmountMinor int64  `json:"amountMinor,string" gorm:"comment:金额（最小货币单位）;not null;default:0"`
	Currency    string `json:"currency" gorm:"comment:币种"`
	Direction   string `json:"direction" gorm:"comment:收支方向"`
	Reference   string `json:"reference" gorm:"comment:关联编号"`
	Description string `json:"description" gorm:"comment:说明"`
}

func (Wallet) TableName() string { return "gd_wallet" }

type Orders struct {
	Base
	Kind              string `json:"kind" gorm:"comment:订单类型"`
	EpisodeId         int64  `json:"episodeId" gorm:"comment:单集ID;not null;default:0;index"`
	PlanId            int64  `json:"planId" gorm:"comment:套餐ID;not null;default:0;index"`
	Currency          string `json:"currency" gorm:"comment:币种"`
	AmountMinor       int64  `json:"amountMinor,string" gorm:"comment:订单金额（最小货币单位）;not null;default:0"`
	Provider          string `json:"provider" gorm:"comment:支付平台"`
	ProviderReference string `json:"providerReference" gorm:"comment:支付流水"`
	Fulfillment       string `json:"fulfillment" gorm:"comment:履约状态"`
	IssueId           int64  `json:"issueId" gorm:"comment:问题反馈ID;not null;default:0;index"`
}

func (Orders) TableName() string { return "gd_orders" }

type Refunds struct {
	Base
	OrderId           int64  `json:"orderId" gorm:"comment:订单ID;not null;default:0;index"`
	Reason            string `json:"reason" gorm:"comment:退款原因"`
	AmountMinor       int64  `json:"amountMinor,string" gorm:"comment:退款金额（最小货币单位）;not null;default:0"`
	ProviderReference string `json:"providerReference" gorm:"comment:平台退款流水"`
}

func (Refunds) TableName() string { return "gd_refunds" }

type Recoveries struct {
	Base
	OrderId           int64  `json:"orderId" gorm:"comment:订单ID;not null;default:0;index"`
	ProviderReference string `json:"providerReference" gorm:"comment:平台查询编号"`
	Result            string `json:"result" gorm:"comment:查询或恢复结果"`
	EvidenceUrl       string `json:"evidenceUrl" gorm:"comment:凭据地址"`
}

func (Recoveries) TableName() string { return "gd_recoveries" }

type Ads struct {
	Base
	EpisodeId         int64      `json:"episodeId" gorm:"comment:目标单集ID;not null;default:0;index"`
	Network           string     `json:"network" gorm:"comment:广告平台"`
	Placement         string     `json:"placement" gorm:"comment:广告位"`
	FailureCategory   string     `json:"failureCategory" gorm:"comment:失败分类"`
	ProviderReference string     `json:"providerReference" gorm:"comment:验证回执"`
	CompletedAt       *time.Time `json:"completedAt" gorm:"comment:完成时间"`
}

func (Ads) TableName() string { return "gd_ads" }

type Compensations struct {
	Base
	TargetUserId int64  `json:"targetUserId" gorm:"comment:补偿用户ID;not null;default:0;index"`
	EpisodeId    int64  `json:"episodeId" gorm:"comment:补偿单集ID;not null;default:0;index"`
	AdId         int64  `json:"adId" gorm:"comment:关联广告尝试ID;not null;default:0;index"`
	Reason       string `json:"reason" gorm:"comment:补偿原因"`
}

func (Compensations) TableName() string { return "gd_compensations" }

type Bills struct {
	Base
	ExternalId      string `json:"externalId" gorm:"comment:账单行编号;index"`
	Platform        string `json:"platform" gorm:"comment:账单平台"`
	DramaId         int64  `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	Period          string `json:"period" gorm:"comment:账期"`
	Currency        string `json:"currency" gorm:"comment:币种"`
	GrossMinor      int64  `json:"grossMinor,string" gorm:"comment:总收入（最小货币单位）;not null;default:0"`
	FeeMinor        int64  `json:"feeMinor,string" gorm:"comment:费用（最小货币单位）;not null;default:0"`
	NetMinor        int64  `json:"netMinor,string" gorm:"comment:净收入（最小货币单位）;not null;default:0"`
	Source          string `json:"source" gorm:"comment:获取来源"`
	DifferenceMinor int64  `json:"differenceMinor,string" gorm:"comment:差异金额（最小货币单位）;not null;default:0"`
	Resolution      string `json:"resolution" gorm:"comment:差异处理说明"`
}

func (Bills) TableName() string { return "gd_bills" }

type Settlements struct {
	Base
	OrganizationId int64      `json:"organizationId" gorm:"comment:机构ID;not null;default:0;index"`
	Period         string     `json:"period" gorm:"comment:结算账期"`
	Currency       string     `json:"currency" gorm:"comment:币种"`
	AmountMinor    int64      `json:"amountMinor,string" gorm:"comment:结算金额（最小货币单位）;not null;default:0"`
	BankReference  string     `json:"bankReference" gorm:"comment:到账流水"`
	ReceivedAt     *time.Time `json:"receivedAt" gorm:"comment:到账时间"`
	Note           string     `json:"note" gorm:"comment:结算说明"`
}

func (Settlements) TableName() string { return "gd_settlements" }

type Events struct {
	Base
	DramaId   int64  `json:"dramaId" gorm:"comment:剧集ID;not null;default:0;index"`
	EpisodeId int64  `json:"episodeId" gorm:"comment:单集ID;not null;default:0;index"`
	Event     string `json:"event" gorm:"comment:事件类型"`
	Source    string `json:"source" gorm:"comment:流量来源"`
	SessionId string `json:"sessionId" gorm:"comment:播放会话;index"`
	StartupMs int64  `json:"startupMs" gorm:"comment:首帧时间（毫秒）;not null;default:0"`
	BufferMs  int64  `json:"bufferMs" gorm:"comment:卡顿时间（毫秒）;not null;default:0"`
	ErrorCode string `json:"errorCode" gorm:"comment:播放错误码"`
}

func (Events) TableName() string { return "gd_events" }

type Approvals struct {
	Base
	Resource     string `json:"resource" gorm:"comment:操作资源"`
	TargetId     int64  `json:"targetId" gorm:"comment:目标记录ID;not null;default:0;index"`
	Action       string `json:"action" gorm:"comment:审批操作"`
	Reason       string `json:"reason" gorm:"comment:申请说明"`
	ReviewerId   int64  `json:"reviewerId" gorm:"comment:审批人ID;not null;default:0;index"`
	DecisionNote string `json:"decisionNote" gorm:"comment:审批意见"`
	Evidence     string `json:"evidence" gorm:"comment:外部流水或凭据"`
}

func (Approvals) TableName() string { return "gd_approvals" }

type Audits struct {
	Base
	Resource string `json:"resource" gorm:"comment:操作资源"`
	TargetId int64  `json:"targetId" gorm:"comment:记录ID;not null;default:0;index"`
	Action   string `json:"action" gorm:"comment:操作名称"`
	Detail   string `json:"detail" gorm:"comment:变更内容"`
}

func (Audits) TableName() string { return "gd_audits" }

type Alerts struct {
	Base
	Category     string     `json:"category" gorm:"comment:异常类型"`
	Severity     string     `json:"severity" gorm:"comment:严重程度"`
	Subject      string     `json:"subject" gorm:"comment:告警标题"`
	Detail       string     `json:"detail" gorm:"comment:告警内容"`
	RecoveryNote string     `json:"recoveryNote" gorm:"comment:恢复说明"`
	ResolvedAt   *time.Time `json:"resolvedAt" gorm:"comment:恢复时间"`
}

func (Alerts) TableName() string { return "gd_alerts" }

type Restores struct {
	Base
	AlertId   int64  `json:"alertId" gorm:"comment:告警ID;not null;default:0;index"`
	Operation string `json:"operation" gorm:"comment:恢复操作"`
	Result    string `json:"result" gorm:"comment:恢复结果"`
	Evidence  string `json:"evidence" gorm:"comment:恢复凭据"`
}

func (Restores) TableName() string { return "gd_restores" }

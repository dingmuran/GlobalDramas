package model

type Field struct {
	Key      string   `json:"key"`
	Column   string   `json:"-"`
	Label    string   `json:"label"`
	Type     string   `json:"type"`
	Required bool     `json:"required"`
	Options  []string `json:"options"`
	Ref      string   `json:"ref"`
}
type Resource struct {
	Key    string     `json:"key"`
	Title  string     `json:"title"`
	Read   []uint     `json:"-"`
	Write  []uint     `json:"-"`
	Scope  string     `json:"-"`
	Fields []Field    `json:"fields"`
	New    func() any `json:"-"`
	List   func() any `json:"-"`
}

var Resources = map[string]Resource{
	"dramas": {Key: "dramas", Title: "剧集", Read: []uint{888, 300, 200}, Write: []uint{888, 300}, Scope: "owner", New: func() any { return &Dramas{} }, List: func() any { return &[]Dramas{} }, Fields: []Field{
		{Key: "title", Column: "title", Label: "剧名", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "synopsis", Column: "synopsis", Label: "剧情简介", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "coverUrl", Column: "cover_url", Label: "封面地址", Type: "url", Required: false, Options: []string{}, Ref: ""},
		{Key: "genre", Column: "genre", Label: "题材", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "language", Column: "language", Label: "语言", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "region", Column: "region", Label: "地区", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "totalEpisodes", Column: "total_episodes", Label: "计划集数", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "organizationId", Column: "organization_id", Label: "机构ID", Type: "number", Required: false, Options: []string{}, Ref: "organizations"},
		{Key: "licenseStart", Column: "license_start", Label: "授权开始", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
		{Key: "licenseEnd", Column: "license_end", Label: "授权截止", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
		{Key: "copyrightProof", Column: "copyright_proof", Label: "版权证明地址", Type: "url", Required: false, Options: []string{}, Ref: ""},
		{Key: "reviewNote", Column: "review_note", Label: "审核反馈", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
	}},
	"episodes": {Key: "episodes", Title: "单集", Read: []uint{888, 300, 200}, Write: []uint{888, 300}, Scope: "owner", New: func() any { return &Episodes{} }, List: func() any { return &[]Episodes{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: true, Options: []string{}, Ref: "dramas"},
		{Key: "number", Column: "number", Label: "集数", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "title", Column: "title", Label: "单集名称", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "videoUrl", Column: "video_url", Label: "视频地址", Type: "url", Required: false, Options: []string{}, Ref: ""},
		{Key: "durationSeconds", Column: "duration_seconds", Label: "时长（秒）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "priceMinor", Column: "price_minor", Label: "单集价格（最小货币单位）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "currency", Column: "currency", Label: "币种", Type: "select", Required: true, Options: []string{"CNY", "USD", "EUR", "JPY", "GBP"}, Ref: ""},
		{Key: "processingProgress", Column: "processing_progress", Label: "处理进度（%）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "processingError", Column: "processing_error", Label: "处理反馈", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"versions": {Key: "versions", Title: "内容版本", Read: []uint{888, 300}, Write: []uint{888, 300}, Scope: "owner", New: func() any { return &Versions{} }, List: func() any { return &[]Versions{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: true, Options: []string{}, Ref: "dramas"},
		{Key: "version", Column: "version", Label: "版本号", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "changeNote", Column: "change_note", Label: "变更说明", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "snapshot", Column: "snapshot", Label: "内容快照（JSON）", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
	}},
	"reviews": {Key: "reviews", Title: "审核记录", Read: []uint{888, 300}, Write: []uint{}, Scope: "owner", New: func() any { return &Reviews{} }, List: func() any { return &[]Reviews{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: true, Options: []string{}, Ref: "dramas"},
		{Key: "decision", Column: "decision", Label: "审核结论", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "note", Column: "note", Label: "审核反馈", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "reviewerId", Column: "reviewer_id", Label: "审核人ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
	}},
	"licenses": {Key: "licenses", Title: "授权合同", Read: []uint{888, 300}, Write: []uint{888, 300}, Scope: "owner", New: func() any { return &Licenses{} }, List: func() any { return &[]Licenses{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: true, Options: []string{}, Ref: "dramas"},
		{Key: "licensor", Column: "licensor", Label: "授权方", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "territories", Column: "territories", Label: "授权地区", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "startsAt", Column: "starts_at", Label: "起始时间", Type: "datetime", Required: true, Options: []string{}, Ref: ""},
		{Key: "expiresAt", Column: "expires_at", Label: "到期时间", Type: "datetime", Required: true, Options: []string{}, Ref: ""},
		{Key: "documentUrl", Column: "document_url", Label: "合同地址", Type: "url", Required: true, Options: []string{}, Ref: ""},
		{Key: "remindDays", Column: "remind_days", Label: "提前提醒天数", Type: "number", Required: false, Options: []string{}, Ref: ""},
	}},
	"policies": {Key: "policies", Title: "访问策略", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Policies{} }, List: func() any { return &[]Policies{} }, Fields: []Field{
		{Key: "name", Column: "name", Label: "策略名称", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "dramaId", Column: "drama_id", Label: "覆盖剧集ID（0为全局）", Type: "number", Required: false, Options: []string{}, Ref: "dramas"},
		{Key: "freeEpisodes", Column: "free_episodes", Label: "免费集数（-1全部免费）", Type: "integer", Required: true, Options: []string{}, Ref: ""},
		{Key: "adsEnabled", Column: "ads_enabled", Label: "广告开关", Type: "boolean", Required: false, Options: []string{}, Ref: ""},
		{Key: "memberFree", Column: "member_free", Label: "会员覆盖", Type: "boolean", Required: false, Options: []string{}, Ref: ""},
		{Key: "effectiveAt", Column: "effective_at", Label: "生效时间", Type: "datetime", Required: true, Options: []string{}, Ref: ""},
		{Key: "expiresAt", Column: "expires_at", Label: "失效时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
	}},
	"plans": {Key: "plans", Title: "会员套餐", Read: []uint{888, 300, 200}, Write: []uint{888}, Scope: "all", New: func() any { return &Plans{} }, List: func() any { return &[]Plans{} }, Fields: []Field{
		{Key: "name", Column: "name", Label: "套餐名称", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "platform", Column: "platform", Label: "平台", Type: "select", Required: true, Options: []string{"apple", "google", "web"}, Ref: ""},
		{Key: "platformProductId", Column: "platform_product_id", Label: "平台商品ID", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "benefits", Column: "benefits", Label: "权益说明", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "priceMinor", Column: "price_minor", Label: "价格（最小货币单位）", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "currency", Column: "currency", Label: "币种", Type: "select", Required: true, Options: []string{"CNY", "USD", "EUR", "JPY", "GBP"}, Ref: ""},
		{Key: "durationDays", Column: "duration_days", Label: "有效天数", Type: "number", Required: true, Options: []string{}, Ref: ""},
	}},
	"subscriptions": {Key: "subscriptions", Title: "会员订阅", Read: []uint{888, 300, 200}, Write: []uint{}, Scope: "user", New: func() any { return &Subscriptions{} }, List: func() any { return &[]Subscriptions{} }, Fields: []Field{
		{Key: "planId", Column: "plan_id", Label: "套餐ID", Type: "number", Required: true, Options: []string{}, Ref: "plans"},
		{Key: "platform", Column: "platform", Label: "会员来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "providerSubscriptionId", Column: "provider_subscription_id", Label: "平台订阅号", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "startsAt", Column: "starts_at", Label: "开始时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
		{Key: "expiresAt", Column: "expires_at", Label: "到期时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
		{Key: "syncResult", Column: "sync_result", Label: "同步结果", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"syncs": {Key: "syncs", Title: "平台同步记录", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Syncs{} }, List: func() any { return &[]Syncs{} }, Fields: []Field{
		{Key: "subscriptionId", Column: "subscription_id", Label: "订阅ID", Type: "number", Required: true, Options: []string{}, Ref: "subscriptions"},
		{Key: "platform", Column: "platform", Label: "平台", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "providerReference", Column: "provider_reference", Label: "平台查询编号", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "result", Column: "result", Label: "同步结果", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "checkedAt", Column: "checked_at", Label: "同步时间", Type: "datetime", Required: true, Options: []string{}, Ref: ""},
	}},
	"organizations": {Key: "organizations", Title: "版权方与制片机构", Read: []uint{888, 300}, Write: []uint{888}, Scope: "owner", New: func() any { return &Organizations{} }, List: func() any { return &[]Organizations{} }, Fields: []Field{
		{Key: "accountId", Column: "account_id", Label: "所属制片方账号ID", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "name", Column: "name", Label: "机构名称", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "kind", Column: "kind", Label: "机构类型", Type: "select", Required: true, Options: []string{"copyright", "producer", "both"}, Ref: ""},
		{Key: "contact", Column: "contact", Label: "联系人", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "email", Column: "email", Label: "联系邮箱", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "registrationNumber", Column: "registration_number", Label: "登记编号", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "proofUrl", Column: "proof_url", Label: "资质地址", Type: "url", Required: false, Options: []string{}, Ref: ""},
	}},
	"profiles": {Key: "profiles", Title: "用户业务档案", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Profiles{} }, List: func() any { return &[]Profiles{} }, Fields: []Field{
		{Key: "accountId", Column: "account_id", Label: "系统账号ID", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "organizationId", Column: "organization_id", Label: "机构ID", Type: "number", Required: false, Options: []string{}, Ref: "organizations"},
		{Key: "source", Column: "source", Label: "注册来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "notes", Column: "notes", Label: "备注", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"history": {Key: "history", Title: "观看历史", Read: []uint{888, 200}, Write: []uint{200}, Scope: "user", New: func() any { return &History{} }, List: func() any { return &[]History{} }, Fields: []Field{
		{Key: "episodeId", Column: "episode_id", Label: "单集ID", Type: "number", Required: true, Options: []string{}, Ref: "episodes"},
		{Key: "positionSeconds", Column: "position_seconds", Label: "播放位置（秒）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "watchedSeconds", Column: "watched_seconds", Label: "累计观看（秒）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "source", Column: "source", Label: "流量来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
	}},
	"favorites": {Key: "favorites", Title: "用户收藏", Read: []uint{888, 200}, Write: []uint{200}, Scope: "user", New: func() any { return &Favorites{} }, List: func() any { return &[]Favorites{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: true, Options: []string{}, Ref: "dramas"},
	}},
	"entitlements": {Key: "entitlements", Title: "单集权益", Read: []uint{888, 200}, Write: []uint{}, Scope: "user", New: func() any { return &Entitlements{} }, List: func() any { return &[]Entitlements{} }, Fields: []Field{
		{Key: "episodeId", Column: "episode_id", Label: "单集ID", Type: "number", Required: true, Options: []string{}, Ref: "episodes"},
		{Key: "source", Column: "source", Label: "权益来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "reference", Column: "reference", Label: "来源记录ID", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "expiresAt", Column: "expires_at", Label: "到期时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
	}},
	"feedback": {Key: "feedback", Title: "用户反馈", Read: []uint{888, 300, 200}, Write: []uint{888, 200}, Scope: "user", New: func() any { return &Feedback{} }, List: func() any { return &[]Feedback{} }, Fields: []Field{
		{Key: "category", Column: "category", Label: "反馈类型", Type: "select", Required: true, Options: []string{"content", "payment", "playback", "ad", "other"}, Ref: ""},
		{Key: "subject", Column: "subject", Label: "反馈主题", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "message", Column: "message", Label: "反馈内容", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "orderId", Column: "order_id", Label: "关联订单ID", Type: "number", Required: false, Options: []string{}, Ref: "orders"},
		{Key: "reply", Column: "reply", Label: "客服回复", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"wallet": {Key: "wallet", Title: "钱包流水", Read: []uint{888, 200}, Write: []uint{}, Scope: "user", New: func() any { return &Wallet{} }, List: func() any { return &[]Wallet{} }, Fields: []Field{
		{Key: "amountMinor", Column: "amount_minor", Label: "金额（最小货币单位）", Type: "integer", Required: false, Options: []string{}, Ref: ""},
		{Key: "currency", Column: "currency", Label: "币种", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "direction", Column: "direction", Label: "收支方向", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "reference", Column: "reference", Label: "关联编号", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "description", Column: "description", Label: "说明", Type: "text", Required: false, Options: []string{}, Ref: ""},
	}},
	"orders": {Key: "orders", Title: "订单", Read: []uint{888, 300, 200}, Write: []uint{200}, Scope: "user", New: func() any { return &Orders{} }, List: func() any { return &[]Orders{} }, Fields: []Field{
		{Key: "kind", Column: "kind", Label: "订单类型", Type: "select", Required: true, Options: []string{"episode", "membership", "renewal"}, Ref: ""},
		{Key: "episodeId", Column: "episode_id", Label: "单集ID", Type: "number", Required: false, Options: []string{}, Ref: "episodes"},
		{Key: "planId", Column: "plan_id", Label: "套餐ID", Type: "number", Required: false, Options: []string{}, Ref: "plans"},
		{Key: "currency", Column: "currency", Label: "币种", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "amountMinor", Column: "amount_minor", Label: "订单金额（最小货币单位）", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "provider", Column: "provider", Label: "支付平台", Type: "select", Required: true, Options: []string{"apple", "google", "web"}, Ref: ""},
		{Key: "providerReference", Column: "provider_reference", Label: "支付流水", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "fulfillment", Column: "fulfillment", Label: "履约状态", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "issueId", Column: "issue_id", Label: "问题反馈ID", Type: "number", Required: false, Options: []string{}, Ref: "feedback"},
	}},
	"refunds": {Key: "refunds", Title: "退款请求", Read: []uint{888, 200}, Write: []uint{888, 200}, Scope: "user", New: func() any { return &Refunds{} }, List: func() any { return &[]Refunds{} }, Fields: []Field{
		{Key: "orderId", Column: "order_id", Label: "订单ID", Type: "number", Required: true, Options: []string{}, Ref: "orders"},
		{Key: "reason", Column: "reason", Label: "退款原因", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "amountMinor", Column: "amount_minor", Label: "退款金额（最小货币单位）", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "providerReference", Column: "provider_reference", Label: "平台退款流水", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
	}},
	"recoveries": {Key: "recoveries", Title: "查询与恢复记录", Read: []uint{888, 300, 200}, Write: []uint{888}, Scope: "user", New: func() any { return &Recoveries{} }, List: func() any { return &[]Recoveries{} }, Fields: []Field{
		{Key: "orderId", Column: "order_id", Label: "订单ID", Type: "number", Required: true, Options: []string{}, Ref: "orders"},
		{Key: "providerReference", Column: "provider_reference", Label: "平台查询编号", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "result", Column: "result", Label: "查询或恢复结果", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "evidenceUrl", Column: "evidence_url", Label: "凭据地址", Type: "url", Required: false, Options: []string{}, Ref: ""},
	}},
	"ads": {Key: "ads", Title: "广告尝试", Read: []uint{888, 200}, Write: []uint{200}, Scope: "user", New: func() any { return &Ads{} }, List: func() any { return &[]Ads{} }, Fields: []Field{
		{Key: "episodeId", Column: "episode_id", Label: "目标单集ID", Type: "number", Required: true, Options: []string{}, Ref: "episodes"},
		{Key: "network", Column: "network", Label: "广告平台", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "placement", Column: "placement", Label: "广告位", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "failureCategory", Column: "failure_category", Label: "失败分类", Type: "select", Required: false, Options: []string{"no_fill", "timeout", "network", "cancelled", "provider_error"}, Ref: ""},
		{Key: "providerReference", Column: "provider_reference", Label: "验证回执", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "completedAt", Column: "completed_at", Label: "完成时间", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
	}},
	"compensations": {Key: "compensations", Title: "客服补偿", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Compensations{} }, List: func() any { return &[]Compensations{} }, Fields: []Field{
		{Key: "targetUserId", Column: "target_user_id", Label: "补偿用户ID", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "episodeId", Column: "episode_id", Label: "补偿单集ID", Type: "number", Required: true, Options: []string{}, Ref: "episodes"},
		{Key: "adId", Column: "ad_id", Label: "关联广告尝试ID", Type: "number", Required: false, Options: []string{}, Ref: "ads"},
		{Key: "reason", Column: "reason", Label: "补偿原因", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
	}},
	"bills": {Key: "bills", Title: "财务账单", Read: []uint{888, 300}, Write: []uint{888}, Scope: "owner", New: func() any { return &Bills{} }, List: func() any { return &[]Bills{} }, Fields: []Field{
		{Key: "externalId", Column: "external_id", Label: "账单行编号", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "platform", Column: "platform", Label: "账单平台", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: false, Options: []string{}, Ref: "dramas"},
		{Key: "period", Column: "period", Label: "账期", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "currency", Column: "currency", Label: "币种", Type: "select", Required: true, Options: []string{"CNY", "USD", "EUR", "JPY", "GBP"}, Ref: ""},
		{Key: "grossMinor", Column: "gross_minor", Label: "总收入（最小货币单位）", Type: "integer", Required: true, Options: []string{}, Ref: ""},
		{Key: "feeMinor", Column: "fee_minor", Label: "费用（最小货币单位）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "netMinor", Column: "net_minor", Label: "净收入（最小货币单位）", Type: "readonly", Required: false, Options: []string{}, Ref: ""},
		{Key: "source", Column: "source", Label: "获取来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "differenceMinor", Column: "difference_minor", Label: "差异金额（最小货币单位）", Type: "integer", Required: false, Options: []string{}, Ref: ""},
		{Key: "resolution", Column: "resolution", Label: "差异处理说明", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"settlements": {Key: "settlements", Title: "结算记录", Read: []uint{888, 300}, Write: []uint{888}, Scope: "owner", New: func() any { return &Settlements{} }, List: func() any { return &[]Settlements{} }, Fields: []Field{
		{Key: "organizationId", Column: "organization_id", Label: "机构ID", Type: "number", Required: true, Options: []string{}, Ref: "organizations"},
		{Key: "period", Column: "period", Label: "结算账期", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "currency", Column: "currency", Label: "币种", Type: "select", Required: true, Options: []string{"CNY", "USD", "EUR", "JPY", "GBP"}, Ref: ""},
		{Key: "amountMinor", Column: "amount_minor", Label: "结算金额（最小货币单位）", Type: "number", Required: true, Options: []string{}, Ref: ""},
		{Key: "bankReference", Column: "bank_reference", Label: "到账流水", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "receivedAt", Column: "received_at", Label: "到账时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
		{Key: "note", Column: "note", Label: "结算说明", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"events": {Key: "events", Title: "行为与播放质量", Read: []uint{888, 300}, Write: []uint{}, Scope: "owner", New: func() any { return &Events{} }, List: func() any { return &[]Events{} }, Fields: []Field{
		{Key: "dramaId", Column: "drama_id", Label: "剧集ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "episodeId", Column: "episode_id", Label: "单集ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "event", Column: "event", Label: "事件类型", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "source", Column: "source", Label: "流量来源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "sessionId", Column: "session_id", Label: "播放会话", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "startupMs", Column: "startup_ms", Label: "首帧时间（毫秒）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "bufferMs", Column: "buffer_ms", Label: "卡顿时间（毫秒）", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "errorCode", Column: "error_code", Label: "播放错误码", Type: "text", Required: false, Options: []string{}, Ref: ""},
	}},
	"approvals": {Key: "approvals", Title: "敏感操作审批", Read: []uint{888}, Write: []uint{}, Scope: "all", New: func() any { return &Approvals{} }, List: func() any { return &[]Approvals{} }, Fields: []Field{
		{Key: "resource", Column: "resource", Label: "操作资源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "targetId", Column: "target_id", Label: "目标记录ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "action", Column: "action", Label: "审批操作", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "reason", Column: "reason", Label: "申请说明", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "reviewerId", Column: "reviewer_id", Label: "审批人ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "decisionNote", Column: "decision_note", Label: "审批意见", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "evidence", Column: "evidence", Label: "外部流水或凭据", Type: "text", Required: false, Options: []string{}, Ref: ""},
	}},
	"audits": {Key: "audits", Title: "操作审计", Read: []uint{888}, Write: []uint{}, Scope: "all", New: func() any { return &Audits{} }, List: func() any { return &[]Audits{} }, Fields: []Field{
		{Key: "resource", Column: "resource", Label: "操作资源", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "targetId", Column: "target_id", Label: "记录ID", Type: "number", Required: false, Options: []string{}, Ref: ""},
		{Key: "action", Column: "action", Label: "操作名称", Type: "text", Required: false, Options: []string{}, Ref: ""},
		{Key: "detail", Column: "detail", Label: "变更内容", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
	}},
	"alerts": {Key: "alerts", Title: "异常告警", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Alerts{} }, List: func() any { return &[]Alerts{} }, Fields: []Field{
		{Key: "category", Column: "category", Label: "异常类型", Type: "select", Required: true, Options: []string{"content", "payment", "finance", "playback", "security", "license"}, Ref: ""},
		{Key: "severity", Column: "severity", Label: "严重程度", Type: "select", Required: true, Options: []string{"info", "warning", "critical"}, Ref: ""},
		{Key: "subject", Column: "subject", Label: "告警标题", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "detail", Column: "detail", Label: "告警内容", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "recoveryNote", Column: "recovery_note", Label: "恢复说明", Type: "textarea", Required: false, Options: []string{}, Ref: ""},
		{Key: "resolvedAt", Column: "resolved_at", Label: "恢复时间", Type: "datetime", Required: false, Options: []string{}, Ref: ""},
	}},
	"restores": {Key: "restores", Title: "异常恢复记录", Read: []uint{888}, Write: []uint{888}, Scope: "all", New: func() any { return &Restores{} }, List: func() any { return &[]Restores{} }, Fields: []Field{
		{Key: "alertId", Column: "alert_id", Label: "告警ID", Type: "number", Required: true, Options: []string{}, Ref: "alerts"},
		{Key: "operation", Column: "operation", Label: "恢复操作", Type: "text", Required: true, Options: []string{}, Ref: ""},
		{Key: "result", Column: "result", Label: "恢复结果", Type: "textarea", Required: true, Options: []string{}, Ref: ""},
		{Key: "evidence", Column: "evidence", Label: "恢复凭据", Type: "text", Required: false, Options: []string{}, Ref: ""},
	}},
}

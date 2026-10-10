# TikTok 审核与付款 Demo 规划

- 日期：2026-10-09。
- 用户要求：前台先做用于 TikTok 审核和付款的 Demo，先调研规则与 PayPal 是否需要接入，本阶段只分析。
- 已确认：TikTok 内 Mini Drama；当前目的是资格申请 Demo，尚非正式版本上线；公司注册在香港。
- 待确认：目标发布地区；是否已有其他平台上线代表作；开发者平台是否已开通 Mini Dramas、IAP 与媒资能力。
- 官方资料结论：Mini Drama 的一次性购买使用 TikTok Beans，订阅使用平台订阅接口；不能据此断言平台所有地区禁止外部付款，但没有发现 PayPal 可以替代该原生流程的依据。
- 开发者结算与用户支付区分：TikTok 收益结算文档要求企业、税务和传统银行账户信息，并非前台接入 PayPal Checkout。
- 播放方案修正：独立网站可评估原生 video/hls.js，TikTok 内须用官方 VePlayer，内容经媒资审核并上架；两种运行环境分别适配。
- 审核涉及企业认证、行业资质、基础资料和版本审核；支持英文、条款与隐私政策URL、可信HTTPS域名、测试用户、真机预览及内容授权资料。
- 推荐首版：少量有授权的真实短剧、发现/详情/播放与选集、独立观众登录、一个付款渠道、订单与权益查询、条款隐私和反馈。先打通单次购买，自动续订与广告按实际开通能力和审核要求再决定，不把自定范围当官方最低门槛。
- 可做界面预览和清晰标记的开发模拟，但模拟付款成功不能替代平台支付联调或正式提审。
- 服务端负责价格、创建平台订单、回调验签、幂等发放权益与订单查询；平台密钥只保存在后端。
- 本次未改业务代码、未接支付、未提交审核、未推送 Git。

## 资格申请阶段的进一步结论

- 官方行业资质审核要求先完成企业认证，提供公司介绍、其他平台上线且可播放的代表作；如作品所属主体不同，补充主体关系或发布运营授权证明。公开文档不保证新建独立 H5 Demo 可代替已上线代表作，需要向平台确认接受形式。
- 资格申请 Demo 推荐先做可访问、支持PC/手机的剧集列表、详情、获授权片段播放、选集、公司/联系方式/条款隐私及标注演示的解锁流程；此范围是产品建议，不是官方最低审核清单。
- 不应先接 PayPal 或发起真实支付来证明资质；待行业资质、应用能力和IAP开通后再接原生付款。
- 如香港指注册主体，官方企业认证文档明确该主体通过验证后不能在美国发布；不将公司所在地当作可发布地区，目标市场需要另定。
- 有资质前的独立浏览器演示与正式TikTok内代码包分开：独立演示播放器不代表可用于正式Mini Drama版本；后者须接VePlayer及审核上架媒资。

## 官方依据

- [Mini Drama 开发](https://developers.tiktok.com/docs/en/tiktok-minis-develop-your-mini-app)
- [发布与审核](https://developers.tiktok.com/docs/en/tiktok-minis-release-your-mini-app)
- [基本资料](https://developers.tiktok.com/docs/en/tiktok-minis-basic-information-specifications)
- [行业资质审核](https://developers.tiktok.com/docs/en/industry-qualification-review)
- [企业认证及香港主体限制](https://developers.tiktok.com/docs/en/verify-your-business)
- [Beans 购买](https://developers.tiktok.com/docs/en/tiktok-minis-in-app-purchases)
- [订阅](https://developers.tiktok.com/docs/en/tiktok-minis-in-app-purchases-subscriptions)
- [商业化与结算](https://developers.tiktok.com/docs/en/enable-monetization-features)
- [媒资管理](https://developers.tiktok.com/docs/en/media-asset-management)
- [官方播放器](https://developers.tiktok.com/docs/en/minis-player)
- [PayPal 独立网站付款参考](https://developer.paypal.com/studio/checkout/standard/integrate)

部分 Legacy Guides 与新指南存在规格差异，提审时以对应产品当前指南、开发者平台实际字段和 TikTok 对接人员确认为准，不套用旧小游戏或普通 Login Kit 审核流程。

## 后续执行

用户随后要求先完成 Demo，提供 ShortMax PC/H5 参考并明确海报自行提供。实现见 [观众演示前台](../done/viewer-review-demo.md)。平台正式接入、资格审核和目标市场仍待确认。

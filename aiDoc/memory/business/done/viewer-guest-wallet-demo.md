# 游客资料与钱包弹层 Demo

- 日期：2026-10-10。
- 按参考展示头像、游客 UID、登录入口、金币与奖励双列、红色充值按钮；使用用户提供的头像及金币素材。
- 浏览器 crypto 生成10位本机游客 UID，保存于 gload-demo-guest-uid localStorage；刷新保持，清除存储后会重建，不用于认证或真实资金。
- 登录沿用访客体验弹窗，充值仅打开演示说明，余额为0，未接真实登录和支付。
- PC悬停及点击头像展示弹层，H5点击展示；账户页同步头像与 UID。
- 浏览器验证刷新前后 UID 一致、充值说明可打开关闭；Docker构建通过。
- 截图：/tmp/gload-reference-proof/guest-panel.png。
- 无法凭参考截图确定其 UID 来源。Cookie 与 localStorage 用来保存身份标识，与 UID 生成是不同环节。
- 未推送 Git。

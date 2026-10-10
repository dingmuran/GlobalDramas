# TikTok 登录参考弹窗

- 日期：2026-10-10。
- 点击登录统一打开shadcn Dialog，只保留TikTok入口，移除旧访客体验弹窗。
- 使用用户提供的GloadDrams品牌海报原图，左侧展示海报，右侧登录标题/按钮/服务条款与隐私政策；支持简体与English和主题。
- 用户追加要求突出海报：Web弹窗900×560，海报占44%；H5顶图260px，品牌文字完整可见。
- 按钮当前只显示尚未接入授权的Demo状态，不修改登录身份、不跳转真实OAuth、不收集凭据。
- Web/H5截图检查、按钮状态反馈与关闭通过；Docker TypeScript/Vite构建通过。截图 /tmp/gload-reference-proof/login-tiktok-desktop.png、login-tiktok-h5.png。
- 未推送Git。

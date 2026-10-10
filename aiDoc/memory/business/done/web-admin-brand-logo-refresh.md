# Web 与 WebAdmin 品牌图标统一

- 日期：2026-10-10
- 用户要求：使用 `web/public/media/ui/brand-logo-tiktok-1024.png` 统一前后台品牌图标，仅在本地修改，不提交，不更新云服务器。
- Web：首页及法律页 Logo、favicon 和 Apple touch icon 使用新图，品牌图片不裁圆角。
- 用户后续修正：TikTok 登录弹窗不替换，恢复原 login-brand.png 及原显示样式；TikTok 登录按钮保持原样。
- WebAdmin：登录页与布局共用 defaultSettings.logo；替换 favicon、默认品牌头像 SVG、模板品牌 SVG 和 128/192/512 桌面图标，manifest 名称统一为 Gload Dramas。
- 原始 1024 PNG 原样复制到后台 public；小尺寸图标由原图缩放，保留功能按钮和第三方支付、登录提供商图标。
- 保留已有许可、版权和用户其他未提交改动。
- 验证：Web 与 WebAdmin 生产构建通过，WebAdmin typecheck 通过；本地浏览器确认首页、法律页、Web 登录弹窗及后台登录页图片加载成功。后台未启动 API，未测试登录提交或登录后页面。

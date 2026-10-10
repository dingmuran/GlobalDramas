# 中英文服务条款与隐私政策页面

- 日期：2026-10-10。
- 用户提供ReelShort web-terms/web-privacy参考，要求登录弹窗链接跳转页面并支持中英文。
- 浏览器读取参考页并确认白底黑字、标题、更新时间、分章节长文排版。没有复制第三方公司的法律文本、联系方式或适用法律。
- 新增独立 /#/terms 与 /#/privacy 页面，隐藏娱乐首页导航和页脚，提供返回入口、原生语言选择器、互相跳转链接；语言复用全站持久化设置。
- 服务条款10章节与隐私政策8章节，中英文对应。按当前Demo功能明确游客UID/localStorage、观看记录、第三方样片请求、未接入TikTok或支付、反馈仅本地保存。保留运营公司与演示说明，正式文件需运营主体上线前确认。
- 实际从登录弹窗点击两个链接验证跳转；隐私跳转后Dialog数量为0，中英文正文切换正常，网页标题更新；H5无横向溢出（clientWidth=scrollWidth=375）。
- Docker TypeScript/Vite构建通过；截图 /tmp/gload-reference-proof/legal-terms-en.png、legal-privacy-zh.png、legal-privacy-h5.png。
- 未推送Git。

## 导航栏视觉优化

- 用户反馈原生语言选择器和蓝色返回链接生硬，改成与正文对齐的1200px容器、灰色圆形返回箭头、低调品牌文字、shadcn圆角语言选择器。
- 自定义菜单采用浅色背景与深色选中文字，避免受网站暗色主题影响。
- Web/H5显示与English切换验证通过，截图 /tmp/gload-reference-proof/legal-refined-desktop.png、legal-refined-h5.png。

## 菜单激活文字与图标修复

- 用户反馈激活项白字不可读；覆盖select-item的后代文字在focus/hover/highlight/checked状态为#252525，修复shadcn后代focus颜色规则。
- 语言图标复用首页ViewerIcons.LanguageIcon。
- 浏览器键盘激活English后读取选项及文字的computed color均为rgb(37,37,37)，中英文来回切换正常，Docker构建通过。
- 截图 /tmp/gload-reference-proof/legal-language-readable.png。

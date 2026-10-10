# 前台参考设计核验

日期：2026-10-09。仅针对本轮首页、真实片库导入及主海报居中修复。

## 参考与证据

- PC完整参考：`/var/folders/1q/7tbnn0w97mn_g1fg20gg3ml80000gn/T/codex-clipboard-c056a7de-826b-43a2-bbf3-570d08456da8.png`，2874×1376，以2倍截图密度归一为1437×688 CSS像素。
- 实现完整截图：`/tmp/gload-reference-proof/desktop-home-imported.png`，1437×688视口。两张截图在同一次视觉查看中并排输入比较。
- 海报偏左问题的聚焦参考：`/var/folders/1q/7tbnn0w97mn_g1fg20gg3ml80000gn/T/codex-clipboard-1c2b14da-30b8-411c-96bb-56019436e21a.png`。完整实现截图中主图区域已清楚呈现，因此无需二次裁切；读取DOM确认cover与img宽度均1422、左坐标0、object-position为50% 50%，且contain内容视觉位于页面正中。
- H5实现：`/tmp/gload-reference-proof/h5-home-imported.png`，390×844视口，文档宽度375（原生滚动条占15），无横向溢出。

## 核验结果与有意差异

- 排版：纯文字导航、居中下划线、左侧标题与单播放按钮、右下五张推荐缩略图及切换箭头；H5两层导航与底部分页点。
- 颜色与表面：黑底、红色选中态、白色标题；移除玻璃及额外装饰。
- 字体：普通无衬线字体，标题突出，片卡文字与集数位于海报下方。
- 素材：552张用户提供的真实海报全部缓存本地并转WebP；不生成海报。
- 文案：简体中文界面，原始多语言剧名不虚构翻译；公司名称按用户要求保留。
- 有意差异：用户要求删掉App入口和充值；品牌使用Gload Dramas。只有竖版海报，没有横版横幅，按用户最新要求PC完整居中，故与参考横幅满屏不同。没有提供简介或分类标签，当前仅展示真实集数，不虚构剧情。
- 交互：推荐切换、锁玉搜索、播放授权样片并写入继续观看、列表24→48加载均已验证。
- Docker内TypeScript检查与Vite生产构建通过；存在主JS包大于500KB的构建提示，不影响本次验证。

## 迭代

1. 移除玻璃、额外标语、装饰性卡片，按参考调整主图与片架。
2. 导入真实标题、集数与海报，保持数据来源准确。
3. 修复全局3:4比例覆盖hero容器的冲突，移除桌面picture的62%宽度，PC主图改为完整居中。

final result: passed（上述范围；真实视频、标签、简介尚未提供，未验证正式支付或发布）。

## 后续补充核验

用户明确授权补充Demo剧情资料后，552条演示简介与标签写入独立数据文件。首页显示演示简介前缀。截图：/tmp/gload-reference-proof/hero-arrows-editorial.png。浏览器验证上一部与下一部双向切换正确，分类、标签、简介可见，Docker构建通过。资料为演示拟稿，后续需替换正式剧情。

## 主图两侧背景优化

按用户最新要求，两侧使用同海报低亮度模糊背景，中间主图居中并以左右mask渐变过渡。截图/tmp/gload-reference-proof/hero-blended-background.png。移除了覆盖背景层的hero-art纯色背景，浏览器确认两侧延展可见、文字清晰。H5不启用此背景层。

## 2026-10-10 语言与图标修复

顶部五个图标DOM尺寸全部24×24。语言菜单使用popper定位到按钮下方，中文→English→中文切换成功，导航文本同步改变。截图/tmp/gload-reference-proof/language-fixed.png。Docker构建通过。

## 游客资料参考弹层

按用户参考展示头像、UID、登录首行、双余额列及红色充值按钮。实现截图 /tmp/gload-reference-proof/guest-panel.png。使用提供的头像与金币素材，简体中文，保留本机演示提示。修复分隔线被flex放大的问题。刷新UID保持，充值说明打开关闭通过，Docker构建通过。

## 2026-10-10 个人中心参考布局与尺寸优化

按截图重构左侧资料/余额/导航、右侧竖版海报与EP进度。初版截图 account-reference.png；用户反馈过大后缩小侧栏至280px、头像46px、充值按钮40px与导航44px，减少纵向间距，保持黑底红色选中状态。最终截图 /tmp/gload-reference-proof/account-compact.png 与 account-compact-h5.png。钱包、片单、观看记录切换通过，H5无横向溢出；Docker TypeScript和生产构建通过。真实支付与认证不在Demo范围。

## TikTok 登录弹窗

按用户参考使用左右分栏、单一TikTok按钮与提供的品牌海报。根据追加要求放大Web海报占比至44%、H5海报高度260px，避免品牌文字裁断。最终截图 /tmp/gload-reference-proof/login-tiktok-desktop.png、login-tiktok-h5.png。按钮显示未接入OAuth说明、关闭恢复页面通过。Docker生产构建通过。没有真实登录、凭据提交或身份伪造。

## 中英文独立法律页面

浏览器查阅ReelShort两个参考页的白底长文布局，实施Gload Dramas独立条款与隐私页面。正文按当前Demo实际行为编写，不移植第三方主体、付费与美国法律条款。登录弹窗链接跳转与关闭、文档语言切换与全站语言保持、PC/H5阅读验证通过；H5无横向溢出。截图 /tmp/gload-reference-proof/legal-terms-en.png、legal-privacy-zh.png、legal-privacy-h5.png。保留演示标记与公司名称。

法律阅读页导航栏进一步优化：与正文对齐、灰色圆形返回箭头、品牌名称与圆角shadcn语言菜单。修正菜单选中项受暗色主题影响的对比度；Web/H5语言切换通过。截图 /tmp/gload-reference-proof/legal-refined-desktop.png、legal-refined-h5.png。

语言菜单跟进：修复选项后代白色激活文字，复用首页LanguageIcon。浏览器computed color验证选项与文本均为rgb(37,37,37)，语言切换成功。截图 /tmp/gload-reference-proof/legal-language-readable.png。

品牌更新：提供的新Logo替换原G标志，Web/H5与法律页使用统一原图，圆角favicon嵌入原PNG并裁剪。Nunito Variable 900圆润品牌文字不复制参考品牌字形。浏览器验证family与fontWeight和favicon href，Docker构建通过。截图 /tmp/gload-reference-proof/logo-rounded-wordmark.png。

## 2026-10-10 Recharge store
- Reference: user supplied ReelShort shopping screenshots; user supplied VIP/coin assets used directly.
- Desktop VIP 2-column / coins 4-column; 390px H5 VIP single-column / coins 2-column; no horizontal overflow.
- Removed baked benefits footer, selection checkmarks/red outlines, top black margin and right solid strip per follow-ups.
- Currency switching verified for all tiers; CNY base converts to USD at latest available dated ECB/Frankfurter rate, with dated offline fallback.
- Account recharge route and PayPal unavailable-provider feedback verified. Google Pay TEST SDK wired, but external sheet could not be observed in IAB; live merchant processing is not connected.
- Proof: `/tmp/gload-reference-proof/shop-desktop.png`, `/tmp/gload-reference-proof/shop-mobile.png`.

### Payment logos follow-up
Apple Pay / Google Pay / PayPal local SVG marks replace text-only options; centered in equal button frames with preserved accessible names. Official source links in `web/public/media/ui/payment-assets.md`. Build passes. Browser proof `/tmp/gload-reference-proof/payment-logos.png`.

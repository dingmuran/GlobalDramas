# 导入用户提供的剧名与海报

- 日期：2026-10-09。
- 用户提供 drama_contract_stats.json，要求替换前台 title 与海报。
- 文件包含 552 个唯一 contract_id 和剧名，读取 contract_title、episode_num、cover_url 与 publish_time_sec；仅保留前台所需数据，不导入经营统计与签名参数。
- 552 张海报全部下载成功，转换为本地 WebP，合计 81,267,632 字节（约77.5MiB），全部元数据路径核验存在；原图保留于被 Git 忽略的 .cache/source-posters/，避免 TikTok CDN 签名链接过期。
- 片库映射在 web/src/demo/catalog.ts，数据在 imported-catalog.json；推荐优先选择中文标题（排除含假名/韩文的标题），原始剧名不编造翻译。
- 文件未提供简介、分类、横幅、视频或价格，不填虚构简介/分类；集数按原数据，横幅使用竖版海报适配。播放仍使用明确标注的授权样片，未连接实际短剧正片或支付。
- 首页推荐限制六项，缩略图五项可切换，列表每次24项加载，搜索弹层最多12项，避免一次渲染552项。
- 旧演示观看记录不删除，但不显示无法匹配的新片库条目；新观看进度按 contract_id 存储。
- 未改后台或 PostgreSQL，未提交 Git。

- 用户反馈主海报偏左：修复封面宽度与全局3:4比例冲突，PC主图完整居中（contain / 50% 50%），H5保持居中裁切；浏览器验证通过，Docker TypeScript 与生产构建通过。
- 用户询问标签和简介：原始文件未含相关字段，当前保留渲染能力并等待真实内容，不根据剧名虚构剧情。

- 后续用户明确授权为Demo补充标签和简介，已在独立demo-editorial.json提供演示文案；详见viewer-demo-editorial-and-arrows.md。

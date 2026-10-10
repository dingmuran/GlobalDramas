# Gload Dramas 观众前台 Demo

React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui（Radix Nova），PC 和手机 H5 共用响应式页面。布局参考 ReelShort，使用用户提供的剧名与海报，保留简体中文界面。

- 地址： http://localhost:8081
- 启动：`docker compose -f compose.local.yaml up -d web`
- 构建：`docker compose -f compose.local.yaml exec -T web npm run build`
- 首页、分类搜索、详情、播放与选集、浏览记录、个人中心、观看进度恢复和模拟解锁均可交互，支持简体中文与英文。
- 进度、访客标记、演示解锁记录、反馈仅存于浏览器；当前 Demo 不读写业务数据库，不调用真实支付或 TikTok 登录。

## 替换素材

导入数据：`src/demo/imported-catalog.json`，552 部剧名与集数取自用户提供的 drama_contract_stats.json。海报保存于 `public/media/posters/`，不依赖会过期的签名 URL。片库映射：`src/demo/catalog.ts`。把自行制作的海报放在 `public/media/posters/`，填写对应 `poster` 和 `banner` URL。建议海报比例 2:3、桌面横幅约 16:7；手机推荐区优先使用竖版海报。未填写时显示 CSS 占位内容，无 AI 生成海报。

所有选集暂用同一段公开授权 Sintel 预告样片，归属与许可见 `public/media/ATTRIBUTION.md`。剧名、海报与集数已替换为导入资料；文件未提供简介、分类或实际剧集视频，分类、标签与简介由 `src/demo/demo-editorial.json` 提供演示编辑数据，尚未接入正式内容接口。模拟解锁价格仍仅用于演示，正式上线前需接入实际作品和权益。

## 后续接入

`/api/viewer/v1` 已代理同一个 Go 服务的观众接口，接口类型在 `../packages/contracts/src`；Demo 本机状态不等于生产账号和权益。独立浏览器使用原生 video，识别到 TTMinis 时显示平台播放器待接入；正式 Mini Drama 须接 VePlayer、平台审核媒资、观众认证和付款/权益服务。

观众 Web 静态演示已部署至 http://huanqiucs.com，当前仅使用 HTTP。未部署后台与数据库，未提交 TikTok 审核、未开通真实支付。后续代码更新仅提交 Git，不自动发布服务器。

## UI 维护

官方配置在 components.json，组件源代码位于 src/components/ui/，业务页面组合这些组件。明暗语义主题及响应式布局在 src/styles.css，使用 Geist 本地字体与简体中文系统字体。

Button、Dialog、Select、InputGroup、Field、Textarea、ToggleGroup、Card、Badge、Empty 和 Sonner 已用于页面，图标采用 Lucide。新增组件在 Docker 执行：`docker compose -f compose.local.yaml exec -T web npx shadcn@latest add @shadcn/accordion`。更新已有组件先检查 CLI diff，保留触摸尺寸和中文关闭标签。

导航为纯文字，弹层采用纯色背景，移除玻璃、装饰图形和宣传区块。右上角太阳/月亮按钮切换亮暗主题并记忆选择；HeaderPanels 使用 Popover 显示演示热门影片、浏览记录和访客入口。PC 搜索点击展开，记录与用户悬停展开、移出收起；H5 顶部居中品牌、菜单与搜索/用户图标，下方为首页/类别/品牌导航，主题与语言移入手机菜单。用户图标悬停显示快捷面板，点击进入 /account 个人中心（浏览记录、已解锁剧集、反馈与访客设置）；个人中心包含我的片单、观看记录与钱包演示，收藏与首页卡片联动并保存在本机。

首页热播榜单位于最新发布之后，使用用户提供的 1–9 排名素材与固定演示顺序。桌面支持左右翻页，H5 支持横向滑动。详情进入自动播放第一集，H5 支持竖向滑动切集。页面使用 History API 路径路由，旧 `#/` 链接会迁移，部署需配置 Nginx 页面回退。

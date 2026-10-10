# 使用 shadcn/ui 改造前台设计

- 日期：2026-10-09。
- 用户要求使用 shadcn skill 改造当前观众 Demo 设计风格。
- web 接入 Tailwind CSS v4/Vite 插件及官方 Radix Nova 组件代码，配置导入别名和 components.json。
- 保留深色短剧产品定位，统一无衬线标题、按钮、搜索、语言选择、分类、弹窗、订单卡片、空状态和提示。
- 使用 Button、Dialog、InputGroup、Field、Textarea、Select、ToggleGroup、Card、Badge、Empty、Sonner、Lucide；删除旧 SVG 图标与已替换组件样式。
- 简体中文、PC/H5 适配、占位海报与本机演示状态保留，未变更 Go、数据库、后台权限和真实付款。
- 依赖、构建、运行在 Docker，未推送 Git。
- 验证：TypeScript/Vite 构建通过，分类、中英切换、收藏、弹窗及 Esc、模拟解锁后样片播放与订单记录通过，控制台无错误。

- 响应式检查：320、390、768、1440 像素均无页面横向溢出；手机顶部保持两行导航。截图保存于 docs/screenshots/shadcn-*。

# 原生 App 工程

- 入口：`mobile/src/app/_layout.tsx`；Expo Router 管理三个底部入口与 `/drama/[id]`。
- 技术：React Native + Expo + TypeScript，独立 package-lock；以 Expo 官方 SDK 兼容矩阵安装依赖。
- UI：原生组件、深色主题、安全区；禁止直接导入 Web DOM/CSS 组件。
- 接口：`mobile/src/services/api.ts` 处理 `{code,data,msg}`，`viewer.ts` 只预留现有公开观众目录。
- 类型：file 依赖 `packages/contracts`，禁止复制业务契约。
- 环境：`EXPO_PUBLIC_API_BASE_URL` 为公开 API 根地址，不包含路径前缀；未配置时请求明确失败。页面默认不发请求。
- 当前骨架不含视频、登录、支付、收藏持久化，不生成虚假账号或业务数据。后续私有观众请求独立认证，不使用管理员 Token。
- 原生工程按 Expo 配置生成；尚未绑定开发者账号、包名、EAS 项目。浏览器预览不取代现有 H5。
- 启动、验证与后续范围见 `mobile/README.md`；修改 App 不自动部署现有网站。

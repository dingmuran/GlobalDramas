# 项目画像

## 项目定位

`Gload Dramas` 是基于gin-vue-admin开发的短剧业务平台，管理后台面向超级管理员和版权方/制片方，观众业务由独立H5前台承载。

## 前端技术栈

以下Vue技术栈用于 `webAdmin/`。新增 `web/` 使用React + Vite + TypeScript，当前为基础工程；`packages/contracts/` 提供共享接口类型。后台Next.js + TypeScript迁移仅规划，未执行。

- Vue 3
- Vite
- Pinia
- Element Plus
- UnoCSS
- Vue Router
- Axios
- 业务统计表格与条形图（真实数据，无演示图表）
- VueUse

## 后端技术栈

- Go
- Gin
- GORM
- Casbin
- Viper
- Zap
- Redis
- JWT
- 多数据库支持
- 多云存储支持

## 项目核心特征

- RBAC 权限控制
- 前后端分离
- 插件化能力
- Swagger 文档
- 统一响应结构
- 代码生成与后台管理基础设施

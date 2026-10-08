# Gload Dramas 项目结构

项目根目录为 `/Users/zhangxinzheng/Downloads/GloadDramas`，原来的 `Global Dramas/GloadDramas` 双层目录已合并。

| 目录 | 当前职责 | 技术栈 |
| --- | --- | --- |
| webAdmin | 超级管理员、版权方/制片方后台 | 现有Vue 3 + Vite |
| web | 观众H5前台基础工程 | React + Vite + TypeScript |
| server | 统一业务后端 | Go + Gin + GORM，Docker运行 |
| packages/contracts | 共享响应、分页与业务模型类型 | TypeScript |

后台入口为 http://localhost:8080/ ，前台入口为 http://localhost:8081/ 。数据库继续使用原PostgreSQL数据卷。

前台目前只有工程入口和真实后端健康检查，尚未实现登录、播放、收藏和订单。后台继续使用现有Vue实现，Next.js迁移仅规划。未来两个前端都可引用共享类型；类型共享不代表权限共享，观众认证不得直接使用管理员登录接口。

修改Go业务模型后运行 `python3 deploy/generate-contracts.py` 同步28个业务模型类型。金额最小单位使用字符串传输，避免JavaScript大整数精度问题；可空日期保留null。共享静态类型不能替代后端鉴权与运行时校验。

Go代码生成器的前端输出目标为 `webAdmin/src`，避免Vue文件写入React前台。两个前端使用独立依赖卷与构建输出，可分别发布。

本次调整仅修改本地，未自动提交或推送Git。

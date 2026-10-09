# 共用后端、独立观众接口

- 日期：2026-10-09。
- 用户决定采用共用 Go 业务层、前后台接口独立的方案，观众前台需支持 PC、手机 H5 和 TikTok 容器。
- server 保留原名；增加 viewer/v1 公共目录接口，后台路径保持兼容。
- 新增 Viewer Router/API/Service/DTO、共享观众类型，web 改用观众入口。
- 共用已发布且授权有效的查询规则；公开 DTO 隐藏后台字段和视频地址。
- 本次不实现观众认证与支付；后续私有接口必须接入独立身份体系，不能使用后台账号 Token。
- 验证：PostgreSQL HTTP 集成测试、既有管理业务测试、前台构建通过；测试数据事务回滚。
- 详细契约：`aiDoc/frontend-backend/viewer-api.md`。未推送 Git。

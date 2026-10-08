# 本地 DBX 连接项目 PostgreSQL

- 日期：2026-10-08
- 状态：已完成
- 需求：使用本地 DBX 连接 Global Dramas 数据库。
- 应用：DBX.app（com.dbx.app）。
- 连接名称：Global Dramas Admin；127.0.0.1:15432；数据库 global_dramas_admin；用户 global_dramas。
- 凭据来源：忽略的 .env.local，与 server/config.local.yaml 的现有数据库密码一致；不在文档记录密码。
- 验证：DBX显示连接成功；已展开默认库、public和表清单，共61张表，含28张gd_业务表及中文注释。
- 保存范围：保存连接配置；未勾选保存/记住密码，密码只用于本次连接。

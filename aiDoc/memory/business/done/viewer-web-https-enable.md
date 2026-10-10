# 双域名免费 HTTPS

- 日期：2026-10-10
- 状态：done
- 用户要求：为 huanqiucs.com 与 www.huanqiucs.com 配置免费 SSL，现已授权启用 HTTPS。
- 实现：复用服务器现有 Let’s Encrypt 双域名证书，Nginx 启用 443；HTTP 301 转到 https://huanqiucs.com，并保留 ACME webroot 验证路径。
- 证书当前有效期：2026-10-10 至 2027-01-08。
- 服务器 HTTP 配置备份：/etc/nginx/sites-available/huanqiucs.conf.http-backup-20261010-081331。
- 边界：仅改 Nginx 和续期配置，网站发布目录仍为 20261010-v2，不部署本地 App 或前台新代码；不推送 Git。
- 验证：Nginx 语法检查及 reload 成功；外网两个 HTTPS /about 均返回 200，默认系统信任校验通过且 SAN 覆盖两域名；两个 HTTP 请求 301 到主域名 HTTPS，保留路径。certbot.timer enabled/active，certbot renew --dry-run --run-deploy-hooks 成功；续期钩子执行 nginx -t 与 reload。浏览器首页正常显示，未捕获加载错误。

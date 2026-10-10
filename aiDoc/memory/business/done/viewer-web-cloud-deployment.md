# 观众 Web 云服务器部署与无 hash 路由

- 提出日期：2026-10-10
- 当前状态：done

## 用户意图

只部署观众 web 到 64.83.14.222，绑定 huanqiucs.com 并配置 Nginx。页面路径不出现 #。

## 实现

- web/src/lib/router.ts 使用 History API；App 监听 popstate 与内部导航事件，旧 #/ 书签自动迁移。
- 页面内部链接、程序导航与分享地址改成路径路由。
- Nginx 使用 index.html 回退，静态资源独立缓存，API 路径不代理后端。
- 20261010-v2 静态包通过 Termius SFTP 上传，SHA256 校验一致；current 链接到发布目录。
- 主域名与 www 的 A 记录都指向 64.83.14.222。
- 证书申请与模拟续期成功；用户随后要求暂时只用 HTTP，已恢复 HTTP 配置，取消跳转和 HTTPS 监听，证书及 HTTPS 配置备份保留。
- 解压后统一目录 755、文件 644，防止品牌图等原始 600 权限导致 403。

## 验证与边界

- 生产构建通过，外网 HTTP 主域名/www、/about 返回 200，浏览器直接进入与刷新正常，无 HTTPS 跳转。
- 旧 #/about 自动变为 /about；剧集详情第 1 集自动播放，视频 readyState 4 且 currentTime 推进。
- 仅部署 Web；后端、后台、数据库未部署。收藏等仍为浏览器 localStorage，视频仍使用授权样片。
- 部署配置保存在 deploy/huanqiucs*.nginx.conf；本地发布包与说明位于 Downloads/GloadDramas-release。

## 后续状态（2026-10-10）

用户重新要求双域名 HTTPS，已启用现有免费证书和 HTTP 跳转，模拟续期成功；发布目录仍为 20261010-v2。详见 [双域名免费 HTTPS](viewer-web-https-enable.md)。

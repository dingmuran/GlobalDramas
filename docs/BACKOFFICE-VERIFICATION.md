# 后台测试账号与验证

验证日期：2026-10-09。运行环境：本地 Docker、Go、PostgreSQL、Ant Design Pro。

| 测试账号 | 角色 | 页面范围 |
|---|---|---|
| producer_test | 300，版权方 / 制片方 | 工作台、剧集管理、版权与授权、数据分析、收益中心 |
| admin_test | 888，超级管理员 | 业务管理与全部系统管理入口 |

现有 admin 保留。两个新账号均启用，各自只有一个角色关联。密码由会话交付给用户，不保存在配置或本文中。

## 自动检查

验收时使用一次性本地工具核验密码、角色关联、启用状态、JWT/Casbin、授权菜单树、全部 schema 资源列表、系统读取接口，以及制片方账号管理/系统管理/权限变更请求被拒绝。首次创建与检查共 75 次请求；创建后复核 73 次请求通过，没有 404 或 5xx。该工具绑定本地测试账号，验收完成后已移除，不作为长期维护或自动创建账号的入口。

系统写入测试：

```sh
docker compose -f compose.local.yaml run --rm --no-deps server sh -c 'GD_INTEGRATION=1 GVA_CONFIG=/workspace/server/config.local.yaml go test ./plugin/dramas/initialize ./plugin/dramas/service -count=1'
```

HTTP 用例按前端相同方法及 JSON 请求检查字典、字典项、参数、API、菜单、版本的新增、编辑、导入导出与删除。业务用例覆盖内容审核发布、归属限制、订单履约、广告与补偿、退款与双人审批等。数据库事务全部回滚；核对未遗留测试字典或剧集。

前端 14 项测试（含真实 Dropdown 交互）、类型检查、Biome、生产构建、Go 全量测试通过。Vitest 同时匹配 .test.ts 和 .test.tsx。

## 浏览器检查

用户分别完成验证码登录。制片方核验工作台与四个业务入口、单集/版本/审核标签及新增剧集表单；管理员核验全部业务分组和 12 个系统入口，账号列表显示三条（原 admin 加两个测试账号）。没有虚构业务数据填充空列表。

头像菜单实际核验：个人设置打开、原资料提交成功（未改值）、主题面板打开和开关生效、关闭按钮有效、退出立即返回登录页。修改密码表单不实际更改用户凭据；浏览器不进行真实资金动作或删除业务记录。

修复两处实际问题：

1. 字典项 parentID=0 被错误查询成上级记录，导致保存失败；统一归一化为根项 null。
2. 全局 animation:none/transition:none 与组件弹层动画冲突，头像菜单透明且点击区域为零；移除该 CSS 覆盖并使用官方 token.motion=false，增加显式点击触发及可聚焦账号按钮。退出不等待网络，使用捕获令牌后台注销，停止退出后的令牌刷新。

截图位于 docs/screenshots/：producer-test-permissions.jpg、test-accounts-created.jpg、account-profile-fixed.jpg、account-theme-fixed.jpg、account-logout-fixed.jpg。

动画配置参考 [Ant Design 官方说明](https://ant.design/docs/react/customize-theme/#disable-motion)。最终头像菜单截图为 docs/screenshots/account-menu-fixed.jpg。

长期保留权限、导航、头像菜单、系统 HTTP 写入与观众内容可见性回归测试；已移除模板 Mock 数据及一次性账号检查工具。

# 共享接口类型

后台与H5共用的纯TypeScript数据契约，不包含Vue、React、路由或登录状态。

`common.ts`维护响应、分页、金额与后台角色类型；`models.ts`根据真实Go业务结构生成，字段名沿用json标签，金额遵循json的string标签，可空日期使用`string | null`。

修改Go模型后运行 `python3 deploy/generate-contracts.py`，再在前台运行类型检查和构建。类型是开发期契约，不代替服务端权限或请求数据的运行时验证。

后台为 Ant Design Pro（React + TypeScript + Umi Max），观众前台为 React + Vite + TypeScript。两端分别管理请求地址与认证方式；观众公共目录类型维护在 `viewer.ts`。

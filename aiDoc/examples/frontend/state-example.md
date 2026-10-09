# 状态

页面读取 `useModel('@@initialState')` 获取Go返回的用户、菜单、schema；异步数据用React Query，查询键包含资源、用户与角色。保存后失效相关查询，退出时清理QueryClient。不得使用Pinia。

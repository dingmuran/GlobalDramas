# 请求封装

```ts
import { api } from '@/services/api';
import type { PageResult } from '@gload-dramas/contracts';
import type { Row } from '@/types/platform';
export const listDramas = () => api<PageResult<Row>>('/dramas/records/dramas');
```

真实业务不得调用模板Mock服务。统一封装负责code校验，JWT由app请求拦截器注入。

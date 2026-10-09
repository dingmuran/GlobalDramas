export interface BusinessPage {
  key: string;
  title: string;
  description: string;
  role: 300 | 888;
  resources: string[];
  dashboard?: boolean;
  analytics?: boolean;
  revenue?: boolean;
}
export const businessPages: BusinessPage[] = [
  {
    key: 'GDStudio',
    title: '工作台',
    description: '内容交付、审核与收益进度。',
    role: 300,
    resources: [],
    dashboard: true,
  },
  {
    key: 'GDDramas',
    title: '剧集管理',
    description: '创建剧集、管理单集与内容版本。',
    role: 300,
    resources: ['dramas', 'episodes', 'versions', 'reviews'],
  },
  {
    key: 'GDAnalytics',
    title: '数据分析',
    description: '观看、来源、留存与播放质量。',
    role: 300,
    resources: ['events'],
    analytics: true,
  },
  {
    key: 'GDEarnings',
    title: '收益中心',
    description: '按币种核对账单、结算与到账。',
    role: 300,
    resources: ['bills', 'settlements'],
    revenue: true,
  },
  {
    key: 'GDLicenses',
    title: '版权与授权',
    description: '管理授权范围、证明及到期时间。',
    role: 300,
    resources: ['licenses', 'dramas'],
  },
  {
    key: 'GDOverview',
    title: '管理总览',
    description: '内容、交易与平台运营的实时视图。',
    role: 888,
    resources: [],
    dashboard: true,
  },
  {
    key: 'GDReviews',
    title: '内容审核',
    description: '审核内容与版权，管理发布和下架。',
    role: 888,
    resources: ['dramas', 'reviews', 'episodes', 'licenses', 'versions'],
  },
  {
    key: 'GDUsers',
    title: '用户与机构',
    description: '后台账号、机构与观众业务记录。',
    role: 888,
    resources: [
      'accounts',
      'organizations',
      'profiles',
      'history',
      'favorites',
      'entitlements',
      'wallet',
      'feedback',
    ],
  },
  {
    key: 'GDFinance',
    title: '平台财务',
    description: '导入账单、处理差异与结算到账。',
    role: 888,
    resources: ['bills', 'settlements'],
    revenue: true,
  },
  {
    key: 'GDPolicies',
    title: '策略配置',
    description: '全局与按剧覆盖，预览生效结果。',
    role: 888,
    resources: ['policies'],
  },
  {
    key: 'GDMembership',
    title: '会员管理',
    description: '套餐、权益说明、订阅与同步结果。',
    role: 888,
    resources: ['plans', 'subscriptions', 'syncs'],
  },
  {
    key: 'GDOrders',
    title: '订单与售后',
    description: '首购、续费、退款与查询恢复。',
    role: 888,
    resources: ['orders', 'refunds', 'recoveries', 'feedback'],
  },
  {
    key: 'GDAds',
    title: '广告与补偿',
    description: '核验广告结果、失败与客服补偿。',
    role: 888,
    resources: ['ads', 'compensations'],
  },
  {
    key: 'GDData',
    title: '平台数据',
    description: '内容表现、会员、广告与播放质量。',
    role: 888,
    resources: ['events', 'subscriptions', 'ads'],
    analytics: true,
  },
  {
    key: 'GDGovernance',
    title: '审批审计与告警',
    description: '双人审批、审计追踪与异常恢复。',
    role: 888,
    resources: ['approvals', 'audits', 'alerts', 'restores'],
  },
];

import type { BackofficeRole, MoneyMinor } from '@gload-dramas/contracts';
export interface Authority {
  authorityId: BackofficeRole;
  authorityName: string;
  defaultRouter: string;
  children?: Authority[];
}
export interface User {
  name?: string;
  avatar?: string;
  userid?: string;
  access?: string;
  ID: number;
  userName: string;
  nickName: string;
  authorityId: BackofficeRole;
  authority: Authority;
  authorities?: Authority[];
  enable: number;
  phone?: string;
  email?: string;
  headerImg?: string;
}
export interface Menu {
  ID: number;
  menuId?: number;
  name: string;
  path: string;
  parentId: number;
  component?: string;
  hidden?: boolean;
  sort?: number;
  meta: { title: string; icon?: string; [key: string]: unknown };
  children?: Menu[];
  btns?: Record<string, number>;
}
export interface Field {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  ref: string;
}
export interface Resource {
  key: string;
  title: string;
  fields: Field[];
  canWrite: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canAction?: boolean;
  role: BackofficeRole;
}
export type Row = {
  id: number;
  status: string;
  currency?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
export interface Overview {
  counts: Record<string, number>;
  sources: { key: string; count: number }[];
  funnel: { key: string; count: number }[];
  quality: { startup_ms: number; buffer_ms: number; viewers: number };
  revenue: { currency: string; netMinor: MoneyMinor }[];
  retention: {
    cohort: string;
    users: number;
    day1: number | null;
    day7: number | null;
  }[];
  dramaStats: {
    drama_id: number;
    title: string;
    plays: number;
    completions: number;
    viewers: number;
  }[];
  expiring: Row[];
}
export interface InitialState {
  settings?: import('@ant-design/pro-components').ProSettings;
  settingDrawerOpen?: boolean;
  fetchUserInfo?: () => Promise<User | undefined>;
  currentUser?: User;
  menus: Menu[];
  schema: Resource[];
}
export interface Action {
  action: string;
  note?: string;
  evidence?: string;
  decision?: boolean;
  start?: number;
  count?: number;
}

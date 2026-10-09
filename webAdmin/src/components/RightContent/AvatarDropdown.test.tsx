// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarDropdown } from './AvatarDropdown';

const state = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  setInitialState: vi.fn(),
  clearSession: vi.fn(),
  clearQueries: vi.fn(),
  logout: vi.fn(),
}));
vi.mock('@umijs/max', () => ({
  history: { push: state.push, replace: state.replace },
  useModel: () => ({
    initialState: { currentUser: { nickName: '测试账号' } },
    setInitialState: state.setInitialState,
  }),
}));
vi.mock('@/services/api', () => ({ logout: state.logout }));
vi.mock('@/services/query', () => ({
  queryClient: { clear: state.clearQueries },
}));
vi.mock('@/services/session', () => ({
  clearSession: state.clearSession,
  getToken: () => 'captured-test-token',
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.logout.mockResolvedValue({});
});
afterEach(cleanup);
async function openMenu() {
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <AvatarDropdown>
        <span>测试账号</span>
      </AvatarDropdown>
    </ConfigProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '账号菜单' }));
  return screen.findByRole('menuitem', { name: /个人设置/ });
}
describe('account menu interactions', () => {
  it('opens the actual dropdown and navigates to personal settings', async () => {
    fireEvent.click(await openMenu());
    expect(state.push).toHaveBeenCalledWith('/profile');
  });
  it('opens theme settings through shared layout state', async () => {
    await openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: /主题设置/ }));
    const updater = state.setInitialState.mock.calls[0][0];
    expect(updater({ menus: [], schema: [] })).toMatchObject({
      settingDrawerOpen: true,
    });
  });
  it('clears session and navigates immediately while server revocation is pending', async () => {
    state.logout.mockReturnValue(new Promise(() => {}));
    await openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: /退出登录/ }));
    expect(state.clearSession).toHaveBeenCalledOnce();
    expect(state.clearQueries).toHaveBeenCalledOnce();
    expect(state.replace).toHaveBeenCalledWith('/user/login');
    expect(state.setInitialState).toHaveBeenCalledWith({
      menus: [],
      schema: [],
      settingDrawerOpen: false,
    });
    expect(state.logout).toHaveBeenCalledWith('captured-test-token');
  });
  it('stays signed out if server revocation fails', async () => {
    state.logout.mockRejectedValue(new Error('offline'));
    await openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: /退出登录/ }));
    await waitFor(() =>
      expect(state.replace).toHaveBeenCalledWith('/user/login'),
    );
    expect(state.clearSession).toHaveBeenCalledOnce();
  });
});

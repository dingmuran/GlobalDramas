import { useEffect, useState } from 'react';
export interface WatchRecord {
  dramaId: string;
  episode: number;
  seconds: number;
  updatedAt: string;
}
export interface DemoOrder {
  id: string;
  dramaId: string;
  beans: number;
  createdAt: string;
  status: 'demo-completed';
}
export interface DemoState {
  favorites: string[];
  likes: string[];
  history: WatchRecord[];
  orders: DemoOrder[];
  unlocked: string[];
  guest: boolean;
  guestUid: string;
}
function guestUid(): string {
  const key = 'gload-demo-guest-uid';
  try {
    const saved = localStorage.getItem(key);
    if (saved && /^\d{10}$/.test(saved)) return saved;
  } catch { /* Storage may be disabled. */ }
  const random = crypto.getRandomValues(new Uint32Array(2));
  const uid = String(1000000000 + ((random[0] * 1048576 + (random[1] >>> 12)) % 9000000000));
  try { localStorage.setItem(key, uid); } catch { /* Session-only fallback. */ }
  return uid;
}
const empty: DemoState = {
  favorites: [],
  likes: [],
  history: [],
  orders: [],
  unlocked: [],
  guest: false,
  guestUid: guestUid(),
};
const key = 'gload-viewer-demo-v1';
function load(): DemoState {
  try {
    const v = JSON.parse(
      localStorage.getItem(key) || 'null',
    ) as Partial<DemoState> | null;
    if (
      !v ||
      !Array.isArray(v.favorites) ||
      !Array.isArray(v.history) ||
      !Array.isArray(v.orders) ||
      !Array.isArray(v.unlocked)
    )
      return empty;
    return { ...empty, ...v, likes: Array.isArray(v.likes) ? v.likes : [], guestUid: empty.guestUid };
  } catch {
    return empty;
  }
}
export function useDemoStore() {
  const [state, setState] = useState<DemoState>(load);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* Storage may be disabled. */
    }
  }, [state]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === key || event.key === null)) setState(load());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function update(fn: (s: DemoState) => DemoState) {
    setState(fn);
  }
  return { state, update };
}

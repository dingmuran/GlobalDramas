import { createContext, useContext, useLayoutEffect, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{theme: Theme; setTheme: Dispatch<SetStateAction<Theme>>} | null>(null);
function readTheme(): Theme {
  try { return localStorage.getItem('gload-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}
export function ThemeProvider({children}: {children: ReactNode}) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    try { localStorage.setItem('gload-theme',theme); } catch { /* Storage may be disabled. */ }
  }, [theme]);
  return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>;
}
export function useViewerTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required');
  return value;
}

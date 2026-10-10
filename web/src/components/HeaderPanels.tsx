import { navigate } from '@/lib/router';
import { GuestAvatar, DemoCoin } from './GuestAssets';
import { SearchIcon as Search, UserIcon as CircleUserRound, MoonIcon as MoonStar, SunIcon as SunMedium, LanguageIcon as Globe2 } from './ViewerIcons';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Clock3,
  ArrowUpRight,
  Play,
  Menu,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from '@/components/ui/popover';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { useViewerTheme } from './ThemeProvider';
import Cover from './Cover';
import { dramas, genreLabels, type Language } from '@/demo/catalog';
import type { DemoState } from '@/demo/store';
import { cn } from '@/lib/utils';

type Panel = 'search' | 'history' | 'user' | 'menu';
interface Props {
  language: Language;
  setLanguage: (language: Language) => void;
  search: string;
  setSearch: (search: string) => void;
  state: DemoState;
  onGuest: () => void;
  onLogout: () => void;
  route: string;
}

export default function HeaderPanels({
  language,
  setLanguage,
  search,
  setSearch,
  state,
  onGuest,
  onLogout,
  route,
}: Props) {
  const [active, setActive] = useState<Panel | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useViewerTheme();
  const t = (zh: string, en: string) => (language === 'en' ? en : zh);
  function cancelClose() {
    if (timer.current) clearTimeout(timer.current);
  }
  function closeSoon() {
    cancelClose();
    timer.current = setTimeout(() => setActive(null), 160);
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    setActive(null);
  }, [route]);
  const query = search.trim().toLowerCase();
  const allMatches = query
    ? dramas.filter((d) =>
      `${d.title['zh-CN']} ${d.title.en} ${d.tags[language].join(' ')}`
        .toLowerCase()
        .includes(query),
    )
    : dramas;
  const matches = allMatches.slice(0, 12);
  const records = state.history.flatMap((record) => {
    const drama = dramas.find((d) => d.id === record.dramaId);
    return drama ? [{ ...record, drama }] : [];
  });
  function appearance(mobile = false) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon-lg"
          className={mobile ? "mobile-theme-row" : "rounded-full"}
          aria-label={
            theme === 'dark'
              ? t('切换亮色模式', 'Switch to light mode')
              : t('切换暗色模式', 'Switch to dark mode')
          }
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <SunMedium className="size-6" data-icon="inline-start" />
          ) : (
            <MoonStar className="size-6" data-icon="inline-start" />
          )}
          {mobile && <><span>{t('显示模式', 'Appearance')}</span><small>{theme === 'dark' ? t('深色', 'Dark') : t('浅色', 'Light')}</small></>}
        </Button>
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as Language)}
        >
          <SelectTrigger
            className={cn("rounded-full viewer-language-trigger", mobile && "mobile-language-row")}
            aria-label={t('语言', 'Language')}
          >
            <Globe2 className="size-6" aria-hidden="true" />
            {mobile && <span className="mobile-setting-label">{t('语言', 'Language')}</span>}
            <span className={mobile ? 'mobile-setting-value' : undefined}>{t('简体中文', 'English')}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            <SelectGroup>
              <SelectItem value="zh-CN">简体中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
    );
  }
  function panel(
    kind: Panel,
    label: string,
    icon: ReactNode,
    body: ReactNode,
    hover = false,
    className = '',
  ) {
    return (
      <Popover
        open={active === kind}
        onOpenChange={(open) => {
          cancelClose();
          setActive(open ? kind : null);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={label}
            className={cn(
              'header-icon rounded-full',
              active === kind && 'header-icon-active',
              kind === 'search' && 'header-search-trigger',
              className,
            )}
            onClick={(e) => {
              if (kind === 'user') {
                e.preventDefault();
                cancelClose();
                setActive(null);
                navigate('/account');
                return;
              }
              if (
                hover &&
                e.detail > 0 &&
                window.matchMedia('(hover: hover)').matches
              ) {
                e.preventDefault();
                cancelClose();
                setActive(kind);
              }
            }}
            onPointerEnter={(e) => {
              if (hover && e.pointerType === 'mouse') {
                cancelClose();
                setActive(kind);
              }
            }}
            onPointerLeave={(e) => {
              if (hover && e.pointerType === 'mouse') closeSoon();
            }}
          >
            {icon}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={kind === 'menu' ? 'start' : 'end'}
          sideOffset={kind === 'search' ? 8 : 12}
          collisionPadding={16}
          className={cn(
            'header-panel glass-surface rounded-3xl p-6',
            kind === 'search' && 'header-search-panel',
            kind === 'user' && 'guest-account-panel',
            kind === 'menu' && 'mobile-settings-panel',
          )}
          aria-label={label}
          onPointerEnter={hover ? cancelClose : undefined}
          onPointerLeave={(e) => {
            if (hover && e.pointerType === 'mouse') closeSoon();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            if (kind === 'search') input.current?.focus();
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {body}
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <>
      {panel(
        'menu',
        t('打开菜单', 'Open menu'),
        <Menu data-icon="inline-start" />,
        <>
          <PopoverHeader>
            <PopoverTitle>{t('浏览与设置', 'Browse & settings')}</PopoverTitle>
          </PopoverHeader>
          <Button asChild variant="ghost" size="lg" className="mobile-history-row">
            <a href="/history" onClick={() => setActive(null)}>
              <Clock3 data-icon="inline-start" />
              {t('浏览记录', 'Viewing history')}
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
          <Separator />
          <div className="mobile-appearance">{appearance(true)}</div>
          <p className="panel-note">
          </p>
        </>,
        false,
        'mobile-menu-trigger',
      )}
      <div className="header-tools">
        {panel(
          'search',
          t('开启搜索', 'Open search'),
          <Search data-icon="inline-start" />,
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActive(null);
                navigate('/explore');
              }}
            >
              <InputGroup className="glass-surface h-12 rounded-full">
                <InputGroupInput
                  ref={input}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={t('搜索剧名', 'Search dramas')}
                  placeholder={t(
                    '搜索故事、剧名或关键词',
                    'Search stories, titles or keywords',
                  )}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    size="icon-sm"
                    aria-label={t('提交搜索', 'Submit search')}
                  >
                    <Search data-icon="inline-start" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
            <PopoverHeader>
              <PopoverTitle>
                {query
                  ? t('搜索结果', 'Search results')
                  : t('热门影片', 'Popular stories')}
              </PopoverTitle>
              <p className="panel-note">
                {t('精选剧集', 'Featured stories')}
              </p>
            </PopoverHeader>
            <div className="search-poster-grid">
              {matches.map((d, i) => (
                <a
                  className="search-story"
                  href={`/drama/${d.id}`}
                  key={d.id}
                  onClick={() => setActive(null)}
                >
                  <div className="search-story-cover">
                    <Cover drama={d} language={language} />
                    <span className="search-story-rank">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="search-story-copy">
                    <strong>{d.title[language]}</strong>
                    <Badge variant="secondary">
                      {genreLabels[language][d.genre]}
                    </Badge>
                    <small>
                      {d.episodes} {t('集', 'episodes')}
                      <ArrowUpRight aria-hidden="true" />
                    </small>
                  </div>
                </a>
              ))}
              {!matches.length && (
                <p className="panel-note">
                  {t(
                    '暂无结果，试试其他关键词。',
                    'No results. Try another keyword.',
                  )}
                </p>
              )}
            </div>
          </>,
        )}
        {panel(
          'history',
          t('浏览记录', 'Viewing history'),
          <Clock3 data-icon="inline-start" />,
          <>
            <PopoverHeader>
              <PopoverTitle>{t('浏览记录', 'Viewing history')}</PopoverTitle>
              <p className="panel-note">{t('最近观看', 'Recently watched')}</p>
            </PopoverHeader>
            <div className="panel-history-list">
              {records.slice(0, 3).map((record) => (
                <a
                  className="panel-history-story"
                  key={record.dramaId}
                  href={`/watch/${record.dramaId}/${record.episode}`}
                  onClick={() => setActive(null)}
                >
                  <Cover drama={record.drama} language={language} />
                  <div>
                    <strong>{record.drama.title[language]}</strong>
                    <small>
                      {t('已观看到第 ', 'Continue episode ')}
                      {record.episode}
                      {t(' 集', '')}
                    </small>
                  </div>
                  <Play aria-hidden="true" />
                </a>
              ))}
              {!records.length && (
                <div className="panel-empty">
                  <Clock3 aria-hidden="true" />
                  <p>{t('还没有浏览记录', 'No viewing history yet')}</p>
                  <small>
                    {t(
                      '播放后会自动保存在本机',
                      'Progress is saved on this device',
                    )}
                  </small>
                </div>
              )}
            </div>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full rounded-full"
            >
              <a href="/history" onClick={() => setActive(null)}>
                {t('查看全部记录', 'View all history')}
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </>,
          true,
          'desktop-history-trigger',
        )}
        <div className="desktop-appearance">{appearance()}</div>
        {panel(
          'user',
          t('用户入口', 'User menu'),
          <CircleUserRound data-icon="inline-start" />,
          <>
            <div className="guest-panel-profile">
              <a href="/account" aria-label={t('查看用户信息', 'View account')} onClick={() => setActive(null)}>
                <GuestAvatar />
              </a>
              <div>
                <strong>{t('游客', 'Guest')}</strong>
                <small>UID {state.guestUid}</small>
              </div>
              <Button variant="ghost" onClick={() => { setActive(null); onGuest(); }}>
                {t('登录', 'Log in')}
              </Button>
            </div>
            <Separator />
            <div className="guest-panel-balances">
              <div><strong><DemoCoin />0</strong><span>{t('金币', 'Coins')}</span></div>
              <Separator orientation="vertical" />
              <div><strong><DemoCoin />0</strong><span>{t('奖励', 'Rewards')}</span></div>
            </div>
            <Button variant="default" size="lg" className="guest-panel-recharge w-full rounded-full" onClick={() => { setActive(null); navigate('/shop'); }}>
              {t('充值', 'Top up')}
            </Button>
          </>,
          true,
        )}
      </div>

    </>
  );
}

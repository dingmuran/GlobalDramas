import { navigate } from '@/lib/router';
import { SearchIcon as Search } from './components/ViewerIcons';
import HeaderPanels from './components/HeaderPanels';
import ShopPage from './components/ShopPage';
import AccountPage from './components/AccountPage';
import SiteFooter from './components/SiteFooter';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LockKeyhole,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Cover from './components/Cover';
import DramaCard from './components/DramaCard';
import PosterShelf from './components/PosterShelf';
import Modal from './components/Modal';
import LoginDialog from './components/LoginDialog';
import LegalPage from './components/LegalPage';
import {
  dramas,
  featuredDramas,
  trendingDramas,
  genreLabels,
  type Drama,
  type Genre,
  type Language,
} from './demo/catalog';
import { useDemoStore } from './demo/store';
import Player from './components/Player';

function useRoute() {
  const [route, setRoute] = useState(() => location.pathname.replace(/\/+$/, '') || '/');
  useEffect(() => {
    const fn = () => {
      setRoute(location.pathname.replace(/\/+$/, '') || '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    addEventListener('popstate', fn);
    addEventListener('gload:navigate', fn);
    return () => { removeEventListener('popstate', fn); removeEventListener('gload:navigate', fn); };
  }, []);
  return route;
}
export default function App() {
  const route = useRoute();
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('gload-language') === 'en' ? 'en' : 'zh-CN';
    } catch {
      return 'zh-CN';
    }
  });
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<Genre | 'all'>('all');
  const [topic, setTopic] = useState('all');
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const topicsRef = useRef<HTMLDivElement>(null);
  const [topicLayout, setTopicLayout] = useState({ count: Infinity, height: 100, overflow: false });
  useLayoutEffect(() => {
    const element = topicsRef.current;
    if (!element) return;
    const measure = () => {
      const buttons = Array.from(element.querySelectorAll('button'));
      const rows = [...new Set(buttons.map(button => button.offsetTop))];
      const visible = buttons.filter(button => button.offsetTop <= (rows[1] ?? rows[0]));
      const height = visible.length ? Math.max(...visible.map(button => button.offsetTop + button.offsetHeight)) - (rows[0] ?? 0) : 0;
      const next = { count: visible.length, height, overflow: rows.length > 2 };
      setTopicLayout(previous => previous.count === next.count && previous.height === next.height && previous.overflow === next.overflow ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [route, language]);
  const [slide, setSlide] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const heroMoveFrame = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [trackAnimated, setTrackAnimated] = useState(true);
  const heroGesture = useRef<{ pointerId: number; x: number; y: number; time: number; horizontal: boolean; baseX: number } | null>(null);
  useEffect(() => () => { if (heroMoveFrame.current !== null) cancelAnimationFrame(heroMoveFrame.current); }, []);
  const carouselStories = [featuredDramas[featuredDramas.length - 1], ...featuredDramas, featuredDramas[0]];
  function cancelHeroGesture() {
    if (!heroGesture.current) return;
    heroGesture.current = null;
    if (heroMoveFrame.current !== null) cancelAnimationFrame(heroMoveFrame.current);
    heroMoveFrame.current = null;
    setDragging(false);
    if (heroTrackRef.current) heroTrackRef.current.style.transform = `translate3d(-${trackIndex * 100}%,0,0)`;
  }
  function goToSlide(next: number, direction?: number) {
    setSlide(next);
    setTrackIndex(direction === 1 && slide === featuredDramas.length - 1 ? featuredDramas.length + 1 : direction === -1 && slide === 0 ? 0 : next + 1);
  }
  useEffect(() => {
    if (trackAnimated) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => setTrackAnimated(true)); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [trackAnimated]);
  useEffect(() => {
    if (route !== '/' || featuredDramas.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !heroGesture.current) goToSlide((slide + 1) % featuredDramas.length, 1);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [route, slide]);
  const [visibleCount, setVisibleCount] = useState(24);
  const [modal, setModal] = useState<'guest' | 'unlock' | null>(null);
  const [unlockDrama, setUnlockDrama] = useState<Drama>(dramas[0]);
  const setToast = (message: string) => toast(message);
  const { state, update } = useDemoStore();
  const history = state.history.filter((record) =>
    dramas.some((d) => d.id === record.dramaId),
  );
  const t = (zh: string, en: string) => (language === 'en' ? en : zh);
  const parts = route.split('/').filter(Boolean);
  const current = dramas.find((d) => d.id === parts[1]);
  const thumbnailStart = Math.max(
    0,
    Math.min(slide - 2, featuredDramas.length - 5),
  );
  useEffect(() => {
    document.documentElement.lang = language;
    if (!(current && (parts[0] === 'drama' || parts[0] === 'watch'))) document.title = parts[0] === 'terms' ? `${t('服务条款', 'Terms of Service')} · Gload Dramas` : parts[0] === 'privacy' ? `${t('隐私政策', 'Privacy Policy')} · Gload Dramas` : `Gload Dramas · ${language === 'en' ? 'Stories worth a moment' : '好故事，随时开始'}`;
    try {
      localStorage.setItem('gload-language', language);
    } catch {
      /* no persistence */
    }
  }, [language, route]);
  function unlock(d: Drama) {
    setUnlockDrama(d);
    setModal('unlock');
  }
  function buy() {
    const orderId = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    update((s) =>
      s.unlocked.includes(unlockDrama.id)
        ? s
        : {
            ...s,
            unlocked: [...s.unlocked, unlockDrama.id],
            orders: [
              {
                id: orderId,
                dramaId: unlockDrama.id,
                beans: 20,
                createdAt,
                status: 'demo-completed',
              },
              ...s.orders,
            ],
          },
    );
    setModal(null);
    setToast(
      t('解锁成功。', 'Unlocked successfully.'),
    );
  }
  const nav: { href: string; zh: string; en: string }[] = [
    { href: '/', zh: '首页', en: 'Home' },
    { href: '/explore', zh: '类别', en: 'Categories' },
    { href: '/about', zh: '品牌', en: 'Brand' },
  ];
  function card(d: Drama, rank?: number) {
    return <DramaCard key={d.id} rank={rank} drama={d} language={language} saved={state.favorites.includes(d.id)} onSave={() => {
      const saved = state.favorites.includes(d.id);
      update(previous => ({ ...previous, favorites: previous.favorites.includes(d.id) ? previous.favorites.filter(id => id !== d.id) : [...previous.favorites, d.id] }));
      toast(saved ? t('已取消收藏', 'Removed from my list') : t('已加入我的片单', 'Saved to my list'), saved ? undefined : { action: { label: t('查看片单', 'View my list'), onClick: () => { navigate('/account/favorites'); } } });
    }} />;
  }
  function shelf(title: string, items: Drama[], category: Genre | 'all' = 'all') {
    if (!items.length) return null;
    return (
      <PosterShelf title={title} english={language === 'en'} more={
        <a href="/explore" onClick={() => { setGenre(category); setTopic('all'); setSearch(''); setVisibleCount(24); }}>
          {t('查看全部', 'View all')}
        </a>
      }>
        {items.map(d => card(d))}
      </PosterShelf>
    );
  }
  const topicTranslations: Record<string, string> = { '人物故事': 'Character stories', '剧情': 'Drama', '古装': 'Period', '命运反转': 'Twists of fate', '奇幻': 'Fantasy', '宫廷': 'Royal court', '家庭': 'Family', '年代': 'Historical', '悬疑': 'Suspense', '情感': 'Relationships', '情感纠葛': 'Love triangles', '成长逆袭': 'Comeback', '暗黑': 'Dark stories', '权谋': 'Power & intrigue', '爱情': 'Romance', '身份谜局': 'Hidden identity', '逆袭': 'Rise to power', '冒险': 'Adventure', '反转': 'Plot twists', '抉择': 'Choices' };
  const topics = [...new Set(dramas.flatMap(d => d.tags['zh-CN']))];
  const filtered = dramas.filter(
    (d) =>
      (genre === 'all' || d.genre === genre) &&
      (route !== '/explore' || topic === 'all' || d.tags['zh-CN'].includes(topic)) &&
      `${d.title['zh-CN']} ${d.title.en} ${d.tags[language].join(' ')}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  if (parts[0] === 'terms' || parts[0] === 'privacy') {
    return <LegalPage page={parts[0]} language={language} onLanguage={setLanguage} />;
  }
  return (
    <>
      <header className={cn('site-header', route === '/' && 'header-home')}>
        <a className="brand" href="/" aria-label="Gload Dramas">
          <img className="brand-logo" src="/media/ui/brand-logo-tiktok-1024.png" alt="" />
          <span>
            Gload<span className="brand-light"> Dramas</span>
          </span>
        </a>
        <nav className="main-nav" aria-label={t('主导航', 'Main navigation')}>
          {nav.map((n) => (
            <a
              href={n.href}
              key={n.href}
              onClick={() => {
                if (n.href === '/explore') {
                  setSearch('');
                  setGenre('all');
                  setTopic('all');
                  setVisibleCount(24);
                }
              }}
              className={route === n.href ? 'active' : ''}
            >
              {t(n.zh, n.en)}
            </a>
          ))}
        </nav>
        <HeaderPanels
          language={language}
          setLanguage={setLanguage}
          search={search}
          setSearch={setSearch}
          state={state}
          route={route}
          onGuest={() => setModal('guest')}
          onLogout={() => {
            update((s) => ({ ...s, guest: false }));
            setToast(t('已退出访客体验', 'Guest session ended'));
          }}
        />
      </header>
      <main>
        {route === '/' && (
          <>
            <section
              className="hero"
              onPointerDown={(event) => {
                if (!window.matchMedia('(max-width: 800px)').matches || !event.isPrimary || event.button !== 0) return;
                if ((event.target as Element).closest('a, button')) return;
                heroGesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), horizontal: false, baseX: heroTrackRef.current ? new DOMMatrixReadOnly(getComputedStyle(heroTrackRef.current).transform).m41 : -trackIndex * event.currentTarget.clientWidth };
                setDragging(true);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = heroGesture.current;
                if (!start || start.pointerId !== event.pointerId) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (!start.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.3) start.horizontal = true;
                if (start.horizontal) {
                  const width = event.currentTarget.clientWidth;
                  const offset = Math.max(-width, Math.min(width, dx));
                  if (heroMoveFrame.current !== null) cancelAnimationFrame(heroMoveFrame.current);
                  heroMoveFrame.current = requestAnimationFrame(() => {
                    if (heroTrackRef.current) heroTrackRef.current.style.transform = `translate3d(${start.baseX + offset}px,0,0)`;
                    heroMoveFrame.current = null;
                  });
                }
              }}
              onPointerUp={(event) => {
                const start = heroGesture.current;
                if (!start || start.pointerId !== event.pointerId) return;
                heroGesture.current = null;
                if (heroMoveFrame.current !== null) cancelAnimationFrame(heroMoveFrame.current);
                heroMoveFrame.current = null;
                setDragging(false);
                if (heroTrackRef.current) heroTrackRef.current.style.transform = `translate3d(-${trackIndex * 100}%,0,0)`;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                const fastSwipe = performance.now() - start.time < 280 && Math.abs(dx) > 28;
                if (start.horizontal && (Math.abs(dx) >= event.currentTarget.clientWidth * .18 || fastSwipe) && Math.abs(dx) > Math.abs(dy) * 1.3) {
                  const direction = dx < 0 ? 1 : -1;
                  goToSlide((slide + direction + featuredDramas.length) % featuredDramas.length, direction);
                }
              }}
              onPointerCancel={cancelHeroGesture}
              onLostPointerCapture={cancelHeroGesture}
              aria-label={t('精选推荐', 'Featured stories')}
            >
              <div ref={heroTrackRef} className="hero-slide-track" data-instant={dragging || !trackAnimated} style={{ transform: `translate3d(-${trackIndex * 100}%,0,0)` }} onTransitionEnd={event => {
                if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
                if (trackIndex === 0 || trackIndex === featuredDramas.length + 1) {
                  setTrackAnimated(false);
                  setTrackIndex(slide + 1);
                }
              }}>
                {carouselStories.map((featured, index) => <div className="hero-slide" key={`${featured.id}-${index}`} aria-hidden={index !== trackIndex} inert={index !== trackIndex}>
              <div className="hero-backdrop" aria-hidden="true">
                <img src={featured.banner || featured.poster} alt="" />
              </div>
              <div className="hero-art">
                <Cover drama={featured} language={language} wide />
              </div>
              <div className="hero-shade" />
              <div className="hero-content">
                <h1>{featured.title[language]}</h1>
                <Badge variant="secondary" className="hero-category">
                  {featured.genre === 'other' ? `${featured.episodes} ${t('集', 'episodes')}` : genreLabels[language][featured.genre]}
                </Badge>
                <div className="hero-tags">
                  {featured.tags[language].map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <p className="hero-description">
                  {featured.synopsis[language]}
                </p>
                <div className="hero-buttons">
                  <Button asChild variant="default" size="lg">
                    <a href={`/watch/${featured.id}/1`}>
                      <Play data-icon="inline-start" aria-hidden="true" />
                      {t('播放', 'Play')}
                    </a>
                  </Button>
                </div>
              </div>
                </div>)}
              </div>
              <div
                className="hero-thumbnails"
                aria-label={t('选择推荐剧集', 'Choose a featured story')}
              >
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="hero-prev"
                  aria-label={t('上一部推荐', 'Previous featured story')}
                  onClick={() => goToSlide((slide - 1 + featuredDramas.length) % featuredDramas.length, -1)}
                >
                  <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                </Button>
                {featuredDramas
                  .slice(thumbnailStart, thumbnailStart + 5)
                  .map((d, i) => (
                    <button
                      key={d.id}
                      className={cn(
                        'hero-thumbnail',
                        slide === i + thumbnailStart && 'selected',
                      )}
                      title={d.title[language]}
                      aria-label={t('推荐：', 'Feature: ') + d.title[language]}
                      aria-pressed={slide === i + thumbnailStart}
                      onClick={() => goToSlide(i + thumbnailStart)}
                    >
                      <Cover drama={d} language={language} />
                    </button>
                  ))}
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="hero-next"
                  aria-label={t('下一部推荐', 'Next featured story')}
                  onClick={() => goToSlide((slide + 1) % featuredDramas.length, 1)}
                >
                  <ChevronRight data-icon="inline-start" />
                </Button>
              </div>
              <div className="hero-pagination">
                {featuredDramas.map((d, i) => (
                  <button
                    key={d.id}
                    className={slide === i ? 'selected' : ''}
                    aria-label={t('推荐 ', 'Feature ') + (i + 1)}
                    aria-pressed={slide === i}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            </section>
            <div className="content">
              {history.length > 0 && (
                <PosterShelf title={t('继续观看', 'Continue watching')} english={language === 'en'} className="continue-shelf">
                    {history.map((record) => {
                      const d = dramas.find((v) => v.id === record.dramaId);
                      return d ? (
                        <article className="drama-card" key={d.id}>
                          <a
                            className="poster-link"
                            href={`/watch/${d.id}/${record.episode}`}
                            aria-label={
                              t('继续观看 ', 'Continue watching ') +
                              d.title[language]
                            }
                          >
                            <Cover drama={d} language={language} />
                            <span className="poster-play">
                              <Play aria-hidden="true" />
                            </span>
                          </a>
                          <a
                            className="card-title"
                            href={`/watch/${d.id}/${record.episode}`}
                          >
                            {d.title[language]}
                          </a>
                          <p>
                            EP.{record.episode} / EP.{d.episodes}
                          </p>
                        </article>
                      ) : null;
                    })}
                </PosterShelf>
              )}
              {shelf(
                t('最新发布', 'New releases'),
                [...dramas]
                  .sort((a, b) => b.publishedAt - a.publishedAt)
                  .slice(0, 18),
              )}
              <PosterShelf title={t('热播榜单', 'Trending now')} english={language === 'en'} className="trending-shelf">
                {trendingDramas.map((d, index) => card(d, index + 1))}
              </PosterShelf>
              {shelf(t('精选推荐', 'Selected for you'), [...featuredDramas, ...dramas.filter(d => !featuredDramas.some(featured => featured.id === d.id))].slice(0, 18))}
              {(['romance', 'mystery', 'period', 'family'] as Genre[]).map(category => (
                <div key={category}>
                  {shelf(genreLabels[language][category], dramas.filter(d => d.genre === category).slice(0, 18), category)}
                </div>
              ))}
            </div>
          </>
        )}
        {route === '/explore' && (
          <div className="content page">
            <nav className="browse-breadcrumb" aria-label={t('面包屑导航', 'Breadcrumb')}><a href="/">{t('首页', 'Home')}</a><span>/</span><span>{genreLabels[language][genre]}</span></nav>
            <section className="browse-filters" aria-label={t('筛选剧集', 'Filter stories')}>
              <div className="browse-genres" aria-label={t('类别', 'Categories')}>{(Object.keys(genreLabels[language]) as (Genre | 'all')[]).map(g => <button type="button" key={g} aria-pressed={genre === g} className={genre === g ? 'active' : ''} onClick={() => { setGenre(g); setTopic('all'); setVisibleCount(24); }}>{genreLabels[language][g]}</button>)}</div>
              <div id="browse-topics" ref={topicsRef} className="browse-topics" style={{ maxHeight: topicsExpanded ? undefined : topicLayout.height, overflow: topicsExpanded ? undefined : 'hidden' }} aria-label={t('题材', 'Topics')}>
                {['all', ...topics].map((tag, index) => <button type="button" key={tag} tabIndex={!topicsExpanded && index >= topicLayout.count ? -1 : 0} aria-hidden={!topicsExpanded && index >= topicLayout.count ? true : undefined} aria-pressed={topic === tag} className={topic === tag ? 'active' : ''} onClick={() => { setTopic(tag); setVisibleCount(24); }}>{tag === 'all' ? t('全部', 'All') : t(tag, topicTranslations[tag] || tag)}</button>)}
              </div>
              {topicLayout.overflow && <button type="button" className="browse-expand" aria-expanded={topicsExpanded} aria-controls="browse-topics" onClick={() => setTopicsExpanded(v => !v)}>{topicsExpanded ? t('收起', 'Show less') : t('更多题材', 'More topics')}<ChevronDown size={16} className={topicsExpanded ? 'expanded' : ''} /></button>}
            </section>
            <div className="browse-results-heading"><h1>{topic !== 'all' ? t(topic, topicTranslations[topic] || topic) : genre === 'all' ? t('全部短剧', 'All stories') : genreLabels[language][genre]}</h1><span className="muted">{filtered.length} {t('部剧集', 'stories')}</span></div>
            {search && (
              <div className="search-summary">
                {t('搜索结果', 'Results')}: “{search}” · {filtered.length}
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setSearch('')}
                >
                  {t('清除', 'Clear')}
                </Button>
              </div>
            )}
            <div className="poster-grid">
              {filtered.slice(0, visibleCount).map((d) => card(d))}
            </div>
            {filtered.length > visibleCount && (
              <Button
                variant="secondary"
                size="lg"
                className="mt-6"
                onClick={() => setVisibleCount(visibleCount + 24)}
              >
                {t('加载更多', 'Load more')}
              </Button>
            )}
            {!filtered.length && (
              <Empty className="my-8 border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search data-icon="inline-start" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {t('还没有找到这个故事', 'No stories found')}
                  </EmptyTitle>
                  <EmptyDescription>
                    {t(
                      '换个关键词或分类再试试。',
                      'Try another keyword or category.',
                    )}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSearch('');
                      setGenre('all');
                      setTopic('all');
                    }}
                  >
                    {t('查看全部', 'Show all')}
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        )}
        {(parts[0] === 'watch' || parts[0] === 'drama') && current && (
          <Player
            key={current.id}
            drama={current}
            episode={parts[0] === 'drama' ? 1 : Number(parts[2]) || 1}
            language={language}
            liked={state.likes.includes(current.id)}
            onLike={() => update(s => ({ ...s, likes: s.likes.includes(current.id) ? s.likes.filter(id => id !== current.id) : [...s.likes, current.id] }))}
            saved={state.favorites.includes(current.id)}
            onSave={() => {
              const saved = state.favorites.includes(current.id);
              update(s => ({ ...s, favorites: saved ? s.favorites.filter(id => id !== current.id) : [...s.favorites, current.id] }));
              toast(saved ? t('已取消收藏', 'Removed from my list') : t('已加入我的片单', 'Saved to my list'));
            }}
            unlocked={state.unlocked.includes(current.id)}
            onUnlock={() => unlock(current)}
            onProgress={(episode, seconds) =>
              update((s) => ({
                ...s,
                history: [
                  {
                    dramaId: current.id,
                    episode,
                    seconds,
                    updatedAt: new Date().toISOString(),
                  },
                  ...s.history.filter((h) => h.dramaId !== current.id),
                ],
              }))
            }
            resume={
              state.history.find(
                (h) =>
                  h.dramaId === current.id &&
                  h.episode === (Number(parts[2]) || 1) && parts[0] !== 'drama',
              )?.seconds || 0
            }
          />
        )}
        {parts[0] === 'shop' && <ShopPage language={language} />}
        {parts[0] === 'account' && (
          <AccountPage
            key={route}
            initialTab={parts[1] === 'wallet' ? 'wallet' : parts[1] === 'history' ? 'history' : 'favorites'}
            language={language}
            state={state}
            onGuest={() => setModal('guest')}
            onLogout={() => {
              update((s) => ({ ...s, guest: false }));
              setToast(t('已退出访客体验', 'Guest session ended'));
            }}
          />
        )}
        {route === '/history' && (
          <div className="content page">
            <h1>{t('浏览记录', 'Viewing history')}</h1>
            <section className="library-section">
              <div className="section-heading">
                <h2>{t('观看记录', 'Watch history')}</h2>
                {!!history.length && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      update((s) => ({ ...s, history: [] }));
                      setToast(
                        t('已清除观看记录', 'Viewing history cleared'),
                      );
                    }}
                  >
                    {t('清除记录', 'Clear history')}
                  </Button>
                )}
              </div>
              {history.map((h) => {
                const d = dramas.find((v) => v.id === h.dramaId);
                return d ? (
                  <a
                    className="history-item"
                    key={d.id}
                    href={`/watch/${d.id}/${h.episode}`}
                  >
                    <div>
                      <Cover drama={d} language={language} />
                    </div>
                    <span>
                      <strong>{d.title[language]}</strong>
                      <small>
                        {t('第 ', 'Episode ')}
                        {h.episode}
                        {t(' 集', '')} · {Math.floor(h.seconds)}s
                      </small>
                    </span>
                    <Play data-icon="inline-start" aria-hidden="true" />
                  </a>
                ) : null;
              })}
              {!history.length && (
                <p className="muted">
                  {t(
                    '播放样片后，记录会保存在此浏览器。',
                    'Your viewing history will appear here after playing a sample.',
                  )}
                </p>
              )}
            </section>
          </div>
        )}
        {['about', 'feedback'].includes(parts[0] || '') && (
          <InfoPage page={parts[0]} language={language} onToast={setToast} />
        )}
        {![
          '',
          'explore',
          'history',
          'account',
          'shop',
          'about',
          'terms',
          'privacy',
          'feedback',
          'drama',
          'watch',
        ].includes(parts[0] || '') ||
        (['drama', 'watch'].includes(parts[0]) && !current) ? (
          <div className="content page empty">
            <h1>404</h1>
            <p>{t('这个故事还未开始。', 'This story hasn’t started yet.')}</p>
            <Button asChild variant="default" size="lg">
              <a href="/">{t('返回首页', 'Back home')}</a>
            </Button>
          </div>
        ) : null}
      </main>
      {!((parts[0] === 'drama' || parts[0] === 'watch') && current) && <SiteFooter language={language} />}
      <Toaster position="bottom-center" />
      {modal === 'guest' && (
        <LoginDialog language={language} onClose={() => setModal(null)} />
      )}
      {modal === 'unlock' && (
        <Modal
          title={t('让故事继续', 'Keep the story going')}
          onClose={() => setModal(null)}
        >
          <div className="checkout-story">
            <Cover drama={unlockDrama} language={language} />
            <div>
              <h3>{unlockDrama.title[language]}</h3>
              <p>{t('解锁全部选集', 'Unlock all episodes')}</p>
            </div>
          </div>
          <div className="price-box">
            <span>{t('整部剧集', 'Full story')}</span>
            <strong>
              20 <small>{t('金币', 'coins')}</small>
            </strong>
          </div>
          <p className="demo-note">
            {t(
              '此操作不产生扣款。',
              'No payment is taken for this action.',
            )}
          </p>
          <Button variant="default" size="lg" className="w-full" onClick={buy}>
            <LockKeyhole data-icon="inline-start" aria-hidden="true" />
            {t('解锁选集', 'Unlock episodes')}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => setModal(null)}
          >
            {t('暂时不要', 'Not now')}
          </Button>
        </Modal>
      )}
    </>
  );
}
function InfoPage({
  page,
  language,
  onToast,
}: {
  page: string;
  language: Language;
  onToast: (v: string) => void;
}) {
  const t = (zh: string, en: string) => (language === 'en' ? en : zh);
  const [message, setMessage] = useState('');
  const title =
    page === 'about'
      ? t('关于 Gload Dramas', 'About Gload Dramas')
      : t('我们想听见你的声音', 'We would love to hear from you');
  return (
    <article className="content page prose">
      <span className="eyebrow">GLOAD DRAMAS</span>
      <h1>{title}</h1>
      {page === 'about' ? (
        <>
          <p>
            {t(
              'Gload Dramas 是面向全球观众的短剧产品，本页展示发现、选集、播放、观看记录及解锁流程。',
              'Gload Dramas brings short stories to a global audience. Discover stories, browse episodes and pick up where you left off.',
            )}
          </p>
          <h2>{t('内容介绍', 'Our content')}</h2>
          <p>
            {t(
              '剧名、海报与集数来自提供的剧集数据。文件未提供分类、简介或剧集正片，当前所有选集仍使用 Sintel 公开授权预告样片，解锁记录不构成实际购买。',
              'Titles, posters and episode counts are imported from the supplied catalog. Genres, descriptions and episode videos were not supplied. Playback still uses the licensed Sintel sample and unlock records do not constitute purchases.',
            )}
          </p>
          <h2>{t('素材来源', 'Asset credits')}</h2>
          <p>
            Sintel © Blender Foundation ·{' '}
            <a href="https://www.sintel.org" target="_blank" rel="noreferrer">
              www.sintel.org
            </a>{' '}
            ·{' '}
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 3.0
            </a>
            .{' '}
            {t(
              '影片未改编，使用于样片播放。',
              'The video is unmodified and used for sample playback.',
            )}
          </p>
          <p>
            {t(
              '本版本未接入 TikTok 登录、官方媒资播放器或付款，也不代表已取得 TikTok 行业资质。正式版本将接入平台审核与播放能力。',
              'TikTok login, official media playback and payments are not connected. TikTok qualification approval is not implied. The live version will use the required platform integrations.',
            )}
          </p>
        </>
      ) : (
        <>
          <p>
            {t(
              '告诉我们你的体验。本版本只保存本机反馈，不会发送给客服。',
              'Tell us about your experience. Feedback is saved locally and is not sent to support.',
            )}
          </p>
          <form
            className="feedback-form"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                localStorage.setItem(
                  'gload-demo-feedback',
                  JSON.stringify({
                    message: message.trim(),
                    createdAt: new Date().toISOString(),
                  }),
                );
                setMessage('');
                onToast(
                  t(
                    '已保存本机反馈，尚未送出。',
                    'Feedback saved locally, not sent.',
                  ),
                );
              } catch {
                onToast(
                  t(
                    '浏览器无法保存，请稍后再试。',
                    'Browser storage unavailable. Please try again.',
                  ),
                );
              }
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="feedback">
                  {t('你的反馈', 'Your feedback')}
                </FieldLabel>
                <Textarea
                  id="feedback"
                  required
                  maxLength={2000}
                  minLength={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(
                    '请勿填写密码或付款信息。',
                    'Do not include passwords or payment information.',
                  )}
                  rows={6}
                />
              </Field>
            </FieldGroup>
            <Button variant="default" size="lg" type="submit">
              {t('保存反馈', 'Save feedback')}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>
        </>
      )}
    </article>
  );
}

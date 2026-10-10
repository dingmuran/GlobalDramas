import { navigate } from '@/lib/router';
import { ArrowLeft, Bookmark, Heart, ChevronDown, ChevronUp, ListVideo, LockKeyhole, Play, Share2, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { sampleVideo, type Drama, type Language } from '../demo/catalog';
import Cover from './Cover';

interface Props {
  drama: Drama;
  episode: number;
  language: Language;
  unlocked: boolean;
  liked: boolean;
  onLike: () => void;
  saved: boolean;
  onSave: () => void;
  onUnlock: () => void;
  onProgress: (episode: number, seconds: number) => void;
  resume: number;
}
export default function Player({ drama, episode, language, unlocked, liked, onLike, saved, onSave, onUnlock, onProgress, resume }: Props) {
  const t = (zh: string, en: string) => language === 'en' ? en : zh;
  const selected = Math.max(1, Math.min(drama.episodes, Math.floor(episode)));
  const allowed = selected <= 2 || unlocked;
  const video = useRef<HTMLVideoElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(0);
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 800px)').matches);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const inTikTok = typeof (window as Window & { TTMinis?: unknown }).TTMinis !== 'undefined';
  useEffect(() => {
    const query = matchMedia('(max-width: 800px)');
    const change = () => setMobile(query.matches);
    query.addEventListener('change', change);
    return () => { query.removeEventListener('change', change); if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, []);
  useLayoutEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const measure = () => page.current?.style.setProperty('--cinema-header-height', `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!showEpisodes) return;
    const previous = document.activeElement as HTMLElement | null;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowEpisodes(false);
      if (event.key === 'Tab') {
        const buttons = Array.from(sheet.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); previous?.focus(); };
  }, [showEpisodes]);
  useLayoutEffect(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    const element = feed.current;
    if (!element || !mobile) return;
    const top = (selected - 1) * element.clientHeight;
    if (Math.abs(element.scrollTop - top) > 2) element.scrollTo({ top, behavior: 'instant' });
  }, [selected, mobile]);
  useEffect(() => {
    document.title = `${drama.title[language]} · ${t('第 ', 'Episode ')}${selected} · Gload Dramas`;
  }, [drama, language, selected]);
  useEffect(() => {
    lastSaved.current = 0;
    setError(false);
    setPaused(false);
    setPlaying(false);
  }, [drama.id, selected]);
  function save(force = false) {
    const seconds = video.current?.currentTime || 0;
    if (force || Math.abs(seconds - lastSaved.current) >= 5) {
      lastSaved.current = seconds;
      onProgress(selected, seconds);
    }
  }
  function goTo(next: number) {
    setShowEpisodes(false);
    if (next < 1 || next > drama.episodes || next === selected) return;
    save(true);
    if (mobile && feed.current) {
      feed.current.scrollTo({ top: (next - 1) * feed.current.clientHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    } else navigate(`/watch/${drama.id}/${next}`);
  }
  function onScroll() {
    if (!mobile) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const element = feed.current;
      if (!element) return;
      const next = Math.max(1, Math.min(drama.episodes, Math.round(element.scrollTop / element.clientHeight) + 1));
      if (next !== selected) {
        save(true);
        navigate(`/watch/${drama.id}/${next}`);
      }
    }, 160);
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(new URL(`/drama/${drama.id}`, location.href).href);
      toast(t('分享链接已复制', 'Link copied'));
    } catch { toast(t('暂时无法复制链接', 'Could not copy the link')); }
  }
  const actions = <div className="cinema-actions">
    <button className="cinema-like" type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? t('取消喜欢', 'Unlike') : t('喜欢', 'Like')}><Heart size={21} fill={liked ? 'currentColor' : 'none'} /><span>{liked ? t('已喜欢', 'Liked') : t('喜欢', 'Like')}</span></button>
    <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? t('取消收藏', 'Remove from my list') : t('收藏', 'Save')}><Bookmark size={21} fill={saved ? 'currentColor' : 'none'} /><span>{saved ? t('已收藏', 'Saved') : t('收藏', 'Save')}</span></button>
    <button type="button" onClick={share}><Share2 size={21} /><span>{t('分享', 'Share')}</span></button>
    <button className="cinema-mobile-episodes" type="button" onClick={() => setShowEpisodes(true)} aria-expanded={showEpisodes}><ListVideo size={21} /><span>{t('选集', 'Episodes')}</span></button>
  </div>;
  const episodes = <div className="cinema-episode-grid">{Array.from({ length: drama.episodes }, (_, i) => <button type="button" key={i} aria-current={selected === i + 1 ? 'page' : undefined} onClick={() => goTo(i + 1)} data-playing={selected === i + 1 && playing}>{i + 1}{selected === i + 1 && <span className="episode-equalizer" aria-label={playing ? t("正在播放", "Playing") : t("当前集", "Current episode")}><i /><i /><i /></span>}{i >= 2 && !unlocked && <LockKeyhole size={10} />}</button>)}</div>;
  return <div className="cinema-page" ref={page}>
    <a href="/" className="cinema-back" aria-label={t('返回首页', 'Back home')}><ArrowLeft size={24} /></a>
    <div className="cinema-layout">
      <section className="cinema-viewer" aria-label={t('剧集播放器', 'Episode player')}>
        <div className="cinema-feed" ref={feed} onScroll={onScroll}>
          {(mobile ? Array.from({ length: drama.episodes }, (_, i) => i + 1) : [selected]).map(number => <div key={number} className="cinema-frame" aria-label={t(`第${number}集`, `Episode ${number}`)}>
            {number === selected && allowed && !inTikTok && !error ? <>
              <video key={`${drama.id}-${selected}`} ref={video} src={sampleVideo} poster={drama.poster} autoPlay muted controls playsInline preload="auto" aria-label={t(`第${selected}集播放器`, `Episode ${selected} player`)}
                onLoadedMetadata={() => { if (video.current && resume > 0 && resume < video.current.duration) video.current.currentTime = resume; }}
                onCanPlay={() => { video.current?.play().catch(() => setPaused(true)); }}
                onPlay={() => { setPlaying(true); setPaused(false); save(true); }} onTimeUpdate={() => save()} onPause={() => { setPlaying(false); setPaused(true); save(true); }} onEnded={() => { setPlaying(false); save(true); goTo(selected + 1); }} onError={() => { setPlaying(false); setError(true); }} />
              {paused && <button className="cinema-play" type="button" aria-label={t('播放', 'Play')} onClick={() => { video.current?.play().catch(() => setPaused(true)); }}><Play fill="currentColor" size={30} /></button>}
            </> : <>
              <Cover drama={drama} language={language} />
              {number === selected && <div className="cinema-unavailable">
                {!allowed ? <><LockKeyhole size={30} /><h2>{t('继续下一段故事', 'Continue the story')}</h2><button type="button" onClick={onUnlock}>{t('解锁剧集', 'Unlock story')}</button></> : <><Play size={30} /><h2>{t('视频暂时无法播放', 'Video unavailable')}</h2>{!inTikTok && <button type="button" onClick={() => setError(false)}>{t('重新加载', 'Retry')}</button>}</>}
              </div>}
            </>}
            <div className="cinema-mobile-caption"><h1>{drama.title[language]}</h1><p>{t(`第${number}集`, `Episode ${number}`)} / {drama.episodes}</p>{number === selected && actions}</div>
          </div>)}
        </div>
        <div className="cinema-stepper"><button type="button" aria-label={t('上一集', 'Previous episode')} disabled={selected === 1} onClick={() => goTo(selected - 1)}><ChevronUp /></button><button type="button" aria-label={t('下一集', 'Next episode')} disabled={selected === drama.episodes} onClick={() => goTo(selected + 1)}><ChevronDown /></button></div>
      </section>
      <aside className="cinema-sidebar">
        <nav className="cinema-breadcrumb" aria-label={t('面包屑导航', 'Breadcrumb')}><a href="/">{t('首页', 'Home')}</a><span>/</span><span>{drama.title[language]}</span><span>/</span><span>{t(`第${selected}集`, `Episode ${selected}`)}</span></nav>
        <h1>{t(`第${selected}集 · `, `Episode ${selected} · `)}{drama.title[language]}</h1>
        <div className="cinema-synopsis"><h2>{t('故事简介', 'The story')}</h2><p>{drama.synopsis[language]}</p></div>
        <div className="cinema-tags">{drama.tags[language].map(tag => <span key={tag}>{tag}</span>)}</div>
        {actions}
        <div className="cinema-episodes-heading"><h2>{t('选集', 'Episodes')}</h2><span>{drama.episodes} {t('集', 'episodes')}</span></div>
        {episodes}
        <p className="cinema-source-note">{t('当前视频为授权样片，非本剧正片。', 'This video is a licensed sample, not an episode of this story.')}</p>
      </aside>
    </div>
    {showEpisodes && <div className="cinema-sheet-backdrop" onClick={() => setShowEpisodes(false)}><section ref={sheet} role="dialog" aria-modal="true" aria-label={t('选集', 'Episodes')} className="cinema-sheet" onClick={event => event.stopPropagation()}><div className="cinema-episodes-heading"><h2>{t('选集', 'Episodes')} · {drama.episodes}</h2><button type="button" autoFocus onClick={() => setShowEpisodes(false)} aria-label={t('关闭', 'Close')}><X size={22} /></button></div>{episodes}<p className="cinema-source-note">{t('当前视频为授权样片，非本剧正片。', 'This video is a licensed sample, not an episode of this story.')}</p></section></div>}
  </div>;
}

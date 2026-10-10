import { useEffect, useId, useRef, useState } from 'react';
import { Bookmark, Play, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Cover from './Cover';
import { genreLabels, type Drama, type Language } from '../demo/catalog';

export default function DramaCard({ drama, language, saved, onSave, rank }: {
  rank?: number;
  drama: Drama;
  language: Language;
  saved: boolean;
  onSave: () => void;
}) {
  const previewId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const t = (zh: string, en: string) => language === 'en' ? en : zh;
  const href = `/drama/${drama.id}`;
  const cancelTimer = () => { if (timer.current) clearTimeout(timer.current); };
  const close = () => { cancelTimer(); setExpanded(false); };
  const open = () => {
    if (!matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)').matches) return;
    cancelTimer();
    timer.current = setTimeout(() => { window.dispatchEvent(new CustomEvent('gload-card-preview', { detail: previewId })); setExpanded(true); }, 160);
  };
  const leave = () => { cancelTimer(); timer.current = setTimeout(() => setExpanded(false), 140); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const anotherPreview = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== previewId) { cancelTimer(); setExpanded(false); }
    };
    window.addEventListener('gload-card-preview', anotherPreview);
    return () => window.removeEventListener('gload-card-preview', anotherPreview);
  }, [previewId]);
  useEffect(() => {
    const resize = () => { cancelTimer(); setExpanded(false); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  async function share() {
    const url = new URL(href, location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      toast(t('剧集链接已复制', 'Story link copied'));
    } catch {
      toast(t('无法自动复制，请复制下方链接', 'Copy this story link'), { description: url, duration: 8000 });
    }
  }
  return (
    <article ref={cardRef} className={`drama-card preview-card${rank ? ' ranked-card' : ''}`} data-preview-open={expanded} onMouseEnter={open} onMouseLeave={leave} onFocus={open} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) leave();
    }} onKeyDown={event => {
      if (event.key === 'Escape') {
        if ((event.target as HTMLElement).closest('.card-details')) cardRef.current?.querySelector<HTMLAnchorElement>('.poster-link')?.focus();
        close();
      }
      if (event.key === 'ArrowDown' && expanded && !(event.target as HTMLElement).closest('.card-details')) {
        event.preventDefault();
        cardRef.current?.querySelector<HTMLAnchorElement>('.hover-preview-play')?.focus();
      }
    }}>
      <a className="poster-link" href={href} aria-label={t('查看 ', 'View ') + drama.title[language]}>
        <Cover drama={drama} language={language} />
        {rank && <span className="poster-rank"><span className="sr-only">{t(`第 ${rank} 名`, `Rank ${rank}`)}</span><img src={`/media/ranks/${rank}.png`} alt="" loading="lazy" aria-hidden="true" /></span>}
        <span className="poster-play"><Play size={28} aria-hidden="true" /></span>
      </a>
      <a className="card-title" href={href} title={drama.title[language]}>{drama.title[language]}</a>
      <p className="card-meta">{expanded ? drama.tags[language].slice(0, 3).join(' · ') : <>{genreLabels[language][drama.genre]}<span>·</span>{drama.episodes} {t('集', 'episodes')}</>}</p>
      <div className="card-details" aria-hidden={!expanded} inert={!expanded}>
        <div className="card-details-inner">
          <p className="hover-preview-synopsis" title={drama.synopsis[language]}>{drama.synopsis[language]}</p>
          <div className="hover-preview-actions">
            <a className="hover-preview-play" href={`/watch/${drama.id}/1`} aria-label={t('播放 ', 'Play ') + drama.title[language]} onClick={close}><Play size={15} strokeWidth={1.6} fill="currentColor" aria-hidden="true" /><span>{t('播放', 'Play')}</span></a>
            <button type="button" aria-label={t(saved ? '取消收藏' : '收藏', saved ? 'Remove from my list' : 'Save to my list')} aria-pressed={saved} onClick={onSave}><Bookmark size={18} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" /></button>
            <button type="button" aria-label={t('分享', 'Share')} onClick={share}><Share2 size={18} strokeWidth={1.8} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

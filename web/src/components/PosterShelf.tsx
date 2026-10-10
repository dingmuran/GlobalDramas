import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PosterShelf({ title, children, more, english = false, className = '' }: {
  title: string;
  children: ReactNode;
  more?: ReactNode;
  english?: boolean;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const rowId = useId();
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () => {
      const next = { start: row.scrollLeft <= 2, end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 2 };
      setEdges(previous => previous.start === next.start && previous.end === next.end ? previous : next);
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => { row.removeEventListener('scroll', update); observer.disconnect(); };
  }, [children]);
  const scroll = (direction: number) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const step = (card?.offsetWidth ?? row.clientWidth) + gap;
    row.scrollBy({ left: direction * step * Math.max(1, Math.floor((row.clientWidth + gap + 2) / step)), behavior: 'smooth' });
  };
  return (
    <section className={`shelf ${className}`} aria-label={title}>
      <div className="section-heading">
        <h2>{title}</h2>
        <div className="shelf-actions">
          {more}
          <div className="shelf-arrows" hidden={edges.start && edges.end}>
            <button type="button" disabled={edges.start} aria-controls={rowId} aria-label={`${title}：${english ? 'Previous' : '向左翻页'}`} onClick={() => scroll(-1)}><ChevronLeft size={18} strokeWidth={1.7} aria-hidden="true" /></button>
            <button type="button" disabled={edges.end} aria-controls={rowId} aria-label={`${title}：${english ? 'Next' : '向右翻页'}`} onClick={() => scroll(1)}><ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      <div ref={rowRef} id={rowId} className="poster-row">{children}</div>
    </section>
  );
}

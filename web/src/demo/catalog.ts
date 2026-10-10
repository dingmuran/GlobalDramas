import importedCatalog from './imported-catalog.json';
import demoEditorial from './demo-editorial.json';
const editorial = demoEditorial as Record<string, { genre: Genre; tags: Record<Language, string[]>; synopsis: Record<Language, string> }>;
export type Language = 'zh-CN' | 'en';
export type Genre = 'romance' | 'mystery' | 'period' | 'family' | 'other';
export interface Drama {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  synopsis: Record<Language, string>;
  genre: Genre;
  tags: Record<Language, string[]>;
  episodes: number;
  tone: string;
  poster: string;
  banner: string;
  year: number;
  publishedAt: number;
}
// Imported titles and episode counts are supplied by the project owner.
// Playback and unlocks remain local demo interactions.
export const dramas: Drama[] = importedCatalog.map((item) => ({
  id: item.id,
  title: { 'zh-CN': item.title, en: item.title },
  subtitle: { 'zh-CN': '', en: '' },
  synopsis: editorial[item.id].synopsis,
  genre: editorial[item.id].genre,
  tags: editorial[item.id].tags,
  episodes: item.episodes,
  tone: 'neutral',
  poster: item.poster,
  banner: '',
  year: new Date(item.publishedAt * 1000).getUTCFullYear(),
  publishedAt: item.publishedAt,
}));
const hasChineseTitle = (d: Drama) =>
  /[\u4e00-\u9fff]/.test(d.title['zh-CN']) &&
  !/[\u3040-\u30ff\uac00-\ud7af]/.test(d.title['zh-CN']);
export const featuredDramas = [
  ...dramas.filter(hasChineseTitle),
  ...dramas.filter((d) => !hasChineseTitle(d)),
].slice(0, 6);
// Demo ranking order; replace with ranked API results when connected.
export const trendingDramas = [...featuredDramas, ...dramas.filter(d => !featuredDramas.some(featured => featured.id === d.id))].slice(0, 9);
export const genreLabels: Record<Language, Record<Genre | 'all', string>> = {
  'zh-CN': {
    all: '全部',
    other: '短剧',
    romance: '现代爱情',
    mystery: '悬疑反转',
    period: '古装情缘',
    family: '温暖生活',
  },
  en: {
    all: 'All',
    other: 'Short drama',
    romance: 'Romance',
    mystery: 'Mystery',
    period: 'Period',
    family: 'Family',
  },
};
export const sampleVideo = '/media/sintel-trailer.mp4';

import { ArrowLeft } from 'lucide-react';
import { LanguageIcon } from './ViewerIcons';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import type { Language } from '../demo/catalog';
import { legalDocuments } from '../demo/legal';

export default function LegalPage({ page, language, onLanguage }: { page: 'terms' | 'privacy'; language: Language; onLanguage: (language: Language) => void }) {
  const documentCopy = legalDocuments[page];
  const en = language === 'en';
  return (
    <div className="legal-page">
      <header className="legal-toolbar">
        <div className="legal-toolbar-inner">
          <a className="legal-back" href="/" aria-label={en ? 'Back to Gload Dramas' : '返回 Gload Dramas'}><span><ArrowLeft aria-hidden="true" /></span><img className="legal-brand-logo" src="/media/ui/brand-logo.png" alt="" /><strong>Gload Dramas</strong></a>
          <Select value={language} onValueChange={(value) => onLanguage(value as Language)}>
            <SelectTrigger className="legal-language-trigger" aria-label={en ? 'Document language' : '文档语言'}><LanguageIcon /><SelectValue /></SelectTrigger>
            <SelectContent className="legal-language-menu" position="popper" align="end"><SelectGroup><SelectItem value="zh-CN">简体中文</SelectItem><SelectItem value="en">English</SelectItem></SelectGroup></SelectContent>
          </Select>
        </div>
      </header>
      <article className="legal-document">
        <h1>{documentCopy.title[language]}</h1>
        <p className="legal-date">{en ? 'Last updated: October 10, 2026' : '最后更新：2026年10月10日'}</p>
        <p>{documentCopy.intro[language]}</p>
        {documentCopy.sections.map((section, index) => <section key={index}><h2>{section.title[language]}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph[language]}</p>)}</section>)}
        <footer className="legal-document-footer"><a href={page === 'terms' ? '/privacy' : '/terms'}>{page === 'terms' ? (en ? 'Read Privacy Policy' : '阅读隐私政策') : (en ? 'Read Terms of Service' : '阅读服务条款')}</a><p>© 2026 香港寰球未來智能科技有限公司</p></footer>
      </article>
    </div>
  );
}

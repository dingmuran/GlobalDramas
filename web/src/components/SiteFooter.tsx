import type { Language } from '@/demo/catalog';

const companyName = '香港寰球未來智能科技有限公司';

export default function SiteFooter({ language }: { language: Language }) {
  const t = (zh: string, en: string) => language === 'zh-CN' ? zh : en;
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-identity">
          <a className="footer-wordmark" href="/" aria-label="Gload Dramas">Gload Dramas</a>
          <p className="footer-company">{companyName}</p>
        </div>
        <section>
          <h2>{t('联系我们', 'Contact us')}</h2>
          <a href="/about">{t('关于 Gload Dramas', 'About Gload Dramas')}</a>
          <a href="/feedback">{t('联系与反馈', 'Contact & feedback')}</a>
        </section>
        <section>
          <h2>{t('法律信息', 'Legal')}</h2>
          <a href="/privacy">{t('隐私政策', 'Privacy policy')}</a>
          <a href="/terms">{t('服务条款', 'Terms of service')}</a>
        </section>
      </div>
      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} {companyName} · {t('保留所有权利', 'All rights reserved')}</p>
      </div>
    </footer>
  );
}

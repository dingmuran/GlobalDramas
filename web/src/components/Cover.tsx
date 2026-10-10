import type { Drama, Language } from '../demo/catalog';
export default function Cover({
  drama,
  language,
  wide = false,
}: {
  drama: Drama;
  language: Language;
  wide?: boolean;
}) {
  const image = wide ? drama.banner || drama.poster : drama.poster;
  return (
    <div className={`cover cover-${drama.tone} ${wide ? 'cover-wide' : ''}`}>
      {image ? (
        <picture>
          {wide && drama.poster && (
            <source media="(max-width: 800px)" srcSet={drama.poster} />
          )}
          <img
            src={image}
            alt={drama.title[language]}
            loading={wide ? 'eager' : 'lazy'}
          />
        </picture>
      ) : (
        <div
          className="cover-pending"
          aria-label={language === 'en' ? 'Artwork pending' : '待上传海报'}
        >
          <span>
            {language === 'en'
              ? wide
                ? 'Banner artwork pending'
                : 'Poster pending'
              : wide
                ? '待上传横幅'
                : '待上传海报'}
          </span>
        </div>
      )}
    </div>
  );
}

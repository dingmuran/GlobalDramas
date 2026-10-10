const navigationEvent = 'gload:navigate';
export { navigationEvent };

export function navigate(path: string) {
  const url = new URL(path, location.origin);
  if (url.origin !== location.origin) return;
  if (url.href !== location.href) history.pushState(null, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(navigationEvent));
}

export function initializeRouting() {
  const migrate = () => {
    if (location.hash.startsWith('#/')) {
      history.replaceState(null, '', location.hash.slice(1));
      window.dispatchEvent(new Event(navigationEvent));
    }
  };
  migrate();
  window.addEventListener('hashchange', migrate);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || url.hash || !/^\/(?:$|(?:explore|drama|watch|shop|account|history|about|feedback|terms|privacy)(?:\/|$))/.test(url.pathname)) return;
    event.preventDefault();
    navigate(url.pathname + url.search);
  });
}

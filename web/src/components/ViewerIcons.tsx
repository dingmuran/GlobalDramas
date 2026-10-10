import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
function IconFrame(props: IconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />;
}

export function SearchIcon(props: IconProps) {
  return <IconFrame {...props}><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></IconFrame>;
}
export function LanguageIcon(props: IconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4.5" ry="9" /><path d="M3 12h18M12 3v18" /></IconFrame>;
}
export function SunIcon(props: IconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="5" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></IconFrame>;
}
export function MoonIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M20.7 15.3A9 9 0 0 1 8.7 3.3a9 9 0 1 0 12 12Z" /></IconFrame>;
}
export function UserIcon(props: IconProps) {
  return <IconFrame {...props} stroke="none" className={['viewer-user-icon', props.className].filter(Boolean).join(' ')}><circle cx="12" cy="12" r="12" fill="var(--viewer-avatar-background, #303030)" /><circle cx="12" cy="9" r="4" fill="var(--viewer-avatar-person, #696969)" /><path d="M3.3 20.3a9.1 9.1 0 0 1 17.4 0A12 12 0 0 1 3.3 20.3Z" fill="var(--viewer-avatar-person, #696969)" /></IconFrame>;
}

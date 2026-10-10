import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Language } from '../demo/catalog';

function TikTokIcon() {
  const note = 'M16.6 3c.4 2.5 1.8 4 4.4 4.2v4a10 10 0 0 1-4.4-1.4v7a6.1 6.1 0 1 1-5.3-6.1v4a2.3 2.3 0 1 0 1.3 2.1V3z';
  return <svg viewBox="0 0 24 24" data-icon="inline-start" aria-hidden="true"><path d={note} fill="#25f4ee" transform="translate(-.7 .6)"/><path d={note} fill="#fe2c55" transform="translate(.7 -.3)"/><path d={note} fill="white"/></svg>;
}

export default function LoginDialog({ language, onClose }: { language: Language; onClose: () => void }) {
  const [requested, setRequested] = useState(false);
  const en = language === 'en';
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="login-dialog">
        <div className="login-brand-art" aria-hidden="true"><img src="/media/ui/login-brand.png" alt="" /></div>
        <div className="login-panel">
          <DialogHeader>
            <DialogTitle>{en ? 'Log in to Gload Dramas' : '登录 Gload Dramas'}</DialogTitle>
            <DialogDescription className="sr-only">{en ? 'Continue with your TikTok account.' : '使用 TikTok 账号继续。'}</DialogDescription>
          </DialogHeader>
          <div className="login-provider">
            <Button variant="secondary" size="lg" onClick={() => setRequested(true)}><TikTokIcon />TikTok</Button>
            <p className="login-status" role="status">{requested ? (en ? 'TikTok login is currently unavailable.' : 'TikTok 登录暂不可用。') : (en ? 'Continue with your TikTok account' : '使用 TikTok 账号登录')}</p>
          </div>
          <p className="login-legal">{en ? 'By continuing, you agree to our ' : '继续即表示你同意'}<a href="/terms" onClick={onClose}>{en ? 'Terms of Service' : '服务条款'}</a>{en ? ' and ' : '和'}<a href="/privacy" onClick={onClose}>{en ? 'Privacy Policy' : '隐私政策'}</a>。</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

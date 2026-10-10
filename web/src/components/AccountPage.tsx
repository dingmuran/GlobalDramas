import { navigate } from '@/lib/router';
import { useState } from 'react';
import { Clock3, Wallet, SquarePlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { dramas, type Language } from '@/demo/catalog';
import type { DemoState } from '@/demo/store';
import { GuestAvatar, DemoCoin } from './GuestAssets';
import Cover from './Cover';

export default function AccountPage({ language, state, onGuest, initialTab = 'favorites' }: {
  initialTab?: string; language: Language; state: DemoState; onGuest: () => void; onLogout: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [walletTab, setWalletTab] = useState('transactions');
  const t = (zh: string, en: string) => language === 'en' ? en : zh;
  const records = state.history.flatMap(record => {
    const drama = dramas.find(d => d.id === record.dramaId);
    return drama ? [{ drama, episode: record.episode }] : [];
  });
  const favorites = [...state.favorites].reverse().flatMap(id => { const drama = dramas.find(d => d.id === id); return drama ? [drama] : []; });
  const unlocked = dramas.filter(d => state.unlocked.includes(d.id));
  function posterList(items: { drama: typeof dramas[number]; episode?: number }[]) {
    return items.length ? <div className="account-poster-grid">{items.map(({ drama, episode }) => (
      <a key={drama.id} className="account-poster" href={episode ? `/watch/${drama.id}/${episode}` : `/drama/${drama.id}`}>
        <Cover drama={drama} language={language} />
        <strong>{drama.title[language]}</strong>
        <small>{episode ? `EP.${episode} / EP.${drama.episodes}` : `${drama.episodes} ${t('集', 'episodes')}`}</small>
      </a>
    ))}</div> : <div className="account-plain-empty"><p>{t('暂无记录', 'No records yet')}</p><Button asChild variant="ghost"><a href="/explore">{t('浏览剧集', 'Browse stories')}</a></Button></div>;
  }
  return <div className="content page account-page account-reference">
    <aside className="account-sidebar">
      <Card className="account-identity">
        <CardContent>
          <GuestAvatar />
          <div><strong>{t('游客', 'Guest')}</strong><small>UID {state.guestUid}</small></div>
          <Button variant="outline" onClick={onGuest}>{t('登录', 'Log in')}</Button>
        </CardContent>
      </Card>
      <Card className="account-wallet-card">
        <CardHeader><CardTitle>{t('账户余额', 'Account balance')}</CardTitle><CardDescription className="sr-only">{t('账户余额', 'Account balance')}</CardDescription></CardHeader>
        <CardContent>
          <div className="guest-panel-balances"><div><strong><DemoCoin />0</strong><span>{t('金币', 'Coins')}</span></div><span className="account-balance-divider" /><div><strong><DemoCoin />0</strong><span>{t('奖励', 'Rewards')}</span></div></div>
          <Button className="guest-panel-recharge w-full" size="lg" asChild><a href="/shop">{t('充值', 'Top up')}</a></Button>
        </CardContent>
      </Card>
      <nav className="account-reference-nav" aria-label={t('个人中心导航', 'Account navigation')}>
        {[{id:'wallet',icon:Wallet,label:t('钱包', 'Wallet')},{id:'favorites',icon:SquarePlay,label:t('我的片单', 'My list')},{id:'history',icon:Clock3,label:t('观看记录', 'Viewing history')}].map(({id,icon:Icon,label}) => <Button key={id} variant="ghost" onClick={() => { setTab(id); navigate(`/account/${id}`); }} aria-current={tab === id ? 'page' : undefined}><Icon aria-hidden="true" />{label}{id === 'favorites' && <span className="account-list-count">{favorites.length}</span>}</Button>)}
      </nav>
    </aside>
    <section className="account-main" aria-label={t('用户信息', 'Account information')}>
      {tab === 'history' && posterList(records)}
      {tab === 'favorites' && <>
        <div className="account-library-heading"><h1>{t('我的片单', 'My list')}</h1><span>{favorites.length} {t('部剧集', 'stories')}</span></div>
        {favorites.length ? posterList(favorites.map(drama => ({drama}))) : <div className="account-plain-empty"><p>{t('还没有收藏的剧集', 'Your list is empty')}</p><Button asChild variant="ghost"><a href="/explore">{t('发现喜欢的故事', 'Find your next story')}</a></Button></div>}
      </>}
      {tab === 'wallet' && <div className="account-wallet-tabs">
        <ToggleGroup type="single" value={walletTab} onValueChange={v => { if (v) setWalletTab(v); }}><ToggleGroupItem value="transactions">{t('交易记录', 'Transactions')}</ToggleGroupItem><ToggleGroupItem value="unlocked">{t('已解锁集数', 'Unlocked episodes')}</ToggleGroupItem></ToggleGroup>
        {walletTab === 'transactions' && <div><div className="account-table-scroll"><table className="account-transaction-table"><thead><tr>{[t('数量','Quantity'),t('金币','Coins'),t('交易','Transaction'),t('交易时间','Date')].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody><tr><td colSpan={4}>{t('暂无交易记录', 'No transactions yet')}</td></tr></tbody></table></div></div>}
        {walletTab === 'unlocked' && <div>{posterList(unlocked.map(drama => ({drama})))}</div>}
      </div>}
    </section>
  </div>;
}

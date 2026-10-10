import { useEffect, useState } from 'react';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Language } from '@/demo/catalog';
import { DemoCoin } from './GuestAssets';
import Modal from './Modal';
import { convertCny, fallbackExchangeRate, fetchExchangeRate } from '@/demo/currency';
import { openGooglePay, prepareGooglePay } from '@/demo/googlePay';

const plans = [
  { id: 'weekly', zh: '每周 VIP', en: 'Weekly VIP', price: 38, old: 78 },
  { id: 'monthly', zh: '每月 VIP', en: 'Monthly VIP', price: 128 },
  { id: 'yearly', zh: '年度 VIP', en: 'Annual VIP', price: 888 },
];
const packs = [
  { id: 'coins500', coins: 500, bonus: 0, price: 18 },
  { id: 'coins1000', coins: 1000, bonus: 100, price: 33 },
  { id: 'coins2000', coins: 2000, bonus: 400, price: 68 },
  { id: 'coins3000', coins: 3000, bonus: 900, price: 108 },
  { id: 'coins5000', coins: 5000, bonus: 2500, price: 168 },
  { id: 'coins10000', coins: 10000, bonus: 10000, price: 338 },
];
const methods = ['Apple Pay', 'Google Pay', 'PayPal', 'card'] as const;
export default function ShopPage({ language }: { language: Language }) {
  const t = (zh: string, en: string) => language === 'en' ? en : zh;
  const [product, setProduct] = useState('weekly');
  const [method, setMethod] = useState<typeof methods[number] | null>(null);
  const [methodHint, setMethodHint] = useState(false);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState('');
  const [payReady, setPayReady] = useState(false);
  const [exchange, setExchange] = useState(fallbackExchangeRate);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    fetchExchangeRate(controller.signal).then(setExchange).catch(() => {}).finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  const [payPending, setPayPending] = useState(false);
  useEffect(() => { let mounted = true; prepareGooglePay().then(() => { if (mounted) setPayReady(true); }).catch(() => {}); return () => { mounted = false; }; }, []);
  const selectedPlan = plans.find(p => p.id === product);
  const selectedPack = packs.find(p => p.id === product);
  const title = selectedPlan ? t(selectedPlan.zh, selectedPlan.en) : `${selectedPack?.coins.toLocaleString()} ${t('金币', 'coins')}${selectedPack?.bonus ? ` + ${selectedPack.bonus.toLocaleString()} ${t('奖励', 'bonus')}` : ''}`;
  const price = selectedPlan?.price ?? selectedPack?.price ?? 0;
  const amount = (value: number) => convertCny(value, language === 'en', exchange.cnyPerUsd);
  const money = (value: number) => `${language === 'en' ? '$' : '¥'}${amount(value).toLocaleString(language === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: language === 'en' ? 2 : 0, maximumFractionDigits: 2 })}`;
  function pay(productId: string) {
    if (payPending) return;
    if (!method) {
      setMethodHint(true);
      document.getElementById('shop-payment')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector<HTMLButtonElement>('.shop-payment-option')?.focus({ preventScroll: true });
      return;
    }
    const payment = method;
    const purchase = [...plans, ...packs].find(p => p.id === productId);
    if (!purchase) return;
    setProduct(productId);
    if (payment !== 'Google Pay') {
      setMessage(t('此付款方式尚未接入商户支付服务，当前不会扣款。', 'This payment provider is not connected to a merchant account. No payment will be taken.'));
      setReview(true);
      return;
    }
    if (!payReady) {
      setMessage(t('Google Pay 加载失败或尚未就绪，请检查网络后重试。', 'Google Pay is not ready. Check your connection and try again.'));
      setReview(true);
      prepareGooglePay().then(() => setPayReady(true)).catch(() => {});
      return;
    }
    setPayPending(true);
    const timer = window.setTimeout(() => {
      setPayPending(false);
      setMessage(t('Google Pay 付款窗口尚未返回，请检查是否已打开弹出窗口。', 'Google Pay has not returned. Check whether its payment window opened.'));
      setReview(true);
    }, 15000);
    openGooglePay(amount(purchase.price), language === 'en').then(() => {
      setMessage(t('Google Pay 流程已结束，未产生扣款。', 'Google Pay flow ended. No payment was taken.'));
      setReview(true);
    }).catch((error: unknown) => {
      if (typeof error === 'object' && error && 'statusCode' in error && error.statusCode === 'CANCELED') return;
      setMessage(t('当前浏览器或网络无法打开 Google Pay 付款窗口，请使用 Chrome 并允许弹出窗口。', 'Google Pay could not open. Try Chrome with pop-ups allowed and check your connection.'));
      setReview(true);
    }).finally(() => { window.clearTimeout(timer); setPayPending(false); });
  }
  return <div className="shop-page">
    <nav className="shop-breadcrumb" aria-label={t('面包屑导航', 'Breadcrumb')}><a href="/account">{t('个人中心', 'Account')}</a><span>/</span><h1>{t('充值商城', 'Top-up store')}</h1></nav>
    <div className="shop-surface">
      <div className="shop-balance-bar"><div><span>{t('金币', 'Coins')}: <DemoCoin /><b>0</b></span><i /><span>{t('奖励', 'Rewards')}: <DemoCoin /><b>0</b></span></div><a href="/account/wallet">{t('交易记录', 'Transactions')}<ChevronRight size={17} /></a></div>
      <Separator />
      <div className="shop-body">
        <section id="shop-payment" className="shop-payment" aria-label={t('付款方式', 'Payment method')}><h2 className="shop-section-title">{t('付款方式', 'Payment method')}</h2><p className="shop-muted">{t('先选择付款方式，再点击下方套餐付款', 'Choose a payment method, then click a plan or coin pack to pay')}</p><div className="shop-payment-grid">{methods.map(m => <Button variant="secondary" className={`shop-payment-option ${method === m ? 'is-selected' : ''}`} aria-pressed={method === m} disabled={payPending} key={m} onClick={() => { setMethod(m); setMethodHint(false); }}>{m === 'card' ? <CreditCard className="shop-payment-symbol" aria-hidden="true" /> : <img className={`shop-payment-symbol ${m === 'Apple Pay' ? 'shop-apple-symbol' : ''}`} src={`/media/ui/${m === 'Apple Pay' ? 'apple-mark' : m === 'Google Pay' ? 'google-mark' : 'paypal-mark'}.svg`} alt="" />}<span className="shop-payment-label">{m === 'card' ? t('银行卡', 'Credit card') : m}</span></Button>)}</div>{methodHint && <p className="shop-method-hint" role="status">{t('请先选择付款方式', 'Choose a payment method first')}</p>}{payPending && <p className="shop-muted" role="status">{t('正在打开 Google Pay 付款窗口…', 'Opening Google Pay…')}</p>}</section>
        <fieldset className="shop-products"><legend className="shop-section-title">{t('VIP 畅享所有剧集', 'VIP · Enjoy every story')}</legend><p className="shop-muted">{t('选择适合你的观影计划', 'Find your viewing plan')}</p>
          <div className="shop-vip-grid">{plans.map(p => <button type="button" key={p.id} className="shop-vip-card" disabled={payPending} onClick={() => pay(p.id)}>
            <img className="shop-vip-art" src="/media/ui/vip-card.png" alt="" />
            {p.old && <span className="shop-promotion">{t('首周优惠', 'Intro offer')}</span>}
            <div className="shop-vip-copy"><span>{t(p.zh, p.en)}</span><div><strong>{money(p.price)}</strong>{p.old && <del>{money(p.old)}</del>}</div><small>{p.old ? t(`首周 ${money(p.price)}，后续 ${money(p.old)} / 周`, `${money(p.price)} first week, then ${money(p.old)} / week`) : t('尊享会员 · 随时取消', 'Premium membership · Cancel anytime')}</small></div>
          </button>)}</div>
          <h2 className="shop-section-title shop-coins-heading">{t('充值金币', 'Top up coins')}</h2>
          <div className="shop-coin-grid">{packs.map(p => <button type="button" key={p.id} className="shop-coin-card" disabled={payPending} onClick={() => pay(p.id)}>
            {p.bonus > 0 && <span className="shop-promotion">+{p.bonus / p.coins * 100}%</span>}
            <img src="/media/ui/coin-stack.png" alt="" /><strong>{p.coins.toLocaleString()}{p.bonus ? ` + ${p.bonus.toLocaleString()}` : ''}</strong><span className="shop-coin-price">{money(p.price)}</span>
          </button>)}</div>
        </fieldset>
        <p className="shop-muted shop-exchange-rate">{t('参考汇率', 'Reference rate')}: $1 ≈ ¥{exchange.cnyPerUsd.toFixed(4)} · {exchange.date}</p>
        <div className="shop-guidance"><ShieldCheck size={17} /><div><strong>{t('产品说明与支付指南', 'Product & payment guide')}</strong><p>{t('继续即表示你已阅读', 'By continuing, you acknowledge the')} <a href="/terms">{t('服务条款', 'Terms of Service')}</a> {t('及', 'and')} <a href="/privacy">{t('隐私政策', 'Privacy Policy')}</a>。</p></div></div>
      </div>
    </div>
    {review && <Modal title={method === 'Google Pay' ? 'Google Pay' : t('付款方式', 'Payment method')} onClose={() => setReview(false)}><div className="shop-review"><strong>{title}</strong><span>{method === 'card' ? t('银行卡', 'Credit card') : method}</span><b>{money(price)}</b></div><p>{message}</p><Button className="w-full" onClick={() => setReview(false)}>{t('知道了', 'Got it')}</Button></Modal>}
  </div>;
}

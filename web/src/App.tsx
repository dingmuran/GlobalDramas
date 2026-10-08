import { useEffect, useState } from 'react'
import type { HealthState } from '@gload-dramas/contracts'
import { checkHealth } from './lib/api'

export default function App() {
  const [health, setHealth] = useState<HealthState>('checking')
  useEffect(() => {
    const controller = new AbortController()
    checkHealth(controller.signal).then(setHealth).catch(() => {
      if (!controller.signal.aborted) setHealth('unavailable')
    })
    return () => controller.abort()
  }, [])

  return (
    <main className="stage">
      <header className="masthead"><span className="monogram" aria-hidden="true">GD</span><span>Gload Dramas</span><span className="edition">H5</span></header>
      <section className="intro" aria-labelledby="title">
        <p className="eyebrow">故事，随时开始。</p>
        <h1 id="title">好故事，<br />就在你手中。</h1>
        <p className="description">Gload Dramas 观众前台的起点。</p>
      </section>
      <section className="readiness" aria-labelledby="ready-title">
        <div className="section-number" aria-hidden="true">01 / START</div>
        <h2 id="ready-title">前台工程已就绪</h2>
        <p>目前仅建立 React + Vite + TypeScript 基础工程。观众登录、发现、播放、收藏与订单将在后续接入，此处没有演示剧集或交易数据。</p>
        <p className={`service ${health}`} role="status"><span aria-hidden="true" />{health === 'checking' ? '正在检查后端连接…' : health === 'available' ? 'Go 后端连接正常' : '后端暂不可用，请确认服务已启动'}</p>
      </section>
      <footer>发现好剧 · 追剧记录 · 我的收藏 · 会员与订单</footer>
    </main>
  )
}

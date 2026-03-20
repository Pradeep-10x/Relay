"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('ln-revealed'); obs.unobserve(el) } },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal()
  return <div ref={ref} className={`ln-reveal ${className}`}>{children}</div>
}

/* ─── Icon helper ─── */
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

/* ═══ LANDING PAGE ═══ */
export default function LandingPage() {
  return (
    <div className="ln-page relative">
      <div className="ln-grid-bg" />
      {/* ── NAV ── */}
      <header className="ln-nav">
        <nav className="ln-nav-inner">
          <Link href="/" className="ln-brand">
            <Image src="/logo.svg" alt="Relay" width={32} height={32} className="ln-brand-logo" priority unoptimized />
            <span className="text-2xl font-extrabold tracking-tight font-headline">Relay</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pradeep-10x/Relay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-surface flex items-center gap-2 px-3 py-2 text-sm rounded border border-white"
            >
              <Icon name="code" className="text-base" />
              GitHub 
            </a>
            <Link href="/login" className="ln-btn-primary ln-btn--sm">
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-28">
        {/* ── HERO ── */}
        <section className="ln-hero">
          <div className="ln-hero-grid relative z-10">
            <div className="ln-hero-content flex flex-col items-center text-center">
              <span className=" font-sora text-sm tracking-widest font-bold mb-6 block uppercase border border-dotted border-white p-2">
                From backlog to done — without the chaos.
              </span>
              <h1 className="ln-hero-title w-fit mx-auto ">
                Industrial-grade Project & Issue <br /> management System.
              </h1>

              <p className="ln-hero-sub">
                Multi-tenant architecture, workflow engine, realtime sync, and secure RBAC
                — the foundation for production-ready task systems.
              </p>

              <div className="ln-hero-actions">
                <Link href="/register" className="ln-btn-neon">
                  Start Tracking
                </Link> 
                <a
                  href="#features"
                  className="ln-btn-protocol"
                >
                  Explore
                </a>
              </div>
            </div>
          </div>
        </section>

          {/* ── FEATURES ── */}
        <Reveal>
          <section id="features" className="ln-section ln-section--xl">
            <div className="ln-features-header">
              <div className="max-w-2xl">
                <h1 className="ln-heading-xl">Engineered for Complexity.</h1>
                <p className="ln-text-muted text-xl leading-relaxed">
                  Relay abstracts the infrastructure required for multi-tenant SaaS tools, providing
                  a high-performance foundation for issue tracking and task management system.
                </p>
              </div>
            </div>

            <div className="ln-feature-wrap">
              {/* Dotted string connectors */}
              <svg className="ln-feature-connectors" viewBox="0 0 800 750" fill="none" preserveAspectRatio="none">
                <path d="M 280 120 C 340 40, 460 200, 520 120" stroke="#e5e2e1" strokeWidth="1.5" strokeDasharray="8 6" fill="none" opacity="0.25" />
                <path d="M 520 260 C 480 400, 320 340, 280 530" stroke="#e5e2e1" strokeWidth="1.5" strokeDasharray="8 6" fill="none" opacity="0.25" />
                <path d="M 280 580 C 340 660, 460 500, 520 620" stroke="#e5e2e1" strokeWidth="1.5" strokeDasharray="8 6" fill="none" opacity="0.25" />
              </svg>
            <div className="ln-feature-grid">
              {[
                { icon: 'workspace_icon_217150.png', title: 'Workspace Isolation', desc: 'Strict logical data partitioning at the database level. Each tenant operates in a cryptographically isolated environment with custom schemas.' },
                { icon: 'engine.png', title: 'Workflow Engine', desc: 'Programmable state transitions. Define rigid workflows with mandatory gates, validation hooks, and automated state updates.' },
                { icon: 'issuereopened_106360.png', title: 'Issue Dependencies', desc: 'Native support for blocking, related, and sub-task hierarchies. Automatic collision detection for circular dependencies across project nodes.' },
                { icon: 'brush.png', title: 'Collaborative Canvas', desc: 'Integrated whiteboard with real-time sync. High-fidelity multiplayer editing for system diagrams and project planning directly in-app.' },
              ].map((f, i) => (
                <div key={i} className="ln-feature-card">
                  <div className="ln-feature-icon">
                    <Image src={`/${f.icon}`} alt={f.title} width={32} height={32} className="object-contain" unoptimized />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
            </div>
          </section>
        </Reveal>

      

      

      
        {/* ── FINAL CTA ── */}
        <Reveal>
          <section className="ln-section">
            <div className="border border-gray-500 rounded-lg p-20 bg-black mx-20">
              <h2 className="font-headline text-3xl md:text-5xl font-extrabold mb-12 tracking-tighter leading-[1.1]">
                Everything your team needs. Nothing it doesn't.
Set up in minutes. Built to scale.
              </h2>
              <div className="ln-final-cta-actions">
                <Link 
                  href="/register" 
                  className="relative flex items-center justify-center text-sm font-bold text-black bg-white rounded-full h-12 p-1 pl-6 pr-14 group transition-all duration-500 hover:pl-14 hover:pr-6 hover:bg-gray-200 w-fit overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10 transition-all duration-500">
                    Get Started
                  </span>
                  <div className="absolute right-1 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                  </div>
                </Link>
             
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-footer-brand">
          
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b9cacb] leading-relaxed max-w-sm">
              © {new Date().getFullYear()} Relay. Engineering-Grade Infrastructure. Built for high-performance Project Management.
            </p>
          </div>
          
        </div>
      </footer>
    </div>
  )
}

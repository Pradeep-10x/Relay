"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Github } from 'lucide-react'
import { motion } from 'framer-motion'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Feature {
  icon: string
  title: string
  desc: string
}

/* ─────────────────────────────────────────
   Constants — defined outside component
   so they don't re-create on every render
───────────────────────────────────────── */
const FEATURES: Feature[] = [
  {
    icon: 'workspace_icon_217150.png',
    title: 'Workspace Isolation',
    desc: "Your workspace stays yours. No data bleed, no shared context — full tenant isolation by design.",
  },
  {
    icon: 'engine.png',
    title: 'Workflow Engine',
    desc: 'Build workflows that match how your team actually works — with automated gates, smart transitions, and zero manual chasing.',
  },
  {
    icon: 'issuereopened_106360.png',
    title: 'Issue Dependencies',
    desc: 'Track blockers, related work, and sub-tasks with automatic dependency mapping. Catch circular dependencies before they become problems.',
  },
  {
    icon: 'brush.png',
    title: 'Collaborative Canvas',
    desc: 'A shared digital space where your team can brainstorm, map systems, and plan projects together in real time.',
  },
]



/* ─────────────────────────────────────────
   Reveal wrapper
───────────────────────────────────────── */
function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Feature card
───────────────────────────────────────── */
function FeatureCard({ icon, title, desc }: Feature) {
  return (
    <motion.article 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="ln-feature-card"
    >
      <div className="ln-feature-icon" aria-hidden="true">
        <Image
          src={`/${icon}`}
          alt={`${title} icon`}
          width={32}
          height={32}
          className="object-contain"
          unoptimized
          loading="lazy"
        />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.article>
  )
}

/* ─────────────────────────────────────────
   Animated hero badge
───────────────────────────────────────── */
function HeroBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="
      anim-hero anim-delay-0
      font-sora text-sm tracking-widest font-bold mb-6
      block uppercase border border-gray-800/60
      px-4 py-2 w-fit mx-auto
      bg-white/5 backdrop-blur-sm
    ">
      {children}
    </span>
  )
}

/* ═══════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════ */
export default function LandingPage() {
  /* Sticky nav transparency */
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="ln-page relative">
      <style>{`
        /* ── Entry animations ── */
        @keyframes navDrop {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroEntrance {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-nav  { opacity: 0; animation: navDrop     0.6s ease-out 0.1s forwards; }
        .anim-hero { opacity: 0; animation: heroEntrance 0.6s ease-out    forwards; }

        .anim-delay-0 { animation-delay: 0.00s; }
        .anim-delay-1 { animation-delay: 0.12s; }
        .anim-delay-2 { animation-delay: 0.24s; }
        .anim-delay-3 { animation-delay: 0.36s; }

        /* ── Smooth scrolling ── */
        html { scroll-behavior: smooth; }

        .ln-nav-scrolled {
          background: rgba(255, 255, 255, 0.72) !important;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        /* ── Feature card hover lift ── */
        .ln-feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .ln-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }

        /* ── CTA arrow button ── */
        .cta-arrow-btn .arrow-circle {
          transition: right 0.5s ease, transform 0.5s ease;
        }
        .cta-arrow-btn:hover .arrow-circle {
          right: calc(100% - 44px);
          transform: rotate(45deg);
        }
        .cta-arrow-btn .btn-label {
          transition: padding 0.5s ease;
        }
        .cta-arrow-btn:hover .btn-label {
          padding-left: 3.5rem;
          padding-right: 1.5rem;
        }
      `}</style>

      {/* Background grid */}
      <div className="ln-grid-bg" aria-hidden="true" />

      {/* ─────────── NAV ─────────── */}
      <header className={`ln-nav anim-nav transition-all duration-300 ${scrolled ? 'ln-nav-scrolled' : ''}`}>
        <nav className="ln-nav-inner" aria-label="Main navigation">
          {/* Brand */}
          <Link href="/" className="ln-brand" aria-label="Relay home">
            <Image
              src="/logo.svg"
              alt="Relay logo"
              width={32}
              height={32}
              className="ln-brand-logo"
              priority
              unoptimized
            />
            <span className="text-2xl font-extrabold tracking-tight font-headline">Relay</span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pradeep-10x/Relay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-surface flex items-center gap-2 px-3 py-2 text-sm rounded border border-black/10 hover:border-black/30 transition-colors duration-200 text-zinc-900"
              aria-label="View source on GitHub"
            >
              <Github size={16} aria-hidden="true" />
              Star on GitHub
            </a>

            <Link href="/auth" className="ln-btn-primary ln-btn--sm border border-black/10">
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* ─────────── MAIN ─────────── */}
      <main className="pt-28">

        {/* ── HERO ── */}
        <section className="ln-hero" aria-labelledby="hero-heading">
          <div className="ln-hero-grid relative z-10">
            <div className="ln-hero-content flex flex-col items-center text-center">

              <HeroBadge>Ship faster. Break nothing. Stay in sync.</HeroBadge>

              <h1
                id="hero-heading"
                className="anim-hero anim-delay-1 ln-hero-title w-fit mx-auto"
              >
                Project Management Platform
                <span className="block">Built for Engineering Teams.</span>
              </h1>

              <p className="anim-hero anim-delay-2 ln-hero-sub">
                Relay gives your team one place to plan, track, and ship — with the
                reliability your codebase demands.
              </p>

              <div className="anim-hero anim-delay-3 ln-hero-actions">
                <Link href="/auth" className="ln-btn-neon">
                  Get Started Free
                </Link>
                <a href="#features" className="ln-btn-protocol">
                  Explore features
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <Reveal>
          <section
            id="features"
            className="ln-section ln-section--xl"
            aria-labelledby="features-heading"
          >
            <div className="ln-features-header">
              <div className="max-w-2xl">
                <h2 id="features-heading" className="ln-heading-xl">
                  Built for How Real Teams Work.
                </h2>
                <p className="ln-text-muted text-xl leading-relaxed">
                  Every feature your team needs to stay aligned, move fast, and never
                  lose track of what matters.
                </p>
              </div>
            </div>

            <div className="ln-feature-wrap">
              {/* Decorative connectors */}
              <svg
                className="ln-feature-connectors"
                viewBox="0 0 800 750"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M 280 120 C 340 40, 460 200, 520 120"  stroke="#18181b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.15" />
                <path d="M 520 260 C 480 400, 320 340, 280 530" stroke="#18181b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.15" />
                <path d="M 280 580 C 340 660, 460 500, 520 620" stroke="#18181b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.15" />
              </svg>

              <div className="ln-feature-grid">
                {FEATURES.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── FINAL CTA ── */}
        <Reveal>
          <section className="ln-section" aria-labelledby="cta-heading">
            <div className="border border-zinc-200 rounded-lg p-20 bg-zinc-50 mx-20 shadow-sm text-center flex flex-col items-center">

            <h2 className="font-headline text-3xl md:text-5xl font-extrabold mb-4 tracking-tighter leading-[1.1]">

                Everything your team needs.Live in 60 seconds.

</h2>

<p className="text-zinc-500 text-lg mb-12 max-w-2xl text-center">

                No credit card required. No setup headaches. Just sign up and start shipping.

</p>

              <div className="ln-final-cta-actions">
                <Link
                  href="/auth"
                  className="cta-arrow-btn relative flex items-center justify-center text-sm font-bold text-white bg-black rounded-full h-12 p-1 pl-6 pr-14 w-fit overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors duration-500"
                >
                  <span className="btn-label relative z-10">Get Started</span>
                  <div
                    className="arrow-circle absolute right-1 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-sm"
                    aria-hidden="true"
                  >
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                  </div>
                </Link>
              </div>

            </div>
          </section>
        </Reveal>

      </main>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-footer-brand">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b9cacb] leading-relaxed max-w-sm">
              © {new Date().getFullYear()} Relay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Menu, X, ArrowUpRight, Command, Landmark, Globe2, Sparkles, ShoppingBag, GraduationCap, HeartPulse, Shirt, Plane, Users, HandHeart, Coins, FileText, Rocket, Handshake, ClipboardList } from 'lucide-react';
import { Wordmark, StartupLogo } from '@/components/common/Logo';
import { STARTUPS, STATS, PITCHES, FOUNDERS, OPPORTUNITIES } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { to: '/directory', label: 'Discover', hasPanel: true },
  { to: '/startups', label: 'Companies' },
  { to: '/founders', label: 'Founders' },
  { to: '/investors', label: 'Investors' },
  { to: '/funding', label: 'Funding' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/jobs', label: 'Jobs' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setPanel(false); setMobile(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (e) => { e.preventDefault(); if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); };
  const suggestions = q.trim() ? STARTUPS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())).slice(0,6) : [];

  return (
    <header className={`sticky top-0 z-50 bg-navy text-white transition-all ${scrolled ? 'header-scrolled py-0' : ''}`} data-testid="site-header">
      <div className="wrap flex items-center gap-6" style={{ height: scrolled ? 60 : 68, transition: 'height .18s' }}>
        <Wordmark variant="dark" />
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {NAV.map(link => (
            <div key={link.to} className="relative" onMouseEnter={() => link.hasPanel && setPanel(true)} onMouseLeave={() => link.hasPanel && setPanel(false)}>
              <NavLink
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={({ isActive }) => `px-3 py-2 text-[13px] tracking-tight inline-flex items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {link.label}
                {link.hasPanel && <ChevronDown className="w-3.5 h-3.5" />}
                {({}) => null}
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)} className="hidden md:inline-flex items-center gap-2 text-[12.5px] px-3 py-2 rounded-md border border-white/15 text-white/80 hover:border-white/40 hover:text-white" data-testid="search-toggle">
            <Search className="w-3.5 h-3.5" /> Search
            <span className="mono text-[10.5px] text-white/50 border border-white/15 rounded px-1 py-[1px] ml-1 inline-flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</span>
          </button>
          <button onClick={() => setSearchOpen(true)} className="md:hidden w-9 h-9 rounded-md border border-white/15 flex items-center justify-center" aria-label="Search" data-testid="search-toggle-mobile"><Search className="w-4 h-4" /></button>
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-outline-white btn-sm" data-testid="header-dashboard">{isAdmin ? 'Admin' : 'Dashboard'}</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-[12px] text-white/60 hover:text-white px-2">Sign out</button>
              </>
            ) : (
              <Link to="/sign-in" className="btn btn-outline-white btn-sm" data-testid="header-signin">Sign In</Link>
            )}
            <Link to="/submit-startup" className="btn btn-coral btn-sm" data-testid="header-submit-cta">Submit Startup <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
          <button className="lg:hidden w-9 h-9 rounded-md border border-white/15 flex items-center justify-center" onClick={() => setMobile(true)} aria-label="Menu" data-testid="mobile-menu-toggle">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Discover full-width panel */}
      <AnimatePresence>
        {panel && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full bg-navy border-t border-white/10 shadow-2xl"
            onMouseEnter={() => setPanel(true)} onMouseLeave={() => setPanel(false)}
            data-testid="mega-menu"
          >
            <div className="wrap py-8 grid grid-cols-12 gap-8">
              {/* Left categories */}
              <div className="col-span-3">
                <div className="eyebrow eyebrow-navy">Discover by</div>
                <ul className="mt-4 space-y-1">
                  {[
                    ['Companies', '/startups', Rocket],
                    ['Founders', '/founders', Users],
                    ['Investors', '/investors', Coins],
                    ['Funding', '/funding', HandHeart],
                    ['Active Pitches', '/pitches', FileText],
                    ['Jobs', '/jobs', ClipboardList],
                    ['Opportunities', '/opportunities', Sparkles],
                  ].map(([label, to, Icon]) => (
                    <li key={label}>
                      <Link to={to} className="group flex items-center justify-between py-1.5 text-[13.5px] text-white/75 hover:text-white">
                        <span className="inline-flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-white/40" /> {label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Center featured */}
              <div className="col-span-5 border-l border-white/10 pl-8">
                <div className="eyebrow eyebrow-navy">Startup of the week</div>
                <FeaturedTile startup={STARTUPS[0]} />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <MiniTile label="New round" title="ZakatFlow · Seed" href="/startups/zakatflow" />
                  <MiniTile label="Featured founder" title={FOUNDERS[3].name} href={`/founders/${FOUNDERS[3].slug}`} />
                </div>
              </div>

              {/* Right stats */}
              <div className="col-span-4 border-l border-white/10 pl-8">
                <div className="eyebrow eyebrow-navy">Ecosystem</div>
                <div className="mt-4 space-y-3">
                  {[
                    ['Companies', STATS.startups + '+'],
                    ['Founders', STATS.founders + '+'],
                    ['Investors', STATS.investors + '+'],
                    ['Countries', STATS.countries + '+'],
                    ['Tracked funding', '$85M+'],
                    ['Active pitches', STATS.pitches + '+'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[13px] text-white/70">{k}</span>
                      <span className="mono text-[13px] text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <Link to="/directory" className="btn btn-coral btn-sm">Enter atlas <ArrowUpRight className="w-3.5 h-3.5" /></Link>
                  <Link to="/about-directory" className="btn btn-outline-white btn-sm">How it works</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search command overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm flex items-start justify-center pt-20 md:pt-28"
            onClick={() => setSearchOpen(false)}
            data-testid="search-overlay"
          >
            <motion.form initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.22 }}
              onSubmit={submitSearch} onClick={e => e.stopPropagation()}
              className="w-[94vw] max-w-2xl bg-white rounded-lg overflow-hidden border border-line shadow-2xl"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-line">
                <Search className="w-4 h-4 text-slate2" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search by company, founder, investor, country, industry, or funding stage…" className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-slate2" data-testid="global-search-input" />
                <span className="mono text-[10.5px] text-slate2 border border-line rounded px-1.5 py-[1px]">ESC</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto thin-scroll">
                {suggestions.length === 0 ? (
                  <div className="p-5">
                    <div className="eyebrow mb-3">Trending searches</div>
                    <div className="flex flex-wrap gap-2">
                      {['Islamic Finance','Halal Commerce','AI & SaaS','Education','MENA Investors','Active Pitches'].map(t => (
                        <button key={t} type="button" onClick={() => { navigate(`/search?q=${encodeURIComponent(t)}`); setSearchOpen(false); }} className="filter-pill">{t}</button>
                      ))}
                    </div>
                    <div className="eyebrow mt-5 mb-3">Popular pitches</div>
                    <div className="space-y-2">
                      {PITCHES.slice(0, 3).map(p => (
                        <button type="button" key={p.id} onClick={() => { navigate(`/startups/${p.startupSlug}#pitch`); setSearchOpen(false); }} className="w-full flex items-center gap-3 p-2 rounded row-hover border border-transparent hover:border-line text-left">
                          <div className="w-8 h-8 rounded mono text-[10px] flex items-center justify-center text-white" style={{ background: STARTUPS.find(s => s.slug === p.startupSlug)?.logo?.color }}>{STARTUPS.find(s => s.slug === p.startupSlug)?.logo?.mark}</div>
                          <div className="flex-1"><div className="text-[13px]">{p.pitchTitle}</div><div className="text-[11.5px] text-slate2">Raising ${(p.requested/1_000_000).toFixed(1)}M · {p.equity}%</div></div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    {suggestions.map(s => (
                      <button key={s.slug} type="button" onClick={() => { navigate(`/startups/${s.slug}`); setSearchOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded row-hover text-left">
                        <StartupLogo startup={s} size={34} />
                        <div className="flex-1"><div className="text-[13.5px]">{s.name}</div><div className="text-[11.5px] text-slate2">{s.category} · {s.country}</div></div>
                        <span className="tag">{s.stage}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-navy text-white overflow-y-auto"
            data-testid="mobile-drawer"
          >
            <div className="wrap py-6 flex items-center justify-between">
              <Wordmark variant="dark" />
              <button onClick={() => setMobile(false)} className="w-9 h-9 rounded-md border border-white/15 flex items-center justify-center" aria-label="Close menu"><X className="w-4 h-4" /></button>
            </div>
            <div className="wrap pb-8 space-y-6">
              <button onClick={() => { setMobile(false); setSearchOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-white/15">
                <Search className="w-4 h-4" /><span className="text-[14px] text-white/70">Search the atlas</span>
              </button>
              <nav className="border-t border-white/10 pt-4">
                {NAV.map(l => (
                  <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center justify-between py-4 border-b border-white/10 font-display text-[22px] ${isActive ? 'text-coral' : 'text-white'}`} data-testid={`mobile-nav-${l.label.toLowerCase()}`}>
                    {l.label} <ArrowUpRight className="w-4 h-4 text-white/40" />
                  </NavLink>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-4">
                <Link to="/submit-startup" className="btn btn-coral justify-center">Submit Startup</Link>
                {currentUser ? (
                  <>
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-outline-white justify-center">{isAdmin ? 'Admin dashboard' : 'My dashboard'}</Link>
                    <button onClick={() => { logout(); setMobile(false); navigate('/'); }} className="btn btn-outline-white justify-center">Sign out</button>
                  </>
                ) : <Link to="/sign-in" className="btn btn-outline-white justify-center">Sign In</Link>}
              </div>
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                {[[STATS.startups+'+','Companies'],[STATS.founders+'+','Founders'],[STATS.investors+'+','Investors']].map(([v,k]) => (
                  <div key={k}><div className="mono text-[16px]">{v}</div><div className="text-[10.5px] uppercase tracking-widest text-white/50 mt-1">{k}</div></div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function FeaturedTile({ startup }) {
  return (
    <Link to={`/startups/${startup.slug}`} className="mt-4 block group">
      <div className="flex items-start gap-4">
        <StartupLogo startup={startup} size={56} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-[18px] text-white">{startup.name}</div>
          <div className="text-[12.5px] text-white/60 mt-0.5">{startup.tagline}</div>
          <div className="flex items-center gap-3 mt-3 text-[11.5px] text-white/50">
            <span>{startup.flag} {startup.country}</span>
            <span className="mono">·</span>
            <span>{startup.category}</span>
            <span className="mono">·</span>
            <span className="mono">${(startup.totalRaised/1_000_000).toFixed(1)}M raised</span>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-coral transition" />
      </div>
    </Link>
  );
}

function MiniTile({ label, title, href }) {
  return (
    <Link to={href} className="group block border border-white/10 rounded-md p-3 hover:border-white/30 transition">
      <div className="eyebrow eyebrow-navy">{label}</div>
      <div className="text-[13px] mt-1 text-white flex items-center justify-between">{title} <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition" /></div>
    </Link>
  );
}

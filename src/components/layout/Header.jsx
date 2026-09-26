import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Menu, X, ArrowUpRight, Command,
  Sparkles, Users, Coins, FileText, Rocket, ClipboardList,
} from 'lucide-react';
import CountryLabel from '@/components/common/CountryLabel';
import { Wordmark, StartupLogo, InvestorLogo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const NAV = [
  { key: 'discover', to: '/directory', label: 'Discover' },
  { key: 'companies', to: '/startups', label: 'Companies' },
  { key: 'founders', to: '/founders', label: 'Founders' },
  { key: 'investors', to: '/investors', label: 'Investors' },
  { key: 'opportunities', to: '/opportunities', label: 'Opportunities' },
  { key: 'jobs', to: '/jobs', label: 'Jobs' },
];

const isPublic = (record = {}) => {
  const status = record.status || record.reviewStatus || 'Published';
  return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive'].includes(status);
};

const getDateValue = (item = {}) => {
  const candidates = [
    item.updatedAt,
    item.createdAt,
    item.addedAt,
    item.submitted,
    item.posted,
    item.deadline,
  ];
  for (const value of candidates) {
    if (!value) continue;
    const timestamp = new Date(value).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }
  return 0;
};

const latest = (items = [], count = 5) => [...items]
  .filter(isPublic)
  .sort((a, b) => getDateValue(b) - getDateValue(a))
  .slice(0, count);

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const { data, stats } = useData();

  const companies = useMemo(() => latest(data.startups, 5), [data.startups]);
  const founders = useMemo(() => latest(data.founders, 5), [data.founders]);
  const investors = useMemo(() => latest(data.investors, 5), [data.investors]);
  const opportunities = useMemo(() => latest(data.opportunities, 5), [data.opportunities]);
  const jobs = useMemo(() => latest(data.jobs, 6), [data.jobs]);
  const pitches = useMemo(
    () => latest((data.pitches || []).filter((p) => p.reviewStatus === 'Approved' && p.visibility === 'Public'), 3),
    [data.pitches]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActivePanel(null);
    setMobile(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActivePanel(null);
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setActivePanel(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  };

  const searchSource = (data.startups || []).filter(isPublic);
  const suggestions = q.trim()
    ? searchSource.filter((s) =>
        String(s.name || '').toLowerCase().includes(q.toLowerCase()) ||
        String(s.category || '').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  const openSearch = () => {
    setActivePanel(null);
    setSearchOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-navy text-white transition-all ${scrolled ? 'header-scrolled py-0' : ''}`}
      data-testid="site-header"
      onMouseLeave={() => setActivePanel(null)}
    >
      <div className="wrap flex items-center gap-5" style={{ height: scrolled ? 60 : 68, transition: 'height .18s' }}>
        <Wordmark variant="dark" />

        <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
          {NAV.map((link) => (
            <div key={link.to} onMouseEnter={() => setActivePanel(link.key)}>
              <NavLink
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={({ isActive }) => `px-2.5 xl:px-3 py-2 text-[13px] tracking-tight inline-flex items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {link.label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activePanel === link.key ? 'rotate-180' : ''}`} />
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={openSearch} className="hidden md:inline-flex items-center gap-2 text-[12.5px] px-3 py-2 rounded-md border border-white/15 text-white/80 hover:border-white/40 hover:text-white" data-testid="search-toggle">
            <Search className="w-3.5 h-3.5" /> Search
            <span className="mono text-[10.5px] text-white/50 border border-white/15 rounded px-1 py-[1px] ml-1 inline-flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</span>
          </button>
          <button onClick={openSearch} className="md:hidden w-9 h-9 rounded-md border border-white/15 flex items-center justify-center" aria-label="Search" data-testid="search-toggle-mobile"><Search className="w-4 h-4" /></button>
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

      {/* Dynamic mega menu for every desktop navigation item */}
      <AnimatePresence mode="wait">
        {activePanel && (
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full bg-navy border-t border-white/10 shadow-2xl"
            onMouseEnter={() => setActivePanel(activePanel)}
            data-testid={`mega-menu-${activePanel}`}
          >
            <MegaMenu
              type={activePanel}
              companies={companies}
              founders={founders}
              investors={investors}
              opportunities={opportunities}
              jobs={jobs}
              pitches={pitches}
              data={data}
              stats={stats}
            />
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
              onSubmit={submitSearch} onClick={(e) => e.stopPropagation()}
              className="w-[94vw] max-w-2xl bg-white rounded-lg overflow-hidden border border-line shadow-2xl"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-line">
                <Search className="w-4 h-4 text-slate2" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by company, founder, investor, country, industry, or funding stage…" className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-slate2" data-testid="global-search-input" />
                <span className="mono text-[10.5px] text-slate2 border border-line rounded px-1.5 py-[1px]">ESC</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto thin-scroll">
                {suggestions.length === 0 ? (
                  <div className="p-5">
                    <div className="eyebrow mb-3">Trending searches</div>
                    <div className="flex flex-wrap gap-2">
                      {['Islamic Finance', 'Halal Commerce', 'AI & SaaS', 'Education', 'MENA Investors', 'Active Pitches'].map((t) => (
                        <button key={t} type="button" onClick={() => { navigate(`/search?q=${encodeURIComponent(t)}`); setSearchOpen(false); }} className="filter-pill">{t}</button>
                      ))}
                    </div>
                    <div className="eyebrow mt-5 mb-3">Popular pitches</div>
                    <div className="space-y-2">
                      {pitches.map((p) => {
                        const startup = (data.startups || []).find((s) => s.slug === p.startupSlug);
                        return (
                          <button type="button" key={p.id} onClick={() => { navigate(`/startups/${p.startupSlug}#pitch`); setSearchOpen(false); }} className="w-full flex items-center gap-3 p-2 rounded row-hover border border-transparent hover:border-line text-left">
                            <StartupLogo startup={startup || { name: p.pitchTitle }} size={32} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] truncate">{p.pitchTitle}</div>
                              <div className="text-[11.5px] text-slate2">Raising {formatMoney(p.requested)}{p.equity ? ` · ${p.equity}%` : ''}</div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate2" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    {suggestions.map((s) => (
                      <button key={s.slug} type="button" onClick={() => { navigate(`/startups/${s.slug}`); setSearchOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded row-hover text-left">
                        <StartupLogo startup={s} size={34} />
                        <div className="flex-1"><div className="text-[13.5px]">{s.name}</div><div className="text-[11.5px] text-slate2">{s.category} · <CountryLabel country={s.country} explicitFlag={s.flag} /></div></div>
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
              <button onClick={() => { setMobile(false); openSearch(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-white/15">
                <Search className="w-4 h-4" /><span className="text-[14px] text-white/70">Search the atlas</span>
              </button>
              <nav className="border-t border-white/10 pt-4">
                {NAV.map((l) => (
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
                {[[stats.startups, 'Companies'], [stats.founders, 'Founders'], [stats.investors, 'Investors']].map(([v, k]) => (
                  <div key={k}><div className="mono text-[16px]">{v}+</div><div className="text-[10.5px] uppercase tracking-widest text-white/50 mt-1">{k}</div></div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MegaMenu({ type, companies, founders, investors, opportunities, jobs, pitches, data, stats }) {
  if (type === 'discover') {
    return (
      <MegaShell>
        <div className="col-span-3">
          <PanelLabel>Explore</PanelLabel>
          <div className="mt-4 space-y-1">
            <QuickLink to="/startups" icon={Rocket}>Companies</QuickLink>
            <QuickLink to="/founders" icon={Users}>Founders</QuickLink>
            <QuickLink to="/investors" icon={Coins}>Investors</QuickLink>
            <QuickLink to="/pitches" icon={FileText}>Active Pitches</QuickLink>
            <QuickLink to="/opportunities" icon={Sparkles}>Opportunities</QuickLink>
            <QuickLink to="/jobs" icon={ClipboardList}>Jobs</QuickLink>
          </div>
        </div>
        <div className="col-span-5 border-l border-white/10 pl-8">
          <PanelLabel>Latest in the ecosystem</PanelLabel>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {companies.slice(0, 2).map((company) => (
              <CompactCompany key={company.slug} company={company} />
            ))}
            {opportunities.slice(0, 2).map((item) => (
              <MiniTile key={item.id} label={item.type || 'Opportunity'} title={item.title} href={`/opportunities/${encodeURIComponent(item.id)}`} />
            ))}
          </div>
        </div>
        <div className="col-span-4 border-l border-white/10 pl-8">
          <PanelLabel>Live directory</PanelLabel>
          <div className="mt-4 space-y-3">
            <StatRow label="Companies" value={stats.startups} />
            <StatRow label="Founders" value={stats.founders} />
            <StatRow label="Investors" value={stats.investors} />
            <StatRow label="Opportunities" value={stats.opportunities} />
            <StatRow label="Jobs" value={stats.jobs} />
            <StatRow label="Active pitches" value={pitches.length ? (data.pitches || []).filter((p) => p.reviewStatus === 'Approved' && p.visibility === 'Public').length : 0} />
          </div>
          <Link to="/directory" className="btn btn-coral btn-sm mt-5">Open directory <ArrowUpRight className="w-3.5 h-3.5" /></Link>
        </div>
      </MegaShell>
    );
  }

  if (type === 'companies') {
    return (
      <MegaShell>
        <div className="col-span-3">
          <PanelIntro eyebrow="Companies" title="Latest companies" text="Recently added and updated companies from the live directory." to="/startups" button="View all companies" />
        </div>
        <div className="col-span-6 border-l border-white/10 pl-8">
          <PanelLabel>Recently added</PanelLabel>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {companies.slice(0, 4).map((company) => <CompanyTile key={company.slug} company={company} />)}
          </div>
        </div>
        <div className="col-span-3 border-l border-white/10 pl-8">
          <PanelLabel>Quick view</PanelLabel>
          <div className="mt-4 space-y-3">
            <StatRow label="Total companies" value={stats.startups} />
            <StatRow label="Open jobs" value={stats.jobs} />
            <StatRow label="Active pitches" value={(data.pitches || []).filter((p) => p.reviewStatus === 'Approved' && p.visibility === 'Public').length} />
          </div>
          <Link to="/submit-startup" className="btn btn-outline-white btn-sm mt-5">Submit a company</Link>
        </div>
      </MegaShell>
    );
  }

  if (type === 'founders') {
    return (
      <MegaShell>
        <div className="col-span-3">
          <PanelIntro eyebrow="Founders" title="Meet the builders" text="Latest founder profiles published in the Startup Muslim ecosystem." to="/founders" button="View all founders" />
        </div>
        <div className="col-span-9 border-l border-white/10 pl-8">
          <PanelLabel>Latest founders</PanelLabel>
          <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
            {founders.slice(0, 5).map((founder) => <FounderTile key={founder.slug} founder={founder} />)}
          </div>
        </div>
      </MegaShell>
    );
  }

  if (type === 'investors') {
    return (
      <MegaShell>
        <div className="col-span-3">
          <PanelIntro eyebrow="Investors" title="Investor network" text="Latest investor profiles and capital partners in the directory." to="/investors" button="View all investors" />
        </div>
        <div className="col-span-6 border-l border-white/10 pl-8">
          <PanelLabel>Latest investors</PanelLabel>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {investors.slice(0, 4).map((investor) => <InvestorTile key={investor.slug} investor={investor} />)}
          </div>
        </div>
        <div className="col-span-3 border-l border-white/10 pl-8">
          <PanelLabel>Network</PanelLabel>
          <div className="mt-4 space-y-3">
            <StatRow label="Investors" value={stats.investors} />
            <StatRow label="Companies" value={stats.startups} />
            <StatRow label="Public pitches" value={(data.pitches || []).filter((p) => p.reviewStatus === 'Approved' && p.visibility === 'Public').length} />
          </div>
          <Link to="/pitches" className="btn btn-outline-white btn-sm mt-5">Browse pitches</Link>
        </div>
      </MegaShell>
    );
  }

  if (type === 'opportunities') {
    return (
      <MegaShell>
        <div className="col-span-3">
          <PanelIntro eyebrow="Opportunities" title="What is open now" text="Latest grants, accelerators, competitions, fellowships, and founder programs." to="/opportunities" button="View all opportunities" />
        </div>
        <div className="col-span-9 border-l border-white/10 pl-8">
          <PanelLabel>Latest opportunities</PanelLabel>
          <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
            {opportunities.slice(0, 5).map((item) => <OpportunityTile key={item.id} item={item} />)}
          </div>
        </div>
      </MegaShell>
    );
  }

  return (
    <MegaShell>
      <div className="col-span-3">
        <PanelIntro eyebrow="Jobs" title="Latest openings" text="Fresh roles from companies listed across the Startup Muslim ecosystem." to="/jobs" button="View all jobs" />
      </div>
      <div className="col-span-9 border-l border-white/10 pl-8">
        <PanelLabel>Recently posted</PanelLabel>
        <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
          {jobs.slice(0, 6).map((job) => {
            const company = (data.startups || []).find((s) => s.slug === job.startupSlug);
            return <JobTile key={job.id} job={job} company={company} />;
          })}
        </div>
      </div>
    </MegaShell>
  );
}

function MegaShell({ children }) {
  return <div className="wrap py-7 grid grid-cols-12 gap-8">{children}</div>;
}

function PanelLabel({ children }) {
  return <div className="eyebrow eyebrow-navy">{children}</div>;
}

function PanelIntro({ eyebrow, title, text, to, button }) {
  return (
    <div>
      <PanelLabel>{eyebrow}</PanelLabel>
      <h3 className="font-display text-[24px] leading-tight mt-3 text-white">{title}</h3>
      <p className="text-[12.5px] leading-5 text-white/55 mt-2">{text}</p>
      <Link to={to} className="btn btn-coral btn-sm mt-5">{button} <ArrowUpRight className="w-3.5 h-3.5" /></Link>
    </div>
  );
}

function QuickLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="group flex items-center justify-between py-1.5 text-[13.5px] text-white/75 hover:text-white">
      <span className="inline-flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-white/40" /> {children}</span>
      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
    </Link>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <span className="text-[13px] text-white/65">{label}</span>
      <span className="mono text-[13px] text-white">{value ?? 0}</span>
    </div>
  );
}

function CompactCompany({ company }) {
  return (
    <Link to={`/startups/${company.slug}`} className="group border border-white/10 rounded-md p-3 hover:border-white/30 transition">
      <div className="flex items-center gap-3">
        <StartupLogo startup={company} size={36} rounded={7} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-white truncate">{company.name}</div>
          <div className="text-[11px] text-white/45 truncate">{company.category} · <CountryLabel country={company.country} explicitFlag={company.flag} /></div>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/35 group-hover:text-white" />
      </div>
    </Link>
  );
}

function CompanyTile({ company }) {
  return (
    <Link to={`/startups/${company.slug}`} className="group border border-white/10 rounded-md p-3.5 hover:border-white/30 transition min-w-0">
      <div className="flex items-start gap-3">
        <StartupLogo startup={company} size={42} rounded={8} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-[15px] text-white truncate">{company.name}</div>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/35 group-hover:text-white shrink-0" />
          </div>
          <div className="text-[11.5px] text-white/50 mt-1 truncate">{company.tagline || company.category}</div>
          <div className="text-[10.5px] text-white/40 mt-2"><CountryLabel country={company.country} explicitFlag={company.flag} />{company.stage ? ` · ${company.stage}` : ''}</div>
        </div>
      </div>
    </Link>
  );
}

function FounderTile({ founder }) {
  return (
    <Link to={`/founders/${founder.slug}`} className="group border border-white/10 rounded-md p-3 hover:border-white/30 transition min-w-0">
      <div className="flex items-center gap-3">
        {founder.photo ? (
          <img src={founder.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-white/60" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] text-white truncate">{founder.name}</div>
          <div className="text-[11px] text-white/45 truncate">{founder.role || founder.industry}</div>
          <div className="text-[10.5px] text-white/35 truncate mt-0.5"><CountryLabel country={founder.country} explicitFlag={founder.flag} /></div>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white shrink-0" />
      </div>
    </Link>
  );
}

function InvestorTile({ investor }) {
  return (
    <Link to={`/investors/${investor.slug}`} className="group border border-white/10 rounded-md p-3.5 hover:border-white/30 transition min-w-0">
      <div className="flex items-start gap-3">
        <InvestorLogo investor={investor} size={40} rounded={8} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13.5px] text-white truncate">{investor.name}</div>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white shrink-0" />
          </div>
          <div className="text-[11px] text-white/45 truncate mt-1">{investor.type || investor.focus || 'Investor'}</div>
          <div className="text-[10.5px] text-white/35 truncate mt-1"><CountryLabel country={investor.country} explicitFlag={investor.flag} /></div>
        </div>
      </div>
    </Link>
  );
}

function OpportunityTile({ item }) {
  return (
    <Link to={`/opportunities/${encodeURIComponent(item.id)}`} className="group border border-white/10 rounded-md p-3 hover:border-white/30 transition min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] text-coral">{item.type || 'Opportunity'}</div>
          <div className="text-[13px] text-white mt-1 truncate">{item.title}</div>
          <div className="text-[11px] text-white/45 mt-1 truncate">{item.organization}{item.country ? <> · <CountryLabel country={item.country} explicitFlag={item.flag} /></> : ''}</div>
          {item.deadline && <div className="mono text-[10px] text-white/35 mt-2">Deadline {formatShortDate(item.deadline)}</div>}
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white shrink-0" />
      </div>
    </Link>
  );
}

function JobTile({ job, company }) {
  return (
    <Link to="/jobs" className="group border border-white/10 rounded-md p-3 hover:border-white/30 transition min-w-0">
      <div className="flex items-start gap-3">
        <StartupLogo startup={company || { name: job.title }} size={36} rounded={7} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-white truncate">{job.title}</div>
          <div className="text-[11px] text-white/45 truncate mt-0.5">{company?.name || 'Startup Muslim company'}</div>
          <div className="text-[10.5px] text-white/35 truncate mt-1">{job.location}{job.type ? ` · ${job.type}` : ''}</div>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white shrink-0" />
      </div>
    </Link>
  );
}

function MiniTile({ label, title, href }) {
  return (
    <Link to={href} className="group block border border-white/10 rounded-md p-3 hover:border-white/30 transition min-w-0">
      <div className="eyebrow eyebrow-navy">{label}</div>
      <div className="text-[13px] mt-1 text-white flex items-center justify-between gap-2">
        <span className="truncate">{title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition shrink-0" />
      </div>
    </Link>
  );
}

function formatShortDate(value) {
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return value;
  }
}

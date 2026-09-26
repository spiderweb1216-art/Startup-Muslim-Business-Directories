import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, Command, ArrowRight, MapPin, Sparkles, Database, RefreshCw } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { canonicalCountry, countryLabel, projectCountry } from '@/lib/countryAtlas';

function isPublishedCompany(company = {}) {
  return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive', 'Revoked', 'Cancelled'].includes(company.status || 'Published');
}

function formatCompactMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `$${Math.round(amount / 1_000_000_000)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount}`;
}

// Editorial full-width hero with a live backend-driven SVG world map.
export default function Hero() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All');
  const nav = useNavigate();
  const { data, stats, databaseStatus, refreshData } = useData();

  const publishedCompanies = useMemo(
    () => (data.startups || []).filter(isPublishedCompany),
    [data.startups]
  );

  const countryCount = useMemo(
    () => new Set(publishedCompanies.map((company) => canonicalCountry(company.country)).filter(Boolean)).size,
    [publishedCompanies]
  );

  // Keep the home atlas synced for visitors in other tabs/browsers as backend data changes.
  useEffect(() => {
    if (databaseStatus !== 'connected') return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') refreshData().catch(() => {});
    };
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, [databaseStatus, refreshData]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const live = databaseStatus === 'connected';

  return (
    <section className="relative bg-canvas overflow-hidden" data-testid="hero-section">
      <div className="wrap pt-14 md:pt-20 pb-10 md:pb-14 relative">
        {/* Top row */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="eyebrow">— Global Muslim Startup Intelligence</div>
          <div className="hidden md:flex items-center gap-2 mono text-[11px] text-slate2">
            <span className="inline-flex items-center gap-1">
              {live ? <Sparkles className="w-3 h-3 text-coral" /> : <RefreshCw className="w-3 h-3 text-slate2" />}
              {live ? 'Live database' : databaseStatus === 'checking' ? 'Connecting to database' : 'Database offline'}
            </span>
            <span className="mono">·</span>
            <span>Startup Muslim Atlas</span>
          </div>
        </div>

        {/* Headline + Map side by side */}
        <div className="grid grid-cols-12 gap-8 md:gap-10 items-end mt-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="display-h col-span-12 lg:col-span-8 text-[42px] md:text-[62px] lg:text-[80px] text-ink"
          >
            Find the people and companies building the <span className="italic font-normal text-coral">next Muslim economy</span>.
          </motion.h1>
          <div className="col-span-12 lg:col-span-4 lg:pb-2">
            <p className="text-[15.5px] text-slate2 leading-relaxed max-w-md">
              Research startups, founders, investors, funding rounds, jobs, active pitches, and opportunities across the global Muslim ecosystem.
            </p>
          </div>
        </div>

        {/* Atlas visualization — driven only by backend company records */}
        <div className="mt-12 md:mt-14 relative">
          <div className="panel-flat pt-6">
            <AtlasMap
              companies={publishedCompanies}
              databaseStatus={databaseStatus}
              onRefresh={() => refreshData().catch(() => {})}
            />
          </div>
        </div>

        {/* Search command panel */}
        <motion.form
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={submit}
          className="mt-8 md:mt-10 border border-line bg-white rounded-lg overflow-hidden shadow-[0_2px_0_#DED5C4]"
          data-testid="hero-search-form"
        >
          <div className="flex items-stretch">
            <div className="hidden md:flex items-center gap-2 border-r border-line px-4">
              <select value={kind} onChange={e => setKind(e.target.value)} className="bg-transparent outline-none text-[13px] py-3 pr-2 mono">
                {['All','Companies','Founders','Investors','Pitches','Opportunities'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-4 h-4 text-slate2" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by company, founder, investor, country, industry, or funding stage…" className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-slate2" data-testid="hero-search-input" />
              <span className="hidden md:inline-flex mono text-[11px] text-slate2 border border-line rounded px-1.5 py-[1px] items-center gap-1"><Command className="w-3 h-3" /> K</span>
            </div>
            <button className="btn btn-coral rounded-none px-6" data-testid="hero-search-submit">Search <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="hr" />
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="eyebrow">Popular</span>
            {['Islamic Finance','Halal Commerce','AI & SaaS','Education','MENA Investors','Active Pitches'].map(t => (
              <button key={t} type="button" onClick={() => nav(`/search?q=${encodeURIComponent(t)}`)} className="filter-pill" data-testid={`hero-suggestion-${t}`}>{t}</button>
            ))}
          </div>
        </motion.form>

        {/* Data strip — also uses backend values once connected */}
        <div className="mt-8 border-t border-line pt-6 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            [live ? `${publishedCompanies.length}` : '—', 'Companies'],
            [live ? `${countryCount}` : '—', 'Countries'],
            [live ? `${stats.investors || 0}` : '—', 'Investors'],
            [live ? formatCompactMoney(stats.funding || 0) : '—', 'Tracked funding'],
            [live ? `${stats.pitches || 0}` : '—', 'Active pitches'],
          ].map(([v, k], i) => (
            <div key={k} className={`flex flex-col ${i > 0 ? 'md:border-l md:border-line md:pl-6' : ''}`}>
              <CountUp value={v} />
              <span className="eyebrow mt-1">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(typeof value === 'string' && /^\d/.test(value) ? '0' : value);
  useEffect(() => {
    if (!inView) return;
    const match = typeof value === 'string' ? value.match(/^(\$)?(\d+)([A-Za-z\+]*)$/) : null;
    if (!match) { setDisplay(value); return; }
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr, 10);
    let raf;
    const start = performance.now();
    const dur = 1200;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(`${prefix || ''}${Math.round(target * eased)}${suffix || ''}`);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref} className="mono text-[24px] md:text-[30px] text-ink">{display}</span>;
}

function AtlasMap({ companies, databaseStatus, onRefresh }) {
  const countries = useMemo(() => {
    const grouped = new Map();
    companies.forEach((company) => {
      const country = canonicalCountry(company.country);
      if (!country) return;
      const current = grouped.get(country) || { name: country, companies: 0 };
      current.companies += 1;
      grouped.set(country, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.companies - a.companies || a.name.localeCompare(b.name));
  }, [companies]);

  const mappedCountries = useMemo(
    () => countries
      .map((country) => ({ ...country, point: projectCountry(country.name) }))
      .filter((country) => country.point),
    [countries]
  );

  const maxCompanies = Math.max(1, ...countries.map((country) => country.companies));
  const hub = mappedCountries[0];
  const connections = hub ? mappedCountries.slice(1, 8).map((country) => [hub, country]) : [];

  if (databaseStatus !== 'connected') {
    return (
      <div className="min-h-[320px] md:min-h-[390px] flex items-center justify-center px-6 pb-6">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-sand mx-auto flex items-center justify-center">
            <Database className="w-5 h-5 text-slate2" />
          </div>
          <div className="font-display text-[22px] text-ink mt-4">
            {databaseStatus === 'checking' ? 'Loading live company locations…' : 'Live map data is unavailable'}
          </div>
          <p className="text-[13px] text-slate2 mt-2 leading-relaxed">
            {databaseStatus === 'checking'
              ? 'The atlas is waiting for the backend company data.'
              : 'The atlas will not show dummy countries. Start MySQL/backend and reconnect to load company countries.'}
          </p>
          {databaseStatus === 'error' && (
            <button type="button" onClick={onRefresh} className="btn btn-outline btn-sm mt-4">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 1000 320" className="w-full h-[280px] md:h-[360px]" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Live company atlas showing ${countries.length} countries`}>
        <defs>
          <pattern id="grid-live" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DED5C4" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="conn-live" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D94B3D" stopOpacity="0" />
            <stop offset="50%" stopColor="#D94B3D" stopOpacity=".55" />
            <stop offset="100%" stopColor="#D94B3D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="320" fill="url(#grid-live)" />

        {/* Simplified continent silhouettes. Country nodes/counts below are live backend data. */}
        <g fill="#E8E0D2" stroke="#DED5C4" strokeWidth="1">
          <path d="M120 60 Q 160 40 220 65 Q 300 85 290 160 Q 260 220 200 210 Q 140 200 130 170 Q 100 130 120 60 Z" />
          <path d="M260 210 Q 310 220 320 260 Q 300 300 270 300 Q 245 275 260 210 Z" />
          <path d="M440 70 Q 500 55 540 80 Q 555 110 520 130 Q 470 140 440 120 Q 420 95 440 70 Z" />
          <path d="M470 130 Q 540 130 560 200 Q 545 270 500 275 Q 465 265 460 200 Q 460 165 470 130 Z" />
          <path d="M560 130 Q 620 125 650 155 Q 645 180 615 185 Q 570 180 555 155 Z" />
          <path d="M650 130 Q 720 125 760 165 Q 740 200 690 200 Q 655 190 650 160 Z" />
          <path d="M760 165 Q 820 170 830 210 Q 800 240 770 230 Q 750 205 760 165 Z" />
          <path d="M840 240 Q 900 235 910 275 Q 890 300 850 295 Q 830 270 840 240 Z" />
        </g>

        {connections.map(([a, b]) => {
          const midX = (a.point.x + b.point.x) / 2;
          const midY = Math.min(a.point.y, b.point.y) - 24;
          return (
            <motion.path
              key={`${a.name}-${b.name}`}
              d={`M ${a.point.x} ${a.point.y} Q ${midX} ${midY} ${b.point.x} ${b.point.y}`}
              stroke="url(#conn-live)"
              strokeWidth="1.15"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1 }}
            />
          );
        })}

        {mappedCountries.map((country, index) => {
          const ratio = country.companies / maxCompanies;
          const radius = 3.5 + (ratio * 5.5);
          const prominent = index < 3;
          const showLabel = index < 10;
          return (
            <g key={country.name}>
              <title>{`${country.name}: ${country.companies} ${country.companies === 1 ? 'company' : 'companies'}`}</title>
              <motion.circle
                cx={country.point.x}
                cy={country.point.y}
                r={radius}
                fill={prominent ? '#D94B3D' : '#111827'}
                stroke="#F3F0E8"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.025, duration: 0.3, type: 'spring', stiffness: 200 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {prominent && (
                <motion.circle
                  cx={country.point.x}
                  cy={country.point.y}
                  r={radius + 8}
                  fill="none"
                  stroke="#D94B3D"
                  strokeWidth="1"
                  initial={{ opacity: 0.55, scale: 0.75 }}
                  animate={{ opacity: 0, scale: 1.35 }}
                  transition={{ duration: 2.1, repeat: Infinity, delay: index * 0.25 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              {showLabel && (
                <text x={country.point.x + radius + 5} y={country.point.y + 3} fontSize="8.3" fontFamily="IBM Plex Mono" fill="#667085">
                  {`${countryLabel(country.name).toUpperCase()} · ${country.companies}`}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-2 left-2 eyebrow flex items-center gap-1">
        <MapPin className="w-3 h-3 text-coral" /> Live company atlas
      </div>
      <div className="absolute top-2 right-2 mono text-[10.5px] text-emerald flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" /> Backend connected
      </div>

      {countries.length > 0 ? (
        <div className="border-t border-line px-3 md:px-5 py-4 flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-1">Countries from companies</span>
          {countries.slice(0, 10).map((country) => (
            <span key={country.name} className="tag bg-white border border-line">
              {countryLabel(country.name)} <span className="mono text-slate2 ml-1">{country.companies}</span>
            </span>
          ))}
          {countries.length > 10 && <span className="mono text-[11px] text-slate2">+{countries.length - 10} more</span>}
          <span className="ml-auto mono text-[10.5px] text-slate2">
            {companies.length} companies · {countries.length} countries · refreshes every 15s
          </span>
        </div>
      ) : (
        <div className="border-t border-line px-5 py-5 text-[13px] text-slate2">
          No published companies with a country are currently available in the backend.
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, Command, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { STATS, STARTUPS } from '@/data/mockData';
import { useRef, useEffect } from 'react';

// Editorial full-width hero with SVG world map ecosystem visualization
export default function Hero() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All');
  const nav = useNavigate();
  const submit = (e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <section className="relative bg-canvas overflow-hidden" data-testid="hero-section">
      <div className="wrap pt-14 md:pt-20 pb-10 md:pb-14 relative">
        {/* Top row */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="eyebrow">— Global Muslim Startup Intelligence</div>
          <div className="hidden md:flex items-center gap-2 mono text-[11px] text-slate2">
            <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-coral" /> Live</span>
            <span className="mono">·</span>
            <span>Winter 2026 Atlas</span>
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

        {/* Atlas visualization — full width horizontal band */}
        <div className="mt-12 md:mt-14 relative">
          <div className="panel-flat pt-6">
            <AtlasMap />
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

        {/* Data strip */}
        <div className="mt-8 border-t border-line pt-6 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            [STATS.startups + '+', 'Companies'],
            [STATS.countries + '', 'Countries'],
            [STATS.investors + '', 'Investors'],
            ['$85M+', 'Tracked funding'],
            [STATS.pitches + '', 'Active pitches'],
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
    let raf; const start = performance.now(); const dur = 1200;
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

// Atlas map: SVG horizontal band, subtle continents, curved connection lines, nodes at cities
function AtlasMap() {
  // City nodes with pseudo-lat/lng mapped to SVG coordinates
  const nodes = [
    { name:'London', x: 470, y: 90, big: true },
    { name:'Paris', x: 480, y: 100 },
    { name:'Istanbul', x: 560, y: 118 },
    { name:'Dubai', x: 620, y: 148 },
    { name:'Riyadh', x: 605, y: 158 },
    { name:'Cairo', x: 555, y: 145 },
    { name:'Lagos', x: 495, y: 195 },
    { name:'Karachi', x: 680, y: 148 },
    { name:'Jakarta', x: 800, y: 210 },
    { name:'Kuala Lumpur', x: 800, y: 195 },
    { name:'Toronto', x: 210, y: 100 },
    { name:'New York', x: 245, y: 115, big: true },
    { name:'Chicago', x: 210, y: 118 },
    { name:'Sydney', x: 880, y: 265 },
  ];
  const connections = [
    [0,3],[0,2],[3,7],[3,4],[3,8],[2,5],[11,3],[8,9],[6,4],[10,11],[13,8],[0,11]
  ];
  return (
    <div className="relative">
      <svg viewBox="0 0 1000 320" className="w-full h-[280px] md:h-[360px]" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DED5C4" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D94B3D" stopOpacity="0" />
            <stop offset="50%" stopColor="#D94B3D" stopOpacity=".6" />
            <stop offset="100%" stopColor="#D94B3D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="320" fill="url(#grid)" />
        {/* Continents — simplified silhouettes */}
        <g fill="#E8E0D2" stroke="#DED5C4" strokeWidth="1">
          {/* North America */}
          <path d="M120 60 Q 160 40 220 65 Q 300 85 290 160 Q 260 220 200 210 Q 140 200 130 170 Q 100 130 120 60 Z" />
          {/* South America */}
          <path d="M260 210 Q 310 220 320 260 Q 300 300 270 300 Q 245 275 260 210 Z" />
          {/* Europe */}
          <path d="M440 70 Q 500 55 540 80 Q 555 110 520 130 Q 470 140 440 120 Q 420 95 440 70 Z" />
          {/* Africa */}
          <path d="M470 130 Q 540 130 560 200 Q 545 270 500 275 Q 465 265 460 200 Q 460 165 470 130 Z" />
          {/* Middle East / West Asia */}
          <path d="M560 130 Q 620 125 650 155 Q 645 180 615 185 Q 570 180 555 155 Z" />
          {/* Central + South Asia */}
          <path d="M650 130 Q 720 125 760 165 Q 740 200 690 200 Q 655 190 650 160 Z" />
          {/* Southeast Asia */}
          <path d="M760 165 Q 820 170 830 210 Q 800 240 770 230 Q 750 205 760 165 Z" />
          {/* Australia */}
          <path d="M840 240 Q 900 235 910 275 Q 890 300 850 295 Q 830 270 840 240 Z" />
        </g>

        {/* Connection curves */}
        {connections.map(([a,b], i) => {
          const A = nodes[a], B = nodes[b];
          const midX = (A.x + B.x)/2, midY = Math.min(A.y, B.y) - 30;
          return (
            <motion.path
              key={i}
              d={`M ${A.x} ${A.y} Q ${midX} ${midY} ${B.x} ${B.y}`}
              stroke="url(#conn)" strokeWidth="1.2" fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.3 + i*0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={n.name}>
            <motion.circle
              cx={n.x} cy={n.y} r={n.big ? 5 : 3.5}
              fill={n.big ? '#D94B3D' : '#111827'}
              stroke="#F3F0E8" strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i*0.04, duration: 0.35, type: 'spring', stiffness: 200 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            {n.big && (
              <motion.circle cx={n.x} cy={n.y} r={12} fill="none" stroke="#D94B3D" strokeWidth="1" opacity="0.4"
                initial={{ r: 5, opacity: 0.6 }} animate={{ r: 14, opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 + i*0.1 }} />
            )}
            <text x={n.x + 8} y={n.y + 3} fontSize="8.5" fontFamily="IBM Plex Mono" fill="#667085">{n.name.toUpperCase()}</text>
          </g>
        ))}
      </svg>
      {/* Corner labels */}
      <div className="absolute top-2 left-2 eyebrow flex items-center gap-1"><MapPin className="w-3 h-3 text-coral" /> Ecosystem atlas</div>
      <div className="absolute bottom-2 right-2 mono text-[10.5px] text-slate2">14 hubs · 75 countries</div>
    </div>
  );
}

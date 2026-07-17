import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ArrowUpRight, Building2, Users2, Coins, FileText, HandHeart, Briefcase } from 'lucide-react';
import { STARTUPS, FOUNDERS, INVESTORS, PITCHES, OPPORTUNITIES, JOBS } from '@/data/mockData';
import { StartupLogo, InvestorLogo } from '@/components/common/Logo';
import { EmptyState } from '@/components/common/Section';

const TABS = [
  { id:'all', label:'All' },
  { id:'startups', label:'Startups' },
  { id:'founders', label:'Founders' },
  { id:'investors', label:'Investors' },
  { id:'pitches', label:'Pitches' },
  { id:'opportunities', label:'Opportunities' },
  { id:'jobs', label:'Jobs' },
];

const RECENT_KEY = 'sm_recent_searches_v1';

function highlight(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="bg-coralSoft text-coralDark rounded px-0.5">{text.slice(idx, idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
}

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [tab, setTab] = useState('all');
  const [recent, setRecent] = useState([]);

  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')); } catch {} }, []);
  useEffect(() => {
    if (q.trim()) {
      const nxt = [q, ...recent.filter(x => x !== q)].slice(0, 6);
      setRecent(nxt);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(nxt)); } catch{}
      setSp({ q });
    }
    // eslint-disable-next-line
  }, [q]);

  const t = q.toLowerCase();
  const R = useMemo(() => ({
    startups: STARTUPS.filter(s => !t || s.name.toLowerCase().includes(t) || s.tagline.toLowerCase().includes(t) || s.category.toLowerCase().includes(t) || s.country.toLowerCase().includes(t)),
    founders: FOUNDERS.filter(f => !t || f.name.toLowerCase().includes(t) || f.bio.toLowerCase().includes(t) || f.industry.toLowerCase().includes(t) || f.country.toLowerCase().includes(t)),
    investors: INVESTORS.filter(i => !t || i.name.toLowerCase().includes(t) || i.type.toLowerCase().includes(t) || i.focus.join(' ').toLowerCase().includes(t)),
    pitches: PITCHES.filter(p => !t || p.pitchTitle.toLowerCase().includes(t) || p.summary.toLowerCase().includes(t)),
    opportunities: OPPORTUNITIES.filter(o => !t || o.title.toLowerCase().includes(t) || o.description.toLowerCase().includes(t)),
    jobs: JOBS.filter(j => !t || j.title.toLowerCase().includes(t)),
  }), [t]);

  const counts = { all: Object.values(R).reduce((s, l) => s + l.length, 0), ...Object.fromEntries(Object.entries(R).map(([k,v]) => [k, v.length])) };
  const active = tab === 'all' ? R : { [tab]: R[tab] };

  return (
    <div className="wrap pt-10 pb-24" data-testid="search-page">
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search startups, founders, investors, categories, or countries…" className="w-full bg-white border border-line rounded-full pl-11 pr-4 py-3 text-[15px] outline-none focus:border-ink" data-testid="search-input" />
      </div>

      {recent.length > 0 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] text-slate2 mr-2">Recent:</span>
          {recent.map(r => <button key={r} onClick={() => setQ(r)} className="chip">{r}</button>)}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {TABS.map(tt => (
          <button key={tt.id} onClick={() => setTab(tt.id)} className={`px-3 py-1.5 rounded-full text-[13px] ${tab === tt.id ? 'bg-ink text-white' : 'text-slate2 hover:text-ink'}`} data-testid={`search-tab-${tt.id}`}>
            {tt.label} <span className="opacity-60">({counts[tt.id]})</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {counts.all === 0 && <EmptyState title="No results" description={`We couldn’t find anything for “${q}”. Try a different keyword.`} />}
        {active.startups && active.startups.length > 0 && (
          <SearchGroup title="Startups" icon={Building2}>
            {active.startups.map(s => (
              <Link key={s.slug} to={`/startups/${s.slug}`} className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white hover:border-coral/30">
                <StartupLogo startup={s} />
                <div className="flex-1"><div className="font-medium">{highlight(s.name, q)}</div><div className="text-[12.5px] text-slate2">{highlight(s.tagline, q)}</div></div>
                <ArrowUpRight className="w-4 h-4 text-slate2" />
              </Link>
            ))}
          </SearchGroup>
        )}
        {active.founders && active.founders.length > 0 && (
          <SearchGroup title="Founders" icon={Users2}>
            {active.founders.map(f => (
              <Link key={f.slug} to={`/founders/${f.slug}`} className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white hover:border-coral/30">
                <img src={f.photo} alt="" className="w-11 h-11 rounded-full object-cover" />
                <div className="flex-1"><div className="font-medium">{highlight(f.name, q)}</div><div className="text-[12.5px] text-slate2">{highlight(f.bio, q)}</div></div>
                <ArrowUpRight className="w-4 h-4 text-slate2" />
              </Link>
            ))}
          </SearchGroup>
        )}
        {active.investors && active.investors.length > 0 && (
          <SearchGroup title="Investors" icon={Coins}>
            {active.investors.map(i => (
              <Link key={i.slug} to={`/investors/${i.slug}`} className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white hover:border-coral/30">
                <InvestorLogo investor={i} />
                <div className="flex-1"><div className="font-medium">{highlight(i.name, q)}</div><div className="text-[12.5px] text-slate2">{i.type} · {i.country}</div></div>
                <ArrowUpRight className="w-4 h-4 text-slate2" />
              </Link>
            ))}
          </SearchGroup>
        )}
        {active.pitches && active.pitches.length > 0 && (
          <SearchGroup title="Pitches" icon={FileText}>
            {active.pitches.map(p => (
              <Link key={p.id} to={`/startups/${p.startupSlug}#pitch`} className="p-3 rounded-xl border border-line bg-white hover:border-coral/30 block">
                <div className="font-medium">{highlight(p.pitchTitle, q)}</div><div className="text-[12.5px] text-slate2">{highlight(p.summary, q)}</div>
              </Link>
            ))}
          </SearchGroup>
        )}
        {active.opportunities && active.opportunities.length > 0 && (
          <SearchGroup title="Opportunities" icon={HandHeart}>
            {active.opportunities.map(o => (
              <Link key={o.id} to="/opportunities" className="p-3 rounded-xl border border-line bg-white hover:border-coral/30 block">
                <div className="font-medium">{highlight(o.title, q)}</div><div className="text-[12.5px] text-slate2">{o.organization} · {o.country}</div>
              </Link>
            ))}
          </SearchGroup>
        )}
        {active.jobs && active.jobs.length > 0 && (
          <SearchGroup title="Jobs" icon={Briefcase}>
            {active.jobs.map(j => (
              <Link key={j.id} to="/jobs" className="p-3 rounded-xl border border-line bg-white hover:border-coral/30 block">
                <div className="font-medium">{highlight(j.title, q)}</div><div className="text-[12.5px] text-slate2">{j.arrangement} · {j.location}</div>
              </Link>
            ))}
          </SearchGroup>
        )}
      </div>
    </div>
  );
}

function SearchGroup({ title, icon: Icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Icon className="w-4 h-4 text-coral" /> <div className="eyebrow">{title}</div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

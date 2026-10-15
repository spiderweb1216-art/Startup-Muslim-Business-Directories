import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import StartupCard from '@/components/common/StartupCard';
import { EmptyState, SkeletonRow, SectionHeading } from '@/components/common/Section';
import { Search, Filter } from 'lucide-react';

export default function Startups() {
  const { data, databaseStatus } = useData();
  const companies = useMemo(() => databaseStatus === 'connected' ? (data.startups || []).filter((s) => s.status === 'Published') : [], [data.startups, databaseStatus]);
  const categories = useMemo(() => databaseStatus === 'connected' ? (data.categories || []).filter((c) => c.status !== 'Inactive') : [], [data.categories, databaseStatus]);
  const countries = useMemo(() => Array.from(new Set(companies.map((s) => s.country).filter(Boolean))).sort(), [companies]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t=setTimeout(()=>setLoading(false),300); return ()=>clearTimeout(t); }, [q, cat, country]);

  const results = useMemo(() => {
    let l = [...companies];
    if (q) l = l.filter(s => String(s.name || '').toLowerCase().includes(q.toLowerCase()) || String(s.tagline || '').toLowerCase().includes(q.toLowerCase()));
    if (cat) l = l.filter(s => s.category === cat);
    if (country) l = l.filter(s => s.country === country);
    return l;
  }, [q, cat, country, companies]);

  return (
    <div className="wrap pt-10 pb-24" data-testid="startups-page">
      <SectionHeading eyebrow="Directory" title="All startups." subtitle="Browse the full list of Muslim-led startups in the ecosystem." />
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search startups" className="w-full bg-white border border-line rounded-full pl-11 pr-4 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={cat} onChange={e=>setCat(e.target.value)} className="bg-white border border-line rounded-full px-4 py-2.5 text-[13px]">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
        <select value={country} onChange={e=>setCountry(e.target.value)} className="bg-white border border-line rounded-full px-4 py-2.5 text-[13px]">
          <option value="">All countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} />)}</div>
        ) : results.length === 0 ? (
          <EmptyState title="No matching startups" description="Try a different search or clear filters." icon={Filter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((s,i) => <StartupCard key={s.slug} startup={s} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import StartupCard from '@/components/common/StartupCard';
import { EmptyState, SkeletonRow, SectionHeading } from '@/components/common/Section';
import { Search, Filter } from 'lucide-react';
import { isPublicFundingRound } from '@/lib/fundingDisplay';
import { paginateRecords } from '@/lib/pagination';
import ResultsPagination from '@/components/common/ResultsPagination';

export default function Startups() {
  const { data, databaseStatus } = useData();
  const companies = useMemo(() => databaseStatus === 'connected' ? (data.startups || []).filter((s) => s.status === 'Published') : [], [data.startups, databaseStatus]);
  const categories = useMemo(() => databaseStatus === 'connected' ? (data.categories || []).filter((c) => c.status !== 'Inactive') : [], [data.categories, databaseStatus]);
  const countries = useMemo(() => Array.from(new Set(companies.map((s) => s.country).filter(Boolean))).sort(), [companies]);
  // Only published funding rounds count as publicly disclosed funding activity.
  const fundedCompanySlugs = useMemo(() => new Set((data.rounds || []).filter(isPublicFundingRound).map((r) => r.startupSlug).filter(Boolean)), [data.rounds]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [country, setCountry] = useState('');
  const [funding, setFunding] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t=setTimeout(()=>setLoading(false),300); return ()=>clearTimeout(t); }, [q, cat, country, funding]);

  const results = useMemo(() => {
    let l = [...companies];
    if (q) l = l.filter(s => String(s.name || '').toLowerCase().includes(q.toLowerCase()) || String(s.tagline || '').toLowerCase().includes(q.toLowerCase()));
    if (cat) l = l.filter(s => s.category === cat);
    if (country) l = l.filter(s => s.country === country);
    if (funding === 'with') l = l.filter(s => fundedCompanySlugs.has(s.slug));
    if (funding === 'without') l = l.filter(s => !fundedCompanySlugs.has(s.slug));
    return l;
  }, [q, cat, country, funding, companies, fundedCompanySlugs]);

  const current = useMemo(() => paginateRecords(results, page), [results, page]);
  const goToPage = (nextPage) => { setPage(nextPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="wrap pt-10 pb-24" data-testid="startups-page">
      <SectionHeading eyebrow="Directory" title="All startups." subtitle="Browse the full list of Muslim-led startups in the ecosystem." />
      <div className="mt-8 flex flex-col md:flex-row md:flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="Search startups" className="w-full bg-white border border-line rounded-full pl-11 pr-4 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={cat} onChange={e=>{setCat(e.target.value);setPage(1);}} className="bg-white border border-line rounded-full px-4 py-2.5 text-[13px]">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
        <select value={country} onChange={e=>{setCountry(e.target.value);setPage(1);}} className="bg-white border border-line rounded-full px-4 py-2.5 text-[13px]">
          <option value="">All countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={funding} onChange={e=>{setFunding(e.target.value);setPage(1);}} className="bg-white border border-line rounded-full px-4 py-2.5 text-[13px]" aria-label="Filter by funding rounds" data-testid="startups-funding-filter">
          <option value="all">All funding activity</option>
          <option value="with">With funding rounds</option>
          <option value="without">Without funding rounds</option>
        </select>
      </div>
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} />)}</div>
        ) : results.length === 0 ? (
          <EmptyState title="No matching startups" description="Try a different search or clear filters." icon={Filter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {current.items.map((s,i) => <StartupCard key={s.slug} startup={s} index={current.offset + i} />)}
          </div>
        )}
      </div>
      {!loading && <ResultsPagination {...current} onPageChange={goToPage} noun="companies" />}
    </div>
  );
}

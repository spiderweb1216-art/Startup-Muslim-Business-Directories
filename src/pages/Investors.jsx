import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { InvestorLogo } from '@/components/common/Logo';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import { Search, LayoutGrid, List, ArrowUpRight, DatabaseZap } from 'lucide-react';
import InvestorCard from '@/components/common/InvestorCard';
import SaveButton from '@/components/common/SaveButton';
import CountryLabel from '@/components/common/CountryLabel';
import { useData } from '@/context/DataContext';
import {
  asArray,
  formatInvestorDate,
  getInvestorStages,
  getInvestorTypes,
  getPortfolioCount,
  isPublicInvestorRecord,
  latestInvestorRound,
} from '@/lib/investorData';

export default function Investors() {
  const { data, loading, databaseStatus, databaseError } = useData();
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [stage, setStage] = useState('All');
  const [view, setView] = useState('table');

  const investors = useMemo(() => (data.investors || [])
    .filter(isPublicInvestorRecord)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(a.name || '').localeCompare(String(b.name || ''))), [data.investors]);
  const types = useMemo(() => getInvestorTypes(investors), [investors]);
  const stages = useMemo(() => getInvestorStages(investors), [investors]);

  const results = useMemo(() => {
    let list = [...investors];
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((item) => [
        item.name,
        item.type,
        item.country,
        item.description,
        item.thesis,
        ...asArray(item.focus),
        ...asArray(item.stageFocus),
      ].filter(Boolean).join(' ').toLowerCase().includes(needle));
    }
    if (type !== 'All') list = list.filter((item) => item.type === type);
    if (stage !== 'All') list = list.filter((item) => asArray(item.stageFocus).includes(stage));
    return list;
  }, [investors, q, type, stage]);

  if (databaseStatus === 'error') {
    return <div className="wrap py-20"><div className="border border-line bg-white rounded-2xl p-8 max-w-2xl"><DatabaseZap className="w-7 h-7 text-coral"/><h1 className="font-display text-[28px] mt-4">Investor database unavailable</h1><p className="text-[13px] text-slate2 mt-2">The Investors directory is configured to use backend data only. Start the API/MySQL connection and refresh the page.</p>{databaseError && <div className="mono text-[11px] mt-4 p-3 rounded-lg bg-canvas break-all">{databaseError}</div>}</div></div>;
  }

  if (loading && databaseStatus === 'checking') {
    return <div className="wrap py-20 text-[13px] text-slate2">Loading investors from the backend…</div>;
  }

  return (
    <div className="wrap py-10 pb-24" data-testid="investors-page">
      <SectionHeading number="01" eyebrow="Investors" title="Follow the capital." subtitle="Funds, syndicates, angels, and studios backing Muslim founders." />
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search investors" className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={type} onChange={(event) => setType(event.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {types.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={stage} onChange={(event) => setStage(event.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {stages.map((item) => <option key={item}>{item}</option>)}
        </select>
        <div className="flex items-center bg-white border border-line rounded-md p-1">
          <button type="button" onClick={() => setView('table')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view === 'table' ? 'bg-navy text-white' : 'text-ink'}`}><List className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setView('grid')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view === 'grid' ? 'bg-navy text-white' : 'text-ink'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState title="No investors match" />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {results.map((investor) => <InvestorCard key={investor.slug} investor={investor} portfolioCount={getPortfolioCount(investor, data.startups, data.rounds)} />)}
        </div>
      ) : (
        <div className="mt-8 border border-line rounded-md bg-white overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 md:px-5 py-3 border-b border-line bg-sandLight/40">
            <div className="col-span-4 eyebrow">Investor</div>
            <div className="hidden md:block col-span-2 eyebrow">Type · Country</div>
            <div className="hidden md:block col-span-2 eyebrow">Focus</div>
            <div className="hidden md:block col-span-1 eyebrow">Stages</div>
            <div className="hidden md:block col-span-1 eyebrow">Ticket</div>
            <div className="col-span-4 md:col-span-1 eyebrow">Portfolio</div>
            <div className="col-span-4 md:col-span-1 eyebrow text-right"></div>
          </div>
          {results.map((investor) => {
            const recent = latestInvestorRound(data.rounds, investor.slug);
            const portfolioCount = getPortfolioCount(investor, data.startups, data.rounds);
            return (
              <Link key={investor.slug} to={`/investors/${investor.slug}`} className="grid grid-cols-12 gap-4 items-center px-4 md:px-5 py-4 border-b border-line row-hover" data-testid={`investor-row-${investor.slug}`}>
                <div className="col-span-8 md:col-span-4 flex items-center gap-3">
                  <InvestorLogo investor={investor} />
                  <div className="min-w-0"><div className="font-display font-medium">{investor.name}</div><div className="text-[11.5px] text-slate2 truncate">{investor.description}</div></div>
                </div>
                <div className="hidden md:block col-span-2 text-[12.5px]">{investor.type || '—'}<div className="text-[11.5px] text-slate3"><CountryLabel country={investor.country} explicitFlag={investor.flag} /></div></div>
                <div className="hidden md:block col-span-2 text-[12px] truncate">{asArray(investor.focus).slice(0, 2).join(', ') || '—'}</div>
                <div className="hidden md:block col-span-1 mono text-[11.5px]">{asArray(investor.stageFocus).join(', ') || '—'}</div>
                <div className="hidden md:block col-span-1 mono text-[11.5px]">{investor.ticketRange || '—'}</div>
                <div className="col-span-2 md:col-span-1 mono text-[13px]">{portfolioCount}</div>
                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                  {recent && <span className="mono text-[10.5px] text-slate3 hidden lg:inline">{formatInvestorDate(recent.date)}</span>}
                  <SaveButton type="investors" id={investor.slug} />
                  <span className="w-8 h-8 rounded border border-line inline-flex items-center justify-center hover:border-ink"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

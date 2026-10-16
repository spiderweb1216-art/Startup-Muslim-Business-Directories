import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { InvestorLogo } from '@/components/common/Logo';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import { Search, LayoutGrid, List, ArrowUpRight, DatabaseZap } from 'lucide-react';
import InvestorCard from '@/components/common/InvestorCard';
import SaveButton from '@/components/common/SaveButton';
import CountryLabel from '@/components/common/CountryLabel';
import { useData } from '@/context/DataContext';
import { isPublicFundingRound } from '@/lib/fundingDisplay';
import { paginateRecords } from '@/lib/pagination';
import ResultsPagination from '@/components/common/ResultsPagination';
import { canonicalCountry } from '@/lib/countryAtlas';
import {
  asArray,
  formatInvestorDate,
  getInvestorStages,
  getInvestorTypes,
  getPortfolioCount,
  isPublicInvestorRecord,
  latestInvestorRound,
  roundInvestorSlugs,
} from '@/lib/investorData';

export default function Investors() {
  const { data, loading, databaseStatus } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCountry = searchParams.get('country') || '';
  const [country, setCountry] = useState(urlCountry);
  useEffect(() => { setCountry(urlCountry); setPage(1); }, [urlCountry]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [stage, setStage] = useState('All');
  const [view, setView] = useState('table');
  const [funding, setFunding] = useState('all');
  const [page, setPage] = useState(1);
  const investorsWithRounds = useMemo(() => new Set((data.rounds || []).filter(isPublicFundingRound).flatMap(roundInvestorSlugs)), [data.rounds]);

  const investors = useMemo(() => (data.investors || [])
    .filter(isPublicInvestorRecord)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(a.name || '').localeCompare(String(b.name || ''))), [data.investors]);
  const countryOptions = useMemo(() => Array.from(new Set(investors.map(item => canonicalCountry(item.country)).filter(Boolean))).sort(), [investors]);
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
    if (country) list = list.filter(item => canonicalCountry(item.country) === canonicalCountry(country));
    if (type !== 'All') list = list.filter((item) => item.type === type);
    if (stage !== 'All') list = list.filter((item) => asArray(item.stageFocus).includes(stage));
    if (funding === 'with') list = list.filter((item) => investorsWithRounds.has(item.slug));
    if (funding === 'without') list = list.filter((item) => !investorsWithRounds.has(item.slug));
    return list;
  }, [investors, q, type, stage, funding, country, investorsWithRounds]);

  const current = useMemo(() => paginateRecords(results, page), [results, page]);
  const goToPage = (nextPage) => { setPage(nextPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (databaseStatus === 'error') {
    return <div className="wrap py-20"><div className="border border-line bg-white rounded-2xl p-8 max-w-2xl"><DatabaseZap className="w-7 h-7 text-coral"/><h1 className="font-display text-[28px] mt-4">Investors temporarily unavailable</h1><p className="text-[13px] text-slate2 mt-2">We could not load investor profiles right now. Please try again shortly.</p></div></div>;
  }

  if (loading && databaseStatus === 'checking') {
    return <div className="wrap py-20 text-[13px] text-slate2">Loading investors…</div>;
  }

  return (
    <div className="wrap py-10 pb-24" data-testid="investors-page">
      <SectionHeading number="01" eyebrow="Investors" title="Follow the capital." subtitle="Funds, syndicates, angels, and studios backing Muslim founders." />
      <div className="mt-8 flex flex-col md:flex-row md:flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} placeholder="Search investors" className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={country} aria-label="Filter investors by country" onChange={(event) => { const next=event.target.value;setCountry(next);setPage(1);const params=new URLSearchParams(searchParams);if(next)params.set('country',next);else params.delete('country');setSearchParams(params); }} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          <option value="">All countries</option>
          {countryOptions.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {types.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={stage} onChange={(event) => { setStage(event.target.value); setPage(1); }} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {stages.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={funding} onChange={(event) => { setFunding(event.target.value); setPage(1); }} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]" aria-label="Filter investors by linked funding rounds" data-testid="investors-funding-filter">
          <option value="all">All funding activity</option>
          <option value="with">Linked funding rounds</option>
          <option value="without">No linked rounds</option>
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
          {current.items.map((investor) => <InvestorCard key={investor.slug} investor={investor} portfolioCount={getPortfolioCount(investor, data.startups, data.rounds)} />)}
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
          {current.items.map((investor) => {
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
      <ResultsPagination {...current} onPageChange={goToPage} noun="investors" />
    </div>
  );
}

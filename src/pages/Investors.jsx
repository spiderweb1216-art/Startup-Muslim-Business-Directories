import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { INVESTORS, ROUNDS, formatDate } from '@/data/mockData';
import { InvestorLogo } from '@/components/common/Logo';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import { Search, LayoutGrid, List, ArrowUpRight } from 'lucide-react';
import InvestorCard from '@/components/common/InvestorCard';
import SaveButton from '@/components/common/SaveButton';

const TYPES = ['All','Venture Capital','Angel Syndicate','Investment Firm','Impact Fund','Venture Studio'];
const STAGES = ['All','Pre-Seed','Seed','Series A','Series B'];

export default function Investors() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [stage, setStage] = useState('All');
  const [view, setView] = useState('table');

  const results = useMemo(() => {
    let l = [...INVESTORS];
    if (q) l = l.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.focus.join(' ').toLowerCase().includes(q.toLowerCase()));
    if (type !== 'All') l = l.filter(i => i.type === type);
    if (stage !== 'All') l = l.filter(i => i.stageFocus.includes(stage));
    return l;
  }, [q, type, stage]);

  return (
    <div className="wrap py-10 pb-24" data-testid="investors-page">
      <SectionHeading number="01" eyebrow="Investors" title="Follow the capital." subtitle="Funds, syndicates, angels, and studios backing Muslim founders." />
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search investors" className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={type} onChange={e=>setType(e.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={stage} onChange={e=>setStage(e.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center bg-white border border-line rounded-md p-1">
          <button onClick={() => setView('table')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view==='table'?'bg-navy text-white':'text-ink'}`}><List className="w-3.5 h-3.5" /></button>
          <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view==='grid'?'bg-navy text-white':'text-ink'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState title="No investors match" />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {results.map(i => <InvestorCard key={i.slug} investor={i} />)}
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
          {results.map(inv => {
            const rec = ROUNDS.filter(r => r.investorSlugs.includes(inv.slug)).sort((a,b) => new Date(b.date) - new Date(a.date))[0];
            return (
              <Link key={inv.slug} to={`/investors/${inv.slug}`} className="grid grid-cols-12 gap-4 items-center px-4 md:px-5 py-4 border-b border-line row-hover" data-testid={`investor-row-${inv.slug}`}>
                <div className="col-span-8 md:col-span-4 flex items-center gap-3">
                  <InvestorLogo investor={inv} />
                  <div className="min-w-0">
                    <div className="font-display font-medium">{inv.name}</div>
                    <div className="text-[11.5px] text-slate2 truncate">{inv.description}</div>
                  </div>
                </div>
                <div className="hidden md:block col-span-2 text-[12.5px]">{inv.type}<div className="text-[11.5px] text-slate3">{inv.flag} {inv.country}</div></div>
                <div className="hidden md:block col-span-2 text-[12px] truncate">{inv.focus.slice(0,2).join(', ')}</div>
                <div className="hidden md:block col-span-1 mono text-[11.5px]">{inv.stageFocus.join(', ')}</div>
                <div className="hidden md:block col-span-1 mono text-[11.5px]">{inv.ticketRange}</div>
                <div className="col-span-2 md:col-span-1 mono text-[13px]">{inv.portfolioCount}</div>
                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                  {rec && <span className="mono text-[10.5px] text-slate3 hidden lg:inline">{formatDate(rec.date)}</span>}
                  <SaveButton type="investors" id={inv.slug} />
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

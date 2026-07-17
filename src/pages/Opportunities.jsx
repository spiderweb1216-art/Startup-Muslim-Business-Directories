import React, { useMemo, useState } from 'react';
import { OPPORTUNITIES } from '@/data/mockData';
import OpportunityCard from '@/components/common/OpportunityCard';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import { LayoutGrid, List } from 'lucide-react';

const TYPES = ['Grant','Accelerator','Competition','Fellowship','Demo Day','Founder Program'];

export default function Opportunities() {
  const [type, setType] = useState('');
  const [remote, setRemote] = useState('');
  const [view, setView] = useState('grid');
  const list = useMemo(() => {
    let l = [...OPPORTUNITIES];
    if (type) l = l.filter(o => o.type === type);
    if (remote === 'true') l = l.filter(o => o.remote);
    if (remote === 'false') l = l.filter(o => !o.remote);
    return l;
  }, [type, remote]);
  return (
    <div className="wrap pt-10 pb-24" data-testid="opportunities-page">
      <SectionHeading eyebrow="Funding & opportunities" title="Programs open to Muslim founders." subtitle="A curated board of grants, accelerators, fellowships, competitions, and demo days." />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button className={`chip ${!type ? 'active' : ''}`} onClick={() => setType('')}>All</button>
          {TYPES.map(t => <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? 'active' : ''}`}>{t}</button>)}
        </div>
        <select value={remote} onChange={e=>setRemote(e.target.value)} className="ml-auto bg-white border border-line rounded-full px-4 py-2 text-[13px]">
          <option value="">Any location</option>
          <option value="true">Global / Remote</option>
          <option value="false">On-site</option>
        </select>
        <div className="flex items-center bg-white border border-line rounded-full p-1">
          <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view==='grid'?'bg-ink text-white':'text-ink'}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view==='list'?'bg-ink text-white':'text-ink'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="mt-8">
        {list.length === 0 ? <EmptyState title="No opportunities match" /> : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((o, i) => <OpportunityCard key={o.id} op={o} index={i} />)}
          </div>
        ) : (
          <div className="bg-white border border-line rounded-2xl">
            {list.map(o => (
              <div key={o.id} className="p-4 border-b border-line last:border-none flex items-center gap-4">
                <img src={o.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] eyebrow">{o.type} · {o.organization}</div>
                  <div className="font-display text-[16px]">{o.title}</div>
                  <div className="text-[12.5px] text-slate2 line-clamp-1">{o.description}</div>
                </div>
                <div className="text-[12.5px] text-slate2 whitespace-nowrap">Deadline {new Date(o.deadline).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FOUNDERS } from '@/data/mockData';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import FounderCard from '@/components/common/FounderCard';
import { Search, ArrowUpRight } from 'lucide-react';

export default function Founders() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');
  const results = useMemo(() => {
    let l = [...FOUNDERS];
    if (q) l = l.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.bio.toLowerCase().includes(q.toLowerCase()) || f.industry.toLowerCase().includes(q.toLowerCase()));
    if (open) l = l.filter(f => f.openTo.includes(open));
    return l;
  }, [q, open]);

  const feature = results[0];
  const rest = results.slice(1);

  return (
    <div className="wrap py-10 pb-24" data-testid="founders-page">
      <SectionHeading number="01" eyebrow="Founders" title="Muslim operators, worldwide." subtitle="An editorial index of founders shaping the halal economy." />
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search founders" className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink" />
        </div>
        <select value={open} onChange={e=>setOpen(e.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px]">
          <option value="">Open to (all)</option>
          <option value="funding">Open to funding</option>
          <option value="partnerships">Open to partnerships</option>
          <option value="speaking">Open to speaking</option>
          <option value="co-founder">Open to co-founder</option>
        </select>
      </div>

      {results.length === 0 ? <EmptyState title="No founders match" /> : (
        <div className="mt-10">
          {feature && (
            <FounderCard founder={feature} featured />
          )}
          <div className="mt-8 border-t border-line">
            {rest.map((f, i) => (
              <Link key={f.slug} to={`/founders/${f.slug}`} className="grid grid-cols-12 gap-4 items-center py-5 border-b border-line row-hover px-2" data-testid={`founder-row-${f.slug}`}>
                <div className="col-span-2 md:col-span-1 mono text-[11.5px] text-slate3">{String(i+2).padStart(2,'0')}</div>
                <div className="col-span-2 md:col-span-1"><img src={f.photo} alt="" className="w-12 h-12 rounded-md object-cover" loading="lazy" /></div>
                <div className="col-span-8 md:col-span-4">
                  <div className="font-display font-medium text-[16px]">{f.name}</div>
                  <div className="text-[12px] text-slate2">{f.role}</div>
                </div>
                <div className="hidden md:block col-span-2 text-[12.5px]">{f.industry}</div>
                <div className="hidden md:block col-span-2 text-[12.5px]">{f.flag} {f.country}</div>
                <div className="hidden md:block col-span-1 mono text-[11.5px] text-slate2">{f.experience.split(' ').slice(0,3).join(' ')}</div>
                <div className="col-span-12 md:col-span-1 flex items-center justify-end"><ArrowUpRight className="w-4 h-4 text-slate2" /></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

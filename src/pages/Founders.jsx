import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading, EmptyState } from '@/components/common/Section';
import FounderCard from '@/components/common/FounderCard';
import CountryLabel from '@/components/common/CountryLabel';
import { useData } from '@/context/DataContext';
import { FOUNDER_OPEN_TO_OPTIONS } from '@/constants/founderOptions';
import { Search, ArrowUpRight } from 'lucide-react';

const PUBLIC_STATUSES = new Set(['Published', 'Active']);
const isPublic = (founder = {}) => !founder.status || PUBLIC_STATUSES.has(founder.status);

export default function Founders() {
  const { data } = useData();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');

  const results = useMemo(() => {
    let list = (data.founders || []).filter(isPublic);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((founder) => [
        founder.name,
        founder.bio,
        founder.story,
        founder.industry,
        founder.role,
        founder.country,
        ...(Array.isArray(founder.skills) ? founder.skills : []),
      ].filter(Boolean).join(' ').toLowerCase().includes(term));
    }
    if (open) list = list.filter((founder) => Array.isArray(founder.openTo) && founder.openTo.includes(open));

    return [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(a.name || '').localeCompare(String(b.name || '')));
  }, [data.founders, q, open]);

  const featured = results.slice(0, 2);
  const rest = results.slice(2);

  return (
    <div className="wrap py-10 pb-24" data-testid="founders-page">
      <SectionHeading number="01" eyebrow="Founders" title="Muslim operators, worldwide." subtitle="A live directory of founders shaping the halal economy." />

      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search founders"
            className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
          />
        </div>
        <select value={open} onChange={(event) => setOpen(event.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[13px] min-w-[220px]">
          <option value="">Open to (all)</option>
          {FOUNDER_OPEN_TO_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {results.length === 0 ? <EmptyState title="No founders match" /> : (
        <div className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.map((founder, index) => <FounderCard key={founder.slug} founder={founder} featured index={index} />)}
          </div>

          {rest.length > 0 && (
            <div className="mt-8 border-t border-line">
              {rest.map((founder, index) => (
                <Link key={founder.slug} to={`/founders/${founder.slug}`} className="grid grid-cols-12 gap-4 items-center py-5 border-b border-line row-hover px-2" data-testid={`founder-row-${founder.slug}`}>
                  <div className="col-span-2 md:col-span-1 mono text-[11.5px] text-slate3">{String(index + 3).padStart(2, '0')}</div>
                  <div className="col-span-2 md:col-span-1">
                    <img src={founder.photo} alt={founder.name} className="w-12 h-12 rounded-xl object-cover object-center bg-canvas" loading="lazy" />
                  </div>
                  <div className="col-span-8 md:col-span-4">
                    <div className="font-display font-medium text-[16px]">{founder.name}</div>
                    <div className="text-[12px] text-slate2">{founder.role || 'Founder'}</div>
                  </div>
                  <div className="hidden md:block col-span-2 text-[12.5px]">{founder.industry || '—'}</div>
                  <div className="hidden md:block col-span-2 text-[12.5px]"><CountryLabel country={founder.country} explicitFlag={founder.flag} /></div>
                  <div className="hidden md:block col-span-1 mono text-[11.5px] text-slate2 truncate">{founder.experience || '—'}</div>
                  <div className="col-span-12 md:col-span-1 flex items-center justify-end"><ArrowUpRight className="w-4 h-4 text-slate2" /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, LayoutGrid, List, Search, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import OpportunityCard from '@/components/common/OpportunityCard';
import { SectionHeading, EmptyState } from '@/components/common/Section';

const active = (item) => !['Draft','Pending','Rejected','Archived','Inactive'].includes(item.status || 'Published');

export default function Opportunities() {
  const { data, loading, databaseStatus } = useData();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('newest');
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const location = params.get('location') || '';
  const records = useMemo(() => (data.opportunities || []).filter(active), [data.opportunities]);
  const categories = useMemo(() => Array.from(new Set(records.flatMap((item)=>[item.category, ...(Array.isArray(item.categories) ? item.categories : []), item.type]).filter(Boolean))).sort(), [records]);
  const categoryCounts = useMemo(() => Object.fromEntries(categories.map((name)=>[name,records.filter((item)=>[item.category,item.type,...(item.categories||[])].includes(name)).length])),[categories,records]);
  const update = (key, value) => { const next = new URLSearchParams(params); if (value) next.set(key,value); else next.delete(key); setParams(next); };
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((item) => {
      const matched = !needle || [item.title,item.organization,item.description,item.type,item.category,item.industry,item.country, ...(item.categories || [])].join(' ').toLowerCase().includes(needle);
      const tagged = !category || [item.type,item.category,...(item.categories || [])].includes(category);
      const located = !location || (location === 'remote' ? item.remote : !item.remote);
      return matched && tagged && located;
    }).sort((a,b)=>sort === 'deadline' ? (a.deadline || '9999').localeCompare(b.deadline || '9999') : sort === 'title' ? a.title.localeCompare(b.title) : (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [records, query, category, location, sort]);

  return <div className="wrap pt-10 pb-24" data-testid="opportunities-page">
    <SectionHeading eyebrow="Funding & opportunities" title="Programs open to founders." subtitle="Discover grants, accelerators, fellowships, competitions and founder programs. Explore the details before applying." />
    <div className="mt-8 rounded-2xl border border-line bg-white p-4 md:p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px_170px] gap-3">
        <label className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate2"/><span className="sr-only">Search opportunities</span><input value={query} onChange={(e)=>update('q',e.target.value)} placeholder="Search opportunities, organizers or keywords" className="w-full border border-line rounded-lg pl-10 pr-3 py-3 text-sm outline-none focus:border-ink"/></label>
        <label><span className="sr-only">Location</span><select value={location} onChange={(e)=>update('location',e.target.value)} className="w-full border border-line rounded-lg bg-white px-3 py-3 text-sm"><option value="">Any location</option><option value="remote">Global / Remote</option><option value="onsite">On-site</option></select></label>
        <label><span className="sr-only">Sort opportunities</span><select value={sort} onChange={(e)=>setSort(e.target.value)} className="w-full border border-line rounded-lg bg-white px-3 py-3 text-sm"><option value="newest">Recently updated</option><option value="deadline">Deadline soonest</option><option value="title">Title A–Z</option></select></label>
      </div>
      <div className="border-t border-line pt-4"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate2 mb-3">Explore by category</div><div className="flex flex-wrap gap-2.5"><button aria-pressed={!category} onClick={()=>update('category','')} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${!category?'border-navy bg-navy text-white shadow-[0_5px_15px_rgba(17,24,39,0.18)]':'border-line bg-canvas/60 text-ink hover:border-coral hover:bg-coralSoft'}`}><span className={`h-1.5 w-1.5 rounded-full ${!category?'bg-coral':'bg-slate2'}`}/>All categories<span className={`rounded-full px-2 py-0.5 text-[10px] ${!category?'bg-white/15':'bg-white text-slate2'}`}>{records.length}</span></button>{categories.map((name)=><button key={name} aria-pressed={category===name} onClick={()=>update('category',name)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${category===name?'border-coral bg-gradient-to-r from-coral to-[#bd4235] text-white shadow-[0_5px_15px_rgba(217,75,61,0.22)]':'border-line bg-canvas/60 text-ink hover:border-coral hover:bg-coralSoft hover:-translate-y-0.5'}`}><span className={`h-1.5 w-1.5 rounded-full ${category===name?'bg-white':'bg-coral'}`}/>{name}<span className={`rounded-full px-2 py-0.5 text-[10px] ${category===name?'bg-white/20':'bg-white text-slate2'}`}>{categoryCounts[name]}</span></button>)}</div></div>
    </div>
    <div className="mt-6 flex items-center justify-between gap-3"><div className="text-sm text-slate2">{loading || databaseStatus === 'checking' ? 'Loading…' : `${list.length} ${list.length === 1 ? 'opportunity' : 'opportunities'} found`}</div><div className="flex items-center gap-2">{(query || category || location) && <button onClick={()=>setParams(new URLSearchParams())} className="inline-flex gap-1 text-xs text-slate2 hover:text-ink"><X size={14}/> Clear filters</button>}<div className="flex border border-line bg-white rounded-lg p-1"><button aria-label="Grid view" onClick={()=>setView('grid')} className={`p-2 rounded ${view==='grid'?'bg-ink text-white':''}`}><LayoutGrid size={16}/></button><button aria-label="List view" onClick={()=>setView('list')} className={`p-2 rounded ${view==='list'?'bg-ink text-white':''}`}><List size={16}/></button></div></div></div>
    {databaseStatus === 'error' ? <div className="mt-8 p-8 rounded-xl bg-white border border-line text-slate2">Opportunities are temporarily unavailable. Check the database connection and try again.</div> : <div className="mt-5">
      {list.length === 0 && !loading ? <EmptyState title="No opportunities match your search" /> : view === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{list.map((item)=><OpportunityCard key={item.id} op={item}/>)}</div> : <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">{list.map((item)=><Link to={`/opportunities/${encodeURIComponent(item.id)}`} key={item.id} className="p-4 md:p-5 flex gap-4 items-center hover:bg-canvas/40"><div className="w-16 h-16 shrink-0 bg-canvas rounded-lg overflow-hidden">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover"/>}</div><div className="flex-1 min-w-0"><span className="eyebrow">{item.category || item.type} · {item.organization}</span><div className="font-display text-base mt-1">{item.title}</div><p className="text-xs text-slate2 line-clamp-1">{item.description}</p></div><div className="hidden sm:flex items-center gap-1 text-xs text-slate2 whitespace-nowrap"><CalendarDays size={14}/>{item.deadline || 'Open'}</div></Link>)}</div>}
    </div>}
  </div>;
}

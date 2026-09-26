import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, COUNTRIES, STARTUPS } from '@/data/mockData';
import { StartupListRow, CompanyPreview } from '@/components/common/StartupCard';
import { EmptyState, SkeletonRow } from '@/components/common/Section';
import { countryLabel } from '@/lib/countryAtlas';

const STAGES = ['Pre-Seed','Seed','Series A','Series B'];
const MODELS = ['B2C','B2B SaaS','B2B Marketplace','D2C','Marketplace','B2B2C','B2C SaaS','B2C Subscription'];
const STATUS = [ ['verified','Verified'],['openToFunding','Open to funding'],['hiring','Hiring'],['pitching','Currently pitching'] ];

export default function Directory() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [view, setView] = useState('list');
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    category: sp.get('category') || '',
    country: '',
    stage: [],
    model: [],
    verified: false, openToFunding: false, hiring: false, pitching: false,
  });

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 320); return () => clearTimeout(t); }, [filters, q, sort]);

  const toggleArr = (k, v) => setFilters(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const results = useMemo(() => {
    let l = [...STARTUPS];
    if (q.trim()) {
      const t = q.toLowerCase();
      l = l.filter(s => s.name.toLowerCase().includes(t) || s.tagline.toLowerCase().includes(t) || s.category.toLowerCase().includes(t) || s.country.toLowerCase().includes(t));
    }
    if (filters.category) l = l.filter(s => s.category === filters.category);
    if (filters.country) l = l.filter(s => s.country === filters.country);
    if (filters.stage.length) l = l.filter(s => filters.stage.includes(s.stage));
    if (filters.model.length) l = l.filter(s => filters.model.includes(s.businessModel));
    STATUS.forEach(([k]) => { if (filters[k]) l = l.filter(s => s[k]); });
    if (sort === 'recent') l.sort((a,b) => new Date(b.addedAt) - new Date(a.addedAt));
    if (sort === 'raised') l.sort((a,b) => b.totalRaised - a.totalRaised);
    if (sort === 'alpha') l.sort((a,b) => a.name.localeCompare(b.name));
    return l;
  }, [q, filters, sort]);

  useEffect(() => { if (results.length && !selected) setSelected(results[0]); }, [results, selected]);

  const clearAll = () => { setFilters({ category:'', country:'', stage:[], model:[], verified:false, openToFunding:false, hiring:false, pitching:false }); setQ(''); setSp({}); };

  const chips = [];
  if (filters.category) chips.push({ k:'category', label:filters.category, remove: () => setFilters(f => ({ ...f, category:'' })) });
  if (filters.country) chips.push({ k:'country', label:countryLabel(filters.country), remove: () => setFilters(f => ({ ...f, country:'' })) });
  filters.stage.forEach(s => chips.push({ k:'s'+s, label:s, remove: () => toggleArr('stage', s) }));
  filters.model.forEach(m => chips.push({ k:'m'+m, label:m, remove: () => toggleArr('model', m) }));
  STATUS.forEach(([k, l]) => { if (filters[k]) chips.push({ k, label:l, remove: () => setFilters(f => ({ ...f, [k]: false })) }); });

  return (
    <div data-testid="directory-page">
      {/* Header strip */}
      <div className="bg-canvas border-b border-line">
        <div className="wrap py-10 md:py-14">
          <div className="eyebrow">— Discover</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-3">
            <h1 className="display-h text-[40px] md:text-[54px] leading-[1.05]">The atlas of Muslim startups.</h1>
            <div className="flex items-center gap-2 md:justify-end">
              <div className="relative flex-1 md:min-w-[340px]">
                <Search className="w-4 h-4 text-slate2 absolute left-4 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search company, industry, or country" className="w-full bg-white border border-line rounded-md pl-11 pr-3 py-2.5 text-[13.5px] outline-none focus:border-ink" data-testid="directory-search" />
              </div>
              <button onClick={() => setDrawer(true)} className="lg:hidden btn btn-outline btn-sm" data-testid="directory-mobile-filter"><SlidersHorizontal className="w-3.5 h-3.5" /> Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap grid grid-cols-12 gap-6 py-10">
        {/* Left filter rail */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-24">
            <FilterRail filters={filters} setFilters={setFilters} toggleArr={toggleArr} clearAll={clearAll} />
          </div>
        </aside>

        {/* Center results */}
        <section className="col-span-12 lg:col-span-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
            <div className="text-[13px] text-slate2" data-testid="directory-result-count">
              <span className="mono text-ink">{results.length}</span> companies
            </div>
            <div className="flex items-center gap-2">
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white border border-line rounded-md px-3 py-2 text-[12.5px]" data-testid="directory-sort">
                <option value="recent">Sort: Recently added</option>
                <option value="raised">Sort: Most raised</option>
                <option value="alpha">Sort: A → Z</option>
              </select>
              <div className="hidden md:flex items-center bg-white border border-line rounded-md p-1">
                <button onClick={() => setView('list')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view==='list'?'bg-navy text-white':'text-ink'}`} data-testid="directory-view-list"><List className="w-3.5 h-3.5" /></button>
                <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-md flex items-center justify-center ${view==='grid'?'bg-navy text-white':'text-ink'}`} data-testid="directory-view-grid"><LayoutGrid className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-4">
              {chips.map(c => <button key={c.k} onClick={c.remove} className="filter-pill on">{c.label} <X className="w-3 h-3" /></button>)}
              <button onClick={clearAll} className="text-[12px] text-slate2 hover:text-ink underline">Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} />)}</div>
          ) : results.length === 0 ? (
            <EmptyState title="No companies match" description="Try clearing a filter or a different search." icon={Filter} action={<button className="btn btn-navy btn-sm" onClick={clearAll}>Reset filters</button>} />
          ) : (
            <div className="border border-line rounded-md bg-white overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 md:px-5 py-3 border-b border-line bg-sandLight/40">
                <div className="col-span-1 eyebrow">#</div>
                <div className="col-span-6 md:col-span-4 eyebrow">Company</div>
                <div className="hidden md:block col-span-2 eyebrow">Category</div>
                <div className="hidden md:block col-span-1 eyebrow">Stage</div>
                <div className="col-span-3 md:col-span-2 eyebrow">Raised</div>
                <div className="hidden md:block col-span-1 eyebrow">Team</div>
                <div className="col-span-2 md:col-span-1"></div>
              </div>
              {results.map((s, i) => (
                <div key={s.slug} onMouseEnter={() => setSelected(s)} onClick={() => setSelected(s)}>
                  <StartupListRow startup={s} index={i} active={selected?.slug === s.slug} onSelect={setSelected} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right preview */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-24">
            <div className="eyebrow mb-2">Preview</div>
            {selected ? <CompanyPreview startup={selected} /> : <div className="text-[12.5px] text-slate2">Select a company to preview.</div>}
          </div>
        </aside>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="lg:hidden fixed inset-0 z-[80] bg-navy/50">
            <motion.aside initial={{ y:'100%' }} animate={{ y: 0 }} exit={{ y:'100%' }} transition={{ duration: 0.3 }} onClick={e=>e.stopPropagation()} className="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-lg p-5" data-testid="filter-drawer">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-[18px]">Filters</div>
                <button onClick={() => setDrawer(false)} className="w-8 h-8 rounded border border-line inline-flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <FilterRail filters={filters} setFilters={setFilters} toggleArr={toggleArr} clearAll={clearAll} />
              <button onClick={() => setDrawer(false)} className="btn btn-coral w-full justify-center mt-5">Show {results.length} results</button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterRail({ filters, setFilters, toggleArr, clearAll }) {
  return (
    <div className="space-y-5 border border-line rounded-md p-5 bg-white">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Filters</div>
        <button onClick={clearAll} className="text-[11.5px] text-slate2 hover:text-ink underline">Clear all</button>
      </div>
      <div><div className="eyebrow mb-2">Category</div>
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category:e.target.value }))} className="w-full bg-white border border-line rounded-md p-2 text-[13px]" data-testid="filter-category">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div><div className="eyebrow mb-2">Country</div>
        <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country:e.target.value }))} className="w-full bg-white border border-line rounded-md p-2 text-[13px]" data-testid="filter-country">
          <option value="">All countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
        </select>
      </div>
      <div><div className="eyebrow mb-2">Stage</div>
        <div className="flex flex-wrap gap-1.5">{STAGES.map(s => <button key={s} onClick={() => toggleArr('stage', s)} className={`filter-pill ${filters.stage.includes(s)?'on':''}`} data-testid={`filter-stage-${s}`}>{s}</button>)}</div>
      </div>
      <div><div className="eyebrow mb-2">Business model</div>
        <div className="flex flex-wrap gap-1.5">{MODELS.map(m => <button key={m} onClick={() => toggleArr('model', m)} className={`filter-pill ${filters.model.includes(m)?'on':''}`}>{m}</button>)}</div>
      </div>
      <div><div className="eyebrow mb-2">Status</div>
        <div className="space-y-1.5 text-[13px]">
          {STATUS.map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters[k]} onChange={e => setFilters(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4 accent-coral" data-testid={`filter-${k}`} />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

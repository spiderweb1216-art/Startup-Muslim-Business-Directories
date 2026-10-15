import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { InvestorLogo, StartupLogo } from '@/components/common/Logo';
import { SectionHeading } from '@/components/common/Section';
import CountryLabel from '@/components/common/CountryLabel';
import { useData } from '@/context/DataContext';
import { asArray, getInvestorPortfolio, getInvestorStages, getInvestorTypes, isPublicInvestorRecord } from '@/lib/investorData';

const NETWORK_PAGE_SIZE = 16;

export default function InvestorNetwork() {
  const { data, databaseStatus } = useData();
  // null means the visitor has not chosen a type: choose a manageable one from live data.
  const [type, setType] = useState(null);
  const [stage, setStage] = useState('All');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [page, setPage] = useState(0);

  const investors = useMemo(() => (data.investors || []).filter(isPublicInvestorRecord), [data.investors]);
  const types = useMemo(() => getInvestorTypes(investors), [investors]);
  const stages = useMemo(() => getInvestorStages(investors), [investors]);
  // Default to a populated type with a readable number of nodes, rather than drawing
  // hundreds of overlapping circles on first visit. Never assume a type exists.
  const defaultType = useMemo(() => {
    const choices = types.filter((item) => item !== 'All').map((name) => ({
      name,
      count: investors.filter((investor) => investor.type === name).length,
    })).filter((item) => item.count > 0);
    const manageable = choices.filter((item) => item.count >= 3 && item.count <= NETWORK_PAGE_SIZE);
    const pool = manageable.length ? manageable : choices;
    return [...pool].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0]?.name || 'All';
  }, [investors, types]);

  const activeType = type !== null && types.includes(type) ? type : defaultType;
  const filtered = useMemo(() => investors.filter((item) =>
    (activeType === 'All' || item.type === activeType) &&
    (stage === 'All' || asArray(item.stageFocus).includes(stage))
  ), [investors, activeType, stage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / NETWORK_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * NETWORK_PAGE_SIZE;
  const visibleInvestors = filtered.slice(pageStart, pageStart + NETWORK_PAGE_SIZE);
  const selected = visibleInvestors.find((item) => item.slug === selectedSlug) || visibleInvestors[0] || null;
  const portfolio = selected ? getInvestorPortfolio(selected, data.startups || [], data.rounds || []) : [];

  useEffect(() => {
    if (selected && selected.slug !== selectedSlug) setSelectedSlug(selected.slug);
  }, [selected, selectedSlug]);

  if (databaseStatus !== 'connected' || investors.length === 0) return null;

  return (
    <section className="wrap py-16 md:py-24" data-testid="investor-network-section">
      <SectionHeading number="08" eyebrow="Investor network" title="Follow the capital." subtitle="Investors, syndicates, and studios backing Muslim founders. Select a node to see their portfolio." right={<Link to="/investors" className="btn btn-outline btn-sm">Browse investors <ArrowUpRight className="w-3.5 h-3.5" /></Link>} />
      <div className="mt-10 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 space-y-6">
          <div><div className="eyebrow mb-2">Type</div><div className="flex flex-wrap gap-1.5">{types.map((item) => <button type="button" key={item} onClick={() => { setType(item); setPage(0); }} aria-pressed={activeType === item} className={`filter-pill ${activeType === item ? 'on' : ''}`}>{item}</button>)}</div></div>
          <div><div className="eyebrow mb-2">Stage focus</div><div className="flex flex-wrap gap-1.5">{stages.map((item) => <button type="button" key={item} onClick={() => { setStage(item); setPage(0); }} aria-pressed={stage === item} className={`filter-pill ${stage === item ? 'on' : ''}`}>{item}</button>)}</div></div>
        </aside>

        <div className="col-span-12 md:col-span-5 relative panel-dark rounded-md overflow-hidden min-h-[440px] atlas-grid-dark">
          {selected ? (
            <NetworkDiagram investors={visibleInvestors} selected={selected} onSelect={(item) => setSelectedSlug(item.slug)} portfolio={portfolio} />
          ) : (
            <div className="min-h-[440px] flex items-center justify-center px-8 text-center text-[13px] text-white/70">
              No investors match these filters. Select another type or stage.
            </div>
          )}
          <div className="absolute top-4 left-4 eyebrow eyebrow-navy pointer-events-none">
            Network — {filtered.length} investors
            {filtered.length > NETWORK_PAGE_SIZE && <div className="mt-1 text-[10px] text-white/60">Showing {pageStart + 1}–{Math.min(pageStart + NETWORK_PAGE_SIZE, filtered.length)}</div>}
          </div>
          {totalPages > 1 && <div className="absolute top-3 right-4 flex items-center gap-2 z-10 text-white">
            <button type="button" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} aria-label="Previous investors" className="border border-white/30 rounded p-1 disabled:opacity-40 hover:bg-white/10"><ChevronLeft size={16} /></button>
            <span className="text-[11px] font-mono">{currentPage + 1} / {totalPages}</span>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage + 1 === totalPages} aria-label="Next investors" className="border border-white/30 rounded p-1 disabled:opacity-40 hover:bg-white/10"><ChevronRight size={16} /></button>
          </div>}
        </div>

        <div className="col-span-12 md:col-span-4">
          {selected ? <motion.div key={selected.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="panel overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-3"><InvestorLogo investor={selected} size={48} /><div><Link to={`/investors/${selected.slug}`} className="font-display font-medium text-[17px] link-under">{selected.name}</Link><div className="text-[12px] text-slate2 flex items-center gap-1.5">{selected.type} · <CountryLabel country={selected.country} explicitFlag={selected.flag} /></div></div></div>
            <div className="p-5 space-y-2 text-[13px]"><Row k="Focus" v={asArray(selected.focus).join(', ') || '—'} /><Row k="Stages" v={<span className="mono">{asArray(selected.stageFocus).join(', ') || '—'}</span>} /><Row k="Ticket" v={<span className="mono">{selected.ticketRange || '—'}</span>} /><Row k="Portfolio" v={<span className="mono">{portfolio.length}</span>} /></div>
            {portfolio.length > 0 && <div className="px-5 pb-5"><div className="eyebrow mb-2">Portfolio ({portfolio.length})</div><div className="flex flex-wrap gap-2">{portfolio.slice(0, 8).map((startup) => <Link key={startup.slug} to={`/startups/${startup.slug}`} className="flex items-center gap-1.5 border border-line rounded-md pr-2 hover:border-ink"><StartupLogo startup={startup} size={22} rounded={4} /><span className="text-[11.5px]">{startup.name}</span></Link>)}</div></div>}
            <div className="p-5 border-t border-line flex items-center gap-2"><Link to={`/investors/${selected.slug}`} className="btn btn-navy btn-sm flex-1 justify-center">View investor <ArrowUpRight className="w-3.5 h-3.5" /></Link></div>
          </motion.div> : <div className="panel p-6 text-[13px] text-slate2">No investor selected. Change the filters to see matching profiles.</div>}
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }) { return <div className="flex items-center justify-between border-b border-line/60 pb-2 last:border-none"><span className="text-slate2 text-[12.5px]">{k}</span><span className="text-white/90 !text-ink text-right max-w-[65%]">{v}</span></div>; }

function NetworkDiagram({ investors, selected, onSelect, portfolio }) {
  const width = 600, height = 440, centerX = width / 2, centerY = height / 2;
  const positions = investors.map((investor, index) => { const angle = (index / Math.max(1, investors.length)) * Math.PI * 2; const radius = 155; return { investor, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }; });
  return <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
    {[60,110,155].map((radius) => <circle key={radius} cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" />)}
    {positions.map(({ investor, x, y }) => investor.slug === selected.slug ? portfolio.slice(0, 6).map((startup, index) => { const angle = (index / Math.max(1, Math.min(portfolio.length, 6))) * Math.PI * 2; const px = centerX + Math.cos(angle) * 60; const py = centerY + Math.sin(angle) * 60; return <line key={`${investor.slug}-${startup.slug}`} x1={x} y1={y} x2={px} y2={py} stroke="#D94B3D" strokeWidth="1" opacity="0.7" />; }) : null)}
    {portfolio.slice(0, 6).map((startup, index) => { const angle = (index / Math.max(1, Math.min(portfolio.length, 6))) * Math.PI * 2; const px = centerX + Math.cos(angle) * 60; const py = centerY + Math.sin(angle) * 60; return <g key={startup.slug}><circle cx={px} cy={py} r="10" fill={startup.logo?.color || '#111827'} stroke="#F3F0E8" strokeWidth="1.5" /><text x={px + 13} y={py + 3} fontSize="9" fill="#fff" fontFamily="IBM Plex Mono">{startup.name}</text></g>; })}
    {positions.map(({ investor, x, y }) => { const isSelected = investor.slug === selected.slug; return <g key={investor.slug} onMouseEnter={() => onSelect(investor)} onClick={() => onSelect(investor)} style={{ cursor: 'pointer' }}><circle cx={x} cy={y} r={isSelected ? 16 : 12} fill={investor.logo?.color || '#111827'} stroke={isSelected ? '#D94B3D' : '#F3F0E8'} strokeWidth={isSelected ? 2 : 1.5} /><text x={x} y={y + 4} textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="IBM Plex Mono">{investor.logo?.mark || String(investor.name || '').slice(0,2).toUpperCase()}</text></g>; })}
  </svg>;
}

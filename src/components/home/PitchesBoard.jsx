import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Search, X, Flame } from 'lucide-react';
import { PITCHES, getStartupBySlug, formatMoney, formatDate } from '@/data/mockData';
import { StartupLogo } from '@/components/common/Logo';
import { SectionHeading } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';

export default function PitchesBoard() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('recent');
  const [preview, setPreview] = useState(null);
  const { toast } = useToast();

  const rows = useMemo(() => {
    let l = PITCHES.map(p => ({ ...p, startup: getStartupBySlug(p.startupSlug) })).filter(p => p.startup);
    if (q) l = l.filter(p => p.startup.name.toLowerCase().includes(q.toLowerCase()) || p.pitchTitle.toLowerCase().includes(q.toLowerCase()));
    if (sector) l = l.filter(p => p.startup.category === sector);
    if (stage) l = l.filter(p => p.startup.stage === stage);
    if (sort === 'recent') l.sort((a,b) => new Date(b.submitted) - new Date(a.submitted));
    if (sort === 'amount') l.sort((a,b) => b.requested - a.requested);
    return l;
  }, [q, sector, stage, sort]);

  const sectors = Array.from(new Set(PITCHES.map(p => getStartupBySlug(p.startupSlug)?.category).filter(Boolean)));
  const stages = ['Pre-Seed','Seed','Series A','Series B'];

  return (
    <section className="bg-canvas" data-testid="pitches-board-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading
          number="05"
          eyebrow="Investment board"
          title="Startup pitches, live."
          subtitle="A research board of Muslim founders currently raising. Click any pitch to preview."
          right={<Link to="/pitches" className="btn btn-outline btn-sm">View all pitches <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="mt-8 border border-line rounded-md bg-white overflow-hidden">
          {/* Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border-b border-line">
            <div className="md:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-slate2 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search pitches" className="w-full bg-sandLight/40 border border-line rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-ink" data-testid="pitch-board-search" />
            </div>
            <select value={sector} onChange={e => setSector(e.target.value)} className="md:col-span-3 bg-sandLight/40 border border-line rounded-md px-3 py-2 text-[13px] outline-none">
              <option value="">All sectors</option>
              {sectors.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={stage} onChange={e => setStage(e.target.value)} className="md:col-span-2 bg-sandLight/40 border border-line rounded-md px-3 py-2 text-[13px] outline-none">
              <option value="">All stages</option>
              {stages.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className="md:col-span-2 bg-sandLight/40 border border-line rounded-md px-3 py-2 text-[13px] outline-none">
              <option value="recent">Sort: Recent</option>
              <option value="amount">Sort: Amount</option>
            </select>
            <div className="md:col-span-1 flex items-center justify-end mono text-[11px] text-slate2">{rows.length}</div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 eyebrow bg-sandLight/30 border-b border-line">
            <div className="col-span-3">Company</div>
            <div className="col-span-2">Sector · Country</div>
            <div className="col-span-1">Stage</div>
            <div className="col-span-2">Raising</div>
            <div className="col-span-1">Equity</div>
            <div className="col-span-2">Valuation</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {rows.map((p, i) => (
            <button key={p.id} onClick={() => setPreview(p)} className={`w-full text-left grid grid-cols-12 gap-3 md:gap-3 items-center px-5 py-4 border-b border-line row-hover ${preview?.id === p.id ? 'bg-[#FBF8F1]' : ''}`} data-testid={`pitch-row-${p.id}`}>
              <div className="col-span-12 md:col-span-3 flex items-center gap-3 min-w-0">
                <StartupLogo startup={p.startup} size={36} />
                <div className="min-w-0"><div className="font-display font-medium text-[14px] truncate">{p.startup.name}</div><div className="text-[11.5px] text-slate2 truncate">{p.pitchTitle}</div></div>
              </div>
              <div className="hidden md:block col-span-2 text-[12.5px]">{p.startup.category}<div className="text-[11px] text-slate2">{p.startup.flag} {p.startup.country}</div></div>
              <div className="hidden md:block col-span-1 mono text-[11.5px]">{p.startup.stage}</div>
              <div className="col-span-4 md:col-span-2 mono text-[13px]">{formatMoney(p.requested)}</div>
              <div className="hidden md:block col-span-1 mono text-[13px]">{p.equity}%</div>
              <div className="hidden md:block col-span-2 mono text-[13px]">{formatMoney(p.valuation)}</div>
              <div className="col-span-8 md:col-span-1 flex items-center justify-end gap-2">
                <span className="tag tag-coral"><Flame className="w-3 h-3" /> Live</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview drawer */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-navy/50" onClick={() => setPreview(null)}>
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white overflow-y-auto"
              data-testid="pitch-preview-drawer"
            >
              <div className="p-6 border-b border-line flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <StartupLogo startup={preview.startup} size={48} />
                  <div>
                    <div className="font-display font-medium text-[18px]">{preview.startup.name}</div>
                    <div className="text-[12.5px] text-slate2">{preview.startup.category} · {preview.startup.country}</div>
                  </div>
                </div>
                <button onClick={() => setPreview(null)} className="w-8 h-8 rounded border border-line inline-flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <span className="tag tag-coral"><Flame className="w-3 h-3" /> Active pitch</span>
                  <h3 className="font-display text-[22px] mt-3 leading-tight">{preview.pitchTitle}</h3>
                  <p className="text-[14px] text-slate2 leading-relaxed mt-2">{preview.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <MetricBox label="Raising" value={formatMoney(preview.requested)} />
                  <MetricBox label="Equity" value={`${preview.equity}%`} />
                  <MetricBox label="Valuation" value={formatMoney(preview.valuation)} />
                </div>
                <Section label="Use of funds"><p className="text-[13px] text-slate2">{preview.useOfFunds}</p></Section>
                <Section label="Traction"><p className="text-[13px] text-slate2">{preview.traction}</p></Section>
                <Section label="Submitted"><p className="text-[13px] mono text-slate2">{formatDate(preview.submitted)}</p></Section>
                <div className="flex flex-col gap-2">
                  <button onClick={() => toast('Pitch deck requested (mock).', { type: 'success' })} className="btn btn-coral justify-center">Request pitch deck <ArrowUpRight className="w-4 h-4" /></button>
                  <Link to={`/startups/${preview.startup.slug}#pitch`} className="btn btn-outline justify-center">Open full profile</Link>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MetricBox({ label, value }) {
  return <div className="border border-line rounded p-3"><div className="eyebrow">{label}</div><div className="mono text-[15px] mt-0.5">{value}</div></div>;
}
function Section({ label, children }) {
  return <div><div className="eyebrow mb-1.5">{label}</div>{children}</div>;
}

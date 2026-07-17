import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INVESTORS, STARTUPS, getStartupsByInvestor } from '@/data/mockData';
import { InvestorLogo, StartupLogo } from '@/components/common/Logo';
import { SectionHeading } from '@/components/common/Section';

const TYPES = ['All','Venture Capital','Angel Syndicate','Investment Firm','Impact Fund'];
const STAGES = ['All','Pre-Seed','Seed','Series A','Series B'];

export default function InvestorNetwork() {
  const [type, setType] = useState('All');
  const [stage, setStage] = useState('All');
  const [selected, setSelected] = useState(INVESTORS[0]);

  const filtered = useMemo(() => {
    let l = [...INVESTORS];
    if (type !== 'All') l = l.filter(i => i.type === type);
    if (stage !== 'All') l = l.filter(i => i.stageFocus.includes(stage));
    return l;
  }, [type, stage]);

  const portfolio = getStartupsByInvestor(selected.slug);

  return (
    <section className="wrap py-16 md:py-24" data-testid="investor-network-section">
      <SectionHeading
        number="08"
        eyebrow="Investor network"
        title="Follow the capital."
        subtitle="Investors, syndicates, and studios backing Muslim founders. Select a node to see their portfolio."
        right={<Link to="/investors" className="btn btn-outline btn-sm">Browse investors <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
      />
      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Filters */}
        <aside className="col-span-12 md:col-span-3 space-y-6">
          <div>
            <div className="eyebrow mb-2">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => <button key={t} onClick={() => setType(t)} className={`filter-pill ${type === t ? 'on' : ''}`}>{t}</button>)}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Stage focus</div>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(s => <button key={s} onClick={() => setStage(s)} className={`filter-pill ${stage === s ? 'on' : ''}`}>{s}</button>)}
            </div>
          </div>
        </aside>

        {/* Network visualization */}
        <div className="col-span-12 md:col-span-5 relative panel-dark rounded-md overflow-hidden min-h-[440px] atlas-grid-dark">
          <NetworkDiagram investors={filtered} selected={selected} onSelect={setSelected} />
          <div className="absolute top-4 left-4 eyebrow eyebrow-navy">Network — {filtered.length} investors</div>
        </div>

        {/* Selected preview */}
        <div className="col-span-12 md:col-span-4">
          <motion.div key={selected.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="panel overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-3">
              <InvestorLogo investor={selected} size={48} />
              <div>
                <Link to={`/investors/${selected.slug}`} className="font-display font-medium text-[17px] link-under">{selected.name}</Link>
                <div className="text-[12px] text-slate2">{selected.type} · {selected.flag} {selected.country}</div>
              </div>
            </div>
            <div className="p-5 space-y-2 text-[13px]">
              <Row k="Focus" v={selected.focus.join(', ')} />
              <Row k="Stages" v={<span className="mono">{selected.stageFocus.join(', ')}</span>} />
              <Row k="Ticket" v={<span className="mono">{selected.ticketRange}</span>} />
              <Row k="Portfolio" v={<span className="mono">{selected.portfolioCount}</span>} />
            </div>
            {portfolio.length > 0 && (
              <div className="px-5 pb-5">
                <div className="eyebrow mb-2">Portfolio ({portfolio.length})</div>
                <div className="flex flex-wrap gap-2">
                  {portfolio.slice(0, 8).map(s => (
                    <Link key={s.slug} to={`/startups/${s.slug}`} className="flex items-center gap-1.5 border border-line rounded-md pr-2 hover:border-ink">
                      <StartupLogo startup={s} size={22} rounded={4} /><span className="text-[11.5px]">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="p-5 border-t border-line flex items-center gap-2">
              <Link to={`/investors/${selected.slug}`} className="btn btn-navy btn-sm flex-1 justify-center">View investor <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }) {
  return <div className="flex items-center justify-between border-b border-line/60 pb-2 last:border-none"><span className="text-slate2 text-[12.5px]">{k}</span><span className="text-white/90 !text-ink">{v}</span></div>;
}

// Static SVG diagram: investors as nodes, connected to portfolio startups
function NetworkDiagram({ investors, selected, onSelect }) {
  const w = 600, h = 440;
  const cx = w/2, cy = h/2;
  // Position investors on a circle
  const positions = investors.map((inv, i) => {
    const angle = (i / Math.max(1, investors.length)) * Math.PI * 2;
    const r = 155;
    return { inv, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* Concentric guide rings */}
      {[60,110,155].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" />)}

      {/* Connection lines from selected to its portfolio */}
      {positions.map(({ inv, x, y }) => {
        const isSel = inv.slug === selected.slug;
        return (
          <g key={inv.slug}>
            {isSel && inv.portfolio.slice(0,6).map((ps, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const px = cx + Math.cos(angle) * 60;
              const py = cy + Math.sin(angle) * 60;
              return <line key={ps+i} x1={x} y1={y} x2={px} y2={py} stroke="#D94B3D" strokeWidth="1" opacity="0.7" />;
            })}
          </g>
        );
      })}

      {/* Portfolio nodes for selected */}
      {selected && selected.portfolio.slice(0,6).map((ps, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const px = cx + Math.cos(angle) * 60;
        const py = cy + Math.sin(angle) * 60;
        const s = STARTUPS.find(x => x.slug === ps);
        if (!s) return null;
        return <g key={ps}><circle cx={px} cy={py} r="10" fill={s.logo.color} stroke="#F3F0E8" strokeWidth="1.5" /><text x={px+13} y={py+3} fontSize="9" fill="#fff" fontFamily="IBM Plex Mono">{s.name}</text></g>;
      })}

      {/* Investor nodes */}
      {positions.map(({ inv, x, y }) => {
        const isSel = inv.slug === selected.slug;
        return (
          <g key={inv.slug} onMouseEnter={() => onSelect(inv)} onClick={() => onSelect(inv)} style={{ cursor:'pointer' }}>
            <circle cx={x} cy={y} r={isSel ? 16 : 12} fill={inv.logo?.color || '#111827'} stroke={isSel ? '#D94B3D' : '#F3F0E8'} strokeWidth={isSel ? 2 : 1.5} />
            <text x={x} y={y+4} textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="IBM Plex Mono">{inv.logo?.mark}</text>
          </g>
        );
      })}
    </svg>
  );
}

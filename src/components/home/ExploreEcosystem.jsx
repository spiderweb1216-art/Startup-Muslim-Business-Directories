import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { STARTUPS, CATEGORIES } from '@/data/mockData';
import { StartupLogo } from '@/components/common/Logo';
import { CompanyPreview } from '@/components/common/StartupCard';
import { SectionHeading } from '@/components/common/Section';
import CountryLabel from '@/components/common/CountryLabel';

// Replaces the previous scrolling logo marquee.
// Manual, interactive company gallery grouped by category with a company preview panel.
export default function ExploreEcosystem() {
  const [cat, setCat] = useState('Featured');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(STARTUPS[0]);

  const list = useMemo(() => {
    if (cat === 'Featured') return STARTUPS.slice(0, 12);
    return STARTUPS.filter(s => s.category === cat);
  }, [cat]);

  const perPage = 8;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const visible = list.slice(page * perPage, page * perPage + perPage);

  const cats = ['Featured', ...CATEGORIES.slice(0, 8).map(c => c.name)];

  return (
    <section className="wrap py-16 md:py-24" data-testid="explore-ecosystem-section">
      <SectionHeading
        number="02"
        eyebrow="Explore"
        title="Explore the ecosystem."
        subtitle="Browse the atlas of Muslim-led companies by category. Select any logo to preview the company."
        right={<Link to="/directory" className="btn btn-outline btn-sm">Enter atlas <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
      />
      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Left categories */}
        <aside className="col-span-12 md:col-span-3">
          <div className="eyebrow mb-3">Categories</div>
          <div className="border-t border-line">
            {cats.map(c => {
              const count = c === 'Featured' ? STARTUPS.length : STARTUPS.filter(s => s.category === c).length;
              const isActive = cat === c;
              return (
                <button key={c} onClick={() => { setCat(c); setPage(0); }} data-testid={`explore-cat-${c}`}
                  className={`w-full flex items-center justify-between border-b border-line py-3 text-left group ${isActive ? 'text-ink' : 'text-slate2 hover:text-ink'}`}
                >
                  <span className="flex items-center gap-2">
                    {isActive && <span className="w-1 h-4 bg-coral" aria-hidden />}
                    <span className={`text-[14px] ${isActive ? 'font-medium' : ''}`}>{c}</span>
                  </span>
                  <span className="mono text-[11px] text-slate3">{String(count).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right logo matrix + preview */}
        <div className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-line rounded-md bg-white">
              <div className="px-4 md:px-5 py-3 flex items-center justify-between border-b border-line">
                <div className="mono text-[11.5px] text-slate2">{cat.toUpperCase()} · {visible.length} companies</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p-1))} className="w-7 h-7 rounded border border-line inline-flex items-center justify-center hover:border-ink disabled:opacity-30" disabled={page === 0} aria-label="Previous"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <span className="mono text-[11px] text-slate2">{String(page + 1).padStart(2,'0')} / {String(pages).padStart(2,'0')}</span>
                  <button onClick={() => setPage(p => Math.min(pages - 1, p+1))} className="w-7 h-7 rounded border border-line inline-flex items-center justify-center hover:border-ink disabled:opacity-30" disabled={page >= pages - 1} aria-label="Next"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={`${cat}-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                  className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-line"
                  style={{ borderTop: '1px solid transparent' }}
                >
                  {visible.map((s, i) => (
                    <button key={s.slug} onMouseEnter={() => setSelected(s)} onClick={() => setSelected(s)}
                      className={`p-4 md:p-5 text-left row-hover ${selected?.slug === s.slug ? 'bg-[#FBF8F1]' : ''}`}
                      data-testid={`explore-tile-${s.slug}`}
                    >
                      <StartupLogo startup={s} size={40} />
                      <div className="mt-3 font-display font-medium text-[13.5px] text-ink truncate">{s.name}</div>
                      <div className="mono text-[10.5px] text-slate3 mt-0.5 truncate uppercase tracking-widest"><CountryLabel country={s.country} explicitFlag={s.flag} /></div>
                      <div className="text-[11px] text-slate2 mt-1 truncate">{s.category}</div>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="lg:col-span-1">
              <div className="eyebrow mb-2">Preview</div>
              <CompanyPreview startup={selected} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

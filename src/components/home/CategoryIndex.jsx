import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, STARTUPS } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';

const CATEGORY_IMAGE = {
  'Islamic Finance': 'https://images.unsplash.com/photo-1444653389962-8149286c578a?w=800&auto=format&fit=crop&q=70',
  'Halal Economy': 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=70',
  'AI & SaaS': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=70',
  'E-commerce': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=70',
  'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=70',
  'Health & Wellness': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=70',
  'Modest Fashion': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=70',
  'Media': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=70',
  'Community': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=70',
  'Travel & Hajj': 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&auto=format&fit=crop&q=70',
  'Zakat & Charity': 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop&q=70',
  'Food & Nutrition': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=70',
};

export default function CategoryIndex() {
  const [hover, setHover] = useState(CATEGORIES[0]);
  return (
    <section className="wrap py-16 md:py-24" data-testid="category-index-section">
      <SectionHeading number="06" eyebrow="Category index" title="Twelve slices of the halal economy." subtitle="An editorial index of the categories that make up the Muslim startup ecosystem." />
      <div className="mt-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="border-t border-line">
            {CATEGORIES.map((c, i) => {
              const Icon = Icons[c.icon] || Icons.Sparkles;
              const count = STARTUPS.filter(s => s.category === c.name).length;
              const topCountries = Array.from(new Set(STARTUPS.filter(s => s.category === c.name).map(s => s.country))).slice(0, 3);
              const logos = STARTUPS.filter(s => s.category === c.name).slice(0, 3);
              return (
                <Link key={c.slug} to={`/directory?category=${encodeURIComponent(c.name)}`} onMouseEnter={() => setHover(c)}
                  className="group grid grid-cols-12 items-center gap-4 border-b border-line py-5 row-hover px-2"
                  data-testid={`category-row-${c.slug}`}
                >
                  <div className="col-span-1 mono text-[11.5px] text-slate3">{String(i+1).padStart(2, '0')}</div>
                  <div className="col-span-11 md:col-span-4 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate2 group-hover:text-coral transition" />
                    <div className="font-display text-[22px] md:text-[26px] leading-tight">{c.name}</div>
                  </div>
                  <div className="hidden md:block col-span-3 text-[12.5px] text-slate2">{c.description}</div>
                  <div className="hidden md:block col-span-2">
                    <div className="mono text-[11px] text-slate3 uppercase tracking-widest">Top countries</div>
                    <div className="text-[12.5px] mt-0.5 truncate">{topCountries.join(', ') || '—'}</div>
                  </div>
                  <div className="hidden md:flex col-span-1 items-center -space-x-2">
                    {logos.map(l => (
                      <span key={l.slug} className="w-6 h-6 rounded text-white text-[9px] font-display flex items-center justify-center border border-white" style={{ background: l.logo.color }}>{l.logo.mark}</span>
                    ))}
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <span className="mono text-[12.5px] text-slate2">{String(count).padStart(2,'0')}</span>
                    <Icons.ArrowUpRight className="w-4 h-4 text-slate2 group-hover:text-coral transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="eyebrow mb-3">Category preview</div>
          <motion.div key={hover.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="relative aspect-[4/5] overflow-hidden rounded-md border border-line">
            <img src={CATEGORY_IMAGE[hover.name]} alt={hover.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="mono text-[10.5px] text-white/70 uppercase tracking-widest">Category — {String(CATEGORIES.findIndex(c => c.slug === hover.slug)+1).padStart(2,'0')}</div>
              <div className="font-display text-white text-[28px] mt-1 leading-tight">{hover.name}</div>
              <div className="text-white/70 text-[13px] mt-2 max-w-md">{hover.description}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

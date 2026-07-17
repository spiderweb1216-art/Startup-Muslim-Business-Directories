import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Users2, Globe2, Coins, HandHeart, DollarSign, FileText } from 'lucide-react';
import { STATS } from '@/data/mockData';

const items = [
  { key:'startups', label:'Startups', value:STATS.startups, suffix:'+', icon:Building2, big:true },
  { key:'founders', label:'Founders', value:STATS.founders, suffix:'+', icon:Users2 },
  { key:'countries', label:'Countries', value:STATS.countries, suffix:'+', icon:Globe2 },
  { key:'investors', label:'Investors', value:STATS.investors, suffix:'+', icon:Coins },
  { key:'opportunities', label:'Opportunities', value:STATS.opportunities, suffix:'+', icon:HandHeart },
  { key:'funding', label:'Tracked funding', value:85, prefix:'$', suffix:'M+', icon:DollarSign, big:true },
  { key:'pitches', label:'Startup pitches', value:STATS.pitches, suffix:'+', icon:FileText },
];

function Count({ value, prefix='', suffix='' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now(); const duration = 1400;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="py-16 md:py-24 bg-cream" data-testid="stats-section">
      <div className="wrapper container-p">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            const span = it.big ? 'md:col-span-2' : 'md:col-span-1';
            return (
              <motion.div
                key={it.key} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`${span} rounded-2xl border border-line bg-white p-5 ${it.big ? 'md:p-6' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="eyebrow">{it.label}</div>
                  <Icon className="w-4 h-4 text-brand" />
                </div>
                <div className={`font-display mt-1 text-ink ${it.big ? 'text-[42px] md:text-[54px]' : 'text-[28px] md:text-[32px]'} leading-none`}>
                  <Count value={it.value} prefix={it.prefix || ''} suffix={it.suffix || ''} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

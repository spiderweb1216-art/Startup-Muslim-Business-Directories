import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/common/Section';
import { STARTUPS, CATEGORIES } from '@/data/mockData';

const growthData = [
  { m:'Jul', v:44 },{ m:'Aug', v:52 },{ m:'Sep', v:61 },{ m:'Oct', v:74 },{ m:'Nov', v:88 },{ m:'Dec', v:104 },
];

const topCategories = CATEGORIES.slice(0, 5).map(c => ({ name: c.name, value: STARTUPS.filter(s => s.category === c.name).length + 3 }));
const maxCat = Math.max(...topCategories.map(c => c.value));

const countries = [
  { name:'United Arab Emirates', flag:'🇦🇪', companies:214, growth:'+12%' },
  { name:'United Kingdom', flag:'🇬🇧', companies:178, growth:'+9%' },
  { name:'Malaysia', flag:'🇲🇾', companies:146, growth:'+14%' },
  { name:'Indonesia', flag:'🇮🇩', companies:132, growth:'+11%' },
  { name:'Saudi Arabia', flag:'🇸🇦', companies:118, growth:'+18%' },
];

export default function EcosystemSnapshot() {
  return (
    <section className="bg-canvas" data-testid="ecosystem-snapshot-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading number="03" eyebrow="Snapshot" title="A live snapshot of the ecosystem." subtitle="Where growth is happening, which categories are moving, and where new capital is arriving." />
        <div className="mt-10 grid grid-cols-12 gap-4 md:gap-5">
          {/* Ecosystem map (large) */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="col-span-12 lg:col-span-7 panel-dark p-6 rounded-lg atlas-grid-dark relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow eyebrow-navy">Regions</div>
                <h3 className="mt-2 font-display text-[24px] md:text-[28px] text-white leading-tight">Ecosystem by region</h3>
              </div>
              <div className="mono text-[10.5px] text-white/50">14 hubs</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ['MENA',420,'#D94B3D'],['South-East Asia',312,'#176B58'],['Europe',256,'#8D82D8'],['South Asia',188,'#F3E6D0'],['North America',176,'#8A94A6'],['Africa',124,'#B08040'],
              ].map(([label, n, color]) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-28 shrink-0 text-[12px] text-white/70">{label}</div>
                  <div className="flex-1 h-2 bg-white/8 rounded">
                    <div className="h-full rounded" style={{ width:`${(n/420)*100}%`, background: color }} />
                  </div>
                  <div className="mono text-[12px] text-white w-12 text-right">{n}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-white/50 text-[11px] mono">
              <span>Data · Jan 2026 (mock)</span>
              <span className="inline-flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald" /> +14% YoY</span>
            </div>
          </motion.div>

          {/* Funding activity */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }} className="col-span-12 md:col-span-6 lg:col-span-5 panel p-6">
            <div className="flex items-start justify-between">
              <div><div className="eyebrow">Funding activity</div><h3 className="mt-2 font-display text-[24px] leading-tight">Rounds tracked</h3></div>
              <span className="tag tag-emerald">+18% MoM</span>
            </div>
            <div className="mono text-[36px] mt-2 text-ink">$85M<span className="text-[16px] text-slate2 ml-2">tracked</span></div>
            <div className="h-24 mt-2 -mx-2">
              <ResponsiveContainer>
                <LineChart data={growthData}>
                  <Line type="monotone" dataKey="v" stroke="#D94B3D" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="hr mt-2 pt-3 mono text-[11px] text-slate2 flex justify-between">
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </motion.div>

          {/* Fastest growing categories */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} className="col-span-12 md:col-span-6 lg:col-span-4 panel p-6">
            <div className="eyebrow">Fastest growing categories</div>
            <h3 className="mt-2 font-display text-[22px] leading-tight">Categories in motion</h3>
            <div className="mt-4 space-y-2.5">
              {topCategories.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-[12.5px]">{c.name}</div>
                  <div className="flex-1 h-1.5 bg-sand rounded">
                    <div className="h-full bg-navy rounded" style={{ width: `${(c.value/maxCat)*100}%` }} />
                  </div>
                  <div className="mono text-[11.5px] w-8 text-right text-slate2">{c.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* New this month */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }} className="col-span-6 lg:col-span-2 panel p-5">
            <div className="eyebrow">New this month</div>
            <div className="mono text-[40px] text-ink mt-2 leading-none">47</div>
            <div className="text-[12px] text-slate2 mt-1">Companies added</div>
            <span className="tag tag-emerald mt-3 w-fit">+18</span>
          </motion.div>

          {/* Open pitches */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.14 }} className="col-span-6 lg:col-span-3 panel-dark p-5 rounded-lg">
            <div className="eyebrow eyebrow-navy">Open pitches</div>
            <div className="mono text-[40px] text-white mt-2 leading-none">240<span className="text-[16px] text-white/40">+</span></div>
            <div className="text-[12px] text-white/60 mt-1">Actively raising</div>
            <a href="/pitches" className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-coral hover:underline">Browse pitches <ArrowUpRight className="w-3.5 h-3.5" /></a>
          </motion.div>

          {/* Countries to watch (wide) */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.16 }} className="col-span-12 lg:col-span-7 panel p-6">
            <div className="flex items-center justify-between">
              <div><div className="eyebrow">Countries to watch</div><h3 className="mt-2 font-display text-[24px] leading-tight">Where the ecosystem is compounding</h3></div>
              <span className="mono text-[11px] text-slate2">Winter 2026</span>
            </div>
            <div className="mt-4 divide-y divide-line">
              {countries.map((c, i) => (
                <div key={c.name} className="py-3 flex items-center gap-4">
                  <span className="mono text-[11.5px] text-slate3 w-6">{String(i+1).padStart(2,'0')}</span>
                  <span className="text-[14px] flex-1">{c.flag} {c.name}</span>
                  <span className="mono text-[12.5px] w-16 text-right">{c.companies}</span>
                  <span className="tag tag-emerald w-14 justify-center">{c.growth}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

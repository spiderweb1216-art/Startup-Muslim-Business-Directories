import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Globe2, MapPin } from 'lucide-react';
import { OPPORTUNITIES, formatDate } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';
import SaveButton from '@/components/common/SaveButton';
import { useToast } from '@/context/ToastContext';

const FILTERS = ['Upcoming','Closing soon','Global','Grants','Accelerators'];

export default function OpportunitiesTimeline() {
  const [filter, setFilter] = useState('Upcoming');
  const { toast } = useToast();

  const list = useMemo(() => {
    let l = [...OPPORTUNITIES];
    if (filter === 'Global') l = l.filter(o => o.remote);
    if (filter === 'Grants') l = l.filter(o => o.type === 'Grant');
    if (filter === 'Accelerators') l = l.filter(o => o.type === 'Accelerator');
    if (filter === 'Closing soon') l = [...l].sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
    return [...l].sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  }, [filter]);

  const grouped = list.reduce((acc, o) => {
    const key = new Date(o.deadline).toLocaleString(undefined, { month:'long', year:'numeric' });
    (acc[key] = acc[key] || []).push(o); return acc;
  }, {});

  return (
    <section className="bg-canvas" data-testid="opportunities-timeline-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading
          number="09"
          eyebrow="Opportunities timeline"
          title="Deadlines to watch."
          subtitle="Grants, accelerators, fellowships, and demo days serving Muslim founders — sorted by deadline."
          right={<Link to="/opportunities" className="btn btn-outline btn-sm">View all <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTERS.map(f => <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'on' : ''}`} data-testid={`op-filter-${f}`}>{f}</button>)}
        </div>

        <div className="mt-10">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="grid grid-cols-12 gap-6 md:gap-8 border-t border-line py-8">
              <div className="col-span-12 md:col-span-3">
                <div className="mono text-[11.5px] text-slate3 uppercase tracking-widest">Month</div>
                <div className="font-display text-[28px] mt-1 leading-tight">{month}</div>
                <div className="text-[12.5px] text-slate2 mt-1">{items.length} opportunit{items.length===1?'y':'ies'}</div>
              </div>
              <div className="col-span-12 md:col-span-9 space-y-4">
                {items.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i*0.03 }}
                    className="grid grid-cols-12 gap-4 items-center border border-line rounded-md bg-white p-4 md:p-5" data-testid={`op-timeline-${o.id}`}
                  >
                    <div className="col-span-3 md:col-span-2">
                      <div className="mono text-[11px] text-slate3 uppercase tracking-widest">Deadline</div>
                      <div className="mono text-[14px] mt-1">{formatDate(o.deadline)}</div>
                    </div>
                    <div className="col-span-9 md:col-span-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="tag">{o.type}</span>
                        <span className="tag">{o.organization}</span>
                        {o.remote && <span className="tag tag-emerald"><Globe2 className="w-3 h-3" /> Global</span>}
                      </div>
                      <div className="font-display font-medium text-[16px] mt-2">{o.title}</div>
                      <div className="text-[12.5px] text-slate2 mt-1"><MapPin className="w-3 h-3 inline" /> {o.country}</div>
                    </div>
                    <div className="hidden md:block col-span-2 text-[12px] text-slate2">{o.industry}</div>
                    <div className="col-span-12 md:col-span-2 flex items-center gap-2 md:justify-end">
                      <button className="btn btn-navy btn-sm" onClick={() => toast('Applied (mock).', { type: 'success' })}>Apply</button>
                      <SaveButton type="opportunities" id={o.id} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

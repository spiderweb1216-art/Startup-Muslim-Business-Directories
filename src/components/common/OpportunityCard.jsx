import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Globe2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SaveButton from './SaveButton';
import { formatDate } from '@/data/mockData';
import CountryLabel from './CountryLabel';

export default function OpportunityCard({ op }) {
  const href = `/opportunities/${encodeURIComponent(op.id)}`;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="panel overflow-hidden flex flex-col" data-testid={`opportunity-card-${op.id}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link to={href} aria-label={`View ${op.title}`} className="block w-full h-full bg-canvas">{op.image && <img src={op.image} alt="" loading="lazy" className="w-full h-full object-cover" />}</Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
        <span className="pointer-events-none absolute top-3 left-3 tag !bg-white/95 !border-transparent">{op.type}</span>
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11.5px]">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> <CountryLabel country={op.country} explicitFlag={op.flag} /></span>
          {op.remote && <span className="inline-flex items-center gap-1"><Globe2 className="w-3 h-3" /> Global</span>}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="eyebrow">{op.organization}</div>
        <h4 className="font-display font-medium text-[16px] mt-1"><Link to={href} className="hover:text-coral">{op.title}</Link></h4>
        <p className="text-[12.5px] text-slate2 leading-relaxed mt-2 line-clamp-3">{op.description}</p>
        <div className="mt-3 mono text-[11.5px] text-slate2 inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Deadline {formatDate(op.deadline)}</div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Link to={href} className="btn btn-navy btn-sm" data-testid={`view-opportunity-${op.id}`}>View details <ArrowUpRight size={14}/></Link>
          <SaveButton type="opportunities" id={op.id} />
        </div>
      </div>
    </motion.div>
  );
}

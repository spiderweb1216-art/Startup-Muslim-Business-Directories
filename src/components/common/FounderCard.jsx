import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function FounderCard({ founder, featured = false, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: (index%6)*0.03 }}
      className={`group ${featured ? 'grid grid-cols-1 md:grid-cols-2 gap-0' : 'flex flex-col'} border border-line rounded-md overflow-hidden bg-white`}
      data-testid={`founder-card-${founder.slug}`}
    >
      <div className={featured ? 'relative aspect-[4/5] md:aspect-auto' : 'relative aspect-[4/5]'}>
        <img src={founder.photo} alt={founder.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <span className="absolute top-3 left-3 tag !bg-white/95 !border-transparent">{founder.industry}</span>
      </div>
      <div className="p-5 md:p-6 flex flex-col">
        <div className="eyebrow">{founder.flag} {founder.country}</div>
        <Link to={`/founders/${founder.slug}`} className={`font-display font-semibold mt-2 leading-tight link-under ${featured ? 'text-[26px] md:text-[32px]' : 'text-[18px]'}`}>{founder.name}</Link>
        <div className="text-[12.5px] text-slate2 mt-1">{founder.role}</div>
        {featured && <p className="mt-4 text-[15px] text-ink/85 leading-relaxed italic">“{founder.story}”</p>}
        {!featured && <p className="mt-3 text-[13px] text-slate2 leading-relaxed line-clamp-3">{founder.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {founder.openTo.slice(0, 3).map(o => <span key={o} className="tag">{o.replace('-', ' ')}</span>)}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Link to={`/founders/${founder.slug}`} className="text-[13px] font-medium inline-flex items-center gap-1 hover:text-coral">Read full story <ArrowUpRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import CountryLabel from './CountryLabel';
import { founderOpenToLabel } from '@/constants/founderOptions';

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&auto=format&fit=crop&q=75';

export default function FounderCard({ founder, featured = false, index = 0 }) {
  const openTo = Array.isArray(founder?.openTo) ? founder.openTo : [];
  const image = founder?.photo || FALLBACK_PHOTO;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.03 }}
      className={`group border border-line rounded-2xl overflow-hidden bg-white h-full ${featured ? 'shadow-[0_12px_36px_rgba(15,23,42,0.05)]' : ''}`}
      data-testid={`founder-card-${founder.slug}`}
    >
      <Link to={`/founders/${founder.slug}`} className="block relative overflow-hidden bg-canvas">
        <div className={featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}>
          <img
            src={image}
            alt={founder.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
            onError={(event) => { event.currentTarget.src = FALLBACK_PHOTO; }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent pointer-events-none" />
        {founder.industry && <span className="absolute top-4 left-4 tag !bg-white/95 !border-white/80 shadow-sm">{founder.industry}</span>}
        {featured && <span className="absolute top-4 right-4 rounded-full bg-navy/85 text-white px-3 py-1 text-[10px] mono tracking-[0.12em] uppercase">Featured</span>}
      </Link>

      <div className={`flex flex-col ${featured ? 'p-5 md:p-6' : 'p-5'}`}>
        <div className="eyebrow min-h-[20px]"><CountryLabel country={founder.country} explicitFlag={founder.flag} /></div>
        <Link to={`/founders/${founder.slug}`} className={`font-display font-semibold mt-2 leading-tight link-under ${featured ? 'text-[25px] md:text-[29px]' : 'text-[19px]'}`}>
          {founder.name}
        </Link>
        <div className="text-[12.5px] text-slate2 mt-1">{founder.role || 'Founder'}</div>
        <p className={`mt-3 text-ink/80 leading-relaxed ${featured ? 'text-[14px] line-clamp-3 min-h-[63px]' : 'text-[13px] line-clamp-2'}`}>
          {founder.bio || founder.story || 'Founder profile.'}
        </p>

        {openTo.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {openTo.slice(0, featured ? 4 : 3).map((value) => (
              <span key={value} className="tag bg-canvas border border-line normal-case">{founderOpenToLabel(value)}</span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-line/70 mt-5">
          <span className="text-[11.5px] text-slate2 truncate pr-3">{founder.experience || founder.industry || 'Founder'}</span>
          <Link to={`/founders/${founder.slug}`} className="text-[12.5px] font-medium inline-flex items-center gap-1 hover:text-coral shrink-0">
            View profile <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

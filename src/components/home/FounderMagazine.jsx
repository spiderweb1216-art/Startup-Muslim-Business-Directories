import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { SectionHeading } from '@/components/common/Section';

// Only display founder profiles published in the current database.
export default function FounderMagazine() {
  const { data, databaseStatus } = useData();
  const founders = useMemo(() => databaseStatus === 'connected'
    ? (data.founders || []).filter((f) => f.status === 'Published' && f.name && f.slug)
    : [], [data.founders, databaseStatus]);
  const lead = founders.find((f) => f.story && f.photo) || founders.find((f) => f.photo && f.bio) || founders[0];
  const others = founders.filter((f) => f.slug !== lead?.slug).slice(0, 2);
  // No editorial profile should be substituted from the bundled examples.
  if (!lead) return null;
  const linkedIn = /^https?:\/\//i.test(lead.linkedin || '') ? lead.linkedin : '';

  return (
    <section className="bg-canvas" data-testid="founder-magazine-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading
          number="07"
          eyebrow="Founder profiles"
          title="Operators building publicly."
          subtitle="Stories and profiles of founders published in the directory."
          right={<Link to="/founders" className="btn btn-outline btn-sm">Browse all founders <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="mt-10 grid grid-cols-12 gap-6 md:gap-10">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="col-span-12 md:col-span-6 relative aspect-[4/5] md:aspect-auto md:min-h-[520px] overflow-hidden rounded-md bg-sandLight flex items-center justify-center">
            {lead.photo ? <img src={lead.photo} alt={lead.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <span className="font-display text-[80px] text-slate2">{lead.name.slice(0, 1)}</span>}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 tag !bg-white/95 !border-transparent">Founder profile</div>
          </motion.div>
          <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
            <div className="mono text-[11.5px] text-slate2 uppercase tracking-widest">{lead.industry || 'Founder'}</div>
            <h3 className="font-display text-[38px] md:text-[54px] leading-[1.02] mt-3 text-ink">{lead.name}</h3>
            <div className="text-[13px] text-slate2 mt-1">{lead.role}{lead.startupSlug && <> · <Link to={`/startups/${lead.startupSlug}`} className="link-under text-ink">{lead.startupSlug}</Link></>}</div>
            {lead.story && <blockquote className="mt-8 border-l-2 border-coral pl-5 italic text-[20px] md:text-[24px] leading-snug text-ink">{lead.story}</blockquote>}
            {lead.bio && <p className="text-[14.5px] text-slate2 leading-relaxed mt-6 max-w-lg">{lead.bio}</p>}
            <div className="mt-6 flex items-center gap-3">
              <Link to={`/founders/${lead.slug}`} className="btn btn-navy btn-sm">View founder <ArrowUpRight className="w-3.5 h-3.5" /></Link>
              {linkedIn && <a href={linkedIn} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</a>}
            </div>
          </div>
        </div>
        {others.length > 0 && <div className="mt-14 grid grid-cols-12 gap-6">
          {others.map((founder) => (
            <Link key={founder.slug} to={`/founders/${founder.slug}`} className="col-span-12 md:col-span-6 group grid grid-cols-3 gap-5 items-center border-t border-line pt-6">
              <div className="col-span-1 relative aspect-square overflow-hidden rounded-md bg-sandLight flex items-center justify-center">
                {founder.photo ? <img src={founder.photo} alt={founder.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <span className="font-display text-[30px] text-slate2">{founder.name.slice(0,1)}</span>}
              </div>
              <div className="col-span-2">
                <div className="mono text-[10.5px] text-slate3 uppercase tracking-widest">{founder.industry}</div>
                <div className="font-display text-[22px] mt-1 leading-tight">{founder.name}</div>
                <p className="text-[12.5px] text-slate2 mt-2 line-clamp-2">{founder.bio}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-ink group-hover:text-coral">View profile <ArrowUpRight className="w-3.5 h-3.5" /></div>
              </div>
            </Link>
          ))}
        </div>}
      </div>
    </section>
  );
}

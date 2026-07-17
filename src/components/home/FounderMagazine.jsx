import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import { FOUNDERS } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';

export default function FounderMagazine() {
  const lead = FOUNDERS[3]; // Imran Siddiqui — DeenAI
  const others = [FOUNDERS[0], FOUNDERS[4]];
  return (
    <section className="bg-canvas" data-testid="founder-magazine-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading
          number="07"
          eyebrow="Founder story"
          title="Operators building publicly."
          subtitle="A monthly conversation with a founder reshaping the halal economy."
          right={<Link to="/founders" className="btn btn-outline btn-sm">Browse all founders <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="mt-10 grid grid-cols-12 gap-6 md:gap-10">
          {/* Large founder image */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="col-span-12 md:col-span-6 relative aspect-[4/5] md:aspect-auto md:min-h-[520px] overflow-hidden rounded-md">
            <img src={lead.photo} alt={lead.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 tag !bg-white/95 !border-transparent">Story · Winter 2026</div>
            <div className="absolute bottom-4 left-4 text-white mono text-[10.5px] uppercase tracking-widest">Photographed in Toronto</div>
          </motion.div>

          {/* Story text */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
            <div className="mono text-[11.5px] text-slate2 uppercase tracking-widest">Issue 04 — {lead.industry}</div>
            <h3 className="font-display text-[38px] md:text-[54px] leading-[1.02] mt-3 text-ink">{lead.name}</h3>
            <div className="text-[13px] text-slate2 mt-1">{lead.role} · {lead.startupSlug && <Link to={`/startups/${lead.startupSlug}`} className="link-under text-ink">{lead.startupSlug}</Link>}</div>
            <blockquote className="mt-8 border-l-2 border-coral pl-5 italic text-[20px] md:text-[24px] leading-snug text-ink">
              “{lead.story}”
            </blockquote>
            <p className="text-[14.5px] text-slate2 leading-relaxed mt-6 max-w-lg">{lead.bio}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link to={`/founders/${lead.slug}`} className="btn btn-navy btn-sm">Read full story <ArrowUpRight className="w-3.5 h-3.5" /></Link>
              <a href={lead.linkedin} className="btn btn-outline btn-sm"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Smaller founder mentions */}
        <div className="mt-14 grid grid-cols-12 gap-6">
          {others.map(f => (
            <Link key={f.slug} to={`/founders/${f.slug}`} className="col-span-12 md:col-span-6 group grid grid-cols-3 gap-5 items-center border-t border-line pt-6">
              <div className="col-span-1 relative aspect-square overflow-hidden rounded-md">
                <img src={f.photo} alt={f.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="col-span-2">
                <div className="mono text-[10.5px] text-slate3 uppercase tracking-widest">{f.industry}</div>
                <div className="font-display text-[22px] mt-1 leading-tight">{f.name}</div>
                <p className="text-[12.5px] text-slate2 mt-2 line-clamp-2">{f.bio}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-ink group-hover:text-coral">Read story <ArrowUpRight className="w-3.5 h-3.5" /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

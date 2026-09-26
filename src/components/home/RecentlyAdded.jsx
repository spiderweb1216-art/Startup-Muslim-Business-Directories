import React from 'react';
import { Link } from 'react-router-dom';
import { STARTUPS, formatDate } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';
import { StartupLogo } from '@/components/common/Logo';
import { ArrowRight, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import CountryLabel from '@/components/common/CountryLabel';

export default function RecentlyAdded() {
  const list = [...STARTUPS].sort((a,b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 8);
  return (
    <section className="py-16 md:py-24" data-testid="recently-added-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Fresh listings"
          title="Recently added."
          subtitle="The latest startups joining the Startup Muslim ecosystem."
          right={<Link to="/startups" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">View all <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((s, i) => (
            <motion.div key={s.slug}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: (i%4)*0.05 }}
            >
              <Link to={`/startups/${s.slug}`} className="group flex items-center gap-4 p-4 border border-line rounded-2xl bg-white hover:shadow-soft transition-shadow" data-testid={`recent-startup-${s.slug}`}>
                <StartupLogo startup={s} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-[16px] text-ink">{s.name}</span>
                    {s.verified && <BadgeCheck className="w-4 h-4 text-status-verified" />}
                    <span className="badge bg-brand-soft text-brand-dark ml-1">Recently added</span>
                  </div>
                  <div className="text-[12.5px] text-subtle mt-0.5 truncate">{s.tagline}</div>
                  <div className="text-[11.5px] text-subtle mt-1 flex items-center gap-2 flex-wrap">
                    <span><CountryLabel country={s.country} explicitFlag={s.flag} /></span><span className="dot-sep" />
                    <span>{s.category}</span><span className="dot-sep" />
                    <span>{s.stage}</span><span className="dot-sep" />
                    <span>Added {formatDate(s.addedAt)}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-subtle group-hover:text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

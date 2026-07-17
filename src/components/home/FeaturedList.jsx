import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Flame } from 'lucide-react';
import { STARTUPS } from '@/data/mockData';
import { StartupListRow } from '@/components/common/StartupCard';
import { StartupLogo } from '@/components/common/Logo';
import { SectionHeading } from '@/components/common/Section';
import { formatMoney, getFoundersByStartup } from '@/data/mockData';

export default function FeaturedList() {
  const list = STARTUPS.filter(s => s.verified).slice(0, 10);
  const [active, setActive] = useState(list[0]);

  return (
    <section className="wrap py-16 md:py-24" data-testid="featured-list-section">
      <SectionHeading
        number="04"
        eyebrow="Featured companies"
        title="A ranked view of what’s moving."
        subtitle="Ten Muslim-led companies with recent traction, funding activity, or product momentum."
        right={<Link to="/startups" className="btn btn-outline btn-sm">See all companies <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
      />
      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Ranked editorial list */}
        <div className="col-span-12 lg:col-span-8 border border-line rounded-md bg-white overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 md:px-5 py-3 border-b border-line bg-sandLight/50">
            <div className="col-span-1 eyebrow">#</div>
            <div className="col-span-6 md:col-span-4 eyebrow">Company</div>
            <div className="hidden md:block col-span-2 eyebrow">Category</div>
            <div className="hidden md:block col-span-1 eyebrow">Stage</div>
            <div className="col-span-3 md:col-span-2 eyebrow text-right md:text-left">Raised</div>
            <div className="hidden md:block col-span-1 eyebrow">Team</div>
            <div className="col-span-2 md:col-span-1 eyebrow text-right"></div>
          </div>
          {list.map((s, i) => (
            <StartupListRow key={s.slug} startup={s} index={i} active={active?.slug === s.slug} onSelect={setActive} />
          ))}
        </div>

        {/* Right featured company panel — updates as user hovers */}
        <div className="col-span-12 lg:col-span-4">
          <div className="eyebrow mb-3">Featured company</div>
          <FeaturedPanel startup={active} />
        </div>
      </div>
    </section>
  );
}

function FeaturedPanel({ startup }) {
  const founders = getFoundersByStartup(startup.slug);
  return (
    <motion.div key={startup.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="border border-line rounded-md overflow-hidden bg-white">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={startup.banner} alt="" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="mono uppercase tracking-widest">{startup.stage}</span>
          <span className="mono">{startup.flag} {startup.country}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <StartupLogo startup={startup} size={48} />
          <div>
            <div className="text-white font-display font-medium">{startup.name}</div>
            <div className="text-white/70 text-[11.5px]">{startup.category}</div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[13.5px] text-slate2 leading-relaxed line-clamp-3">{startup.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Cell label="Total raised" value={formatMoney(startup.totalRaised)} />
          <Cell label="Team" value={startup.teamSize} />
          <Cell label="Founded" value={startup.foundedYear} />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {startup.verified && <span className="tag tag-navy"><BadgeCheck className="w-3 h-3" /> Verified</span>}
          {startup.pitching && <span className="tag tag-coral"><Flame className="w-3 h-3" /> Pitching</span>}
        </div>
        {founders.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {founders.slice(0, 3).map(f => <img key={f.id} src={f.photo} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" loading="lazy" />)}
            </div>
            <span className="text-[12px] text-slate2">{founders.map(f => f.name).join(' · ')}</span>
          </div>
        )}
        <Link to={`/startups/${startup.slug}`} className="btn btn-navy btn-sm mt-5 w-full justify-center">Open profile <ArrowUpRight className="w-3.5 h-3.5" /></Link>
      </div>
    </motion.div>
  );
}

function Cell({ label, value }) {
  return <div><div className="eyebrow">{label}</div><div className="mono text-[14px] mt-0.5">{value}</div></div>;
}

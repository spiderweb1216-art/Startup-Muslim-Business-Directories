import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Flame } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { StartupListRow } from '@/components/common/StartupCard';
import { StartupLogo } from '@/components/common/Logo';
import { SectionHeading } from '@/components/common/Section';
import { formatMoney } from '@/data/mockData';
import CountryLabel from '@/components/common/CountryLabel';

export default function FeaturedList() {
  const { data, databaseStatus } = useData();
  const [activeSlug, setActiveSlug] = useState('');
  const list = useMemo(() => {
    if (databaseStatus !== 'connected') return [];
    return (data.startups || [])
      .filter((startup) => startup.status === 'Published')
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(Boolean(b.verified)) - Number(Boolean(a.verified)))
      .slice(0, 10);
  }, [data.startups, databaseStatus]);
  const active = list.find((startup) => startup.slug === activeSlug) || list[0] || null;
  const founders = useMemo(() => active ? (data.founders || []).filter((f) => f.status === 'Published' && f.startupSlug === active.slug) : [], [data.founders, active]);

  return (
    <section className="wrap py-16 md:py-24" data-testid="featured-list-section">
      <SectionHeading
        number="04"
        eyebrow="Featured companies"
        title="A ranked view of what’s moving."
        subtitle="Published companies from the live directory, with featured listings shown first."
        right={<Link to="/startups" className="btn btn-outline btn-sm">See all companies <ArrowUpRight className="w-3.5 h-3.5" /></Link>}
      />
      {list.length === 0 ? (
        <div className="mt-10 p-8 text-center border border-line rounded-md bg-white text-[13px] text-slate2">{databaseStatus === 'connected' ? 'No published companies available yet.' : 'Loading live company data…'}</div>
      ) : (
        <div className="mt-10 grid grid-cols-12 gap-6">
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
            {list.map((startup, i) => (
              <StartupListRow key={startup.slug} startup={startup} index={i} active={active?.slug === startup.slug} onSelect={(item) => setActiveSlug(item.slug)} />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="eyebrow mb-3">Featured company</div>
            <FeaturedPanel startup={active} founders={founders} />
          </div>
        </div>
      )}
    </section>
  );
}

function FeaturedPanel({ startup, founders }) {
  if (!startup) return null;
  return (
    <motion.div key={startup.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="border border-line rounded-md overflow-hidden bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-sandLight">
        {startup.banner && <img src={startup.banner} alt="" loading="lazy" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="mono uppercase tracking-widest">{startup.stage || 'Company'}</span>
          <span className="mono"><CountryLabel country={startup.country} explicitFlag={startup.flag} /></span>
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
        <p className="text-[13.5px] text-slate2 leading-relaxed line-clamp-3">{startup.description || startup.tagline || 'No company description is available.'}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Cell label="Total raised" value={Number(startup.totalRaised) > 0 ? formatMoney(startup.totalRaised) : '—'} />
          <Cell label="Team" value={startup.teamSize || '—'} />
          <Cell label="Founded" value={startup.foundedYear || '—'} />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {startup.verified && <span className="tag tag-navy"><BadgeCheck className="w-3 h-3" /> Verified</span>}
          {startup.pitching && <span className="tag tag-coral"><Flame className="w-3 h-3" /> Pitching</span>}
        </div>
        {founders.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">{founders.slice(0, 3).map((f) => f.photo ? <img key={f.slug} src={f.photo} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" loading="lazy" /> : null)}</div>
            <span className="text-[12px] text-slate2">{founders.map((f) => f.name).join(' · ')}</span>
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

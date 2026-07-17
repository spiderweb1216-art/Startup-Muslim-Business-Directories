import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, BadgeCheck, Flame, Handshake, Briefcase } from 'lucide-react';
import { StartupLogo } from './Logo';
import SaveButton from './SaveButton';
import { formatMoney, getFoundersByStartup } from '@/data/mockData';

// Editorial ranked list row — used in Featured Companies list
export function StartupListRow({ startup, index, active, onSelect }) {
  const rank = String((index ?? 0) + 1).padStart(2, '0');
  const founders = getFoundersByStartup(startup.slug);
  const alt = ((index ?? 0) % 2 === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.35, delay: (index % 6) * 0.03 }}
      onMouseEnter={() => onSelect?.(startup)}
      className={`group grid grid-cols-12 items-center gap-4 px-4 md:px-5 py-4 border-b border-line row-hover ${active ? 'bg-[#FBF8F1]' : ''} ${alt ? '' : ''}`}
      data-testid={`startup-row-${startup.slug}`}
    >
      <div className="col-span-1 mono text-[11.5px] text-slate2">{rank}</div>
      <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
        <StartupLogo startup={startup} size={38} />
        <div className="min-w-0">
          <Link to={`/startups/${startup.slug}`} className="font-display font-medium text-[15px] text-ink truncate link-under">{startup.name}</Link>
          <div className="text-[12px] text-slate2 truncate">{startup.tagline}</div>
        </div>
      </div>
      <div className="hidden md:block col-span-2 text-[12.5px] text-slate2">
        <div>{startup.category}</div>
        <div className="mono text-[11px] text-slate3">{startup.flag} {startup.country}</div>
      </div>
      <div className="hidden md:block col-span-1 mono text-[11.5px] text-slate2">{startup.stage}</div>
      <div className="col-span-3 md:col-span-2 text-right md:text-left">
        <div className="mono text-[13px] text-ink">{formatMoney(startup.totalRaised)}</div>
        <div className="mono text-[10.5px] text-slate3 uppercase tracking-widest">raised</div>
      </div>
      <div className="hidden md:flex col-span-1 items-center -space-x-2">
        {founders.slice(0,3).map(f => <img key={f.id} src={f.photo} alt="" className="w-6 h-6 rounded-full border border-white object-cover" loading="lazy" />)}
      </div>
      <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
        <SaveButton type="startups" id={startup.slug} />
        <Link to={`/startups/${startup.slug}`} className="w-8 h-8 rounded-md border border-line inline-flex items-center justify-center hover:border-ink hover:text-coral transition" aria-label="View profile">
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// Compact company preview panel — used on the right in Explore / Directory
export function CompanyPreview({ startup }) {
  if (!startup) return null;
  const founders = getFoundersByStartup(startup.slug);
  return (
    <motion.div key={startup.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="panel overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="flex items-center gap-3">
          <StartupLogo startup={startup} size={48} />
          <div className="min-w-0">
            <Link to={`/startups/${startup.slug}`} className="font-display font-medium text-[18px] link-under">{startup.name}</Link>
            <div className="text-[12px] text-slate2 truncate">{startup.tagline}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {startup.verified && <span className="tag tag-navy"><BadgeCheck className="w-3 h-3" /> Verified</span>}
          {startup.openToFunding && <span className="tag tag-emerald"><Handshake className="w-3 h-3" /> Funding</span>}
          {startup.pitching && <span className="tag tag-coral"><Flame className="w-3 h-3" /> Pitching</span>}
          {startup.hiring && <span className="tag tag-amber"><Briefcase className="w-3 h-3" /> Hiring</span>}
        </div>
      </div>
      <div className="p-5 space-y-2 text-[13px]">
        <Row k="Category" v={startup.category} />
        <Row k="Country" v={<span>{startup.flag} {startup.country}</span>} />
        <Row k="Stage" v={<span className="mono">{startup.stage}</span>} />
        <Row k="Total raised" v={<span className="mono">{formatMoney(startup.totalRaised)}</span>} />
        <Row k="Team" v={<span className="mono">{startup.teamSize}</span>} />
        <Row k="Founded" v={<span className="mono">{startup.foundedYear}</span>} />
      </div>
      {founders.length > 0 && (
        <div className="px-5 pb-5">
          <div className="eyebrow mb-2">Founders</div>
          <div className="flex flex-wrap gap-2">
            {founders.map(f => (
              <Link key={f.slug} to={`/founders/${f.slug}`} className="flex items-center gap-2 border border-line rounded-md pr-2 hover:border-ink">
                <img src={f.photo} alt="" className="w-6 h-6 rounded-md object-cover" loading="lazy" />
                <span className="text-[12px]">{f.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="p-5 border-t border-line flex items-center justify-between">
        <Link to={`/startups/${startup.slug}`} className="btn btn-navy btn-sm">View company <ArrowUpRight className="w-3.5 h-3.5" /></Link>
        <SaveButton type="startups" id={startup.slug} />
      </div>
    </motion.div>
  );
}

function Row({ k, v }) {
  return <div className="flex items-center justify-between border-b border-line/60 pb-2 last:border-none last:pb-0"><span className="text-slate2 text-[12.5px]">{k}</span><span className="text-ink">{v}</span></div>;
}

// Grid card fallback for /startups page
export default function StartupCard({ startup, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: (index%6)*0.03 }}
      className="panel p-4 flex flex-col group" data-testid={`startup-card-${startup.slug}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StartupLogo startup={startup} />
          <div>
            <Link to={`/startups/${startup.slug}`} className="font-display font-medium link-under text-[15px]">{startup.name}</Link>
            <div className="text-[11.5px] text-slate2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {startup.country}</div>
          </div>
        </div>
        <SaveButton type="startups" id={startup.slug} />
      </div>
      <p className="text-[13px] text-slate2 leading-relaxed mt-3 line-clamp-2">{startup.tagline}</p>
      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
        <div><div className="mono text-[11px] text-slate3 uppercase">Raised</div><div className="mono text-[14px]">{formatMoney(startup.totalRaised)}</div></div>
        <Link to={`/startups/${startup.slug}`} className="text-[12.5px] inline-flex items-center gap-1 hover:text-coral">View <ArrowUpRight className="w-3.5 h-3.5" /></Link>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { InvestorLogo } from './Logo';
import SaveButton from './SaveButton';

export default function InvestorCard({ investor }) {
  return (
    <div className="panel p-5 flex flex-col group" data-testid={`investor-card-${investor.slug}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <InvestorLogo investor={investor} />
          <div>
            <Link to={`/investors/${investor.slug}`} className="font-display font-medium text-[16px] link-under">{investor.name}</Link>
            <div className="text-[11.5px] text-slate2 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {investor.flag} {investor.country}</div>
          </div>
        </div>
        <SaveButton type="investors" id={investor.slug} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div><div className="eyebrow">Type</div><div className="text-[12.5px] mt-1">{investor.type}</div></div>
        <div><div className="eyebrow">Ticket</div><div className="mono text-[12.5px] mt-1">{investor.ticketRange}</div></div>
        <div><div className="eyebrow">Portfolio</div><div className="mono text-[12.5px] mt-1">{investor.portfolioCount} companies</div></div>
        <div><div className="eyebrow">Stages</div><div className="text-[12.5px] mt-1">{investor.stageFocus.join(', ')}</div></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{investor.focus.slice(0, 3).map(f => <span key={f} className="tag">{f}</span>)}</div>
      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
        <div className="text-[11.5px] text-slate2">Since {2018 + (investor.slug.length % 4)}</div>
        <Link to={`/investors/${investor.slug}`} className="text-[13px] inline-flex items-center gap-1 hover:text-coral">View <ArrowUpRight className="w-3.5 h-3.5" /></Link>
      </div>
    </div>
  );
}

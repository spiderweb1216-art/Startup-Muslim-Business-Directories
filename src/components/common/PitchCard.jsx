import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Flame } from 'lucide-react';
import { StartupLogo } from './Logo';
import SaveButton from './SaveButton';
import { formatDate, formatMoney, getStartupBySlug } from '@/data/mockData';

export default function PitchCard({ pitch }) {
  const s = getStartupBySlug(pitch.startupSlug);
  if (!s) return null;
  return (
    <div className="panel p-5 flex flex-col group" data-testid={`pitch-card-${pitch.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StartupLogo startup={s} />
          <div>
            <Link to={`/startups/${s.slug}#pitch`} className="font-display font-medium text-[16px] link-under">{s.name}</Link>
            <div className="text-[11.5px] text-slate2">{s.category} · {s.country}</div>
          </div>
        </div>
        <SaveButton type="pitches" id={pitch.id} />
      </div>
      <span className="mt-3 tag tag-coral w-fit"><Flame className="w-3 h-3" /> Active pitch</span>
      <h4 className="font-display font-medium text-[15px] mt-2">{pitch.pitchTitle}</h4>
      <p className="text-[12.5px] text-slate2 leading-relaxed mt-1 line-clamp-2">{pitch.summary}</p>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-line">
        <Cell k="Raising" v={formatMoney(pitch.requested)} />
        <Cell k="Equity" v={`${pitch.equity}%`} />
        <Cell k="Val" v={formatMoney(pitch.valuation)} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11.5px] text-slate3 mono">Submitted {formatDate(pitch.submitted)}</span>
        <Link to={`/startups/${s.slug}#pitch`} className="text-[13px] font-medium inline-flex items-center gap-1 text-coral">View pitch <ArrowUpRight className="w-3.5 h-3.5" /></Link>
      </div>
    </div>
  );
}

function Cell({ k, v }) {
  return <div><div className="eyebrow">{k}</div><div className="mono text-[13px] mt-0.5">{v}</div></div>;
}

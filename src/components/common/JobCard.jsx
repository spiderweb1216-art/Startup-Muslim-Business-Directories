import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { StartupLogo } from './Logo';
import SaveButton from './SaveButton';
import { useToast } from '@/context/ToastContext';
import { formatDate, getStartupBySlug } from '@/data/mockData';

export default function JobCard({ job }) {
  const s = getStartupBySlug(job.startupSlug);
  const { toast } = useToast();
  if (!s) return null;
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-4 border-b border-line px-4 md:px-5 row-hover" data-testid={`job-card-${job.id}`}>
      <div className="col-span-1 hidden md:block"><StartupLogo startup={s} size={38} /></div>
      <div className="col-span-8 md:col-span-5">
        <div className="font-display font-medium text-[15px]">{job.title}</div>
        <div className="text-[11.5px] text-slate2 mt-0.5"><Link to={`/startups/${s.slug}`} className="link-under">{s.name}</Link> · <MapPin className="w-3 h-3 inline" /> {job.location}</div>
      </div>
      <div className="hidden md:block col-span-2 text-[12.5px]"><span className="tag">{job.arrangement}</span></div>
      <div className="hidden md:block col-span-1 text-[12.5px]"><span className="tag">{job.type}</span></div>
      <div className="hidden md:block col-span-1 mono text-[11.5px] text-slate2"><Clock className="w-3 h-3 inline" /> {formatDate(job.posted)}</div>
      <div className="col-span-4 md:col-span-2 flex items-center gap-2 justify-end">
        <button className="btn btn-outline btn-sm" onClick={() => toast('Application sent (mock).')} data-testid={`apply-job-${job.id}`}>Apply</button>
        <SaveButton type="jobs" id={job.id} />
      </div>
    </div>
  );
}

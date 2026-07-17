import React, { useMemo, useState } from 'react';
import { JOBS } from '@/data/mockData';
import JobCard from '@/components/common/JobCard';
import { SectionHeading, EmptyState } from '@/components/common/Section';

export default function Jobs() {
  const [arr, setArr] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const list = useMemo(() => {
    let l = [...JOBS];
    if (arr) l = l.filter(j => j.arrangement === arr);
    if (type) l = l.filter(j => j.type === type);
    if (level) l = l.filter(j => j.level === level);
    return l;
  }, [arr, type, level]);
  return (
    <div className="wrap pt-10 pb-24" data-testid="jobs-page">
      <SectionHeading eyebrow="Jobs" title="Careers in the ecosystem." subtitle="Values-aligned roles at Muslim-led startups worldwide." />
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {['','Remote','Hybrid','On-site'].map(a => <button key={a || 'all'} onClick={() => setArr(a)} className={`chip ${arr === a ? 'active' : ''}`}>{a || 'All arrangements'}</button>)}
        <select value={type} onChange={e=>setType(e.target.value)} className="ml-auto bg-white border border-line rounded-full px-4 py-2 text-[13px]">
          <option value="">All types</option>
          {['Full-time','Part-time','Internship','Contract'].map(t=><option key={t}>{t}</option>)}
        </select>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="bg-white border border-line rounded-full px-4 py-2 text-[13px]">
          <option value="">All levels</option>
          {['Junior','Mid','Senior','Lead'].map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="mt-8 space-y-3">
        {list.length === 0 ? <EmptyState title="No jobs match your filters" /> : list.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
      </div>
    </div>
  );
}

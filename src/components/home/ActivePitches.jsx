import React from 'react';
import { Link } from 'react-router-dom';
import { PITCHES } from '@/data/mockData';
import PitchCard from '@/components/common/PitchCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export default function ActivePitches() {
  const list = PITCHES.slice(0, 4);
  return (
    <section className="py-16 md:py-24 relative" style={{ background: 'linear-gradient(180deg, #FCECEC 0%, #F7F5F0 100%)' }} data-testid="active-pitches-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Actively raising"
          title="Startup pitches, live."
          subtitle="Explore startups currently raising investment across the Muslim startup ecosystem."
          right={<Link to="/pitches" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">View all pitches <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {list.map((p, i) => <PitchCard key={p.id} pitch={p} index={i} />)}
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-white p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
          <p className="text-[12.5px] text-subtle leading-relaxed flex-1">
            Pitches are listed for informational purposes only and do not constitute investment advice, Shariah certification, or endorsement. Investors should conduct independent due diligence before making any decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

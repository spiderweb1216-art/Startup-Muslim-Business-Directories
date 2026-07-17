import React from 'react';
import { PITCHES } from '@/data/mockData';
import PitchCard from '@/components/common/PitchCard';
import { SectionHeading } from '@/components/common/Section';

export default function Pitches() {
  return (
    <div className="wrap pt-10 pb-24" data-testid="pitches-page">
      <SectionHeading eyebrow="Active pitches" title="Startups currently raising." subtitle="Explore live investment pitches from Muslim founders across the ecosystem." />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PITCHES.map((p, i) => <PitchCard key={p.id} pitch={p} index={i} />)}
      </div>
      <div className="mt-10 border border-line rounded-2xl bg-white p-5 text-[12.5px] text-slate2 leading-relaxed">
        Pitches are provided for informational purposes only and do not constitute investment advice, Shariah certification, or endorsement. Investors should conduct independent due diligence.
      </div>
    </div>
  );
}

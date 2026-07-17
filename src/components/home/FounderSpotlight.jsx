import React from 'react';
import { FOUNDERS } from '@/data/mockData';
import FounderCard from '@/components/common/FounderCard';
import { SectionHeading } from '@/components/common/Section';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FounderSpotlight() {
  const feature = FOUNDERS[3];
  const others = [FOUNDERS[0], FOUNDERS[4]];
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" data-testid="founder-spotlight-section">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="wrapper container-p relative">
        <SectionHeading
          eyebrow="Founder spotlight"
          title="Operators building publicly."
          subtitle="Meet the operators, technologists, and community builders behind the ecosystem."
          right={<Link to="/founders" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">Browse founders <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
          <div className="lg:col-span-2">
            <FounderCard founder={feature} featured />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
            {others.map((f, i) => <FounderCard key={f.slug} founder={f} index={i+1} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { OPPORTUNITIES } from '@/data/mockData';
import OpportunityCard from '@/components/common/OpportunityCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight } from 'lucide-react';

export default function FundingPreview() {
  const list = OPPORTUNITIES.slice(0, 3);
  return (
    <section className="py-16 md:py-24 bg-cream" data-testid="funding-preview-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Funding & opportunities"
          title="Grants, accelerators, and demo days."
          subtitle="Curated funding programs, competitions, fellowships, and demo days serving Muslim founders globally."
          right={<Link to="/funding" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">View all opportunities <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {list.map((o, i) => <OpportunityCard key={o.id} op={o} index={i} />)}
        </div>
      </div>
    </section>
  );
}

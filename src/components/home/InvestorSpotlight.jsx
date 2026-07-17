import React from 'react';
import { Link } from 'react-router-dom';
import { INVESTORS, STARTUPS } from '@/data/mockData';
import InvestorCard from '@/components/common/InvestorCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight } from 'lucide-react';

export default function InvestorSpotlight() {
  const list = INVESTORS.slice(0, 3);
  return (
    <section className="py-16 md:py-24" data-testid="investor-spotlight-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Investors"
          title="Investors supporting the ecosystem."
          subtitle="Venture capital funds, syndicates, and angels backing Muslim founders and halal-economy companies."
          right={<Link to="/investors" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">Browse investors <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {list.map((inv, i) => (
            <div key={inv.slug} className="flex flex-col gap-3">
              <InvestorCard investor={inv} index={i} />
              <div className="border border-line bg-cream/80 rounded-2xl p-4">
                <div className="eyebrow">Portfolio</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {inv.portfolio.slice(0, 6).map(ps => {
                    const s = STARTUPS.find(x => x.slug === ps);
                    if (!s) return null;
                    return (
                      <Link key={s.slug} to={`/startups/${s.slug}`} className="inline-flex items-center gap-1.5 badge border border-line bg-white hover:border-brand/50">
                        <span className="w-4 h-4 rounded" style={{ background: s.logo.color }} />
                        {s.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

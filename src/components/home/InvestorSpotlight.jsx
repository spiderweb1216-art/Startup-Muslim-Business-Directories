import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import InvestorCard from '@/components/common/InvestorCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { getInvestorPortfolio, isPublicInvestorRecord } from '@/lib/investorData';

export default function InvestorSpotlight() {
  const { data, databaseStatus } = useData();
  const list = useMemo(() => (data.investors || [])
    .filter(isPublicInvestorRecord)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 3), [data.investors]);

  if (databaseStatus !== 'connected' || list.length === 0) return null;

  return (
    <section className="py-16 md:py-24" data-testid="investor-spotlight-section">
      <div className="wrapper container-p">
        <SectionHeading eyebrow="Investors" title="Investors supporting the ecosystem." subtitle="Venture capital funds, syndicates, and angels backing Muslim founders and halal-economy companies." right={<Link to="/investors" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">Browse investors <ArrowRight className="w-4 h-4" /></Link>} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {list.map((investor, index) => {
            const portfolio = getInvestorPortfolio(investor, data.startups || [], data.rounds || []);
            return <div key={investor.slug} className="flex flex-col gap-3">
              <InvestorCard investor={investor} index={index} portfolioCount={portfolio.length} />
              {portfolio.length > 0 && <div className="border border-line bg-cream/80 rounded-2xl p-4"><div className="eyebrow">Portfolio</div><div className="mt-2 flex flex-wrap gap-1.5">{portfolio.slice(0, 6).map((startup) => <Link key={startup.slug} to={`/startups/${startup.slug}`} className="inline-flex items-center gap-1.5 badge border border-line bg-white hover:border-brand/50"><span className="w-4 h-4 rounded" style={{ background: startup.logo?.color || '#111827' }} />{startup.name}</Link>)}</div></div>}
            </div>;
          })}
        </div>
      </div>
    </section>
  );
}

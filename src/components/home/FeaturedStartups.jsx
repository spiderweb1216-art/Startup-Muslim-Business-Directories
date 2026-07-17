import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STARTUPS, CATEGORIES } from '@/data/mockData';
import StartupCard from '@/components/common/StartupCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight } from 'lucide-react';

export default function FeaturedStartups() {
  const [cat, setCat] = useState('All');
  const filtered = useMemo(() => {
    const list = cat === 'All' ? STARTUPS : STARTUPS.filter(s => s.category === cat);
    return list.filter(s => s.verified).slice(0, 6);
  }, [cat]);

  return (
    <section className="py-16 md:py-24" data-testid="featured-startups-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Featured startups"
          title="Ecosystem in motion."
          subtitle="Explore promising companies from across the global Muslim startup ecosystem."
          right={<Link to="/startups" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">View all startups <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="mt-6 flex flex-wrap gap-2 thin-scroll overflow-x-auto pb-2">
          {['All', ...CATEGORIES.slice(0, 8).map(c => c.name)].map(name => (
            <button key={name} onClick={() => setCat(name)} className={`chip ${cat === name ? 'active' : ''}`} data-testid={`featured-filter-${name}`}>{name}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {filtered.map((s, i) => <StartupCard key={s.slug} startup={s} index={i} />)}
        </div>
      </div>
    </section>
  );
}

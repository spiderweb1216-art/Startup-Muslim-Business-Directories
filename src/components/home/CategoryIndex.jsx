import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '@/data/mockData';
import { useData } from '@/context/DataContext';

const isPublished = (record = {}) => ![
  'Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive', 'Revoked', 'Cancelled',
].includes(record.status || 'Published');

export default function CategoryIndex() {
  const { data } = useData();

  const companies = useMemo(
    () => (data.startups || []).filter(isPublished),
    [data.startups]
  );

  const counts = useMemo(() => {
    const map = new Map();
    companies.forEach((company) => {
      const category = String(company.category || '').trim();
      if (!category) return;
      map.set(category, (map.get(category) || 0) + 1);
    });
    return map;
  }, [companies]);

  const activeCategoryCount = CATEGORIES.filter((category) => (counts.get(category.name) || 0) > 0).length;

  return (
    <section className="wrap py-10 md:py-12" data-testid="category-index-section">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="eyebrow">— Category index</div>
          <h2 className="font-display text-[28px] md:text-[34px] leading-[1.05] text-ink mt-2">
            Explore the halal economy.
          </h2>
          <p className="text-[13.5px] text-slate2 mt-2 max-w-xl">
            Twelve sectors in one compact view. Counts update from published companies in the database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="tag bg-white border border-line"><strong className="mr-1">{companies.length}</strong> companies</span>
          <span className="tag bg-white border border-line"><strong className="mr-1">{activeCategoryCount}</strong> active sectors</span>
          <Link to="/directory" className="btn btn-outline btn-sm">Browse all <Icons.ArrowUpRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6">
        {CATEGORIES.map((category, index) => {
          const Icon = Icons[category.icon] || Icons.Sparkles;
          const count = counts.get(category.name) || 0;

          return (
            <Link
              key={category.slug}
              to={`/directory?category=${encodeURIComponent(category.name)}`}
              className="group min-h-[104px] rounded-xl border border-line bg-white p-3.5 hover:border-ink/25 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
              data-testid={`category-row-${category.slug}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="w-8 h-8 rounded-lg border border-line bg-canvas flex items-center justify-center" style={{ color: category.accent }}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="mono text-[10px] text-slate3">{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="font-display text-[14px] md:text-[15px] leading-tight text-ink group-hover:text-coral transition-colors">
                  {category.name}
                </div>
                <div className="mono text-[12px] text-slate2 shrink-0">{count}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES, STARTUPS } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';
import { ArrowUpRight } from 'lucide-react';

export default function ExploreCategories() {
  return (
    <section className="py-16 md:py-24 bg-cream" data-testid="explore-categories-section">
      <div className="wrapper container-p">
        <SectionHeading eyebrow="Explore" title="Categories across the ecosystem." subtitle="Twelve slices of the halal economy — from Islamic finance to modest fashion, media, and Hajj tech." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {CATEGORIES.map((c, i) => {
            const Icon = LucideIcons[c.icon] || LucideIcons.Sparkles;
            const count = STARTUPS.filter(s => s.category === c.name).length;
            return (
              <motion.div key={c.slug}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i%4)*0.05 }}
              >
                <Link to={`/directory?category=${encodeURIComponent(c.name)}`} className="group block bg-white border border-line rounded-2xl p-5 card-hover h-full relative overflow-hidden" data-testid={`category-card-${c.slug}`}>
                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ background: c.accent }} />
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-line bg-cream" style={{ color: c.accent }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-subtle group-hover:text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="font-display text-[19px] text-ink mt-4">{c.name}</div>
                  <p className="text-[13px] text-subtle mt-1 leading-relaxed line-clamp-2">{c.description}</p>
                  <div className="mt-4 text-[12.5px] text-ink"><span className="font-medium">{count}</span> <span className="text-subtle">companies listed</span></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

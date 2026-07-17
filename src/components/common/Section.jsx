import React from 'react';
import { motion } from 'framer-motion';

// Editorial section heading: section number + eyebrow + big display + subtitle + right slot
export function SectionHeading({ number, eyebrow, title, subtitle, right, dark = false, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 ${className}`}>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4">
          {number && <span className={`section-number ${dark ? '!text-white/50' : ''}`}>— {number}</span>}
          {eyebrow && <span className={`eyebrow ${dark ? '!text-white/50' : ''}`}>{eyebrow}</span>}
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45 }}
          className={`display-h mt-4 text-[34px] md:text-[46px] leading-[1.04] ${dark ? 'text-white' : 'text-ink'}`}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <p className={`mt-3 text-[15px] leading-relaxed max-w-xl ${dark ? 'text-white/65' : 'text-slate2'}`}>{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon, action, testid }) {
  return (
    <div className="panel p-10 text-center" data-testid={testid || 'empty-state'}>
      {Icon && <div className="w-10 h-10 mx-auto rounded-md border border-line flex items-center justify-center mb-4"><Icon className="w-4 h-4 text-slate2" /></div>}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="text-slate2 text-sm mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="panel p-4 flex items-center gap-4">
      <div className="skeleton w-11 h-11" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-3 w-24" />
      </div>
      <div className="skeleton h-3 w-16" />
    </div>
  );
}

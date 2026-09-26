import React from 'react';
import { Link } from 'react-router-dom';

// Main Startup Muslim header logo supplied by the site owner.
export const Wordmark = ({ variant = 'light', className = '' }) => {
  return (
    <Link
      to="/"
      className={`inline-flex items-center shrink-0 ${variant === 'light' ? 'rounded-lg bg-navy px-2 py-1' : ''} ${className}`}
      aria-label="Startup Muslim home"
    >
      <img
        src="/assets/startup-muslim-logo.png"
        alt="Startup Muslim"
        className="block h-10 sm:h-11 w-auto max-w-[256px] object-contain"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
};

// Startup logo — deterministic vector-style mark (initials on colored square, with corner accent)
export const StartupLogo = ({ startup, size = 44, rounded = 8 }) => {
  const color = startup?.logo?.color || '#111827';
  const mark = startup?.logo?.mark || (startup?.name || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="relative inline-flex items-center justify-center font-display font-semibold text-white select-none shrink-0"
      style={{ width: size, height: size, background: color, borderRadius: rounded, fontSize: Math.round(size * 0.4), letterSpacing: '-0.02em' }}
      aria-label={`${startup?.name || 'logo'} logo`}
    >
      {mark}
      <span aria-hidden style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, background: 'rgba(255,255,255,0.35)', borderRadius: 1 }} />
    </span>
  );
};

export const InvestorLogo = ({ investor, size = 44, rounded = 8 }) => {
  const color = investor?.logo?.color || '#111827';
  const mark = investor?.logo?.mark || (investor?.name || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="relative inline-flex items-center justify-center font-display font-semibold text-white select-none shrink-0"
      style={{ width: size, height: size, background: color, borderRadius: rounded, fontSize: Math.round(size * 0.4), letterSpacing: '-0.02em' }}
      aria-label={`${investor?.name || 'logo'} logo`}
    >
      {mark}
    </span>
  );
};

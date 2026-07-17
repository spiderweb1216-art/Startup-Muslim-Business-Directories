import React from 'react';
import { Link } from 'react-router-dom';

// Compact wordmark — geometric brand marker
export const Wordmark = ({ variant = 'light', className = '' }) => {
  const isDark = variant === 'dark';
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Startup Muslim">
      <span className="relative inline-flex items-center justify-center w-8 h-8">
        <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden>
          <rect x="1" y="1" width="38" height="38" rx="4" fill={isDark ? '#D94B3D' : '#111827'} />
          <path d="M11 27 L 20 12 L 29 27 M 15 22 H 25" stroke={isDark ? '#F3F0E8' : '#F3F0E8'} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display font-semibold text-[15.5px] tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>Startup Muslim</span>
        <span className={`mono text-[9.5px] tracking-[0.14em] uppercase mt-1 ${isDark ? 'text-white/50' : 'text-slate2'}`}>Ecosystem Atlas</span>
      </span>
    </Link>
  );
};

// Startup logo — deterministic vector-style mark (initials on colored square, with corner accent)
export const StartupLogo = ({ startup, size = 44, rounded = 8 }) => {
  const color = startup?.logo?.color || '#111827';
  const mark = startup?.logo?.mark || (startup?.name || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="relative inline-flex items-center justify-center font-display font-semibold text-white select-none"
      style={{ width: size, height: size, background: color, borderRadius: rounded, fontSize: Math.round(size * 0.4), letterSpacing: '-0.02em' }}
      aria-label={`${startup?.name || 'logo'} logo`}
    >
      {mark}
      <span aria-hidden style={{ position:'absolute', top:6, right:6, width:5, height:5, background:'rgba(255,255,255,0.35)', borderRadius:1 }} />
    </span>
  );
};

export const InvestorLogo = ({ investor, size = 44, rounded = 8 }) => {
  const color = investor?.logo?.color || '#111827';
  const mark = investor?.logo?.mark || (investor?.name || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="relative inline-flex items-center justify-center font-display font-semibold text-white select-none"
      style={{ width: size, height: size, background: color, borderRadius: rounded, fontSize: Math.round(size * 0.4), letterSpacing: '-0.02em' }}
      aria-label={`${investor?.name || 'logo'} logo`}
    >
      {mark}
    </span>
  );
};

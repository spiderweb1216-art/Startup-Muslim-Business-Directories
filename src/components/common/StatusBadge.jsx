import React from 'react';

const STYLES = {
  verified: 'tag-navy',
  funding: 'tag-emerald',
  pitching: 'tag-coral',
  hiring: 'tag-amber',
  neutral: '',
};

export default function StatusBadge({ type = 'neutral', children, className = '', ...props }) {
  const s = STYLES[type];
  return (
    <span className={`tag ${s} ${className}`} {...props}>
      {children}
    </span>
  );
}

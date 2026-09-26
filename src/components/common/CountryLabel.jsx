import React from 'react';
import { countryCode, countryName } from '@/lib/countryAtlas';

/**
 * Renders a real flag image instead of a Unicode flag emoji.
 * This is important on Windows, where flag emoji often render as letters like CA/GB/SA.
 */
export default function CountryLabel({
  country,
  explicitFlag = '',
  className = '',
  flagClassName = '',
  showName = true,
}) {
  const name = countryName(country || explicitFlag);
  const code = countryCode(country, explicitFlag);

  if (!name) return null;

  if (!code) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span aria-hidden className="leading-none">{name === 'Remote' ? '🌐' : '🌍'}</span>
        {showName && <span>{name}</span>}
      </span>
    );
  }

  const lower = code.toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <img
        src={`https://flagcdn.com/w40/${lower}.png`}
        srcSet={`https://flagcdn.com/w80/${lower}.png 2x`}
        width="20"
        height="15"
        alt={`${name} flag`}
        loading="lazy"
        decoding="async"
        className={`w-5 h-[15px] shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.12)] ${flagClassName}`}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      {showName && <span className="truncate">{name}</span>}
    </span>
  );
}

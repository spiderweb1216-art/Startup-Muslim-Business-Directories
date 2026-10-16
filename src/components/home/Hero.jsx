import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Search,
  Command,
  ArrowRight,
  MapPin,
  Sparkles,
  Database,
  RefreshCw,
  Globe2,
  Star,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { canonicalCountry, countryLabel, projectCountry } from '@/lib/countryAtlas';

function isPublishedCompany(company = {}) {
  return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive', 'Revoked', 'Cancelled'].includes(company.status || 'Published');
}

function formatCompactMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `$${Math.round(amount / 1_000_000_000)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount}`;
}

const REGION_GROUPS = {
  MENA: [
    'Algeria', 'Bahrain', 'Egypt', 'Iran', 'Iraq', 'Jordan', 'Kuwait', 'Lebanon', 'Libya', 'Morocco', 'Oman',
    'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Tunisia', 'United Arab Emirates', 'Yemen'
  ],
  'South Asia': ['Afghanistan', 'Bangladesh', 'India', 'Maldives', 'Nepal', 'Pakistan', 'Sri Lanka'],
  'Southeast Asia': ['Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Timor-Leste', 'Vietnam'],
  Africa: ['Nigeria', 'South Africa', 'Kenya', 'Senegal', 'Ethiopia', 'Ghana', 'Sudan', 'Somalia', 'Tanzania', 'Uganda', 'Rwanda', 'Morocco', 'Algeria', 'Tunisia', 'Egypt'],
  Europe: ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Spain', 'Italy', 'Sweden', 'Switzerland', 'Belgium', 'Turkey', 'Bosnia and Herzegovina', 'Albania', 'Kosovo'],
  'Central Asia': ['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan', 'Azerbaijan'],
  Americas: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Colombia', 'Chile']
};

function getRegionForCountry(country) {
  const clean = canonicalCountry(country);
  for (const [region, countries] of Object.entries(REGION_GROUPS)) {
    if (countries.includes(clean)) return region;
  }
  return 'Other';
}

function chipClass(active) {
  return active
    ? 'px-3 py-1.5 rounded-full bg-coral text-white text-[12px] mono'
    : 'px-3 py-1.5 rounded-full bg-white border border-line text-[12px] mono text-slate2 hover:text-ink';
}

export default function Hero() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All');
  const nav = useNavigate();
  const { data, stats, databaseStatus, refreshData } = useData();

  const publishedCompanies = useMemo(
    () => (data.startups || []).filter(isPublishedCompany),
    [data.startups]
  );

  const countryCount = useMemo(
    () => new Set(publishedCompanies.map((company) => canonicalCountry(company.country)).filter(Boolean)).size,
    [publishedCompanies]
  );

  useEffect(() => {
    if (databaseStatus !== 'connected') return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') refreshData().catch(() => {});
    };
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, [databaseStatus, refreshData]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const live = databaseStatus === 'connected';

  return (
    <section className="relative bg-canvas overflow-hidden" data-testid="hero-section">
      <div className="wrap pt-14 md:pt-20 pb-10 md:pb-14 relative">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="eyebrow">— Global Muslim Startup Intelligence</div>
          <div className="hidden md:flex items-center gap-2 mono text-[11px] text-slate2">
            <span className="inline-flex items-center gap-1">
              {live ? <Sparkles className="w-3 h-3 text-coral" /> : <RefreshCw className="w-3 h-3 text-slate2" />}
              {live ? 'Live directory' : databaseStatus === 'checking' ? 'Loading directory' : 'Directory temporarily unavailable'}
            </span>
            <span className="mono">·</span>
            <span>Startup Muslim Ecosystem Atlas</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 md:gap-10 items-end mt-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="display-h col-span-12 lg:col-span-8 text-[42px] md:text-[62px] lg:text-[80px] text-ink"
          >
            Find the people and companies building the <span className="italic font-normal text-coral">next Muslim economy</span>.
          </motion.h1>
          <div className="col-span-12 lg:col-span-4 lg:pb-2">
            <p className="text-[15.5px] text-slate2 leading-relaxed max-w-md">
              Research startups, founders, investors, funding rounds, jobs, active pitches, and opportunities across the global Muslim ecosystem.
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-14 relative">
          <div className="panel-flat pt-4 md:pt-5 overflow-hidden">
            <MapShowcase
              companies={publishedCompanies}
              databaseStatus={databaseStatus}
              onRefresh={() => refreshData().catch(() => {})}
            />
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={submit}
          className="mt-8 md:mt-10 border border-line bg-white rounded-lg overflow-hidden shadow-[0_2px_0_#DED5C4]"
          data-testid="hero-search-form"
        >
          <div className="flex items-stretch">
            <div className="hidden md:flex items-center gap-2 border-r border-line px-4">
              <select value={kind} onChange={e => setKind(e.target.value)} className="bg-transparent outline-none text-[13px] py-3 pr-2 mono">
                {['All','Companies','Founders','Investors','Pitches','Opportunities'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-4 h-4 text-slate2" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by company, founder, investor, country, industry, or funding stage…" className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-slate2" data-testid="hero-search-input" />
              <span className="hidden md:inline-flex mono text-[11px] text-slate2 border border-line rounded px-1.5 py-[1px] items-center gap-1"><Command className="w-3 h-3" /> K</span>
            </div>
            <button className="btn btn-coral rounded-none px-6" data-testid="hero-search-submit">Search <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="hr" />
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="eyebrow">Popular</span>
            {['Islamic Finance','Halal Commerce','AI & SaaS','Education','MENA Investors','Active Pitches'].map(t => (
              <button key={t} type="button" onClick={() => nav(`/search?q=${encodeURIComponent(t)}`)} className="filter-pill" data-testid={`hero-suggestion-${t}`}>{t}</button>
            ))}
          </div>
        </motion.form>

        <div className="mt-8 border-t border-line pt-6 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            [live ? `${publishedCompanies.length}` : '—', 'Companies'],
            [live ? `${countryCount}` : '—', 'Countries'],
            [live ? `${stats.investors || 0}` : '—', 'Investors'],
            [live ? formatCompactMoney(stats.funding || 0) : '—', 'Tracked funding'],
            [live ? `${stats.pitches || 0}` : '—', 'Active pitches'],
          ].map(([v, k], i) => (
            <div key={k} className={`flex flex-col ${i > 0 ? 'md:border-l md:border-line md:pl-6' : ''}`}>
              <CountUp value={v} />
              <span className="eyebrow mt-1">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapShowcase({ companies, databaseStatus, onRefresh }) {
  const [tab, setTab] = useState('featured');

  return (
    <div>
      <div className="px-4 md:px-5 pb-4 border-b border-line flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Homepage intelligence layer</div>
          <div className="text-[21px] md:text-[26px] text-ink font-display mt-1">Featured network + rotating ecosystem globe</div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setTab('featured')} className={chipClass(tab === 'featured')}>
            <Star className="w-3.5 h-3.5 inline-block mr-1" /> Featured / Premium
          </button>
          <button type="button" onClick={() => setTab('globe')} className={chipClass(tab === 'globe')}>
            <Globe2 className="w-3.5 h-3.5 inline-block mr-1" /> Ecosystem Globe
          </button>
        </div>
      </div>

      {tab === 'featured' ? (
        <FeaturedPremiumAtlas companies={companies} databaseStatus={databaseStatus} onRefresh={onRefresh} />
      ) : (
        <EcosystemGlobe companies={companies} databaseStatus={databaseStatus} onRefresh={onRefresh} />
      )}
    </div>
  );
}

function FeaturedPremiumAtlas({ companies, databaseStatus, onRefresh }) {
  const countries = useMemo(() => {
    const grouped = new Map();
    companies.forEach((company) => {
      const country = canonicalCountry(company.country);
      if (!country) return;
      const current = grouped.get(country) || { name: country, companies: 0 };
      current.companies += 1;
      grouped.set(country, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.companies - a.companies || a.name.localeCompare(b.name));
  }, [companies]);

  const mappedCountries = useMemo(
    () => countries.map((country) => ({ ...country, point: projectCountry(country.name) })).filter((country) => country.point),
    [countries]
  );

  const maxCompanies = Math.max(1, ...countries.map((country) => country.companies));
  const hub = mappedCountries[0];
  const featured = mappedCountries.slice(0, 8);
  const connections = hub ? featured.slice(1).map((country) => [hub, country]) : [];

  if (databaseStatus !== 'connected') {
    return <LoadingMapState databaseStatus={databaseStatus} onRefresh={onRefresh} />;
  }

  return (
    <div className="relative p-3 md:p-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
        <div className="lg:col-span-4 border border-line rounded-[24px] bg-white p-4 md:p-5">
          <div className="eyebrow">Featured layer</div>
          <h3 className="font-display text-[28px] text-ink mt-2">Premium companies at a glance</h3>
          <p className="text-[14px] text-slate2 leading-relaxed mt-2">
            Keep this as your premium/featured tab. It shows the strongest company concentration by country, with highlighted hubs and a quick global snapshot.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <StatBox label="Countries" value={countries.length} />
            <StatBox label="Companies" value={companies.length} />
            <StatBox label="Featured hubs" value={featured.length} />
            <StatBox label="Live source" value="Backend" />
          </div>
        </div>

        <div className="lg:col-span-8 border border-line rounded-[24px] bg-[#F8F3EA] p-4 md:p-5 overflow-hidden">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="eyebrow">Network map</div>
              <div className="text-[18px] md:text-[22px] text-ink font-display">Featured ecosystem coverage</div>
            </div>
            <div className="mono text-[11px] text-slate2">{companies.length} companies · {countries.length} countries</div>
          </div>

          <svg viewBox="0 0 1000 320" className="w-full h-[280px] md:h-[360px]" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Featured company atlas showing ${countries.length} countries`}>
            <defs>
              <pattern id="grid-featured" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DED5C4" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="conn-featured" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D94B3D" stopOpacity="0" />
                <stop offset="50%" stopColor="#D94B3D" stopOpacity=".65" />
                <stop offset="100%" stopColor="#D94B3D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="1000" height="320" fill="url(#grid-featured)" />
            <g fill="#E8E0D2" stroke="#DED5C4" strokeWidth="1">
              <path d="M120 60 Q 160 40 220 65 Q 300 85 290 160 Q 260 220 200 210 Q 140 200 130 170 Q 100 130 120 60 Z" />
              <path d="M260 210 Q 310 220 320 260 Q 300 300 270 300 Q 245 275 260 210 Z" />
              <path d="M440 70 Q 500 55 540 80 Q 555 110 520 130 Q 470 140 440 120 Q 420 95 440 70 Z" />
              <path d="M470 130 Q 540 130 560 200 Q 545 270 500 275 Q 465 265 460 200 Q 460 165 470 130 Z" />
              <path d="M560 130 Q 620 125 650 155 Q 645 180 615 185 Q 570 180 555 155 Z" />
              <path d="M650 130 Q 720 125 760 165 Q 740 200 690 200 Q 655 190 650 160 Z" />
              <path d="M760 165 Q 820 170 830 210 Q 800 240 770 230 Q 750 205 760 165 Z" />
              <path d="M840 240 Q 900 235 910 275 Q 890 300 850 295 Q 830 270 840 240 Z" />
            </g>
            {connections.map(([a, b]) => {
              const midX = (a.point.x + b.point.x) / 2;
              const midY = Math.min(a.point.y, b.point.y) - 24;
              return (
                <motion.path
                  key={`${a.name}-${b.name}`}
                  d={`M ${a.point.x} ${a.point.y} Q ${midX} ${midY} ${b.point.x} ${b.point.y}`}
                  stroke="url(#conn-featured)"
                  strokeWidth="1.15"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.1 }}
                />
              );
            })}
            {featured.map((country, index) => {
              const ratio = country.companies / maxCompanies;
              const radius = 4 + ratio * 6;
              const showLabel = index < 8;
              return (
                <g key={country.name}>
                  <motion.circle
                    cx={country.point.x}
                    cy={country.point.y}
                    r={radius}
                    fill={index < 3 ? '#D94B3D' : '#111827'}
                    stroke="#F3F0E8"
                    strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08 + index * 0.03, duration: 0.3, type: 'spring', stiffness: 200 }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                  {index < 3 && (
                    <motion.circle
                      cx={country.point.x}
                      cy={country.point.y}
                      r={radius + 9}
                      fill="none"
                      stroke="#D94B3D"
                      strokeWidth="1"
                      initial={{ opacity: 0.6, scale: 0.7 }}
                      animate={{ opacity: 0, scale: 1.35 }}
                      transition={{ duration: 2.1, repeat: Infinity, delay: index * 0.2 }}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                  )}
                  {showLabel && (
                    <text x={country.point.x + radius + 6} y={country.point.y + 3} fontSize="8.6" fontFamily="IBM Plex Mono" fill="#667085">
                      {`${countryLabel(country.name).toUpperCase()} · ${country.companies}`}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="eyebrow mr-1">Featured countries</span>
            {countries.slice(0, 8).map((country) => (
              <span key={country.name} className="tag bg-white border border-line">
                {countryLabel(country.name)} <span className="mono text-slate2 ml-1">{country.companies}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EcosystemGlobe({ companies, databaseStatus, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All regions');
  const [selectedCountry, setSelectedCountry] = useState('All countries');

  const countries = useMemo(() => {
    const grouped = new Map();
    companies.forEach((company) => {
      const country = canonicalCountry(company.country);
      const point = projectCountry(country);
      if (!country || !point) return;
      const current = grouped.get(country) || {
        name: country,
        companies: 0,
        region: getRegionForCountry(country),
        lat: point.lat,
        lng: point.lng,
      };
      current.companies += 1;
      grouped.set(country, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.companies - a.companies || a.name.localeCompare(b.name));
  }, [companies]);

  const regions = useMemo(() => {
    const grouped = new Map();
    countries.forEach((country) => {
      const current = grouped.get(country.region) || { name: country.region, companies: 0, countries: 0 };
      current.companies += country.companies;
      current.countries += 1;
      grouped.set(country.region, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.companies - a.companies || a.name.localeCompare(b.name));
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const regionMatch = selectedRegion === 'All regions' || country.region === selectedRegion;
      const countryMatch = selectedCountry === 'All countries' || country.name === selectedCountry;
      const searchMatch = !search.trim() || country.name.toLowerCase().includes(search.trim().toLowerCase());
      return regionMatch && countryMatch && searchMatch;
    });
  }, [countries, search, selectedRegion, selectedCountry]);

  const filteredCompanyCount = filteredCountries.reduce((sum, item) => sum + item.companies, 0);
  const topCountries = filteredCountries.slice(0, 6);
  const regionSummary = selectedRegion === 'All regions'
    ? regions.slice(0, 6)
    : regions.filter((region) => region.name === selectedRegion);

  if (databaseStatus !== 'connected') {
    return <LoadingMapState databaseStatus={databaseStatus} onRefresh={onRefresh} />;
  }

  return (
    <div className="p-3 md:p-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-5">
        <div className="xl:col-span-3 border border-line rounded-[24px] bg-white p-4 md:p-5">
          <div className="eyebrow flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-coral" /> Ecosystem filters</div>
          <h3 className="font-display text-[26px] text-ink mt-2">Rotating globe view</h3>
          <p className="text-[14px] text-slate2 leading-relaxed mt-2">
            Browse only the countries represented in your directory. Filter by region or country and see how many companies are active in each location.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="eyebrow block mb-2">Search country</label>
              <div className="border border-line rounded-xl px-3 py-2 flex items-center gap-2 bg-[#FBF8F3]">
                <Search className="w-4 h-4 text-slate2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a country…"
                  className="w-full bg-transparent outline-none text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-2">Region</label>
              <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCountry('All countries'); }} className="w-full border border-line rounded-xl px-3 py-2 bg-[#FBF8F3] text-[14px] outline-none">
                <option>All regions</option>
                {regions.map((region) => <option key={region.name}>{region.name}</option>)}
              </select>
            </div>

            <div>
              <label className="eyebrow block mb-2">Country</label>
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 bg-[#FBF8F3] text-[14px] outline-none">
                <option>All countries</option>
                {countries
                  .filter((country) => selectedRegion === 'All regions' || country.region === selectedRegion)
                  .map((country) => <option key={country.name}>{country.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <StatBox label="Visible countries" value={filteredCountries.length} />
              <StatBox label="Visible companies" value={filteredCompanyCount} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-6 border border-line rounded-[24px] bg-[#F8F3EA] p-4 md:p-5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <div className="eyebrow">Interactive globe</div>
              <div className="text-[18px] md:text-[22px] text-ink font-display">Global startup footprint</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] mono text-slate2">
              <span className="w-2 h-2 rounded-full bg-coral inline-block" /> Auto rotating
            </div>
          </div>

          <div className="min-h-[340px] md:min-h-[430px] flex items-center justify-center">
            <RotatingGlobe countries={filteredCountries} />
          </div>

          <div className="mt-4 border-t border-line pt-4 flex flex-wrap gap-2 items-center">
            <span className="eyebrow mr-1">Current view</span>
            {topCountries.length > 0 ? topCountries.map((country) => (
              <span key={country.name} className="tag bg-white border border-line">
                {countryLabel(country.name)} <span className="mono text-slate2 ml-1">{country.companies}</span>
              </span>
            )) : <span className="text-[13px] text-slate2">No countries match the current filter.</span>}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="border border-line rounded-[24px] bg-white p-4 md:p-5">
            <div className="eyebrow flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-coral" /> Top countries</div>
            <div className="mt-4 space-y-3">
              {topCountries.length > 0 ? topCountries.map((country, index) => (
                <div key={country.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="mono text-[11px] text-slate2">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] text-ink truncate">{countryLabel(country.name)}</span>
                  </div>
                  <span className="mono text-[12px] text-coral">{country.companies}</span>
                </div>
              )) : <div className="text-[13px] text-slate2">No data for this filter.</div>}
            </div>
          </div>

          <div className="border border-line rounded-[24px] bg-white p-4 md:p-5">
            <div className="eyebrow">Region coverage</div>
            <div className="mt-4 space-y-3">
              {regionSummary.map((region) => (
                <div key={region.name}>
                  <div className="flex items-center justify-between text-[13px] gap-3">
                    <span className="text-ink">{region.name}</span>
                    <span className="mono text-slate2">{region.companies}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-[#EFE6D7] overflow-hidden">
                    <div className="h-full bg-coral rounded-full" style={{ width: `${Math.max(8, Math.min(100, (region.companies / Math.max(1, filteredCompanyCount || companies.length)) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-line rounded-[24px] bg-white p-4 md:p-5">
            <div className="eyebrow">How to use</div>
            <ul className="mt-3 space-y-2 text-[13px] text-slate2 leading-relaxed list-disc pl-4">
              <li>Use this as the second homepage tab beside Featured / Premium.</li>
              <li>Counts are based only on the companies currently in your directory.</li>
              <li>Globe shows represented countries only, in your existing site style.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatingGlobe({ countries }) {
  const [rotation, setRotation] = useState(-20);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRotation((value) => (value + 1.1) % 360);
    }, 60);
    return () => window.clearInterval(timer);
  }, []);

  const maxCompanies = Math.max(1, ...countries.map((country) => country.companies));

  const visibleCountries = useMemo(() => {
    return countries.map((country) => {
      const projected = projectOnGlobe(country.lat, country.lng, rotation, 280, 280, 170);
      return {
        ...country,
        ...projected,
        radius: 4 + (country.companies / maxCompanies) * 6,
      };
    }).filter((country) => country.visible);
  }, [countries, rotation, maxCompanies]);

  const latitudeLines = [-60, -30, 0, 30, 60];
  const longitudeLines = [-120, -60, 0, 60, 120];

  return (
    <svg viewBox="0 0 560 560" className="w-full max-w-[520px] h-auto" role="img" aria-label="Rotating ecosystem globe showing company countries">
      <defs>
        <radialGradient id="globeFill" cx="45%" cy="40%" r="68%">
          <stop offset="0%" stopColor="#FFF7EC" />
          <stop offset="72%" stopColor="#F7DFC3" />
          <stop offset="100%" stopColor="#EFC08E" />
        </radialGradient>
        <linearGradient id="globeShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D94B3D" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id="globeClip">
          <circle cx="280" cy="280" r="170" />
        </clipPath>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="280" cy="280" r="200" fill="#F7EEE1" opacity="0.55" />
      <circle cx="280" cy="280" r="180" fill="#FFF8EF" opacity="0.8" />
      <circle cx="280" cy="280" r="170" fill="url(#globeFill)" stroke="#E7C7A3" strokeWidth="2" />
      <circle cx="280" cy="280" r="170" fill="url(#globeShade)" opacity="0.55" />

      <g clipPath="url(#globeClip)">
        {latitudeLines.map((lat) => (
          <ellipse key={`lat-${lat}`} cx="280" cy={280 - (lat * 1.6)} rx={170} ry={Math.max(28, 170 * Math.cos((lat * Math.PI) / 180) * 0.35)} fill="none" stroke="#DAB58D" strokeWidth="1" opacity="0.45" />
        ))}
        {longitudeLines.map((lng) => {
          const delta = ((lng + rotation + 540) % 360) - 180;
          const rx = Math.max(14, Math.abs(Math.cos((delta * Math.PI) / 180)) * 170);
          return <ellipse key={`lng-${lng}`} cx="280" cy="280" rx={rx} ry="170" fill="none" stroke="#DAB58D" strokeWidth="1" opacity="0.35" />;
        })}

        {visibleCountries.map((country, index) => (
          <g key={country.name} style={{ opacity: country.opacity }}>
            <motion.circle
              cx={country.x}
              cy={country.y}
              r={country.radius}
              fill={index < 5 ? '#D94B3D' : '#111827'}
              stroke="#FFF7EC"
              strokeWidth="1.5"
              filter={index < 5 ? 'url(#glow)' : undefined}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
            {index < 9 && (
              <text x={country.x + country.radius + 6} y={country.y + 4} fontSize="11" fontFamily="IBM Plex Mono" fill="#5F5146">
                {countryLabel(country.name)} · {country.companies}
              </text>
            )}
          </g>
        ))}
      </g>

      <ellipse cx="280" cy="460" rx="130" ry="18" fill="#E7D3BA" opacity="0.55" />
      <text x="280" y="70" textAnchor="middle" fontSize="13" fontFamily="IBM Plex Mono" fill="#8E6D57">AUTOMATICALLY ROTATING · FILTERED BY YOUR DIRECTORY DATA</text>
    </svg>
  );
}

function projectOnGlobe(lat, lng, rotationDeg, cx, cy, radius) {
  const phi = (lat * Math.PI) / 180;
  const lambda = ((lng - rotationDeg) * Math.PI) / 180;
  const phi0 = (18 * Math.PI) / 180;

  const x3 = Math.cos(phi) * Math.sin(lambda);
  const y3 = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda);
  const z3 = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);

  return {
    x: cx + radius * x3,
    y: cy - radius * y3,
    visible: z3 > -0.05,
    opacity: z3 > 0 ? 0.95 : 0.3,
  };
}

function LoadingMapState({ databaseStatus, onRefresh }) {
  return (
    <div className="min-h-[320px] md:min-h-[390px] flex items-center justify-center px-6 pb-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-sand mx-auto flex items-center justify-center">
          <Database className="w-5 h-5 text-slate2" />
        </div>
        <div className="font-display text-[22px] text-ink mt-4">
          {databaseStatus === 'checking' ? 'Loading live company locations…' : 'Live map data is unavailable'}
        </div>
        <p className="text-[13px] text-slate2 mt-2 leading-relaxed">
          {databaseStatus === 'checking'
            ? 'Preparing company locations.'
            : 'Company locations are temporarily unavailable. Please try again shortly.'}
        </p>
        {databaseStatus === 'error' && (
          <button type="button" onClick={onRefresh} className="btn btn-outline btn-sm mt-4">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#FBF8F3] border border-line px-3 py-3">
      <div className="mono text-[18px] text-ink">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}

function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(typeof value === 'string' && /^\d/.test(value) ? '0' : value);
  useEffect(() => {
    if (!inView) return;
    const match = typeof value === 'string' ? value.match(/^(\$)?(\d+)([A-Za-z\+]*)$/) : null;
    if (!match) { setDisplay(value); return; }
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr, 10);
    let raf;
    const start = performance.now();
    const dur = 1200;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(`${prefix || ''}${Math.round(target * eased)}${suffix || ''}`);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref} className="mono text-[24px] md:text-[30px] text-ink">{display}</span>;
}

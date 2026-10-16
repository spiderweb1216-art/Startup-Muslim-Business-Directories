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
import worldCountryShapes from '@/data/worldCountryShapes.json';

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
              investors={Array.isArray(data.investors) ? data.investors : []}
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

function MapShowcase({ companies, investors, databaseStatus, onRefresh }) {
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
        <EcosystemGlobe companies={companies} investors={investors} databaseStatus={databaseStatus} onRefresh={onRefresh} />
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
          <h3 className="font-display text-[28px] text-ink mt-2">Featured ecosystem at a glance</h3>
          <p className="text-[14px] text-slate2 leading-relaxed mt-2">
            Discover featured ecosystem hubs and explore their startup activity.
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

function EcosystemGlobe({ companies, investors, databaseStatus, onRefresh }) {
  const nav = useNavigate();
  const [entityType, setEntityType] = useState("Startups");
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All regions');
  const [selectedCountry, setSelectedCountry] = useState('All countries');

  const visibleEntities = useMemo(() => entityType === "Startups" ? companies : investors.filter(item => !["Draft", "Pending", "Rejected", "Archived", "Blocked", "Inactive"].includes(item?.status || "Published")), [entityType, companies, investors]);
  const countries = useMemo(() => {
    const grouped = new Map();
    visibleEntities.forEach((company) => {
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
  }, [visibleEntities]);

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
  const selectedEntities = useMemo(() => visibleEntities.filter(item => filteredCountries.some(c => c.name === canonicalCountry(item?.country))).sort((a,b) => String(a.name || '').localeCompare(String(b.name || ''))), [visibleEntities, filteredCountries]);
  const topCountries = filteredCountries.slice(0, 6);
  const openCountryArchive = (country, type = entityType) => {
    if (!country) return;
    nav(`${type === 'Investors' ? '/investors' : '/startups'}?country=${encodeURIComponent(country)}`);
  };
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
          <h3 className="font-display text-[26px] text-ink mt-2">Explore the ecosystem</h3>
          <div className="flex gap-2 mt-4" role="group" aria-label="Directory type">
            {['Startups','Investors'].map(type => <button type="button" key={type} className={chipClass(entityType === type)} onClick={() => {setEntityType(type);setSelectedRegion('All regions');setSelectedCountry('All countries');setSearch('');}}>{type}</button>)}
          </div>
          <p className="text-[14px] text-slate2 leading-relaxed mt-2">
            Select a country on the globe or use the filters to browse matching directory profiles.
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

            {selectedCountry !== 'All countries' && (
              <div className="space-y-2">
                <button type="button" onClick={() => openCountryArchive(selectedCountry, 'Startups')} className="w-full btn btn-coral justify-center">View {selectedCountry} startups <ArrowRight className="w-4 h-4" /></button>
                <button type="button" onClick={() => openCountryArchive(selectedCountry, 'Investors')} className="w-full btn btn-outline justify-center">View {selectedCountry} investors <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <StatBox label="Visible countries" value={filteredCountries.length} />
              <StatBox label={entityType} value={filteredCompanyCount} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-6 border border-line rounded-[24px] bg-[#F8F3EA] p-4 md:p-5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <div className="eyebrow">Interactive globe</div>
              <div className="text-[18px] md:text-[22px] text-ink font-display">Global ecosystem atlas</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] mono text-slate2">
              <span className="w-2 h-2 rounded-full bg-coral inline-block" /> Auto rotating
            </div>
          </div>

          <div className="min-h-[340px] md:min-h-[430px] flex items-center justify-center">
            <RotatingGlobe countries={filteredCountries} selectedCountry={selectedCountry} onCountrySelect={(country) => { setSelectedCountry(country); setSearch(''); const region = getRegionForCountry(country); setSelectedRegion(region === 'Other' ? 'All regions' : region); }} onReset={() => { setSelectedCountry('All countries'); setSelectedRegion('All regions'); setSearch(''); }} onCountryOpen={(country) => openCountryArchive(country)} />
          </div>

          <div className="mt-4 border-t border-line pt-4 flex flex-wrap gap-2 items-center">
            <span className="eyebrow mr-1">Current view</span>
            {topCountries.length > 0 ? topCountries.map((country) => (
              <button key={country.name} type="button" onClick={() => openCountryArchive(country.name)} className="tag bg-white border border-line hover:border-coral" title={`Browse ${entityType.toLowerCase()} in ${country.name}`}>
                {countryLabel(country.name)} <span className="mono text-slate2 ml-1">{country.companies}</span>
              </button>
            )) : <span className="text-[13px] text-slate2">No countries match the current filter.</span>}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="border border-line rounded-[24px] bg-white p-4 md:p-5">
            <div className="eyebrow flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-coral" /> Top countries</div>
            <div className="mt-4 space-y-3">
              {topCountries.length > 0 ? topCountries.map((country, index) => (
                <button key={country.name} type="button" onClick={() => openCountryArchive(country.name)} className="w-full text-left flex items-center justify-between gap-3 hover:text-coral rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral" title={`Browse ${entityType.toLowerCase()} in ${country.name}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="mono text-[11px] text-slate2">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] text-ink truncate">{countryLabel(country.name)}</span>
                  </div>
                  <span className="mono text-[12px] text-coral">{country.companies}</span>
                </button>
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
            <div className="flex justify-between items-center gap-2"><div className="eyebrow">{entityType} in this view</div><span className="mono text-[12px] text-coral">{selectedEntities.length}</span></div>
            <div className="mt-3 max-h-[240px] overflow-y-auto space-y-1">
              {selectedEntities.slice(0,40).map((item,index) => (
                <button key={item.slug || item.id || index} type="button" disabled={!item.slug}
                  onClick={() => item.slug && nav(`${entityType === 'Startups' ? '/startups/' : '/investors/'}${encodeURIComponent(item.slug)}`)}
                  className="w-full text-left flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[#F8F3EA] disabled:opacity-50">
                  <span className="text-[13px] truncate text-ink">{item.name || item.title}</span><ArrowRight className="w-3.5 h-3.5 text-coral shrink-0" />
                </button>))}
              {!selectedEntities.length && <p className="text-[13px] text-slate2">No {entityType.toLowerCase()} match the selected filters.</p>}
            </div>
            {selectedEntities.length > 40 && <p className="text-[11px] text-slate2 mt-2">Showing first 40 matching profiles.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bundled generalized Natural Earth-style country shapes: no map API keys or external tile requests.
const SHAPE_ALIASES = {
  'United States of America': 'United States',
  'Dem. Rep. Congo': 'Democratic Republic of the Congo',
  'Dominican Rep.': 'Dominican Republic',
  'Central African Rep.': 'Central African Republic',
  'S. Sudan': 'South Sudan',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Czechia': 'Czech Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'eSwatini': 'Swaziland',
  'Solomon Is.': 'Solomon Islands',
  'N. Cyprus': 'Cyprus',
  'W. Sahara': 'Western Sahara',
  'Somaliland': 'Somalia',
  'Macedonia': 'Republic of Macedonia',
  'Timor-Leste': 'East Timor',
  'S. Korea': 'South Korea',
  'N. Korea': 'North Korea',
  'Côte d\'Ivoire': 'Ivory Coast',
  'United Rep. of Tanzania': 'Tanzania',
};

function globeProject(lat, lng, rotationDeg, radius = 178) {
  const phi = lat * Math.PI / 180;
  const theta = (lng - rotationDeg) * Math.PI / 180;
  const centerLat = 16 * Math.PI / 180;
  const depth = Math.sin(centerLat) * Math.sin(phi) + Math.cos(centerLat) * Math.cos(phi) * Math.cos(theta);
  return {
    x: 250 + radius * Math.cos(phi) * Math.sin(theta),
    y: 250 - radius * (Math.cos(centerLat) * Math.sin(phi) - Math.sin(centerLat) * Math.cos(phi) * Math.cos(theta)),
    depth,
  };
}

function visiblePolygonPath(ring, rotationDeg) {
  if (!Array.isArray(ring) || ring.length < 3) return '';
  // Sample edges before projecting, then clip land to the near hemisphere.
  // A polygon crossing the horizon is closed along the edge of the visible disc.
  const sampled=[];
  for (let i=0;i<ring.length;i++) {
    const start=ring[i], end=ring[(i+1)%ring.length];
    if (!Array.isArray(start) || !Array.isArray(end)) continue;
    let lonDiff=end[0]-start[0];
    if (lonDiff>180)lonDiff-=360;
    if (lonDiff< -180)lonDiff+=360;
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(lonDiff),Math.abs(end[1]-start[1]))/5));
    for(let j=0;j<steps;j++){
      const t=j/steps;
      sampled.push(globeProject(start[1]+(end[1]-start[1])*t,start[0]+lonDiff*t,rotationDeg));
    }
  }
  if(sampled.length<3)return '';
  const output=[];
  for(let i=0;i<sampled.length;i++){
    const p=sampled[i],q=sampled[(i+1)%sampled.length];
    const pin=p.depth>=0, qin=q.depth>=0;
    if(pin)output.push(p);
    if(pin!==qin){
      let low=0,high=1;
      for(let n=0;n<16;n++){
        const t=(low+high)/2;
        const depth=p.depth+(q.depth-p.depth)*t;
        if((depth>=0)===pin)low=t; else high=t;
      }
      const t=(low+high)/2;
      output.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});
    }
  }
  if(output.length<3)return '';
  return `M${output.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')}Z`;
}

function countryShapePath(shape, rotation) {
  const polygons=shape.type==='MultiPolygon'?shape.coordinates:[shape.coordinates];
  return polygons.map(polygon=>visiblePolygonPath(polygon[0],rotation)).filter(Boolean).join(' ');
}

function RotatingGlobe({ countries, selectedCountry, onCountrySelect, onReset, onCountryOpen }) {
  const [rotation,setRotation]=useState(-22);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState('');
  const dragging=useRef(null);
  const lastDrag=useRef(0);
  const selectedCount=useMemo(()=>new Map(countries.map(item=>[canonicalCountry(item.name),item.companies])),[countries]);

  useEffect(()=>{
    if(paused || (typeof window!=='undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))return undefined;
    const timer=window.setInterval(()=>setRotation(r=>(r+0.45)%360),75);
    return ()=>window.clearInterval(timer);
  },[paused]);

  const shapes=useMemo(()=>worldCountryShapes.map(shape=>{
    const name=canonicalCountry(SHAPE_ALIASES[shape.name]||shape.name);
    return {name,path:countryShapePath(shape,rotation),count:selectedCount.get(name)||0};
  }).filter(shape=>shape.path),[rotation,selectedCount]);



  const choose=(country)=>{
    if(!country || !selectedCount.has(country))return;
    if(Date.now()-lastDrag.current<250)return;
    onCountrySelect(country);
    setPaused(true);
  };

  const handlePointerDown=(event)=>{
    if(event.button!==0 && event.pointerType==='mouse')return;
    dragging.current={x:event.clientX,rotation,moved:false};
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerMove=(event)=>{
    if(!dragging.current)return;
    const dx=event.clientX-dragging.current.x;
    if(Math.abs(dx)>4)dragging.current.moved=true;
    setRotation((dragging.current.rotation-dx*0.38+3600)%360);
  };
  const handlePointerUp=()=>{
    if(dragging.current?.moved){lastDrag.current=Date.now();setPaused(true);}
    dragging.current=null;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full gap-3 mb-1">
        <span className="mono text-[11px] text-slate2">Drag or swipe to turn · click a highlighted country to open its archive</span>
        <button type="button" onClick={()=>setPaused(p=>!p)} className="text-[12px] mono rounded-full px-3 py-1.5 bg-white border border-line hover:text-coral">
          {paused?'Resume rotation':'Pause rotation'}
        </button>
      </div>
      <svg
        viewBox="0 0 500 500" role="img" aria-label="Interactive geographic globe with draggable rotation and clickable countries"
        className="w-full max-w-[510px] select-none cursor-grab active:cursor-grabbing"
        style={{touchAction:'pan-y'}}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
        onPointerLeave={()=>setHovered('')}
      >
        <defs>
          <radialGradient id="atlas-real-globe-water" cx="35%" cy="28%" r="79%">
            <stop offset="0%" stopColor="#FFF7ED"/><stop offset="70%" stopColor="#F2D6B9"/>
            <stop offset="100%" stopColor="#D9B48F"/>
          </radialGradient>
          <clipPath id="atlas-real-globe-clip"><circle cx="250" cy="250" r="178"/></clipPath>
        </defs>
        <circle cx="250" cy="250" r="178" fill="url(#atlas-real-globe-water)" stroke="#D5B494" strokeWidth="1.5"/>
        <g clipPath="url(#atlas-real-globe-clip)">
          {shapes.map(shape=>(
            <path
              key={shape.name} d={shape.path}
              fill={shape.name===selectedCountry?'#B63C31':shape.count?'#CE8069':'#E4D8C9'}
              stroke="#F9F1E6" strokeWidth=".65" strokeLinejoin="round"
              className={shape.count?'cursor-pointer':''}
              onClick={()=>shape.count && onCountryOpen(shape.name)}
              onPointerEnter={()=>setHovered(shape.name)}
            >
              <title>{`${shape.name}: ${shape.count} ${shape.count===1?'company':'companies'}`}</title>
            </path>
          ))}

        </g>
        <circle cx="250" cy="250" r="178" fill="none" stroke="#A96B48" strokeWidth="1" opacity=".35" pointerEvents="none" />
      </svg>
      <div className="flex items-center justify-between gap-3 w-full mt-1">
        <span className="text-[12px] text-slate2 min-h-[20px]">{hovered?`${hovered} · ${selectedCount.get(hovered)||0} companies`:'Click a highlighted country to browse matching profiles'}</span>
        {selectedCountry!=='All countries' && <div className="flex gap-3 items-center"><button type="button" className="text-[12px] font-medium text-coral underline" onClick={()=>onCountryOpen(selectedCountry)}>Open filtered archive →</button><button type="button" className="text-[12px] text-slate2 underline" onClick={onReset}>Clear</button></div>}
      </div>
    </div>
  );
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

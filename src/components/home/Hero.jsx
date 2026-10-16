import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, Command, ArrowRight, MapPin, Sparkles, Database, RefreshCw } from 'lucide-react';
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

// Editorial full-width hero with a live backend-driven SVG world map.
export default function Hero() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All');
  const [atlasView, setAtlasView] = useState('featured');
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

  // Keep the home atlas synced for visitors in other tabs/browsers as backend data changes.
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
        {/* Top row */}
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

        {/* Headline + Map side by side */}
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

        {/* Atlas visualization — driven only by backend company records */}
        <div className="mt-12 md:mt-14 relative">
          <div className="panel-flat pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 pb-3 border-b border-line">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ecosystem atlas views">
                <button type="button" role="tab" aria-selected={atlasView === 'featured'} onClick={() => setAtlasView('featured')} className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${atlasView === 'featured' ? 'bg-ink text-white' : 'bg-white border border-line text-ink hover:bg-sand'}`} data-testid="atlas-featured-tab">Featured / Premium Map</button>
                <button type="button" role="tab" aria-selected={atlasView === 'globe'} onClick={() => setAtlasView('globe')} className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${atlasView === 'globe' ? 'bg-ink text-white' : 'bg-white border border-line text-ink hover:bg-sand'}`} data-testid="atlas-globe-tab">Ecosystem Globe</button>
              </div>
              <span className="mono text-[11px] text-slate2">Counts from published directory companies</span>
            </div>
            {atlasView === 'featured' ? (
              <AtlasMap companies={publishedCompanies} databaseStatus={databaseStatus} onRefresh={() => refreshData().catch(() => {})} />
            ) : (
              <EcosystemGlobe companies={publishedCompanies} databaseStatus={databaseStatus} onRefresh={() => refreshData().catch(() => {})} />
            )}
          </div>
        </div>

        {/* Search command panel */}
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

        {/* Data strip — also uses backend values once connected */}
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

function AtlasMap({ companies, databaseStatus, onRefresh }) {
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
    () => countries
      .map((country) => ({ ...country, point: projectCountry(country.name) }))
      .filter((country) => country.point),
    [countries]
  );

  const maxCompanies = Math.max(1, ...countries.map((country) => country.companies));
  const hub = mappedCountries[0];
  const connections = hub ? mappedCountries.slice(1, 8).map((country) => [hub, country]) : [];

  if (databaseStatus !== 'connected') {
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

  return (
    <div className="relative">
      <svg viewBox="0 0 1000 320" className="w-full h-[280px] md:h-[360px]" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Live company atlas showing ${countries.length} countries`}>
        <defs>
          <pattern id="grid-live" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DED5C4" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="conn-live" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D94B3D" stopOpacity="0" />
            <stop offset="50%" stopColor="#D94B3D" stopOpacity=".55" />
            <stop offset="100%" stopColor="#D94B3D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="320" fill="url(#grid-live)" />

        {/* Simplified continent silhouettes. Country nodes/counts below are live backend data. */}
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
              stroke="url(#conn-live)"
              strokeWidth="1.15"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1 }}
            />
          );
        })}

        {mappedCountries.map((country, index) => {
          const ratio = country.companies / maxCompanies;
          const radius = 3.5 + (ratio * 5.5);
          const prominent = index < 3;
          const showLabel = index < 10;
          return (
            <g key={country.name}>
              <title>{`${country.name}: ${country.companies} ${country.companies === 1 ? 'company' : 'companies'}`}</title>
              <motion.circle
                cx={country.point.x}
                cy={country.point.y}
                r={radius}
                fill={prominent ? '#D94B3D' : '#111827'}
                stroke="#F3F0E8"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.025, duration: 0.3, type: 'spring', stiffness: 200 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {prominent && (
                <motion.circle
                  cx={country.point.x}
                  cy={country.point.y}
                  r={radius + 8}
                  fill="none"
                  stroke="#D94B3D"
                  strokeWidth="1"
                  initial={{ opacity: 0.55, scale: 0.75 }}
                  animate={{ opacity: 0, scale: 1.35 }}
                  transition={{ duration: 2.1, repeat: Infinity, delay: index * 0.25 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              {showLabel && (
                <text x={country.point.x + radius + 5} y={country.point.y + 3} fontSize="8.3" fontFamily="IBM Plex Mono" fill="#667085">
                  {`${countryLabel(country.name).toUpperCase()} · ${country.companies}`}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute top-2 left-2 eyebrow flex items-center gap-1">
        <MapPin className="w-3 h-3 text-coral" /> Live company atlas
      </div>
      <div className="absolute top-2 right-2 mono text-[10.5px] text-emerald flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" /> Directory updated
      </div>

      {countries.length > 0 ? (
        <div className="border-t border-line px-3 md:px-5 py-4 flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-1">Countries from companies</span>
          {countries.slice(0, 10).map((country) => (
            <span key={country.name} className="tag bg-white border border-line">
              {countryLabel(country.name)} <span className="mono text-slate2 ml-1">{country.companies}</span>
            </span>
          ))}
          {countries.length > 10 && <span className="mono text-[11px] text-slate2">+{countries.length - 10} more</span>}
          <span className="ml-auto mono text-[10.5px] text-slate2">
            {companies.length} companies · {countries.length} countries · updated regularly
          </span>
        </div>
      ) : (
        <div className="border-t border-line px-5 py-5 text-[13px] text-slate2">
          No company locations are currently available.
        </div>
      )}
    </div>
  );
}


// Display geography is derived from published company records. No seeded counts.
// Regional groupings are editorial geographic filters, not company affiliations.
const REGION_COUNTRIES = {
  'MENA': 'Algeria,Bahrain,Egypt,Iran,Iraq,Jordan,Kuwait,Lebanon,Libya,Mauritania,Morocco,Oman,Palestine,Qatar,Saudi Arabia,Sudan,Syria,Tunisia,United Arab Emirates,Yemen,Israel,Djibouti',
  'South Asia': 'Afghanistan,Bangladesh,Bhutan,India,Maldives,Nepal,Pakistan,Sri Lanka',
  'Southeast Asia': 'Brunei,Cambodia,Indonesia,Laos,Malaysia,Myanmar,Philippines,Singapore,Thailand,East Timor,Vietnam',
  'Central Asia': 'Kazakhstan,Kyrgyzstan,Tajikistan,Turkmenistan,Uzbekistan',
  'Sub-Saharan Africa': 'Angola,Benin,Botswana,Burkina Faso,Burundi,Cameroon,Cape Verde,Central African Republic,Chad,Comoros,Democratic Republic of the Congo,Equatorial Guinea,Eritrea,Ethiopia,Gabon,Gambia,Ghana,Guinea,Guinea-Bissau,Ivory Coast,Kenya,Liberia,Madagascar,Malawi,Mali,Mauritius,Mozambique,Niger,Nigeria,Rwanda,Senegal,Sierra Leone,Somalia,South Africa,South Sudan,Tanzania,Togo,Uganda,Zambia,Zimbabwe',
  'Europe': 'Albania,Andorra,Austria,Belarus,Belgium,Bosnia and Herzegovina,Bulgaria,Croatia,Cyprus,Czech Republic,Denmark,Estonia,Finland,France,Germany,Greece,Hungary,Iceland,Ireland,Italy,Kosovo,Latvia,Lithuania,Luxembourg,Malta,Moldova,Montenegro,Netherlands,North Macedonia,Norway,Poland,Portugal,Romania,Russia,Serbia,Slovakia,Slovenia,Spain,Sweden,Switzerland,Turkey,Ukraine,United Kingdom',
  'Americas': 'Argentina,Bolivia,Brazil,Canada,Chile,Colombia,Costa Rica,Cuba,Dominican Republic,Ecuador,El Salvador,Guatemala,Haiti,Honduras,Jamaica,Mexico,Nicaragua,Panama,Paraguay,Peru,United States,Uruguay,Venezuela',
  'East Asia & Pacific': 'Australia,China,Fiji,Hong Kong,Japan,New Zealand,South Korea,Taiwan',
};
const REGION_LOOKUP = Object.entries(REGION_COUNTRIES).reduce((out, [region, names]) => {
  names.split(',').forEach((name) => { out[name] = region; });
  return out;
}, {});
function ecosystemRegion(name) { return REGION_LOOKUP[name] || 'Other regions'; }
function globePoint(point, centerLongitude) {
  if (!point) return null;
  const lat = point.lat * Math.PI / 180;
  const longitude = (point.lng - centerLongitude) * Math.PI / 180;
  const visible = Math.cos(lat) * Math.cos(longitude) >= 0;
  return visible ? { x: 330 + 165 * Math.cos(lat) * Math.sin(longitude), y: 202 - 165 * Math.sin(lat) } : null;
}

function EcosystemGlobe({ companies, databaseStatus, onRefresh }) {
  const [region, setRegion] = useState('All regions');
  const [countryName, setCountryName] = useState('All countries');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [longitude, setLongitude] = useState(45);
  const grouped = useMemo(() => {
    const result = new Map();
    (Array.isArray(companies) ? companies : []).forEach((company) => {
      const name = canonicalCountry(company?.country);
      if (!name || name === 'Global' || name === 'Remote') return;
      const existing = result.get(name) || { name, count: 0, region: ecosystemRegion(name), point: projectCountry(name) };
      existing.count++;
      result.set(name, existing);
    });
    return [...result.values()].sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [companies]);
  const regionTotals = useMemo(() => grouped.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + item.count;
    return acc;
  }, {}), [grouped]);
  const regions = useMemo(() => Object.keys(regionTotals).sort((a,b) => regionTotals[b] - regionTotals[a] || a.localeCompare(b)), [regionTotals]);
  const availableCountries = useMemo(() => grouped.filter((entry) => region === 'All regions' || entry.region === region), [grouped, region]);
  const visible = useMemo(() => availableCountries.filter((entry) =>
    (countryName === 'All countries' || entry.name === countryName) && entry.name.toLowerCase().includes(query.trim().toLowerCase())
  ), [availableCountries, countryName, query]);
  const shownTotal = visible.reduce((sum, item) => sum + item.count, 0);
  const selectedEntry = visible.find((item) => item.name === selected);
  const pickCountry = (item) => {
    setSelected(item.name);
    if (item.point) setLongitude(item.point.lng);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-[440px]" data-testid="ecosystem-globe">
      <aside className="bg-white/80 border-b lg:border-b-0 lg:border-r border-line p-4 md:p-5 space-y-4" aria-label="Globe filters">
        <div><div className="eyebrow">Explore the atlas</div><h2 className="font-display text-[24px] mt-1 text-ink">Countries & regions</h2></div>
        <label className="block"><span className="text-xs font-semibold text-ink">Region</span><select value={region} onChange={(e) => { setRegion(e.target.value); setCountryName('All countries'); setSelected(''); }} className="mt-1 block w-full rounded-md border border-line bg-white p-2 text-sm" data-testid="globe-region-filter"><option>All regions</option>{regions.map((name) => <option key={name} value={name}>{name} · {regionTotals[name]}</option>)}</select></label>
        <label className="block"><span className="text-xs font-semibold text-ink">Country</span><select value={countryName} onChange={(e) => { setCountryName(e.target.value); setSelected(''); const c = availableCountries.find(x => x.name === e.target.value); if (c?.point) setLongitude(c.point.lng); }} className="mt-1 block w-full rounded-md border border-line bg-white p-2 text-sm" data-testid="globe-country-filter"><option>All countries</option>{availableCountries.map((item) => <option key={item.name} value={item.name}>{countryLabel(item.name)} · {item.count}</option>)}</select></label>
        <label className="block"><span className="text-xs font-semibold text-ink">Find a country</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search countries…" className="mt-1 block w-full rounded-md border border-line bg-white p-2 text-sm" data-testid="globe-country-search" /></label>
        <div className="grid grid-cols-2 gap-2 text-center"><div className="bg-sand rounded-md p-3"><div className="font-display text-[25px] text-ink">{shownTotal}</div><div className="eyebrow">Companies</div></div><div className="bg-sand rounded-md p-3"><div className="font-display text-[25px] text-ink">{visible.length}</div><div className="eyebrow">Countries</div></div></div>
        <button type="button" className="text-[12px] text-coral underline" onClick={() => { setRegion('All regions'); setCountryName('All countries'); setQuery(''); setSelected(''); setLongitude(45); }}>Reset filters</button>
        <div className="max-h-[170px] overflow-y-auto border-t border-line pt-2" aria-label="Filtered countries">
          {visible.map((item) => <button type="button" onClick={() => pickCountry(item)} key={item.name} className={`w-full flex justify-between gap-3 text-left px-2 py-1.5 rounded text-[12px] ${selected === item.name ? 'bg-sand font-bold' : 'hover:bg-sand/70'}`}><span>{countryLabel(item.name)}</span><span className="mono">{item.count}</span></button>)}
          {visible.length === 0 && <p className="text-sm text-slate2 py-3">No countries match your filters.</p>}
        </div>
      </aside>
      <div className="relative p-4 md:p-6 flex flex-col justify-center min-w-0">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-2"><span className="eyebrow">Ecosystem globe · published company locations</span><div className="flex gap-2"><button type="button" onClick={() => setLongitude(x => x - 35)} className="border border-line bg-white rounded px-2 py-1 text-[12px]" aria-label="Rotate globe left">◀</button><button type="button" onClick={() => setLongitude(x => x + 35)} className="border border-line bg-white rounded px-2 py-1 text-[12px]" aria-label="Rotate globe right">▶</button></div></div>
        {databaseStatus !== 'connected' ? <div className="min-h-[340px] flex flex-col items-center justify-center gap-3"><p className="text-sm text-slate2">{databaseStatus === 'checking' ? 'Loading company locations…' : 'Company locations are temporarily unavailable.'}</p>{databaseStatus === 'error' && <button type="button" className="btn btn-outline btn-sm" onClick={onRefresh}>Retry</button>}</div> : <>
          <svg viewBox="0 0 660 410" className="w-full max-h-[390px]" role="img" aria-label={`Globe showing ${visible.length} countries and ${shownTotal} companies, using published directory records`}>
            <defs><radialGradient id="globe-ocean"><stop offset="0%" stopColor="#F5F1E9"/><stop offset="100%" stopColor="#C7D7D5"/></radialGradient><clipPath id="ecosystem-globe-clip"><circle cx="330" cy="202" r="172"/></clipPath></defs>
            <circle cx="330" cy="202" r="172" fill="url(#globe-ocean)" stroke="#B4C2BB" strokeWidth="2"/>
            <g clipPath="url(#ecosystem-globe-clip)" fill="none" stroke="#D5DBD2" strokeWidth="1">
              {[-60,-30,0,30,60].map((lat) => { const y = 202 - 172*Math.sin(lat*Math.PI/180); const rx = 172*Math.cos(lat*Math.PI/180); return <ellipse key={`lat-${lat}`} cx="330" cy={y} rx={rx} ry={8} />; })}
              {[-60,-30,0,30,60].map((deg) => <ellipse key={`meridian-${deg}`} cx="330" cy="202" rx={172*Math.abs(Math.cos(deg*Math.PI/180))} ry="172" />)}
            </g>
            {visible.map((item) => { const p = globePoint(item.point, longitude); if (!p) return null; const active = item.name === selected; return <g key={item.name} onClick={() => pickCountry(item)} style={{cursor:'pointer'}} role="button" tabIndex="0" aria-label={`${item.name}: ${item.count} companies`} onKeyDown={(event) => {if(event.key === 'Enter' || event.key === ' ') {event.preventDefault(); pickCountry(item);}}}><title>{item.name} · {item.count} companies</title><circle cx={p.x} cy={p.y} r={active ? 9 : Math.max(5,Math.min(12,4+Math.sqrt(item.count)*1.5))} fill={active ? '#D94B3D' : '#123F35'} stroke="white" strokeWidth="2"/><text x={p.x+12} y={p.y-9} fontSize="11" fill="#1A2925" fontWeight={active ? 'bold' : 'normal'}>{item.name} · {item.count}</text></g>; })}
          </svg>
          <div className="text-center text-[12px] text-slate2">Select a country on the left to center it. Rotate to explore other locations.</div>
          {selectedEntry && <div className="mx-auto mt-3 bg-white rounded-md border border-line px-4 py-2 text-[13px]"><strong>{countryLabel(selectedEntry.name)}</strong> · {selectedEntry.count} {selectedEntry.count === 1 ? 'company' : 'companies'} · {selectedEntry.region}</div>}
          {grouped.length === 0 && <p className="text-center text-sm text-slate2 mt-2">No published company locations yet.</p>}
        </>}
      </div>
    </div>
  );
}

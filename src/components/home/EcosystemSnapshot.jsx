import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Database, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/common/Section';
import { useData } from '@/context/DataContext';
import { canonicalCountry } from '@/lib/countryAtlas';
import CountryLabel from '@/components/common/CountryLabel';

const REGION_COLORS = ['#D94B3D', '#176B58', '#8D82D8', '#F3E6D0', '#8A94A6', '#B08040', '#3B7DD8'];

const MENA = new Set([
  'Algeria','Bahrain','Egypt','Iran','Iraq','Jordan','Kuwait','Lebanon','Libya','Morocco','Oman','Palestine','Qatar',
  'Saudi Arabia','Syria','Tunisia','Turkey','Türkiye','United Arab Emirates','UAE','Yemen','Mauritania','Sudan'
]);
const SOUTH_ASIA = new Set(['Afghanistan','Bangladesh','Bhutan','India','Maldives','Nepal','Pakistan','Sri Lanka']);
const SOUTH_EAST_ASIA = new Set(['Brunei','Cambodia','Indonesia','Laos','Malaysia','Myanmar','Philippines','Singapore','Thailand','Timor-Leste','East Timor','Vietnam']);
const NORTH_AMERICA = new Set(['Canada','Mexico','United States','United States of America','USA','US']);
const EUROPE = new Set([
  'Albania','Andorra','Austria','Belarus','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia','Cyprus','Czech Republic','Czechia',
  'Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kosovo','Latvia','Liechtenstein',
  'Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal',
  'Romania','Russia','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Ukraine','United Kingdom','UK','Vatican City'
]);
const AFRICA = new Set([
  'Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde','Central African Republic','Chad','Comoros',
  'Democratic Republic of the Congo','Republic of the Congo','Djibouti','Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon',
  'Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast','Côte d’Ivoire','Cote d\'Ivoire','Kenya','Lesotho','Liberia','Madagascar',
  'Malawi','Mali','Mauritius','Mozambique','Namibia','Niger','Nigeria','Rwanda','Senegal','Seychelles','Sierra Leone','Somalia',
  'South Africa','South Sudan','Tanzania','Togo','Uganda','Zambia','Zimbabwe'
]);

const normalizeCountry = (value = '') => canonicalCountry(value);

const getRegion = (countryValue) => {
  const country = normalizeCountry(countryValue);
  if (MENA.has(country)) return 'MENA';
  if (SOUTH_EAST_ASIA.has(country)) return 'South-East Asia';
  if (SOUTH_ASIA.has(country)) return 'South Asia';
  if (NORTH_AMERICA.has(country)) return 'North America';
  if (EUROPE.has(country)) return 'Europe';
  if (AFRICA.has(country)) return 'Africa';
  return 'Other';
};

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const sameMonth = (value, target) => {
  const d = parseDate(value);
  return Boolean(d && d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth());
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(amount >= 10_000_000_000 ? 0 : 1).replace('.0', '')}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1).replace('.0', '')}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(amount >= 10_000 ? 0 : 1).replace('.0', '')}K`;
  return `$${amount.toLocaleString()}`;
};

const published = (item = {}) => !['Draft','Pending','Rejected','Archived','Blocked','Inactive','Revoked','Cancelled'].includes(item.status || 'Published');

function EmptyLiveState({ dark = false, message = 'No backend data yet.' }) {
  return (
    <div className={`mt-5 rounded-md border border-dashed p-5 text-[12px] ${dark ? 'border-white/15 text-white/55' : 'border-line text-slate2'}`}>
      <span className="inline-flex items-center gap-2"><Database className="w-3.5 h-3.5" />{message}</span>
    </div>
  );
}

export default function EcosystemSnapshot() {
  const { data, databaseStatus, databaseError, refreshData } = useData();
  const connected = databaseStatus === 'connected';
  const now = new Date();

  // Keep this public homepage snapshot synced with MySQL/API without a manual refresh.
  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshData().catch(() => {});
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshData]);

  const snapshot = useMemo(() => {
    if (!connected) {
      return {
        companies: [], rounds: [], pitches: [], regionData: [], topCategories: [], countryData: [],
        fundingSeries: [], totalFunding: 0, monthChange: null, newThisMonth: 0, openPitches: 0,
      };
    }

    const companies = (data.startups || []).filter((x) => x.status === 'Published');
    const rounds = (data.rounds || []).filter(published);
    const pitches = (data.pitches || []).filter((x) =>
      x.status === 'Active' && x.reviewStatus === 'Approved' && x.visibility === 'Public'
    );

    const regionCounts = new Map();
    const countryCounts = new Map();
    const categoryCounts = new Map();

    companies.forEach((company) => {
      const country = normalizeCountry(company.country || company.hq || '');
      if (country) {
        const region = getRegion(country);
        regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
        const existing = countryCounts.get(country) || { name: country, companies: 0, flag: company.flag || '🌍', records: [] };
        existing.companies += 1;
        if ((!existing.flag || existing.flag === '🌍') && company.flag) existing.flag = company.flag;
        existing.records.push(company);
        countryCounts.set(country, existing);
      }
      const category = String(company.category || '').trim();
      if (category) categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    const regionData = [...regionCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topCategories = [...categoryCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
      .slice(0, 5);

    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const countryData = [...countryCounts.values()]
      .map((country) => {
        const currentAdds = country.records.filter((x) => sameMonth(x.addedAt || x.createdAt || x.updatedAt, currentMonth)).length;
        const previousAdds = country.records.filter((x) => sameMonth(x.addedAt || x.createdAt || x.updatedAt, previousMonth)).length;
        let growthLabel = 'Live';
        if (previousAdds > 0) {
          const pct = Math.round(((currentAdds - previousAdds) / previousAdds) * 100);
          growthLabel = `${pct >= 0 ? '+' : ''}${pct}%`;
        } else if (currentAdds > 0) {
          growthLabel = `+${currentAdds} new`;
        }
        return { ...country, currentAdds, previousAdds, growthLabel };
      })
      .sort((a, b) => b.companies - a.companies || a.name.localeCompare(b.name))
      .slice(0, 5);

    const fundingSeries = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: monthKey(d),
        m: d.toLocaleString('en-US', { month: 'short' }),
        value: 0,
      };
    });
    const fundingMap = new Map(fundingSeries.map((x) => [x.key, x]));
    rounds.forEach((round) => {
      const d = parseDate(round.date || round.roundDate || round.createdAt || round.updatedAt);
      if (!d) return;
      const bucket = fundingMap.get(monthKey(d));
      if (bucket) bucket.value += Number(round.amount || 0);
    });

    const totalFunding = rounds.reduce((sum, round) => sum + Number(round.amount || 0), 0);
    const currentFunding = fundingSeries[fundingSeries.length - 1]?.value || 0;
    const previousFunding = fundingSeries[fundingSeries.length - 2]?.value || 0;
    const monthChange = previousFunding > 0
      ? Math.round(((currentFunding - previousFunding) / previousFunding) * 100)
      : currentFunding > 0 ? 100 : null;

    const newThisMonth = companies.filter((x) => sameMonth(x.addedAt || x.createdAt || x.updatedAt, currentMonth)).length;

    return {
      companies,
      rounds,
      pitches,
      regionData,
      topCategories,
      countryData,
      fundingSeries,
      totalFunding,
      monthChange,
      newThisMonth,
      openPitches: pitches.length,
      countryCount: countryCounts.size,
    };
  }, [connected, data.startups, data.rounds, data.pitches, now.getFullYear(), now.getMonth()]);

  const maxRegion = Math.max(1, ...snapshot.regionData.map((x) => x.value));
  const maxCategory = Math.max(1, ...snapshot.topCategories.map((x) => x.value));
  const liveStamp = now.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const offlineMessage = databaseStatus === 'checking'
    ? 'Connecting to live backend…'
    : `Backend unavailable${databaseError ? `: ${databaseError}` : ''}`;

  return (
    <section className="bg-canvas" data-testid="ecosystem-snapshot-section">
      <div className="wrap py-16 md:py-24">
        <SectionHeading
          number="03"
          eyebrow="Snapshot"
          title="A live snapshot of the ecosystem."
          subtitle="Every figure below is calculated from published records in the Startup Muslim backend."
        />

        <div className="mt-10 grid grid-cols-12 gap-4 md:gap-5">
          {/* Ecosystem by region — calculated from backend company countries */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="col-span-12 lg:col-span-7 panel-dark p-6 rounded-lg atlas-grid-dark relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow eyebrow-navy">Regions</div>
                <h3 className="mt-2 font-display text-[24px] md:text-[28px] text-white leading-tight">Ecosystem by region</h3>
              </div>
              <div className="mono text-[10.5px] text-white/50 whitespace-nowrap">
                {connected ? `${snapshot.countryCount || 0} countries` : 'Live backend'}
              </div>
            </div>

            {!connected ? (
              <EmptyLiveState dark message={offlineMessage} />
            ) : snapshot.regionData.length === 0 ? (
              <EmptyLiveState dark message="No published companies with a country yet." />
            ) : (
              <div className="mt-6 space-y-3">
                {snapshot.regionData.map((region, index) => (
                  <div key={region.name} className="flex items-center gap-4">
                    <div className="w-28 shrink-0 text-[12px] text-white/70">{region.name}</div>
                    <div className="flex-1 h-2 bg-white/8 rounded">
                      <div
                        className="h-full rounded transition-[width] duration-500"
                        style={{ width: `${(region.value / maxRegion) * 100}%`, background: REGION_COLORS[index % REGION_COLORS.length] }}
                      />
                    </div>
                    <div className="mono text-[12px] text-white w-12 text-right">{region.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4 text-white/50 text-[11px] mono">
              <span>{connected ? `Live · ${liveStamp} · MySQL` : 'Waiting for MySQL/API'}</span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald" />
                {connected ? `${snapshot.companies.length} published companies` : 'No mock fallback'}
              </span>
            </div>
          </motion.div>

          {/* Funding activity — calculated from published funding rounds */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }} className="col-span-12 md:col-span-6 lg:col-span-5 panel p-6">
            <div className="flex items-start justify-between gap-3">
              <div><div className="eyebrow">Funding activity</div><h3 className="mt-2 font-display text-[24px] leading-tight">Rounds tracked</h3></div>
              <span className="tag tag-emerald whitespace-nowrap">
                {connected && snapshot.monthChange !== null ? `${snapshot.monthChange >= 0 ? '+' : ''}${snapshot.monthChange}% MoM` : connected ? 'Live data' : 'Offline'}
              </span>
            </div>

            <div className="mono text-[36px] mt-2 text-ink">
              {connected ? formatMoney(snapshot.totalFunding) : '—'}
              <span className="text-[16px] text-slate2 ml-2">tracked</span>
            </div>

            {connected ? (
              <>
                <div className="h-24 mt-2 -mx-2">
                  <ResponsiveContainer>
                    <LineChart data={snapshot.fundingSeries}>
                      <Line type="monotone" dataKey="value" stroke="#D94B3D" strokeWidth={2} dot={false} isAnimationActive />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="hr mt-2 pt-3 mono text-[11px] text-slate2 flex justify-between">
                  {snapshot.fundingSeries.map((x) => <span key={x.key}>{x.m}</span>)}
                </div>
                <div className="mt-2 text-[11px] text-slate2">{snapshot.rounds.length} published funding round{snapshot.rounds.length === 1 ? '' : 's'} in backend</div>
              </>
            ) : (
              <EmptyLiveState message={offlineMessage} />
            )}
          </motion.div>

          {/* Categories — calculated from published company categories */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} className="col-span-12 md:col-span-6 lg:col-span-4 panel p-6">
            <div className="eyebrow">Top live categories</div>
            <h3 className="mt-2 font-display text-[22px] leading-tight">Categories in motion</h3>
            {!connected ? (
              <EmptyLiveState message={offlineMessage} />
            ) : snapshot.topCategories.length === 0 ? (
              <EmptyLiveState message="No published company categories yet." />
            ) : (
              <div className="mt-4 space-y-2.5">
                {snapshot.topCategories.map((category) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 text-[12.5px] truncate" title={category.name}>{category.name}</div>
                    <div className="flex-1 h-1.5 bg-sand rounded">
                      <div className="h-full bg-navy rounded" style={{ width: `${(category.value / maxCategory) * 100}%` }} />
                    </div>
                    <div className="mono text-[11.5px] w-8 text-right text-slate2">{category.value}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* New this month — calculated from company added/created dates */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }} className="col-span-6 lg:col-span-2 panel p-5">
            <div className="eyebrow">New this month</div>
            <div className="mono text-[40px] text-ink mt-2 leading-none">{connected ? snapshot.newThisMonth : '—'}</div>
            <div className="text-[12px] text-slate2 mt-1">Companies added</div>
            <span className="tag tag-emerald mt-3 w-fit">{connected ? 'Live' : 'Offline'}</span>
          </motion.div>

          {/* Open pitches — approved + public + active pitches from backend */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.14 }} className="col-span-6 lg:col-span-3 panel-dark p-5 rounded-lg">
            <div className="eyebrow eyebrow-navy">Open pitches</div>
            <div className="mono text-[40px] text-white mt-2 leading-none">{connected ? snapshot.openPitches : '—'}</div>
            <div className="text-[12px] text-white/60 mt-1">Approved, public & active</div>
            <a href="/pitches" className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-coral hover:underline">Browse pitches <ArrowUpRight className="w-3.5 h-3.5" /></a>
          </motion.div>

          {/* Countries to watch — ranked by real published company counts */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.16 }} className="col-span-12 lg:col-span-7 panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div><div className="eyebrow">Countries to watch</div><h3 className="mt-2 font-display text-[24px] leading-tight">Where the ecosystem is compounding</h3></div>
              <span className="mono text-[11px] text-slate2 whitespace-nowrap">{connected ? `Live · ${liveStamp}` : 'Backend offline'}</span>
            </div>

            {!connected ? (
              <EmptyLiveState message={offlineMessage} />
            ) : snapshot.countryData.length === 0 ? (
              <EmptyLiveState message="No published company countries yet." />
            ) : (
              <div className="mt-4 divide-y divide-line">
                {snapshot.countryData.map((country, index) => (
                  <div key={country.name} className="py-3 flex items-center gap-4">
                    <span className="mono text-[11.5px] text-slate3 w-6">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] flex-1 min-w-0 truncate"><CountryLabel country={country.name} explicitFlag={country.flag} /></span>
                    <span className="mono text-[12.5px] w-16 text-right">{country.companies}</span>
                    <span className="tag tag-emerald min-w-[58px] justify-center whitespace-nowrap">{country.growthLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

// Investor names entered here live ONLY on the round (funding_rounds.data).
// A name entered without selecting an existing profile never creates an investor.
const uniqueNames = (items) => Array.from(new Map((items || [])
  .filter((name) => typeof name === 'string' && name.trim())
  .map((name) => [name.trim().toLocaleLowerCase(), name.trim()])).values());
const clean = (value) => String(value || '').trim().replace(/\s+/g, ' ');

function SearchInvestor({ investors, onChoose, onUnlisted, placeholder, excludeSlugs = [], excludeNames = [] }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const normalized = clean(query);
  const available = useMemo(() => (investors || [])
    .filter((person) => person?.slug && person?.name && !excludeSlugs.includes(person.slug) && !excludeNames.some((name) => clean(name).toLowerCase() === clean(person.name).toLowerCase()))
    .filter((person) => !normalized || `${person.name} ${person.type || ''} ${person.country || ''}`.toLowerCase().includes(normalized.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8), [investors, excludeSlugs, excludeNames, normalized]);
  const exactProfile = (investors || []).some((person) => clean(person.name).toLowerCase() === normalized.toLowerCase());
  const alreadySelected = excludeNames.some((name) => clean(name).toLowerCase() === normalized.toLowerCase());
  const choose = (person) => { onChoose(person); setQuery(''); setFocused(false); };
  const addUnlisted = () => {
    if (!normalized || exactProfile || alreadySelected || normalized.length > 160) return;
    onUnlisted(normalized); setQuery(''); setFocused(false);
  };
  return <div className="relative">
    <div className="relative"><Search aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate2"/>
      <input type="text" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(event) => { if (event.key === 'Escape') setFocused(false); if (event.key === 'Enter') { event.preventDefault(); if (normalized && available.length && clean(available[0].name).toLowerCase() === normalized.toLowerCase()) choose(available[0]); } }}
        placeholder={placeholder} className="w-full bg-white border border-line rounded-lg pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-ink" />
    </div>
    {focused && normalized && <div className="absolute z-30 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line shadow-lg bg-white p-1">
      {available.map((investor) => <button type="button" key={investor.slug} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(investor)} className="w-full text-left rounded-md px-3 py-2 hover:bg-canvas text-[12px]">
        <span className="block font-medium">{investor.name}</span><span className="block text-[10.5px] text-slate2">Existing investor profile · {investor.type || investor.country || investor.slug}</span>
      </button>)}
      {!available.length && <div className="px-3 py-2 text-[12px] text-slate2">No matching investor profiles</div>}
      {!exactProfile && !alreadySelected && normalized.length <= 160 && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addUnlisted} className="w-full text-left rounded-md px-3 py-2 border-t border-line hover:bg-canvas text-[12px] text-ink">
        <span className="font-medium">+ Use “{normalized}” as an unlisted investor</span><span className="block text-[10.5px] text-slate2">Saved only on this funding round — no investor profile created</span>
      </button>}
      {exactProfile && <div className="px-3 py-2 text-[11px] text-slate2">This name exists in Investors. Select its profile above to link it.</div>}
    </div>}
  </div>;
}

export default function FundingInvestorFields({ investors = [], round = {}, onChange }) {
  const investorBySlug = useMemo(() => new Map(investors.map((investor) => [investor.slug, investor])), [investors]);
  const leadSlug = round.leadInvestorSlug || '';
  const leadName = clean(round.leadInvestorName);
  const participantSlugs = Array.isArray(round.investorSlugs) ? round.investorSlugs.filter(Boolean) : [];
  const participantNames = uniqueNames(round.investorNames);
  const leadLabel = investorBySlug.get(leadSlug)?.name || (leadSlug ? `Linked investor (${leadSlug})` : leadName);
  const dropDuplicateLead = (name) => clean(name).toLowerCase() !== clean(leadLabel).toLowerCase();
  const pickLead = (investor) => onChange({ leadInvestorSlug: investor.slug, leadInvestorName: '', investorSlugs: participantSlugs.filter((slug) => slug !== investor.slug), investorNames: participantNames.filter((name) => clean(name).toLowerCase() !== clean(investor.name).toLowerCase()) });
  const nameLead = (name) => onChange({ leadInvestorSlug: '', leadInvestorName: name, investorNames: participantNames.filter((item) => clean(item).toLowerCase() !== clean(name).toLowerCase()) });
  const pickParticipant = (investor) => onChange({ investorSlugs: [...new Set([...participantSlugs, investor.slug])], investorNames: participantNames.filter((name) => clean(name).toLowerCase() !== clean(investor.name).toLowerCase()) });
  const nameParticipant = (name) => onChange({ investorNames: uniqueNames([...participantNames, name]) });
  return <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border border-line rounded-xl bg-canvas/40 p-4">
    <div>
      <label className="block text-[12px] font-medium mb-1.5">Lead investor</label>
      {leadLabel && <div className="flex items-center gap-2 mb-2 rounded-lg border border-line bg-white px-3 py-2">
        <span className="text-[12px] flex-1 min-w-0 break-words">{leadLabel}</span><span className="text-[10px] text-slate2">{leadSlug ? 'Linked' : 'Round only'}</span>
        <button type="button" aria-label="Remove lead investor" onClick={() => onChange({ leadInvestorSlug: '', leadInvestorName: '' })}><X className="w-4 h-4"/></button>
      </div>}
      <SearchInvestor investors={investors} placeholder="Search investors or type a new name..." onChoose={pickLead} onUnlisted={nameLead}/>
    </div>
    <div>
      <label className="block text-[12px] font-medium mb-1.5">Other participating investors</label>
      {(participantSlugs.length > 0 || participantNames.length > 0) && <div className="flex flex-wrap gap-2 mb-2">
        {participantSlugs.map((slug) => <span key={slug} className="inline-flex items-center gap-2 border border-line rounded-lg bg-white px-2.5 py-1.5 text-[11px]">
          {investorBySlug.get(slug)?.name || `Linked investor (${slug})`} · Linked <button type="button" aria-label={`Remove ${slug}`} onClick={() => onChange({ investorSlugs: participantSlugs.filter((item) => item !== slug) })}><X className="w-3.5 h-3.5"/></button>
        </span>)}
        {participantNames.filter(dropDuplicateLead).map((name) => <span key={name.toLowerCase()} className="inline-flex items-center gap-2 border border-line rounded-lg bg-white px-2.5 py-1.5 text-[11px]">
          {name} · Round only <button type="button" aria-label={`Remove ${name}`} onClick={() => onChange({ investorNames: participantNames.filter((item) => item !== name) })}><X className="w-3.5 h-3.5"/></button>
        </span>)}
      </div>}
      <SearchInvestor investors={investors} placeholder="Find or add another investor..." onChoose={pickParticipant} onUnlisted={nameParticipant}
        excludeSlugs={[leadSlug, ...participantSlugs]} excludeNames={[leadLabel, ...participantNames, ...participantSlugs.map((slug) => investorBySlug.get(slug)?.name || '')]}/>
    </div>
    <p className="md:col-span-2 text-[11px] text-slate2">Select a search result to link an existing Investors profile. Choose “Use as an unlisted investor” to store a name on this funding round only. Unlisted names display on the company page but are not created in Investors.</p>
  </div>;
}

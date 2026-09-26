import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { InvestorLogo, StartupLogo } from '@/components/common/Logo';
import SaveButton from '@/components/common/SaveButton';
import CountryLabel from '@/components/common/CountryLabel';
import { MapPin, Globe, Mail, ArrowUpRight, ShieldCheck, Linkedin, Phone, DatabaseZap, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  asArray,
  formatInvestorDate,
  formatInvestorMoney,
  getInvestorCoInvestors,
  getInvestorPortfolio,
  getInvestorRounds,
  isPublicInvestorRecord,
} from '@/lib/investorData';

const usableUrl = (value) => Boolean(value && value !== '#');

export default function InvestorDetail() {
  const { slug } = useParams();
  const { toast } = useToast();
  const { data, addMessage, loading, databaseStatus, databaseError } = useData();
  const { currentUser } = useAuth();
  const [contactOpen,setContactOpen] = useState(false);
  useEffect(()=>{
    if (!contactOpen) return undefined;
    const escape=(event)=>{if(event.key==='Escape')setContactOpen(false);};
    document.addEventListener('keydown',escape);
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.removeEventListener('keydown',escape);document.body.style.overflow=previous;};
  },[contactOpen]);

  if (databaseStatus === 'error') {
    return <div className="wrap py-20"><div className="border border-line bg-white rounded-2xl p-8 max-w-2xl"><DatabaseZap className="w-7 h-7 text-coral"/><h1 className="font-display text-[28px] mt-4">Investor database unavailable</h1><p className="text-[13px] text-slate2 mt-2">This profile uses backend data only. Start the API/MySQL connection and refresh.</p>{databaseError && <div className="mono text-[11px] mt-4 p-3 rounded-lg bg-canvas break-all">{databaseError}</div>}</div></div>;
  }
  if (loading && databaseStatus === 'checking') return <div className="wrap py-20 text-[13px] text-slate2">Loading investor profile from the backend…</div>;

  const investor = (data.investors || []).find((item) => item.slug === slug && isPublicInvestorRecord(item));
  if (!investor) return <Navigate to="/investors" replace />;

  const portfolio = getInvestorPortfolio(investor, data.startups || [], data.rounds || []);
  const rounds = getInvestorRounds(data.rounds || [], investor.slug);
  const coInvestors = getInvestorCoInvestors(investor, data.investors || [], data.rounds || [], data.startups || []).slice(0, 4);
  const focus = asArray(investor.focus);
  const stageFocus = asArray(investor.stageFocus);
  const contact = investor.contact || {};
  const email = contact.email || investor.email || '';
  const phone = contact.phone || investor.phone || '';
  const linkedin = contact.linkedin || investor.linkedin || '';

  const contactAdmin = () => {
    addMessage({
      name: currentUser?.name || 'Website visitor',
      email: currentUser?.email || 'visitor@example.com',
      topic: 'Investor contact',
      message: `Contact request for investor ${investor.name}.`,
    });
    toast('Contact request sent to the admin inbox.', { type: 'success' });
  };

  return (
    <div className="wrap pt-10 pb-24" data-testid="investor-detail-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-line bg-white rounded-3xl p-6 md:p-8">
            <div className="flex items-start gap-5 flex-wrap">
              <InvestorLogo investor={investor} size={72} rounded={18} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-[32px] md:text-[42px] leading-tight">{investor.name}</h1>
                  {investor.verified && <span className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-1 text-[11px] font-semibold leading-none text-emerald">Verified</span>}
                </div>
                <div className="text-[13.5px] text-slate2 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{investor.type || 'Investor'}</span><span className="dot-sep" />
                  <MapPin className="w-3.5 h-3.5" /> <CountryLabel country={investor.country} explicitFlag={investor.flag} />
                </div>
                {investor.description && <p className="text-[15px] text-ink/85 mt-4 max-w-2xl">{investor.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {usableUrl(investor.website) && <a href={investor.website} target="_blank" rel="noreferrer" className="btn btn-coral"><Globe className="w-4 h-4" /> Website</a>}
                <button className="btn btn-outline" onClick={() => setContactOpen(true)}><Mail className="w-4 h-4" /> Contact</button>
                {currentUser?.id===investor.ownerId&&<Link to="/dashboard/investor" className="btn btn-outline">Edit profile</Link>}
                <SaveButton type="investors" id={investor.slug} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Fact label="Ticket range" value={investor.ticketRange || 'Not disclosed'} />
              <Fact label="Portfolio" value={`${portfolio.length} companies`} />
              <Fact label="Stage focus" value={stageFocus.join(', ') || 'Not specified'} />
              <Fact label="Halal focus" value={investor.halalFocus ? 'Yes' : 'General'} />
            </div>

            {(investor.thesis || focus.length > 0) && <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {investor.thesis && <div><div className="eyebrow mb-2">Investment thesis</div><p className="text-[13.5px] leading-6 text-ink/80">{investor.thesis}</p></div>}
              {focus.length > 0 && <div>
                <div className="eyebrow mb-3">Focus areas</div>
                <div className="flex flex-wrap gap-2">
                  {focus.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-[#FBF8F2] px-3 py-1.5 text-[12px] font-medium leading-none text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-coral shrink-0" aria-hidden />
                      {item}
                    </span>
                  ))}
                </div>
              </div>}
            </div>}
          </div>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4"><div className="eyebrow">Portfolio</div><div className="mono text-[10.5px] text-slate2">{portfolio.length} linked companies</div></div>
            {portfolio.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((startup) => (
                <Link key={startup.slug} to={`/startups/${startup.slug}`} className="flex items-center gap-4 border border-line bg-white rounded-2xl p-4 hover:border-coral/30">
                  <StartupLogo startup={startup} />
                  <div className="flex-1 min-w-0"><div className="font-display text-[16px]">{startup.name}</div><div className="text-[12.5px] text-slate2 truncate">{startup.tagline}</div><div className="text-[11.5px] text-slate2 mt-1">{startup.category} · {startup.stage}</div></div>
                  <ArrowUpRight className="w-4 h-4 text-slate2" />
                </Link>
              ))}
            </div> : <div className="border border-dashed border-line rounded-2xl p-6 text-[13px] text-slate2">No published portfolio companies are linked to this investor yet.</div>}
          </section>

          <section>
            <div className="eyebrow mb-4">Recent investments</div>
            {rounds.length > 0 ? <div className="border border-line bg-white rounded-2xl overflow-x-auto thin-scroll">
              <table className="w-full text-[13.5px]">
                <thead><tr className="text-slate2 text-left"><th className="py-3 px-4">Startup</th><th className="py-3 px-4">Round</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Amount</th><th className="py-3 px-4">Role</th></tr></thead>
                <tbody>
                  {rounds.map((round) => {
                    const startup = (data.startups || []).find((item) => item.slug === round.startupSlug);
                    return <tr key={round.id} className="border-t border-line">
                      <td className="py-3 px-4">{startup ? <Link to={`/startups/${startup.slug}`} className="hover:text-coral">{startup.name}</Link> : (round.startupSlug || '—')}</td>
                      <td className="py-3 px-4">{round.roundName || round.stage || '—'}</td>
                      <td className="py-3 px-4 text-slate2">{formatInvestorDate(round.date)}</td>
                      <td className="py-3 px-4">{formatInvestorMoney(round.amount)}</td>
                      <td className="py-3 px-4">
                        {round.leadInvestorSlug === investor.slug ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3B8AE] bg-[#FFF0ED] px-2.5 py-1 text-[11.5px] font-semibold leading-none text-[#C84235]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E94B3C]" aria-hidden />
                            Lead
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE5] bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-medium leading-none text-slate2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate2/60" aria-hidden />
                            Participating
                          </span>
                        )}
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div> : <div className="border border-dashed border-line rounded-2xl p-6 text-[13px] text-slate2">No published funding rounds are linked to this investor yet.</div>}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {(investor.headquarters || investor.hq || investor.foundedYear || investor.aum || investor.teamSize) && <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Investor data</div>
            <div className="mt-3 divide-y divide-line">
              {(investor.headquarters || investor.hq) && <SideRow label="Headquarters" value={investor.headquarters || investor.hq} />}
              {investor.foundedYear && <SideRow label="Founded" value={investor.foundedYear} />}
              {investor.aum && <SideRow label="AUM" value={investor.aum} />}
              {investor.teamSize && <SideRow label="Team" value={investor.teamSize} />}
            </div>
          </div>}

          <div className="border border-line bg-white rounded-2xl p-5 flex items-center justify-between gap-3"><div><div className="eyebrow">Contact</div><div className="text-xs text-slate2 mt-2">See public investor contact details.</div></div><button className="btn btn-outline btn-sm" onClick={()=>setContactOpen(true)}>View contact</button></div>

          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Co-investors</div>
            {coInvestors.length > 0 ? <div className="mt-3 space-y-2">{coInvestors.map((co) => (
              <Link key={co.slug} to={`/investors/${co.slug}`} className="flex items-center gap-3 group">
                <InvestorLogo investor={co} size={32} rounded={8} />
                <div className="flex-1"><div className="text-[13px] font-medium">{co.name}</div><div className="text-[11.5px] text-slate2">{co.type}{co._relationshipScore ? ` · ${co._relationshipScore} shared signal${co._relationshipScore === 1 ? '' : 's'}` : ''}</div></div>
                <ArrowUpRight className="w-4 h-4 text-slate2 group-hover:text-coral" />
              </Link>
            ))}</div> : <div className="text-[12px] text-slate2 mt-3">No linked co-investors yet.</div>}
          </div>

          <div className="border border-line bg-white rounded-2xl p-5 flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-coral" /><div className="text-[12.5px] text-slate2">Investor profiles are informational only. Not investment advice, endorsement, or Shariah certification.</div></div>
        </aside>
      </div>
      {contactOpen && <div className="fixed inset-0 z-[140] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onMouseDown={()=>setContactOpen(false)} role="dialog" aria-modal="true" aria-label={`${investor.name} contact details`}><div className="w-full max-w-lg max-h-[calc(100dvh-24px)] overflow-y-auto bg-[#F7F4EE] rounded-2xl border border-line shadow-2xl" onMouseDown={(event)=>event.stopPropagation()}><div className="bg-navy text-white px-5 py-4 flex items-start gap-4"><InvestorLogo investor={investor} size={48} rounded={12}/><div className="flex-1 min-w-0"><div className="text-[10px] uppercase tracking-[.18em] text-white/55">Investor contact</div><h2 className="font-display text-xl mt-1 truncate">{investor.name}</h2><p className="text-xs text-white/65 mt-1">{investor.type || 'Investor'}</p></div><button onClick={()=>setContactOpen(false)} aria-label="Close contact popup" className="p-2 rounded-lg border border-white/20 hover:bg-white/10"><X size={16}/></button></div><div className="p-5"><div className="grid sm:grid-cols-2 gap-2">{[email&&{label:'Email',value:email,href:`mailto:${email}`,icon:Mail},phone&&{label:'Phone',value:phone,href:`tel:${phone}`,icon:Phone},usableUrl(linkedin)&&{label:'LinkedIn',value:'Open profile',href:linkedin,icon:Linkedin},usableUrl(investor.website)&&{label:'Website',value:'Visit website',href:investor.website,icon:Globe},(investor.headquarters||investor.country)&&{label:'Location',value:investor.headquarters||investor.country,icon:MapPin}].filter(Boolean).map(({label,value,href,icon:Icon})=>{const content=<><Icon size={16} className="text-coral shrink-0"/><span className="min-w-0"><span className="block text-[10px] uppercase text-slate2">{label}</span><span className="block text-xs font-medium break-words mt-0.5">{value}</span></span></>;return href?<a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-coral">{content}</a>:<div key={label} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">{content}</div>;})}</div>{!(email||phone||usableUrl(linkedin)||usableUrl(investor.website))&&<div className="mt-3 rounded-xl bg-white border border-line p-4 text-xs text-slate2">This investor has not shared direct contact details. You can request contact through the site.</div>}{!email&&<button onClick={()=>{contactAdmin();setContactOpen(false);}} className="btn btn-coral btn-sm mt-4">Request contact</button>}</div></div></div>}
    </div>
  );
}

function Fact({ label, value }) {
  return <div className="rounded-2xl border border-line p-3 bg-canvas/40"><div className="eyebrow">{label}</div><div className="text-[13.5px] font-medium mt-1">{value}</div></div>;
}

function SideRow({ label, value }) {
  return <div className="py-2.5 first:pt-0 last:pb-0"><div className="text-[10.5px] text-slate2">{label}</div><div className="text-[12.5px] font-medium mt-0.5">{value}</div></div>;
}

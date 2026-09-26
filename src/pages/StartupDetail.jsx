import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Bookmark, CalendarDays, Download, Flame, Globe, Linkedin, Mail, MapPin, MessageCircle, Phone, Play, ShieldCheck, UserRound, X } from 'lucide-react';
import { StartupLogo, InvestorLogo } from '@/components/common/Logo';
import SaveButton from '@/components/common/SaveButton';
import { EmptyState } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';
import { useSaved } from '@/context/SavedContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import CountryLabel from '@/components/common/CountryLabel';
import OverviewBlocks from '@/components/common/OverviewBlocks';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `$${(amount/1_000_000_000).toFixed(1).replace('.0','')}B`;
  if (amount >= 1_000_000) return `$${(amount/1_000_000).toFixed(1).replace('.0','')}M`;
  if (amount >= 1_000) return `$${(amount/1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
};
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? (value || '') : date.toLocaleDateString('en-US',{month:'short',year:'numeric'}); };

const TABS = [
  { id:'overview', label:'Overview' },
  { id:'pitch', label:'Investment Pitch' },
  { id:'rounds', label:'Funding Rounds' },
  { id:'founders', label:'Founders' },
  { id:'products', label:'Products' },
  { id:'jobs', label:'Jobs' },
  { id:'similar', label:'Similar' },
];

export default function StartupDetail() {
  const { slug } = useParams();
  const [tab, setTab] = useState('overview');
  const [contactOpen, setContactOpen] = useState(false);
  const { toast } = useToast();
  const { toggle, isSaved } = useSaved();
  const { addItem, data, loading, databaseStatus } = useData();
  const { currentUser } = useAuth();

  const s = (data.startups || []).find((item) => item.slug === slug && !['Draft','Pending','Rejected','Archived','Inactive'].includes(item.status || 'Published'));
  const pitch = s ? (data.pitches || []).find((item) => item.startupSlug === s.slug && item.status === 'Active' && item.reviewStatus === 'Approved' && item.visibility === 'Public') : null;
  const rounds = s ? (data.rounds || []).filter((item) => item.startupSlug === s.slug && !['Draft','Pending','Rejected','Archived'].includes(item.status || 'Published')).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)) : [];
  const founders = s ? (data.founders || []).filter((item) => (item.startupSlug === s.slug || (s.founderSlugs || []).includes(item.slug)) && !['Draft','Pending','Rejected','Archived'].includes(item.status || 'Published')) : [];
  const jobs = s ? (data.jobs || []).filter((item) => item.startupSlug === s.slug && !['Draft','Pending','Rejected','Archived','Inactive','Closed'].includes(item.status || 'Published')) : [];
  const explicitSimilar = s ? (s.similarSlugs || []).map((similarSlug)=>(data.startups || []).find((item)=>item.slug===similarSlug)).filter(Boolean) : [];
  const similar = s ? (explicitSimilar.length ? explicitSimilar : (data.startups || []).filter((item)=>item.slug!==s.slug && item.category===s.category && !['Draft','Pending','Rejected','Archived'].includes(item.status || 'Published')).slice(0,4)) : [];

  useEffect(() => {
    if (window.location.hash === '#pitch') setTab('pitch');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (!contactOpen) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setContactOpen(false); };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [contactOpen]);

  if (loading || databaseStatus === 'checking') return <div className="wrap py-24 text-center text-slate2">Loading company from backend…</div>;
  if (databaseStatus === 'error') return <div className="wrap py-24 text-center"><div className="font-display text-[24px]">Company data is temporarily unavailable.</div><p className="text-[13px] text-slate2 mt-2">The public profile is waiting for the backend database connection.</p></div>;
  if (!s) return <Navigate to="/startups" replace />;
  const followed = isSaved('follows', s.slug);
  const myClaim = currentUser ? data.claims.find((claim) => claim.startupSlug === s.slug && (claim.ownerId === currentUser.id || String(claim.requesterEmail || '').toLowerCase() === String(currentUser.email || '').toLowerCase()) && !['Rejected','Revoked','Cancelled'].includes(claim.status)) : null;
  const canManage = Boolean(currentUser && (s.ownerId === currentUser.id || myClaim?.status === 'Approved'));
  const claimedByAnotherUser = Boolean(s.ownerId && currentUser && s.ownerId !== currentUser.id && myClaim?.status !== 'Approved');

  const submitClaim = () => {
    if (!currentUser) return toast('Please sign in before claiming a startup profile.', { type:'warning' });
    if (canManage) return;
    if (myClaim) return toast(`Your claim is already ${String(myClaim.status).toLowerCase()}.`, { type:'info' });
    if (claimedByAnotherUser || (s.claimed && !canManage)) return toast('This startup profile is already claimed.', { type:'warning' });
    const created = addItem('claims', { startupSlug:s.slug, requester:currentUser.name, requesterEmail:currentUser.email, ownerId:currentUser.id, role:currentUser.role || 'Founder', submitted:new Date().toISOString().slice(0,10), status:'Pending', notes:'' }, currentUser.name);
    created.savePromise?.then(() => toast('Claim request submitted for admin review.', { type:'success' })).catch((error) => toast(error.message || 'The claim could not be submitted.', { type:'warning' }));
  };

  return (
    <div data-testid="startup-detail-page">
      {/* Banner */}
      <div className="relative h-52 md:h-72 bg-navy overflow-hidden">
        <img src={s.banner} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/40 to-canvas" />
      </div>

      {/* Profile header */}
      <div className="wrap -mt-16 md:-mt-20 relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-1 bg-canvas rounded-md w-fit shrink-0">
            <div className="hidden md:block">
              <StartupLogo startup={s} size={128} rounded={16} />
            </div>
            <div className="md:hidden">
              <StartupLogo startup={s} size={96} rounded={14} />
            </div>
          </div>
          <div className="flex-1 min-w-0 md:min-h-[128px] flex flex-col justify-center pb-1">
            <h1 className="display-h text-[36px] md:text-[52px] leading-[1.02]">{s.name}</h1>
            <p className="text-[15px] text-slate2 mt-2 max-w-2xl">{s.tagline}</p>

            {/* Quiet company metadata — intentionally placed below the tagline so it never fights the hero image/title. */}
            <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Company category and location">
              <span className="inline-flex min-h-8 items-center rounded-full border border-line bg-white/85 px-3 text-[11.5px] font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />
                {s.category}
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-line bg-white/85 px-3 text-[11.5px] font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                <CountryLabel
                  country={s.country}
                  explicitFlag={s.flag}
                  className="text-ink gap-2"
                  flagClassName="w-4 h-3 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.10)]"
                />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={s.website} className="btn btn-navy btn-sm" data-testid="startup-website"><Globe className="w-3.5 h-3.5" /> Website</a>
            <button className="btn btn-outline btn-sm" onClick={() => setContactOpen(true)} data-testid="contact-founder-btn"><MessageCircle className="w-3.5 h-3.5" /> Contact</button>
            {canManage ? <Link to={`/dashboard/startups/${s.slug}`} className="btn btn-coral btn-sm" data-testid="manage-profile-btn">Manage profile</Link> : <button className="btn btn-outline btn-sm" disabled={Boolean(myClaim || claimedByAnotherUser || s.claimed)} onClick={submitClaim} data-testid="claim-profile-btn">{myClaim ? `Claim ${myClaim.status.toLowerCase()}` : claimedByAnotherUser || s.claimed ? 'Profile claimed' : 'Claim'}</button>}
            <SaveButton type="startups" id={s.slug} testid="startup-save" />
          </div>
        </div>

        {/* Status strip */}
        <div className="mt-6 border-t border-line pt-4 flex items-center gap-4 flex-wrap text-[12.5px]">
          {s.verified && <span className="inline-flex items-center gap-1.5 text-navy"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
          {(s.claimed || s.ownerId || myClaim?.status === 'Approved') && <span className="inline-flex items-center gap-1.5 text-emerald"><BadgeCheck className="w-3.5 h-3.5" /> Claimed profile</span>}
          {s.openToFunding && <span className="inline-flex items-center gap-1.5 text-emerald">◼ Open to funding</span>}
          {s.pitching && <span className="inline-flex items-center gap-1.5 text-coral"><Flame className="w-3.5 h-3.5" /> Currently pitching</span>}
          {s.hiring && <span className="inline-flex items-center gap-1.5 text-amber">◼ Hiring</span>}
          <span className="mono text-slate3 uppercase tracking-widest ml-auto">Stage · {s.stage}</span>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-line flex items-center gap-1 overflow-x-auto thin-scroll">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-[13px] border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-coral text-ink' : 'border-transparent text-slate2 hover:text-ink'}`} data-testid={`tab-${t.id}`}>{t.label}</button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-12 gap-8 mt-8 pb-16">
          <main className="col-span-12 lg:col-span-8 space-y-10">
            {tab === 'overview' && <Overview startup={s} />}
            {tab === 'pitch' && <PitchPanel startup={s} pitch={pitch} onContact={() => setContactOpen(true)} />}
            {tab === 'rounds' && <RoundsTimeline rounds={rounds} investors={data.investors || []} />}
            {tab === 'founders' && <FoundersPanel founders={founders} />}
            {tab === 'products' && <ProductsPanel startup={s} />}
            {tab === 'jobs' && <JobsPanel jobs={jobs} startup={s} />}
            {tab === 'similar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similar.map(x => (
                  <Link key={x.slug} to={`/startups/${x.slug}`} className="border border-line rounded-md p-4 flex items-center gap-3 hover:border-ink transition">
                    <StartupLogo startup={x} />
                    <div className="flex-1 min-w-0"><div className="font-display font-medium">{x.name}</div><div className="text-[12px] text-slate2 truncate">{x.tagline}</div></div>
                    <ArrowUpRight className="w-4 h-4 text-slate2" />
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* Sticky right research panel */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="border border-line rounded-md bg-white p-5">
                <div className="eyebrow mb-3">Company data</div>
                <ul className="space-y-2 text-[13px]">
                  <DataRow k="Founded" v={<span className="mono">{s.foundedYear}</span>} />
                  <DataRow k="Stage" v={<span className="mono">{s.stage}</span>} />
                  <DataRow k="Total raised" v={<span className="mono">{formatMoney(s.totalRaised)}</span>} />
                  <DataRow k="Team" v={<span className="mono">{s.teamSize}</span>} />
                  <DataRow k="Model" v={s.businessModel} />
                  <DataRow k="HQ" v={s.hq} />
                  <DataRow k="Website" v={<a href={s.website} className="text-ink hover:text-coral inline-flex items-center gap-1">Open <ArrowUpRight className="w-3 h-3" /></a>} />
                </ul>
              </div>
              <div className="border border-line rounded-md bg-white p-5">
                <div className="eyebrow mb-3">Traction</div>
                <ul className="space-y-2 text-[13px]">
                  <DataRow k="Revenue" v={s.revenue} />
                  <DataRow k="Users" v={s.users} />
                  <DataRow k="Growth" v={<span className="mono">{s.growth}</span>} />
                </ul>
              </div>
              <button onClick={() => { toggle('follows', s.slug); toast(followed ? 'Unfollowed.' : 'Following.', { type: 'success' }); }}
                className="w-full border border-line bg-white rounded-md p-4 flex items-center gap-3 hover:border-ink" data-testid="follow-startup">
                <Bookmark className="w-4 h-4 text-coral" />
                <div className="text-left"><div className="font-medium text-[13.5px]">{followed ? 'You\'re following' : 'Follow this company'}</div><div className="text-[11.5px] text-slate2">Get updates on rounds & product</div></div>
              </button>
              <div className="border border-line rounded-md bg-canvas p-4 flex gap-3 items-start text-[11.5px] text-slate2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-coral mt-0.5" />
                Listings are informational only. Not investment advice or Shariah certification.
              </div>
            </div>
          </aside>
        </div>
      </div>

      {contactOpen && <ContactModal startup={s} onClose={() => setContactOpen(false)} />}
    </div>
  );
}

function ContactModal({ startup, onClose }) {
  const storedContact = startup.contact || {};
  const contact = {
    ...storedContact,
    public: storedContact.public !== false,
    name: String(storedContact.name || startup.contactName || '').trim() || `${startup.name} Team`,
    role: String(storedContact.role || startup.contactRole || '').trim() || 'Company enquiries',
    email: String(storedContact.email || startup.contactEmail || '').trim(),
    phone: String(storedContact.phone || startup.contactPhone || '').trim(),
    whatsapp: String(storedContact.whatsapp || startup.contactWhatsapp || '').trim(),
    address: String(storedContact.address || startup.contactAddress || startup.hq || startup.country || '').trim(),
    linkedin: String(storedContact.linkedin || startup.contactLinkedin || '').trim(),
    note: String(storedContact.note || startup.contactNote || '').trim(),
  };
  const visible = contact.public !== false;
  const validWebsite = /^https?:\/\//i.test(String(startup.website || '').trim());
  const whatsappDigits = String(contact.whatsapp || '').replace(/\D/g, '');
  const hasContact = visible && Boolean(contact.name || contact.role || contact.email || contact.phone || contact.whatsapp || contact.address || contact.linkedin || contact.note);
  const rows = [
    contact.name && { icon:UserRound, label:'Contact person', value:contact.name, sub:contact.role },
    contact.email && { icon:Mail, label:'Email', value:contact.email, href:`mailto:${contact.email}` },
    contact.phone && { icon:Phone, label:'Phone', value:contact.phone, href:`tel:${String(contact.phone).replace(/\s/g,'')}` },
    contact.whatsapp && { icon:MessageCircle, label:'WhatsApp', value:contact.whatsapp, href:whatsappDigits ? `https://wa.me/${whatsappDigits}` : undefined },
    contact.address && { icon:MapPin, label:'Office / location', value:contact.address },
    contact.linkedin && { icon:Linkedin, label:'LinkedIn', value:'Open contact profile', href:contact.linkedin },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[140] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={`${startup.name} contact details`}>
      <div className="w-full sm:max-w-lg max-h-[calc(100dvh-20px)] overflow-y-auto bg-[#F7F4EE] rounded-2xl border border-line shadow-2xl" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="bg-navy text-white px-4 py-4 flex items-start gap-4">
          <StartupLogo startup={startup} size={52} rounded={12} />
          <div className="min-w-0 flex-1">
            <div className="mono text-[9.5px] uppercase tracking-[0.18em] text-white/55">Company contact</div>
            <div className="font-display text-[22px] mt-1 truncate">{startup.name}</div>
            <div className="text-[11.5px] text-white/65 mt-1">Public contact information supplied from the company backend.</div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg border border-white/15 hover:bg-white/10 inline-flex items-center justify-center shrink-0" aria-label="Close contact popup"><X className="w-4 h-4"/></button>
        </div>

        <div className="p-4">
          {!visible ? (
            <div className="rounded-xl border border-line bg-white p-5 text-center"><div className="font-medium text-[13px]">Contact details are private</div><p className="text-[11.5px] text-slate2 mt-1">This company has not enabled public contact information.</p></div>
          ) : !hasContact ? (
            <div className="rounded-xl border border-line bg-white p-5 text-center"><div className="font-medium text-[13px]">No contact details added yet</div><p className="text-[11.5px] text-slate2 mt-1">The company can add email, phone, WhatsApp and contact-person details from the backend editor.</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {rows.map(({icon:Icon,label,value,sub,href}) => {
                const content = <><span className="w-9 h-9 rounded-lg bg-canvas border border-line inline-flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-coral"/></span><span className="min-w-0 flex-1"><span className="block mono text-[9px] uppercase tracking-[0.14em] text-slate3">{label}</span><span className="block text-[13px] text-ink mt-0.5 break-words">{value}</span>{sub && <span className="block text-[10.5px] text-slate2 mt-0.5">{sub}</span>}</span>{href && <ArrowUpRight className="w-3.5 h-3.5 text-slate3 shrink-0"/>}</>;
                return href ? <a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noreferrer':undefined} className="rounded-xl border border-line bg-white p-3 flex items-center gap-3 hover:border-ink transition">{content}</a> : <div key={label} className="rounded-xl border border-line bg-white p-3 flex items-center gap-3">{content}</div>;
              })}
              {contact.note && <div className="sm:col-span-2 rounded-xl border border-line bg-white p-3"><div className="mono text-[9px] uppercase tracking-[0.14em] text-slate3">Note</div><p className="text-[12px] leading-relaxed text-slate2 mt-1.5 whitespace-pre-line">{contact.note}</p></div>}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-3">
            <span className="text-[10.5px] text-slate2">Contact details come directly from this company profile.</span>
            {validWebsite && <a href={startup.website} target="_blank" rel="noreferrer" className="btn btn-navy btn-sm"><Globe className="w-3.5 h-3.5"/> Website</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataRow({ k, v }) { return <li className="flex items-center justify-between border-b border-line/60 last:border-none pb-2 last:pb-0"><span className="text-slate2 text-[12.5px]">{k}</span><span className="text-ink">{v}</span></li>; }

function JobsPanel({ jobs, startup }) {
  return <section><div className="flex items-end justify-between gap-3 mb-5"><div><div className="eyebrow">Careers</div><h2 className="font-display text-2xl mt-2">Open roles at {startup.name}</h2></div><span className="text-xs text-slate2">{jobs.length} open {jobs.length===1?'role':'roles'}</span></div>{jobs.length===0?<div className="rounded-2xl bg-white border border-line p-8 text-sm text-slate2">There are no open jobs at this company right now.</div>:<div className="space-y-3">{jobs.map((job)=><article key={job.id} className="rounded-2xl bg-white border border-line p-5 md:p-6"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><h3 className="font-display text-xl">{job.title}</h3><div className="flex gap-2 flex-wrap mt-3">{[job.location,job.arrangement,job.type,job.level].filter(Boolean).map((value,index)=><span key={`${value}-${index}`} className="rounded-full bg-canvas px-3 py-1 text-xs text-slate2">{value}</span>)}</div></div>{job.applicationUrl&&<a className="btn btn-coral btn-sm shrink-0" href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply <ArrowUpRight size={14}/></a>}</div>{job.description&&<p className="text-sm text-slate2 leading-relaxed mt-4 whitespace-pre-line">{job.description}</p>}{job.posted&&<div className="text-xs text-slate2 mt-4">Posted {formatDate(job.posted)}</div>}</article>)}</div>}</section>;
}

function Overview({ startup: s }) {
  return <OverviewBlocks startup={s} />;
}

function PitchPanel({ startup: s, pitch, onContact }) {
  const { toast } = useToast();
  const { addMessage } = useData();
  const { currentUser } = useAuth();
  const sendRequest = (topic, message) => { addMessage({ name:currentUser?.name||'Website visitor', email:currentUser?.email||'visitor@example.com', topic, message }); toast('Request sent to the admin inbox.', { type:'success' }); };
  if (!pitch) return <EmptyState title="No active investment pitch" description="This startup has not published an active investment pitch yet." icon={Flame} />;
  return (
    <div id="pitch" className="space-y-6">
      <div className="panel-dark rounded-md p-6 md:p-8 atlas-grid-dark relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="tag tag-coral"><Flame className="w-3 h-3" /> Active pitch</span>
            <h3 className="font-display text-white text-[26px] md:text-[32px] leading-tight mt-3">{pitch.pitchTitle}</h3>
            <p className="text-white/70 text-[14px] mt-2 max-w-xl">{pitch.summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/10 pt-6">
          <PitchM label="Raising" value={formatMoney(pitch.requested)} />
          <PitchM label="Equity offered" value={`${pitch.equity}%`} />
          <PitchM label="Valuation" value={formatMoney(pitch.valuation)} />
          <PitchM label="Minimum ticket" value={formatMoney(pitch.minTicket)} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => sendRequest('Pitch deck request', `Pitch deck requested for ${s.name}.`)} className="btn btn-coral" data-testid="request-pitch-deck"><Download className="w-3.5 h-3.5" /> Request pitch deck</button>
          <button onClick={onContact} className="btn btn-outline-white" data-testid="contact-founder-pitch"><MessageCircle className="w-3.5 h-3.5" /> Contact founder</button>
          <button onClick={() => toast('Demo video will be available when a valid demo link is added.', { type: 'info' })} className="btn btn-outline-white"><Play className="w-3.5 h-3.5" /> Demo video</button>
          <SaveButton type="pitches" id={pitch.id} variant="dark" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          ['Problem', pitch.problem],['Solution', pitch.solution],['Market', pitch.market],['Business model', pitch.businessModel],['Traction', pitch.traction],['Use of funds', pitch.useOfFunds],
        ].map(([t, v]) => (
          <div key={t}>
            <div className="eyebrow mb-1.5">{t}</div>
            <p className="text-[13.5px] text-ink/85 leading-relaxed">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchM({ label, value }) {
  return <div><div className="eyebrow eyebrow-navy">{label}</div><div className="mono text-[24px] text-white mt-1">{value}</div></div>;
}

function RoundsTimeline({ rounds, investors }) {
  if (!rounds.length) return <EmptyState title="No rounds" description="No funding rounds have been recorded yet." icon={CalendarDays} />;
  return (
    <div className="relative pl-6 border-l border-line">
      {rounds.map((r, i) => {
        const lead = (investors || []).find((item)=>item.slug===r.leadInvestorSlug);
        return (
          <div key={r.id} className="relative mb-8 last:mb-0">
            <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-coral border-2 border-canvas" />
            <div className="mono text-[11px] text-slate2 uppercase tracking-widest">{formatDate(r.date)}</div>
            <div className="font-display text-[20px] mt-1">{r.roundName} · <span className="mono">{formatMoney(r.amount)}</span></div>
            <div className="text-[12.5px] text-slate2 mt-1">Valuation <span className="mono">{formatMoney(r.valuation)}</span></div>
            <p className="text-[13px] text-ink/85 mt-2 max-w-xl">{r.notes}</p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {lead && <Link to={`/investors/${lead.slug}`} className="inline-flex items-center gap-2 border border-line rounded-md pr-3 hover:border-ink"><InvestorLogo investor={lead} size={22} rounded={4} /><span className="text-[12px]">{lead.name}</span><span className="tag tag-navy ml-1">Lead</span></Link>}
              {(r.investorSlugs || []).filter(x => x !== r.leadInvestorSlug).map(is => {
                const inv = (investors || []).find((item)=>item.slug===is);
                return inv && <Link key={is} to={`/investors/${inv.slug}`} className="inline-flex items-center gap-2 border border-line rounded-md pr-3 hover:border-ink"><InvestorLogo investor={inv} size={22} rounded={4} /><span className="text-[12px]">{inv.name}</span></Link>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FoundersPanel({ founders }) {
  if (!founders.length) return <EmptyState title="No founders listed" />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {founders.map(f => (
        <Link key={f.slug} to={`/founders/${f.slug}`} className="flex items-center gap-4 border border-line rounded-md p-4 hover:border-ink">
          <img src={f.photo} alt={f.name} className="w-14 h-14 rounded-md object-cover" loading="lazy" />
          <div className="flex-1"><div className="font-display font-medium">{f.name}</div><div className="text-[12px] text-slate2">{f.role} · <CountryLabel country={f.country} explicitFlag={f.flag} /></div><div className="text-[12px] text-slate2 mt-1 line-clamp-2">{f.bio}</div></div>
          <ArrowUpRight className="w-4 h-4 text-slate2" />
        </Link>
      ))}
    </div>
  );
}

function ProductsPanel({ startup: s }) {
  const products = Array.isArray(s.products) && s.products.length
    ? s.products
    : (s.productImages || []).map((image,index)=>({ id:`legacy-${index}`, title:`Product ${index+1}`, description:'', image, url:'' }));
  if (!products.length) return <EmptyState title="No products added" description="This company has not published product information yet." />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {products.map((product,index)=><article key={product.id || index} className="border border-line bg-white rounded-xl overflow-hidden">
        {product.image && <img src={product.image} alt={product.title || ''} className="w-full h-56 object-cover bg-canvas" loading="lazy" />}
        <div className="p-5">
          <div className="font-display text-[20px]">{product.title || `Product ${index+1}`}</div>
          {product.description && <p className="text-[13px] text-slate2 leading-relaxed mt-2">{product.description}</p>}
          {product.url && <a href={product.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-coral mt-4">View product <ArrowUpRight className="w-3.5 h-3.5"/></a>}
        </div>
      </article>)}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Bookmark, CalendarDays, Download, Flame, Globe, MessageCircle, Play, ShieldCheck } from 'lucide-react';
import { STARTUPS, getStartupBySlug, getPitchByStartupSlug, getRoundsByStartup, getFoundersByStartup, getSimilarStartups, getInvestorBySlug, formatDate, formatMoney } from '@/data/mockData';
import { StartupLogo, InvestorLogo } from '@/components/common/Logo';
import SaveButton from '@/components/common/SaveButton';
import { EmptyState } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';
import { useSaved } from '@/context/SavedContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const TABS = [
  { id:'overview', label:'Overview' },
  { id:'pitch', label:'Investment Pitch' },
  { id:'rounds', label:'Funding Rounds' },
  { id:'founders', label:'Founders' },
  { id:'products', label:'Products' },
  { id:'similar', label:'Similar' },
];

export default function StartupDetail() {
  const { slug } = useParams();
  const s = getStartupBySlug(slug);
  const [tab, setTab] = useState('overview');
  const { toast } = useToast();
  const { toggle, isSaved } = useSaved();
  const { addMessage, addItem, data } = useData();
  const { currentUser } = useAuth();
  useEffect(() => {
    if (window.location.hash === '#pitch') setTab('pitch');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);
  if (!s) return <Navigate to="/startups" replace />;
  const pitch = getPitchByStartupSlug(s.slug);
  const rounds = getRoundsByStartup(s.slug);
  const founders = getFoundersByStartup(s.slug);
  const similar = getSimilarStartups(s);
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
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="p-1 bg-canvas rounded-md w-fit">
            <StartupLogo startup={s} size={88} rounded={12} />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="mono text-[11px] text-slate3 uppercase tracking-widest">{s.category} · {s.flag} {s.country}</div>
            <h1 className="display-h text-[36px] md:text-[52px] leading-[1.02] mt-2">{s.name}</h1>
            <p className="text-[15px] text-slate2 mt-2 max-w-2xl">{s.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={s.website} className="btn btn-navy btn-sm" data-testid="startup-website"><Globe className="w-3.5 h-3.5" /> Website</a>
            <button className="btn btn-outline btn-sm" onClick={() => { addMessage({ name:currentUser?.name||'Website visitor', email:currentUser?.email||'visitor@example.com', topic:'Founder contact', message:`Contact request for ${s.name}.` }); toast('Contact request sent to the admin inbox.', { type: 'success' }); }} data-testid="contact-founder-btn"><MessageCircle className="w-3.5 h-3.5" /> Contact</button>
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
            {tab === 'pitch' && <PitchPanel startup={s} pitch={pitch} />}
            {tab === 'rounds' && <RoundsTimeline rounds={rounds} />}
            {tab === 'founders' && <FoundersPanel founders={founders} />}
            {tab === 'products' && <ProductsPanel startup={s} />}
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
    </div>
  );
}

function DataRow({ k, v }) { return <li className="flex items-center justify-between border-b border-line/60 last:border-none pb-2 last:pb-0"><span className="text-slate2 text-[12.5px]">{k}</span><span className="text-ink">{v}</span></li>; }

function Overview({ startup: s }) {
  return (
    <>
      <section>
        <div className="eyebrow">About</div>
        <h2 className="font-display text-[26px] mt-2">What {s.name} does</h2>
        <p className="text-[15px] text-ink/85 leading-relaxed mt-3 max-w-2xl">{s.description}</p>
      </section>
      {s.productImages?.[0] && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {s.productImages.map((src, i) => <img key={i} src={src} alt="" className="w-full h-56 object-cover rounded-md border border-line" loading="lazy" />)}
        </div>
      )}
    </>
  );
}

function PitchPanel({ startup: s, pitch }) {
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
          <button onClick={() => sendRequest('Founder contact', `Investor contact request for ${s.name}.`)} className="btn btn-outline-white" data-testid="contact-founder-pitch"><MessageCircle className="w-3.5 h-3.5" /> Contact founder</button>
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

function RoundsTimeline({ rounds }) {
  if (!rounds.length) return <EmptyState title="No rounds" description="No funding rounds have been recorded yet." icon={CalendarDays} />;
  return (
    <div className="relative pl-6 border-l border-line">
      {rounds.map((r, i) => {
        const lead = getInvestorBySlug(r.leadInvestorSlug);
        return (
          <div key={r.id} className="relative mb-8 last:mb-0">
            <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-coral border-2 border-canvas" />
            <div className="mono text-[11px] text-slate2 uppercase tracking-widest">{formatDate(r.date)}</div>
            <div className="font-display text-[20px] mt-1">{r.roundName} · <span className="mono">{formatMoney(r.amount)}</span></div>
            <div className="text-[12.5px] text-slate2 mt-1">Valuation <span className="mono">{formatMoney(r.valuation)}</span></div>
            <p className="text-[13px] text-ink/85 mt-2 max-w-xl">{r.notes}</p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {lead && <Link to={`/investors/${lead.slug}`} className="inline-flex items-center gap-2 border border-line rounded-md pr-3 hover:border-ink"><InvestorLogo investor={lead} size={22} rounded={4} /><span className="text-[12px]">{lead.name}</span><span className="tag tag-navy ml-1">Lead</span></Link>}
              {r.investorSlugs.filter(x => x !== r.leadInvestorSlug).map(is => {
                const inv = getInvestorBySlug(is);
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
          <div className="flex-1"><div className="font-display font-medium">{f.name}</div><div className="text-[12px] text-slate2">{f.role} · {f.country}</div><div className="text-[12px] text-slate2 mt-1 line-clamp-2">{f.bio}</div></div>
          <ArrowUpRight className="w-4 h-4 text-slate2" />
        </Link>
      ))}
    </div>
  );
}

function ProductsPanel({ startup: s }) {
  return (
    <div>
      <div className="eyebrow mb-3">Product previews</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(s.productImages || []).map((src, i) => <img key={i} src={src} alt="" className="w-full h-64 object-cover rounded-md border border-line" loading="lazy" />)}
      </div>
    </div>
  );
}

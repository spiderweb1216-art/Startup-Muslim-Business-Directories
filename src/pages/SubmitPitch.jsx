import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SectionHeading } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';
import { useData, slugify } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function SubmitPitch() {
  const [d, setD] = useState({
    startup:'', startupSlug:'', founder:'', email:'', website:'', problem:'', solution:'', market:'', model:'', traction:'',
    revenue:'', amount:'', equity:'', valuation:'', minTicket:'', use:'', previous:'', previousInvestors:'',
    deck:'', demo:'', visibility:'Private', consent:false,
  });
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const { submitPitch, data: cmsData } = useData();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const approvedClaimSlugs = useMemo(() => new Set(cmsData.claims.filter((claim)=>claim.ownerId===currentUser?.id&&claim.status==='Approved').map((claim)=>claim.startupSlug)), [cmsData.claims,currentUser]);
  const ownedStartups = useMemo(() => cmsData.startups.filter((startup)=>startup.ownerId===currentUser?.id||approvedClaimSlugs.has(startup.slug)), [cmsData.startups,currentUser,approvedClaimSlugs]);
  const requestedStartup = searchParams.get('startup') || '';
  useEffect(() => {
    const preferred = ownedStartups.find((startup)=>startup.slug===requestedStartup) || (ownedStartups.length===1 ? ownedStartups[0] : null);
    setD((current)=>({
      ...current,
      founder:current.founder || currentUser?.name || '',
      email:current.email || currentUser?.email || '',
      ...(preferred ? { startup:preferred.name, startupSlug:preferred.slug, website:current.website || preferred.website || '' } : {}),
    }));
  }, [currentUser,ownedStartups,requestedStartup]);
  const upd = (k, v) => setD(x => ({ ...x, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!d.startup || !d.founder || !d.email || !d.problem || !d.solution || !d.amount || !d.consent) return toast('Please fill required fields and confirm consent.', { type: 'warning' });
    try {
      const created = submitPitch({
        startupName:d.startup, startupSlug:d.startupSlug || slugify(d.startup), pitchTitle:`${d.startup} investment pitch`,
        problem:d.problem, solution:d.solution, market:d.market, businessModel:d.model, traction:d.traction,
        requested:d.amount, equity:d.equity, valuation:d.valuation, minTicket:d.minTicket, useOfFunds:d.use,
        visibility:d.visibility, summary:`Submitted by ${d.founder}. ${d.revenue || ''}`, deck:d.deck, demo:d.demo, previousFunding:d.previous, previousInvestors:d.previousInvestors,
        founderName:d.founder, contactEmail:d.email, website:d.website
      }, currentUser);
      if (created.savePromise) await created.savePromise;
      setDone(true); toast('Your pitch has been submitted privately and added to the admin review queue.', { type: 'success' });
    } catch (error) {
      toast(error.message || 'The pitch could not be submitted.', { type:'warning' });
    }
  };

  if (!cmsData.settings.submissionsEnabled) {
    return <div className="wrap pt-20 pb-24 text-center max-w-xl mx-auto"><div className="w-14 h-14 rounded-full bg-amberSoft text-amber mx-auto flex items-center justify-center"><Lock className="w-7 h-7" /></div><h1 className="font-display text-[36px] mt-6">Submissions are paused</h1><p className="text-slate2 mt-3">The administrator has temporarily disabled new startup and pitch submissions.</p></div>;
  }

  if (done) {
    return (
      <div className="wrap pt-20 pb-24 text-center max-w-xl mx-auto" data-testid="submit-pitch-success">
        <div className="w-14 h-14 rounded-full bg-emeraldSoft text-emerald mx-auto flex items-center justify-center"><CheckCircle2 className="w-7 h-7" /></div>
        <h1 className="font-display text-[36px] mt-6">Pitch submitted</h1>
        <p className="text-slate2 mt-3">Your pitch has been submitted privately for review. We’ll follow up by email.</p>
      </div>
    );
  }

  return (
    <div className="wrap pt-10 pb-24" data-testid="submit-pitch-page">
      <SectionHeading eyebrow="Submit" title="Share your investment pitch." subtitle="Private by default. Our team reviews every submission before sharing with the ecosystem." />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={submit} className="lg:col-span-2 border border-line bg-white rounded-2xl p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Startup name *">{ownedStartups.length>0?<select required value={d.startupSlug} onChange={e=>{const selected=ownedStartups.find((startup)=>startup.slug===e.target.value);setD((current)=>({...current,startupSlug:selected?.slug||'',startup:selected?.name||'',website:current.website||selected?.website||''}));}} className={inp} data-testid="pitch-startup"><option value="">Select an owned startup</option>{ownedStartups.map((startup)=><option key={startup.slug} value={startup.slug}>{startup.name}</option>)}</select>:<input required value={d.startup} onChange={e=>setD((current)=>({...current,startup:e.target.value,startupSlug:slugify(e.target.value)}))} className={inp} data-testid="pitch-startup" />}</F>
            <F label="Founder name *"><input required value={d.founder} onChange={e=>upd('founder', e.target.value)} className={inp} data-testid="pitch-founder" /></F>
            <F label="Email *"><input required type="email" value={d.email} onChange={e=>upd('email', e.target.value)} className={inp} data-testid="pitch-email" /></F>
            <F label="Website"><input value={d.website} onChange={e=>upd('website', e.target.value)} className={inp} /></F>
            <F label="Problem *" span2><textarea required value={d.problem} onChange={e=>upd('problem', e.target.value)} className={`${inp} min-h-[100px]`} data-testid="pitch-problem" /></F>
            <F label="Solution *" span2><textarea required value={d.solution} onChange={e=>upd('solution', e.target.value)} className={`${inp} min-h-[100px]`} data-testid="pitch-solution" /></F>
            <F label="Target market"><input value={d.market} onChange={e=>upd('market', e.target.value)} className={inp} /></F>
            <F label="Business model"><input value={d.model} onChange={e=>upd('model', e.target.value)} className={inp} /></F>
            <F label="Traction"><input value={d.traction} onChange={e=>upd('traction', e.target.value)} className={inp} /></F>
            <F label="Revenue stage"><input value={d.revenue} onChange={e=>upd('revenue', e.target.value)} className={inp} /></F>
            <F label="Funding needed (USD) *"><input required type="number" value={d.amount} onChange={e=>upd('amount', e.target.value)} className={inp} data-testid="pitch-amount" /></F>
            <F label="Equity offered (%)"><input value={d.equity} onChange={e=>upd('equity', e.target.value)} className={inp} /></F>
            <F label="Valuation"><input value={d.valuation} onChange={e=>upd('valuation', e.target.value)} className={inp} /></F>
            <F label="Minimum ticket"><input value={d.minTicket} onChange={e=>upd('minTicket', e.target.value)} className={inp} /></F>
            <F label="Use of funds" span2><textarea value={d.use} onChange={e=>upd('use', e.target.value)} className={`${inp} min-h-[80px]`} /></F>
            <F label="Previous funding"><input value={d.previous} onChange={e=>upd('previous', e.target.value)} className={inp} /></F>
            <F label="Previous investors"><input value={d.previousInvestors} onChange={e=>upd('previousInvestors', e.target.value)} className={inp} /></F>
            <F label="Pitch deck (URL)"><input value={d.deck} onChange={e=>upd('deck', e.target.value)} className={inp} /></F>
            <F label="Demo link"><input value={d.demo} onChange={e=>upd('demo', e.target.value)} className={inp} /></F>
            <F label="Visibility">
              <select value={d.visibility} onChange={e=>upd('visibility', e.target.value)} className={inp}><option>Private</option><option>Public</option></select>
            </F>
          </div>
          <label className="flex items-start gap-2 text-[13.5px]">
            <input type="checkbox" checked={d.consent} onChange={e=>upd('consent', e.target.checked)} className="w-4 h-4 mt-0.5 accent-brand" data-testid="pitch-consent" />
            <span>I confirm the information is accurate and consent to sharing this with Startup Muslim for review.</span>
          </label>
          <button className="btn btn-coral w-full justify-center" data-testid="pitch-submit"><Send className="w-4 h-4" /> Submit privately</button>
        </form>
        <aside className="space-y-4">
          <div className="border border-line bg-canvas/60 rounded-2xl p-5">
            <div className="eyebrow flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Privacy</div>
            <p className="text-[13.5px] text-ink/85 mt-2 leading-relaxed">Your pitch is private by default. Nothing is published without your consent. We share only with reviewers.</p>
          </div>
          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Review process</div>
            <p className="text-[13.5px] text-ink/85 mt-2 leading-relaxed">A member of the Startup Muslim team reviews each pitch within 5 business days.</p>
          </div>
          <div className="border border-line bg-white rounded-2xl p-5 text-[12.5px] text-slate2 leading-relaxed">
            Not investment advice, endorsement, or Shariah certification. Users should verify all information independently.
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = 'w-full bg-white border border-line rounded-xl p-3 text-[14px] outline-none focus:border-ink transition-colors';
function F({ label, children, span2 }) {
  return <div className={span2 ? 'md:col-span-2' : ''}><label className="text-[12.5px] text-slate2">{label}</label><div className="mt-1">{children}</div></div>;
}

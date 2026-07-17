import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Rocket } from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '@/data/mockData';
import { SectionHeading } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const DRAFT_KEY = 'sm_startup_draft_v1';

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Company Details' },
  { id: 3, title: 'Founder Details' },
  { id: 4, title: 'Funding & Traction' },
  { id: 5, title: 'Media & Links' },
  { id: 6, title: 'Review & Submit' },
];

const empty = {
  name:'', tagline:'', category:'', country:'', website:'',
  stage:'Pre-Seed', model:'', foundedYear:'', teamSize:'', hq:'', description:'',
  founderName:'', founderRole:'', founderEmail:'',
  raised:'', revenue:'', users:'', growth:'',
  logoUrl:'', bannerUrl:'',
  consent:false,
};

export default function SubmitStartup() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(empty);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const { submitStartup, data: cmsData } = useData();
  const { currentUser } = useAuth();

  useEffect(() => { try { const r = localStorage.getItem(DRAFT_KEY); if (r) setData(JSON.parse(r)); } catch{} }, []);
  useEffect(() => { if(currentUser)setData((current)=>({...current,founderName:current.founderName||currentUser.name||'',founderEmail:current.founderEmail||currentUser.email||''})); }, [currentUser]);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch{} }, [data]);

  const upd = (k, v) => setData(d => ({ ...d, [k]: v }));

  const validateStep = () => {
    const e = {};
    if (step === 1) { ['name','tagline','category','country'].forEach(k => { if (!data[k]) e[k] = 'Required'; }); }
    if (step === 2) { ['stage','model'].forEach(k => { if (!data[k]) e[k] = 'Required'; }); }
    if (step === 3) { if (!data.founderName) e.founderName = 'Required'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.founderEmail)) e.founderEmail = 'Enter a valid email'; }
    if (step === 6 && !data.consent) e.consent = 'Please confirm';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(6, s+1)); };
  const prev = () => setStep(s => Math.max(1, s-1));

  const submit = async () => {
    if (!validateStep()) return;
    try {
      const created=submitStartup(data,currentUser);
      if(created.savePromise)await created.savePromise;
      setDone(true);
      try { localStorage.removeItem(DRAFT_KEY); } catch{}
      toast('Startup submitted for review and added to the admin dashboard.', { type:'success' });
    } catch(error) {
      toast(error.message||'The startup could not be submitted.', { type:'warning' });
    }
  };

  const progress = ((step-1) / (STEPS.length-1)) * 100;

  if (!cmsData.settings.submissionsEnabled) {
    return <div className="wrap pt-20 pb-24 text-center max-w-xl mx-auto"><div className="w-14 h-14 rounded-full bg-amberSoft text-amber mx-auto flex items-center justify-center"><Rocket className="w-7 h-7" /></div><h1 className="font-display text-[36px] mt-6">Submissions are paused</h1><p className="text-slate2 mt-3">The administrator has temporarily disabled new startup and pitch submissions.</p><Link to="/" className="btn btn-outline mt-6">Return home</Link></div>;
  }

  if (done) {
    return (
      <div className="wrap pt-20 pb-24 text-center max-w-xl mx-auto" data-testid="submit-startup-success">
        <div className="w-14 h-14 rounded-full bg-emeraldSoft text-emerald mx-auto flex items-center justify-center"><CheckCircle2 className="w-7 h-7" /></div>
        <h1 className="font-display text-[36px] mt-6">Submitted for review</h1>
        <p className="text-slate2 mt-3">Your startup has been submitted for review. The Startup Muslim team will review it before publishing.</p>
        <div className="mt-6 flex items-center gap-3 justify-center">
          <Link to="/directory" className="btn btn-outline">Explore directory</Link>
          <button onClick={() => { setDone(false); setStep(1); setData(empty); }} className="btn btn-coral">Submit another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap pt-10 pb-24" data-testid="submit-startup-page">
      <SectionHeading eyebrow="Submit" title="Submit your startup." subtitle="Add your company to the Startup Muslim ecosystem. All submissions are reviewed before publishing." />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Progress</div>
            <div className="mt-3 h-1.5 bg-canvas rounded-full overflow-hidden"><div className="h-full bg-coral transition-all" style={{ width:`${progress}%` }} /></div>
            <ol className="mt-4 space-y-2">
              {STEPS.map(s => (
                <li key={s.id} className={`flex items-center gap-2 text-[13.5px] ${step === s.id ? 'text-ink font-medium' : 'text-slate2'}`}>
                  <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center border ${step > s.id ? 'bg-coral text-white border-coral' : step === s.id ? 'bg-ink text-white border-ink' : 'border-line'}`}>{step > s.id ? '✓' : s.id}</span>
                  {s.title}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="border border-line bg-white rounded-2xl p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                <div className="eyebrow">Step {step} of {STEPS.length}</div>
                <h2 className="font-display text-[28px] mt-1">{STEPS[step-1].title}</h2>

                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Field label="Startup name" required error={errors.name}><input value={data.name} onChange={e=>upd('name', e.target.value)} className={inp} placeholder="e.g. HalalPay" data-testid="submit-name" /></Field>
                    <Field label="Website"><input value={data.website} onChange={e=>upd('website', e.target.value)} className={inp} placeholder="https://" /></Field>
                    <Field label="Tagline" required error={errors.tagline} span2><input value={data.tagline} onChange={e=>upd('tagline', e.target.value)} className={inp} placeholder="One sentence that says what you do" data-testid="submit-tagline" /></Field>
                    <Field label="Category" required error={errors.category}>
                      <select value={data.category} onChange={e=>upd('category', e.target.value)} className={inp} data-testid="submit-category"><option value="">Select category</option>{CATEGORIES.map(c => <option key={c.slug}>{c.name}</option>)}</select>
                    </Field>
                    <Field label="Country" required error={errors.country}>
                      <select value={data.country} onChange={e=>upd('country', e.target.value)} className={inp} data-testid="submit-country"><option value="">Select country</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select>
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Field label="Stage" required error={errors.stage}>
                      <select value={data.stage} onChange={e=>upd('stage', e.target.value)} className={inp}>{['Pre-Seed','Seed','Series A','Series B','Series C+'].map(s=> <option key={s}>{s}</option>)}</select>
                    </Field>
                    <Field label="Business model" required error={errors.model}>
                      <select value={data.model} onChange={e=>upd('model', e.target.value)} className={inp}><option value="">Select</option>{['B2C','B2B SaaS','B2B Marketplace','D2C','Marketplace','B2B2C','B2C Subscription'].map(s=> <option key={s}>{s}</option>)}</select>
                    </Field>
                    <Field label="Founded year"><input type="number" value={data.foundedYear} onChange={e=>upd('foundedYear', e.target.value)} className={inp} placeholder="2024" /></Field>
                    <Field label="Team size"><input type="number" value={data.teamSize} onChange={e=>upd('teamSize', e.target.value)} className={inp} placeholder="5" /></Field>
                    <Field label="Headquarters" span2><input value={data.hq} onChange={e=>upd('hq', e.target.value)} className={inp} placeholder="City, Country" /></Field>
                    <Field label="Description" span2><textarea value={data.description} onChange={e=>upd('description', e.target.value)} className={`${inp} min-h-[120px]`} placeholder="Tell us about your company (3–5 sentences)" /></Field>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Field label="Founder name" required error={errors.founderName}><input value={data.founderName} onChange={e=>upd('founderName', e.target.value)} className={inp} placeholder="Your full name" data-testid="submit-founder-name" /></Field>
                    <Field label="Role"><input value={data.founderRole} onChange={e=>upd('founderRole', e.target.value)} className={inp} placeholder="Co-founder & CEO" /></Field>
                    <Field label="Email" required error={errors.founderEmail} span2><input value={data.founderEmail} onChange={e=>upd('founderEmail', e.target.value)} className={inp} placeholder="you@company.com" data-testid="submit-founder-email" /></Field>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Field label="Total raised (USD)"><input value={data.raised} onChange={e=>upd('raised', e.target.value)} className={inp} placeholder="500000" /></Field>
                    <Field label="Revenue"><input value={data.revenue} onChange={e=>upd('revenue', e.target.value)} className={inp} placeholder="e.g. $200K ARR" /></Field>
                    <Field label="Users / customers"><input value={data.users} onChange={e=>upd('users', e.target.value)} className={inp} placeholder="e.g. 5,000 users" /></Field>
                    <Field label="Growth"><input value={data.growth} onChange={e=>upd('growth', e.target.value)} className={inp} placeholder="e.g. +12% MoM" /></Field>
                  </div>
                )}

                {step === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Upload label="Logo" value={data.logoUrl} onChange={v => upd('logoUrl', v)} testid="submit-logo" />
                    <Upload label="Banner image" value={data.bannerUrl} onChange={v => upd('bannerUrl', v)} testid="submit-banner" />
                  </div>
                )}

                {step === 6 && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-canvas/40 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px]">
                        <ReviewRow label="Name" value={data.name} />
                        <ReviewRow label="Tagline" value={data.tagline} />
                        <ReviewRow label="Category" value={data.category} />
                        <ReviewRow label="Country" value={data.country} />
                        <ReviewRow label="Stage" value={data.stage} />
                        <ReviewRow label="Model" value={data.model} />
                        <ReviewRow label="Founder" value={data.founderName} />
                        <ReviewRow label="Email" value={data.founderEmail} />
                      </div>
                    </div>
                    <label className="flex items-start gap-2 text-[13.5px]">
                      <input type="checkbox" checked={data.consent} onChange={e=>upd('consent', e.target.checked)} className="w-4 h-4 mt-0.5 accent-brand" data-testid="submit-consent" />
                      <span>I confirm the information is accurate and I have permission to submit this listing.</span>
                    </label>
                    {errors.consent && <div className="text-coral text-[12.5px]">{errors.consent}</div>}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={prev} disabled={step === 1} className="btn btn-outline disabled:opacity-40" data-testid="submit-back"><ArrowLeft className="w-4 h-4" /> Back</button>
                  {step < 6 ? (
                    <button onClick={next} className="btn btn-coral" data-testid="submit-next">Continue <ArrowRight className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={submit} className="btn btn-coral" data-testid="submit-final"><Rocket className="w-4 h-4" /> Submit for review</button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full bg-white border border-line rounded-xl p-3 text-[14px] outline-none focus:border-ink transition-colors';

function Field({ label, required, error, children, span2 }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="text-[12.5px] text-slate2">{label}{required && <span className="text-coral"> *</span>}</label>
      <div className="mt-1">{children}</div>
      {error && <div className="text-coral text-[12px] mt-1">{error}</div>}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return <div><div className="eyebrow">{label}</div><div className="text-ink mt-0.5">{value || <span className="text-slate2">—</span>}</div></div>;
}

function Upload({ label, value, onChange, testid }) {
  return (
    <div>
      <label className="text-[12.5px] text-slate2">{label}</label>
      <div className="mt-1 border-2 border-dashed border-line rounded-xl p-5 flex items-center gap-3 bg-canvas/30">
        <div className="w-12 h-12 rounded-xl bg-white border border-line flex items-center justify-center overflow-hidden">
          {value ? <img src={value} alt="preview" className="w-full h-full object-cover" /> : <ImagePlus className="w-5 h-5 text-slate2" />}
        </div>
        <div className="flex-1">
          <input value={value} onChange={e=>onChange(e.target.value)} placeholder="Paste an image URL or upload below" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate2" data-testid={testid} />
          <div className="mt-2 flex items-center gap-2"><label className="inline-flex cursor-pointer items-center rounded-md border border-line bg-white px-3 py-2 text-[11.5px] hover:border-ink"><input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>onChange(reader.result);reader.readAsDataURL(file);}} />Choose image</label><span className="text-[11px] text-slate2">PNG, JPG, or WebP. Stored locally in this browser.</span></div>
        </div>
      </div>
    </div>
  );
}

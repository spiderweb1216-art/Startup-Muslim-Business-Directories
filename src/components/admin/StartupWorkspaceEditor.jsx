import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, Building2, CircleDollarSign, FileText, ImagePlus,
  Layers3, Package, Plus, Save, Search, Trash2, UserRound, X,
} from 'lucide-react';
import OverviewBlockEditor from '@/components/common/OverviewBlockEditor';
import { getOverviewBlocks, normalizeOverviewBlocks, overviewSummary } from '@/lib/overviewBlocks';
import { slugify } from '@/context/DataContext';

const INPUT = 'w-full bg-white border border-line rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-ink';
const TODAY = () => new Date().toISOString().slice(0,10);
const clone = (value) => JSON.parse(JSON.stringify(value));
const tempId = (prefix) => `tmp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const list = (value) => Array.isArray(value) ? value : [];

const TABS = [
  ['profile','Company info',Building2],
  ['overview','Overview',Layers3],
  ['pitch','Investment Pitch',FileText],
  ['rounds','Funding Rounds',CircleDollarSign],
  ['founders','Founders',UserRound],
  ['products','Products',Package],
  ['similar','Similar',Search],
];

const blankPitch = () => ({
  id:'', pitchTitle:'', summary:'', problem:'', solution:'', market:'', businessModel:'', traction:'', useOfFunds:'',
  requested:0, equity:0, valuation:0, minTicket:0, status:'Active', reviewStatus:'Approved', visibility:'Public', featured:false,
});

function normalizeProducts(startup={}) {
  if (Array.isArray(startup.products) && startup.products.length) return startup.products.map((p,i)=>({id:p.id||`product-${i+1}`,...p}));
  return list(startup.productImages).map((image,i)=>({id:`legacy-product-${i+1}`,title:`Product ${i+1}`,description:'',image,url:''}));
}

function makeForm(initial={}) {
  return {
    name:initial.name||'', slug:initial.slug||'', tagline:initial.tagline||'', category:initial.category||'', country:initial.country||'', flag:initial.flag||'',
    stage:initial.stage||'Pre-Seed', fundingStage:initial.fundingStage||initial.stage||'Pre-Seed', businessModel:initial.businessModel||'', status:initial.status||'Published',
    verified:Boolean(initial.verified), featured:Boolean(initial.featured), openToFunding:Boolean(initial.openToFunding), hiring:Boolean(initial.hiring), pitching:Boolean(initial.pitching),
    totalRaised:Number(initial.totalRaised||0), foundedYear:initial.foundedYear||'', teamSize:initial.teamSize||'', hq:initial.hq||'', revenue:initial.revenue||'', users:initial.users||'', growth:initial.growth||'',
    website:initial.website||'', banner:initial.banner||'', ownerId:initial.ownerId||'', addedAt:initial.addedAt||TODAY(), views:Number(initial.views||0),
    contact:{
      public:initial.contact?.public !== false,
      name:initial.contact?.name||initial.contactName||(initial.name ? `${initial.name} Team` : ''),
      role:initial.contact?.role||initial.contactRole||(initial.name ? 'Company enquiries' : ''),
      email:initial.contact?.email||initial.contactEmail||'',
      phone:initial.contact?.phone||initial.contactPhone||'',
      whatsapp:initial.contact?.whatsapp||initial.contactWhatsapp||'',
      address:initial.contact?.address||initial.contactAddress||initial.hq||initial.country||'',
      linkedin:initial.contact?.linkedin||initial.contactLinkedin||'',
      note:initial.contact?.note||initial.contactNote||'',
    },
    logo:{mark:initial.logo?.mark||String(initial.name||'SM').slice(0,2).toUpperCase(),color:initial.logo?.color||'#3B82F6'},
    overviewBlocks:getOverviewBlocks(initial), products:normalizeProducts(initial), similarSlugs:list(initial.similarSlugs),
  };
}

export default function StartupWorkspaceEditor({ initial, data, onClose, onSave, saving=false, memberMode=false }) {
  const isEdit = Boolean(initial?.slug);
  const [tab,setTab] = useState('profile');
  const [form,setForm] = useState(()=>makeForm(initial||{}));
  const relatedPitches = useMemo(()=>list(data.pitches).filter((x)=>x.startupSlug===initial?.slug),[data.pitches,initial?.slug]);
  const initialPitch = relatedPitches.find((x)=>x.status==='Active') || relatedPitches[0] || null;
  const [pitchEnabled,setPitchEnabled] = useState(Boolean(initialPitch));
  const [pitch,setPitch] = useState(()=>initialPitch ? clone(initialPitch) : blankPitch());
  const [rounds,setRounds] = useState(()=>list(data.rounds).filter((x)=>x.startupSlug===initial?.slug).map(clone));
  const [founders,setFounders] = useState(()=>{
    const linked = list(data.founders).filter((x)=>x.startupSlug===initial?.slug || list(initial?.founderSlugs).includes(x.slug));
    return linked.map(clone);
  });
  const [error,setError] = useState('');

  const set = (key,value)=>setForm((prev)=>({...prev,[key]:value}));
  const setLogo = (key,value)=>setForm((prev)=>({...prev,logo:{...(prev.logo||{}),[key]:value}}));
  const setContact = (key,value)=>setForm((prev)=>({...prev,contact:{...(prev.contact||{}),[key]:value}}));

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.name.trim()) return setError('Company name is required.');
    const slug = (form.slug || slugify(form.name)).trim();
    if (!slug) return setError('A valid URL slug is required.');
    setError('');
    const overviewBlocks = normalizeOverviewBlocks(form.overviewBlocks);
    const products = list(form.products).filter((p)=>p.title?.trim() || p.image?.trim() || p.description?.trim()).map((p,i)=>({ ...p, id:p.id||`product-${i+1}` }));
    const normalizedContact = {
      ...(form.contact || {}),
      public: form.contact?.public !== false,
      name: String(form.contact?.name || '').trim() || `${form.name.trim()} Team`,
      role: String(form.contact?.role || '').trim() || 'Company enquiries',
      email: String(form.contact?.email || '').trim(),
      phone: String(form.contact?.phone || '').trim(),
      whatsapp: String(form.contact?.whatsapp || '').trim(),
      address: String(form.contact?.address || '').trim() || String(form.hq || form.country || '').trim(),
      linkedin: String(form.contact?.linkedin || '').trim(),
      note: String(form.contact?.note || '').trim(),
    };
    const startup = {
      ...form,
      contact: normalizedContact,
      slug,
      overviewBlocks,
      description:overviewSummary(overviewBlocks, form.tagline || ''),
      products,
      productImages:products.map((p)=>p.image).filter(Boolean),
      similarSlugs:list(form.similarSlugs).filter((s)=>s && s!==slug),
      founderSlugs:founders.map((f)=>f.slug || slugify(f.name)).filter(Boolean),
      pitching:Boolean(pitchEnabled && pitch.status==='Active' && pitch.reviewStatus==='Approved' && pitch.visibility==='Public'),
    };
    await onSave({ startup, pitch: pitchEnabled ? pitch : null, pitchEnabled, rounds, founders, originalSlug:initial?.slug || '' });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-5" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(e)=>e.stopPropagation()} className="bg-[#F7F4EE] w-full max-w-[1500px] h-[96vh] md:h-[94vh] md:rounded-2xl border border-line overflow-hidden flex flex-col shadow-2xl">
        <header className="bg-white border-b border-line px-4 md:px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-coralSoft text-coral flex items-center justify-center"><Building2 className="w-4 h-4"/></div>
          <div className="min-w-0 flex-1">
            <div className="eyebrow">{isEdit?'Edit company':memberMode?'Submit company for review':'Add company'}</div>
            <div className="font-display text-[21px] truncate mt-0.5">{form.name || 'Untitled company'}</div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate2"><span className="w-2 h-2 rounded-full bg-emerald"/> {memberMode ? 'Your company workspace' : 'MySQL-backed company workspace'}</div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg border border-line flex items-center justify-center"><X className="w-4 h-4"/></button>
        </header>

        <div className="bg-white border-b border-line px-3 md:px-6 flex items-center gap-1 overflow-x-auto thin-scroll">
          {TABS.map(([id,label,Icon])=><button key={id} type="button" onClick={()=>setTab(id)} className={`min-h-12 px-3 md:px-4 inline-flex items-center gap-2 text-[12px] whitespace-nowrap border-b-2 -mb-px ${tab===id?'border-coral text-ink font-medium':'border-transparent text-slate2 hover:text-ink'}`}><Icon className="w-3.5 h-3.5"/>{label}{id==='rounds'&&rounds.length>0?<span className="tag">{rounds.length}</span>:id==='founders'&&founders.length>0?<span className="tag">{founders.length}</span>:id==='products'&&form.products.length>0?<span className="tag">{form.products.length}</span>:null}</button>)}
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll p-4 md:p-6">
          {tab==='profile' && <ProfileTab form={form} set={set} setLogo={setLogo} setContact={setContact} data={data} isEdit={isEdit} memberMode={memberMode} />}
          {tab==='overview' && <OverviewBlockEditor value={form.overviewBlocks} onChange={(value)=>set('overviewBlocks',value)} />}
          {tab==='pitch' && <PitchTab enabled={pitchEnabled} setEnabled={setPitchEnabled} pitch={pitch} setPitch={setPitch} memberMode={memberMode} />}
          {tab==='rounds' && <RoundsTab rounds={rounds} setRounds={setRounds} investors={data.investors||[]} memberMode={memberMode} />}
          {tab==='founders' && <FoundersTab founders={founders} setFounders={setFounders} startupSlug={form.slug || slugify(form.name)} memberMode={memberMode} />}
          {tab==='products' && <ProductsTab products={form.products} setProducts={(products)=>set('products',products)} />}
          {tab==='similar' && <SimilarTab selected={form.similarSlugs} onChange={(v)=>set('similarSlugs',v)} startups={data.startups||[]} currentSlug={initial?.slug || form.slug} />}
          {error && <div className="mt-4 p-3 rounded-xl bg-coralSoft text-coral text-[12px]">{error}</div>}
        </div>

        <footer className="bg-white border-t border-line px-4 md:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="text-[10.5px] text-slate2 hidden sm:block">{memberMode && !isEdit ? 'Your submission becomes public after admin approval.' : 'All public company tabs are controlled from this editor.'}</div>
          <div className="flex gap-2 ml-auto"><button type="button" onClick={onClose} className="btn btn-outline">Cancel</button><button disabled={saving} className="btn btn-coral disabled:opacity-50"><Save className="w-4 h-4"/>{saving?'Saving everything…':memberMode&&!isEdit?'Submit for review':isEdit?'Save company':'Create company'}</button></div>
        </footer>
      </form>
    </div>
  );
}

function ProfileTab({ form, set, setLogo, setContact, data, isEdit, memberMode }) {
  return <div className="max-w-6xl mx-auto space-y-5">
    <Panel title="Identity & publishing" text="Core information shown in the company hero, cards, filters, and company data panel.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Company name" required><input value={form.name} onChange={(e)=>{set('name',e.target.value); if(!form.slug)set('slug',slugify(e.target.value));}} className={INPUT}/></Field>
        <Field label="URL slug"><input value={form.slug} disabled={isEdit} onChange={(e)=>set('slug',slugify(e.target.value))} className={`${INPUT} ${isEdit ? 'bg-canvas text-slate2 cursor-not-allowed' : ''}`}/>{isEdit && <span className="block text-[10px] text-slate2 mt-1">The slug stays fixed while editing so linked pitches, rounds, and founders keep their relationship.</span>}</Field>
        {!memberMode && <Field label="Publication status"><select value={form.status} onChange={(e)=>set('status',e.target.value)} className={INPUT}>{['Published','Draft','Pending','Archived'].map(x=><option key={x}>{x}</option>)}</select></Field>}
        <Field label="Tagline" wide><textarea value={form.tagline} onChange={(e)=>set('tagline',e.target.value)} className={`${INPUT} min-h-20`}/></Field>
        <Field label="Category"><select value={form.category} onChange={(e)=>set('category',e.target.value)} className={INPUT}><option value="">Select category</option>{list(data.categories).map((c)=><option key={c.slug} value={c.name}>{c.name}</option>)}</select></Field>
        <Field label="Country"><input value={form.country} onChange={(e)=>set('country',e.target.value)} className={INPUT} placeholder="Canada"/></Field>
        <Field label="Headquarters"><input value={form.hq} onChange={(e)=>set('hq',e.target.value)} className={INPUT} placeholder="Toronto, Canada"/></Field>
      </div>
    </Panel>

    <Panel title="Company data" text="These values populate the right-hand Company Data and Traction cards on the public page.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Founded year"><input type="number" value={form.foundedYear} onChange={(e)=>set('foundedYear',e.target.value)} className={INPUT}/></Field>
        <Field label="Company stage"><select value={form.stage} onChange={(e)=>set('stage',e.target.value)} className={INPUT}>{['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Funding stage"><select value={form.fundingStage} onChange={(e)=>set('fundingStage',e.target.value)} className={INPUT}>{['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Team size"><input type="number" value={form.teamSize} onChange={(e)=>set('teamSize',e.target.value)} className={INPUT}/></Field>
        <Field label="Business model"><input value={form.businessModel} onChange={(e)=>set('businessModel',e.target.value)} className={INPUT}/></Field>
        <Field label="Total raised (USD)"><input type="number" value={form.totalRaised} onChange={(e)=>set('totalRaised',Number(e.target.value||0))} className={INPUT}/></Field>
        <Field label="Revenue"><input value={form.revenue} onChange={(e)=>set('revenue',e.target.value)} className={INPUT} placeholder="$200K ARR"/></Field>
        <Field label="Users / customers"><input value={form.users} onChange={(e)=>set('users',e.target.value)} className={INPUT}/></Field>
        <Field label="Growth"><input value={form.growth} onChange={(e)=>set('growth',e.target.value)} className={INPUT} placeholder="+12% MoM"/></Field>
        <Field label="Website"><input value={form.website} onChange={(e)=>set('website',e.target.value)} className={INPUT} placeholder="https://"/></Field>
        {!memberMode && <Field label="Owner user ID"><input value={form.ownerId} onChange={(e)=>set('ownerId',e.target.value)} className={INPUT}/></Field>}
      </div>
    </Panel>

    <Panel title="Public contact details" text="These details power the Contact popup on the public company profile. They are stored with this company in the backend.">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-canvas/35 px-4 py-3 mb-4">
        <div><div className="text-[12px] font-medium">Show contact details publicly</div><div className="text-[10.5px] text-slate2 mt-0.5">When enabled, visitors can open the Contact popup from the company profile.</div></div>
        <input type="checkbox" checked={form.contact?.public !== false} onChange={(e)=>setContact('public',e.target.checked)} className="w-5 h-5 accent-[#D94B3D]"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Contact person"><input value={form.contact?.name||''} onChange={(e)=>setContact('name',e.target.value)} className={INPUT} placeholder="e.g. Ahmad Khan"/></Field>
        <Field label="Role / title"><input value={form.contact?.role||''} onChange={(e)=>setContact('role',e.target.value)} className={INPUT} placeholder="Founder / Partnerships"/></Field>
        <Field label="Email"><input type="email" value={form.contact?.email||''} onChange={(e)=>setContact('email',e.target.value)} className={INPUT} placeholder="hello@company.com"/></Field>
        <Field label="Phone"><input value={form.contact?.phone||''} onChange={(e)=>setContact('phone',e.target.value)} className={INPUT} placeholder="+1 416 555 0123"/></Field>
        <Field label="WhatsApp"><input value={form.contact?.whatsapp||''} onChange={(e)=>setContact('whatsapp',e.target.value)} className={INPUT} placeholder="+92 300 1234567"/></Field>
        <Field label="LinkedIn / contact profile"><input value={form.contact?.linkedin||''} onChange={(e)=>setContact('linkedin',e.target.value)} className={INPUT} placeholder="https://linkedin.com/in/..."/></Field>
        <Field label="Office / contact address" wide><input value={form.contact?.address||''} onChange={(e)=>setContact('address',e.target.value)} className={INPUT} placeholder="Toronto, Ontario, Canada"/></Field>
        <Field label="Contact note" wide><textarea value={form.contact?.note||''} onChange={(e)=>setContact('note',e.target.value)} className={`${INPUT} min-h-20`} placeholder="Best time to contact, partnership instructions, or a short note for visitors."/></Field>
      </div>
    </Panel>

    <Panel title="Media & status" text="Hero visuals and public status badges.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ImageField label="Banner image" value={form.banner} onChange={(v)=>set('banner',v)} />
        <div className="grid grid-cols-2 gap-3 content-start">
          <Field label="Logo initials"><input value={form.logo?.mark||''} onChange={(e)=>setLogo('mark',e.target.value)} className={INPUT}/></Field>
          <Field label="Logo color"><div className="flex gap-2"><input type="color" value={form.logo?.color||'#3B82F6'} onChange={(e)=>setLogo('color',e.target.value)} className="w-12 h-10 border border-line rounded-lg p-1 bg-white"/><input value={form.logo?.color||''} onChange={(e)=>setLogo('color',e.target.value)} className={INPUT}/></div></Field>
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-2">{(memberMode ? [['openToFunding','Open to funding'],['hiring','Hiring']] : [['verified','Verified'],['featured','Featured'],['openToFunding','Open to funding'],['hiring','Hiring']]).map(([key,label])=><Toggle key={key} label={label} checked={form[key]} onChange={(v)=>set(key,v)}/>)}</div>
        </div>
      </div>
    </Panel>
  </div>;
}

function PitchTab({ enabled, setEnabled, pitch, setPitch, memberMode }) {
  const set=(key,value)=>setPitch((prev)=>({...prev,[key]:value}));
  return <div className="max-w-5xl mx-auto space-y-5">
    <div className="bg-white border border-line rounded-2xl p-5 flex items-center justify-between gap-4"><div><div className="font-display text-[19px]">Investment Pitch tab</div><p className="text-[12px] text-slate2 mt-1">Enable this to publish and manage the investment pitch linked to this company.</p></div><label className="flex items-center gap-2 text-[12px]"><span>{enabled?'Enabled':'Disabled'}</span><input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} className="w-5 h-5 accent-[#D94B3D]"/></label></div>
    {enabled && <Panel title="Pitch content" text="This is stored as a linked pitch record in MySQL and rendered in the Investment Pitch tab."><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Pitch title" wide><input value={pitch.pitchTitle||''} onChange={(e)=>set('pitchTitle',e.target.value)} className={INPUT}/></Field>
      <Field label="Status"><select value={pitch.status||'Active'} onChange={(e)=>set('status',e.target.value)} className={INPUT}>{['Active','Closed','Archived'].map(x=><option key={x}>{x}</option>)}</select></Field>
      {!memberMode && <Field label="Review status"><select value={pitch.reviewStatus||'Approved'} onChange={(e)=>set('reviewStatus',e.target.value)} className={INPUT}>{['Approved','Pending','Rejected'].map(x=><option key={x}>{x}</option>)}</select></Field>}
      <Field label="Visibility"><select value={pitch.visibility||'Public'} onChange={(e)=>set('visibility',e.target.value)} className={INPUT}>{['Public','Private','Members only'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Summary" wide><textarea value={pitch.summary||''} onChange={(e)=>set('summary',e.target.value)} className={`${INPUT} min-h-24`}/></Field>
      <Field label="Problem" wide><textarea value={pitch.problem||''} onChange={(e)=>set('problem',e.target.value)} className={`${INPUT} min-h-24`}/></Field>
      <Field label="Solution" wide><textarea value={pitch.solution||''} onChange={(e)=>set('solution',e.target.value)} className={`${INPUT} min-h-24`}/></Field>
      <Field label="Market"><input value={pitch.market||''} onChange={(e)=>set('market',e.target.value)} className={INPUT}/></Field>
      <Field label="Business model"><input value={pitch.businessModel||''} onChange={(e)=>set('businessModel',e.target.value)} className={INPUT}/></Field>
      <Field label="Traction" wide><textarea value={pitch.traction||''} onChange={(e)=>set('traction',e.target.value)} className={`${INPUT} min-h-24`}/></Field>
      <Field label="Use of funds" wide><textarea value={pitch.useOfFunds||''} onChange={(e)=>set('useOfFunds',e.target.value)} className={`${INPUT} min-h-24`}/></Field>
      <Field label="Raising (USD)"><input type="number" value={pitch.requested||0} onChange={(e)=>set('requested',Number(e.target.value||0))} className={INPUT}/></Field>
      <Field label="Equity offered (%)"><input type="number" value={pitch.equity||0} onChange={(e)=>set('equity',Number(e.target.value||0))} className={INPUT}/></Field>
      <Field label="Valuation (USD)"><input type="number" value={pitch.valuation||0} onChange={(e)=>set('valuation',Number(e.target.value||0))} className={INPUT}/></Field>
      <Field label="Minimum ticket (USD)"><input type="number" value={pitch.minTicket||0} onChange={(e)=>set('minTicket',Number(e.target.value||0))} className={INPUT}/></Field>
    </div></Panel>}
  </div>;
}

function RoundsTab({ rounds, setRounds, investors, memberMode }) {
  const add=()=>setRounds([...rounds,{id:tempId('round'),roundName:'Seed',stage:'Seed',date:TODAY(),amount:0,valuation:0,leadInvestorSlug:'',investorSlugs:[],notes:'',status:'Published'}]);
  const patch=(index,key,value)=>setRounds(rounds.map((r,i)=>i===index?{...r,[key]:value}:r));
  const remove=(index)=>setRounds(rounds.filter((_,i)=>i!==index));
  const move=(index,dir)=>{const t=index+dir;if(t<0||t>=rounds.length)return;const n=[...rounds];[n[index],n[t]]=[n[t],n[index]];setRounds(n);};
  return <RepeaterShell title="Funding Rounds" text="Every row is stored in the funding-rounds backend collection and appears on the public Funding Rounds tab." action="Add round" onAdd={add} empty={rounds.length===0}>
    {rounds.map((r,index)=><RepeaterCard key={r.id||index} title={r.roundName||`Round ${index+1}`} index={index} count={rounds.length} onMove={move} onRemove={remove}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Field label="Round name"><input value={r.roundName||''} onChange={(e)=>patch(index,'roundName',e.target.value)} className={INPUT}/></Field>
      <Field label="Stage"><select value={r.stage||'Seed'} onChange={(e)=>patch(index,'stage',e.target.value)} className={INPUT}>{['Pre-Seed','Seed','Series A','Series B','Series C+','Grant','Debt'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Date"><input type="date" value={String(r.date||'').slice(0,10)} onChange={(e)=>patch(index,'date',e.target.value)} className={INPUT}/></Field>
      <Field label="Amount (USD)"><input type="number" value={r.amount||0} onChange={(e)=>patch(index,'amount',Number(e.target.value||0))} className={INPUT}/></Field>
      <Field label="Valuation (USD)"><input type="number" value={r.valuation||0} onChange={(e)=>patch(index,'valuation',Number(e.target.value||0))} className={INPUT}/></Field>
      {!memberMode && <Field label="Status"><select value={r.status||'Published'} onChange={(e)=>patch(index,'status',e.target.value)} className={INPUT}>{['Published','Draft','Archived'].map(x=><option key={x}>{x}</option>)}</select></Field>}
      <Field label="Lead investor"><select value={r.leadInvestorSlug||''} onChange={(e)=>patch(index,'leadInvestorSlug',e.target.value)} className={INPUT}><option value="">None</option>{list(investors).map((inv)=><option key={inv.slug} value={inv.slug}>{inv.name}</option>)}</select></Field>
      <Field label="Investor slugs" wide><input value={list(r.investorSlugs).join(', ')} onChange={(e)=>patch(index,'investorSlugs',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))} className={INPUT} placeholder="investor-one, investor-two"/></Field>
      <Field label="Notes" wide><textarea value={r.notes||''} onChange={(e)=>patch(index,'notes',e.target.value)} className={`${INPUT} min-h-20`}/></Field>
    </div></RepeaterCard>)}
  </RepeaterShell>;
}

function FoundersTab({ founders, setFounders, startupSlug, memberMode }) {
  const add=()=>setFounders([...founders,{slug:tempId('founder'),name:'',role:'Founder',country:'',industry:'',photo:'',linkedin:'',bio:'',story:'',skills:[],status:'Published',verified:false,startupSlug}]);
  const patch=(index,key,value)=>setFounders(founders.map((f,i)=>i===index?{...f,[key]:value}:f));
  const remove=(index)=>setFounders(founders.filter((_,i)=>i!==index));
  const move=(index,dir)=>{const t=index+dir;if(t<0||t>=founders.length)return;const n=[...founders];[n[index],n[t]]=[n[t],n[index]];setFounders(n);};
  return <RepeaterShell title="Founders" text="Manage the founder cards shown in the public Founders tab. These are real founder records linked to this company." action="Add founder" onAdd={add} empty={founders.length===0}>
    {founders.map((f,index)=><RepeaterCard key={f.slug||index} title={f.name||`Founder ${index+1}`} index={index} count={founders.length} onMove={move} onRemove={remove}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Field label="Full name"><input value={f.name||''} onChange={(e)=>setFounders(founders.map((founder,i)=>i===index?{...founder,name:e.target.value,slug:String(founder.slug||'').startsWith('tmp-')?(slugify(e.target.value)||founder.slug):founder.slug}:founder))} className={INPUT}/></Field>
      <Field label="URL slug"><input value={f.slug||''} onChange={(e)=>patch(index,'slug',slugify(e.target.value))} className={INPUT}/></Field>
      <Field label="Role"><input value={f.role||''} onChange={(e)=>patch(index,'role',e.target.value)} className={INPUT}/></Field>
      <Field label="Country"><input value={f.country||''} onChange={(e)=>patch(index,'country',e.target.value)} className={INPUT}/></Field>
      <Field label="Industry"><input value={f.industry||''} onChange={(e)=>patch(index,'industry',e.target.value)} className={INPUT}/></Field>
      {!memberMode && <Field label="Status"><select value={f.status||'Published'} onChange={(e)=>patch(index,'status',e.target.value)} className={INPUT}>{['Published','Draft','Pending','Archived'].map(x=><option key={x}>{x}</option>)}</select></Field>}
      <Field label="Photo URL" wide><input value={f.photo||''} onChange={(e)=>patch(index,'photo',e.target.value)} className={INPUT}/></Field>
      <Field label="LinkedIn"><input value={f.linkedin||''} onChange={(e)=>patch(index,'linkedin',e.target.value)} className={INPUT}/></Field>
      <Field label="Skills"><input value={list(f.skills).join(', ')} onChange={(e)=>patch(index,'skills',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))} className={INPUT}/></Field>
      <Field label="Short bio" wide><textarea value={f.bio||''} onChange={(e)=>patch(index,'bio',e.target.value)} className={`${INPUT} min-h-20`}/></Field>
      <Field label="Founder story" wide><textarea value={f.story||''} onChange={(e)=>patch(index,'story',e.target.value)} className={`${INPUT} min-h-20`}/></Field>
      {!memberMode && <Toggle label="Verified" checked={Boolean(f.verified)} onChange={(v)=>patch(index,'verified',v)}/>}
    </div></RepeaterCard>)}
  </RepeaterShell>;
}

function ProductsTab({ products, setProducts }) {
  const add=()=>setProducts([...products,{id:tempId('product'),title:'',description:'',image:'',url:''}]);
  const patch=(index,key,value)=>setProducts(products.map((p,i)=>i===index?{...p,[key]:value}:p));
  const remove=(index)=>setProducts(products.filter((_,i)=>i!==index));
  const move=(index,dir)=>{const t=index+dir;if(t<0||t>=products.length)return;const n=[...products];[n[index],n[t]]=[n[t],n[index]];setProducts(n);};
  return <RepeaterShell title="Products" text="Add product cards for the public Products tab. Images and descriptions are stored with this company in MySQL." action="Add product" onAdd={add} empty={products.length===0}>
    {products.map((p,index)=><RepeaterCard key={p.id||index} title={p.title||`Product ${index+1}`} index={index} count={products.length} onMove={move} onRemove={remove}><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field label="Product title"><input value={p.title||''} onChange={(e)=>patch(index,'title',e.target.value)} className={INPUT}/></Field>
      <Field label="Product URL"><input value={p.url||''} onChange={(e)=>patch(index,'url',e.target.value)} className={INPUT} placeholder="https://"/></Field>
      <Field label="Description" wide><textarea value={p.description||''} onChange={(e)=>patch(index,'description',e.target.value)} className={`${INPUT} min-h-20`}/></Field>
      <div className="md:col-span-2"><ImageField label="Product image" value={p.image||''} onChange={(v)=>patch(index,'image',v)}/></div>
    </div></RepeaterCard>)}
  </RepeaterShell>;
}

function SimilarTab({ selected, onChange, startups, currentSlug }) {
  const [q,setQ]=useState('');
  const options=list(startups).filter((s)=>s.slug!==currentSlug && `${s.name} ${s.category} ${s.country}`.toLowerCase().includes(q.toLowerCase()));
  const toggle=(slug)=>onChange(selected.includes(slug)?selected.filter((x)=>x!==slug):[...selected,slug]);
  return <div className="max-w-5xl mx-auto"><Panel title="Similar companies" text="Choose the companies that should appear in the public Similar tab. If none are selected, the public page can fall back to companies in the same category.">
    <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2"/><input value={q} onChange={(e)=>setQ(e.target.value)} className={`${INPUT} pl-9`} placeholder="Search companies…"/></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto thin-scroll pr-1">{options.map((s)=>{const active=selected.includes(s.slug);return <button key={s.slug} type="button" onClick={()=>toggle(s.slug)} className={`rounded-xl border p-3 text-left flex items-center gap-3 ${active?'border-coral bg-coralSoft/30':'border-line bg-white hover:border-ink'}`}><div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-semibold" style={{background:s.logo?.color||'#111827'}}>{s.logo?.mark||s.name?.slice(0,2)}</div><div className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate">{s.name}</div><div className="text-[10.5px] text-slate2 truncate">{s.category} · {s.country}</div></div><span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] ${active?'bg-coral border-coral text-white':'border-line'}`}>{active?'✓':''}</span></button>})}</div>
    <div className="mt-4 text-[11px] text-slate2">{selected.length} selected</div>
  </Panel></div>;
}

function Panel({ title, text, children }) {return <section className="bg-white border border-line rounded-2xl p-5 md:p-6"><div><div className="font-display text-[18px]">{title}</div>{text&&<p className="text-[11.5px] text-slate2 mt-1 max-w-3xl">{text}</p>}</div><div className="mt-5">{children}</div></section>;}
function Field({ label, required, wide, children }) {return <label className={wide?'md:col-span-2 lg:col-span-3':''}><span className="block text-[11.5px] text-slate2 mb-1.5">{label}{required&&<span className="text-coral"> *</span>}</span>{children}</label>;}
function Toggle({ label, checked, onChange }) {return <label className="border border-line bg-white rounded-xl px-3 py-2.5 flex items-center justify-between gap-3"><span className="text-[11.5px]">{label}</span><input type="checkbox" checked={Boolean(checked)} onChange={(e)=>onChange(e.target.checked)} className="w-4 h-4 accent-[#D94B3D]"/></label>;}

function ImageField({ label, value, onChange }) {
  const ref=useRef(null);
  return <div><div className="text-[11.5px] text-slate2 mb-1.5">{label}</div><div className="border border-line rounded-xl bg-canvas/25 p-3 flex gap-3 items-center"><div className="w-24 h-16 rounded-lg border border-line bg-white overflow-hidden flex items-center justify-center shrink-0">{value?<img src={value} alt="" className="w-full h-full object-cover"/>:<ImagePlus className="w-5 h-5 text-slate2"/>}</div><div className="flex-1 min-w-0"><input value={value||''} onChange={(e)=>onChange(e.target.value)} className={INPUT} placeholder="Image URL"/><button type="button" onClick={()=>ref.current?.click()} className="mt-2 text-[11px] text-coral hover:underline">Choose local image</button><input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>onChange(reader.result);reader.readAsDataURL(file);e.target.value='';}}/></div></div></div>;
}

function RepeaterShell({ title, text, action, onAdd, empty, children }) {return <div className="max-w-6xl mx-auto space-y-4"><div className="bg-white border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="font-display text-[19px]">{title}</div><p className="text-[11.5px] text-slate2 mt-1 max-w-2xl">{text}</p></div><button type="button" onClick={onAdd} className="btn btn-coral"><Plus className="w-4 h-4"/>{action}</button></div>{empty?<div className="bg-white border-2 border-dashed border-line rounded-2xl p-12 text-center"><Plus className="w-6 h-6 mx-auto text-coral"/><div className="text-[13px] font-medium mt-3">Nothing added yet</div><button type="button" onClick={onAdd} className="text-[11.5px] text-coral mt-2 hover:underline">Add the first item</button></div>:children}</div>;}
function RepeaterCard({ title, index, count, onMove, onRemove, children }) {return <section className="bg-white border border-line rounded-2xl overflow-hidden"><div className="px-4 py-3 border-b border-line bg-canvas/40 flex items-center gap-2"><span className="text-[12px] font-medium flex-1">{title}</span><button type="button" onClick={()=>onMove(index,-1)} disabled={index===0} className="admin-icon-btn disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5"/></button><button type="button" onClick={()=>onMove(index,1)} disabled={index===count-1} className="admin-icon-btn disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5"/></button><button type="button" onClick={()=>onRemove(index)} className="admin-icon-btn text-coral"><Trash2 className="w-3.5 h-3.5"/></button></div><div className="p-4 md:p-5">{children}</div></section>;}

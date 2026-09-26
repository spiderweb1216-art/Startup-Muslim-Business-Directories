import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowUpRight, Handshake, LogOut, Plus, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData, slugify } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';

const INITIAL = { name:'', slug:'', type:'Angel Investor', country:'', flag:'', ticketRange:'', foundedYear:'', headquarters:'', aum:'', teamSize:'', website:'', linkedin:'', email:'', phone:'', description:'', thesis:'', focus:[], stageFocus:[], portfolio:[], halalFocus:false, logo:{mark:'',color:'#14233b'} };
const FIELDS = [
  ['name','Investor or fund name','text',true],['type','Investor type','text'],['country','Country','text'],['flag','Country code','text'],
  ['ticketRange','Typical ticket range','text'],['foundedYear','Founded year','number'],['headquarters','Headquarters','text'],['aum','Assets under management','text'],['teamSize','Team size','text'],
  ['website','Website','url'],['linkedin','LinkedIn profile','url'],['email','Public contact email','email'],['phone','Public contact phone','tel'],
];
const INPUT = 'w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13px] text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/10';
const STAGES = ['Pre-Seed','Seed','Series A','Series B','Series C+','Growth'];

function InvestorEditor({ initial, categories, startups, onSave }) {
  const [form,setForm] = useState(() => ({ ...INITIAL, ...initial, logo:{...INITIAL.logo,...initial?.logo}, focus:Array.isArray(initial?.focus)?initial.focus:[], stageFocus:Array.isArray(initial?.stageFocus)?initial.stageFocus:[], portfolio:Array.isArray(initial?.portfolio)?initial.portfolio:[] }));
  const [saving,setSaving] = useState(false);
  const set=(key,value)=>setForm((prev)=>({...prev,[key]:value}));
  const toggle=(key,value)=>setForm((prev)=>({...prev,[key]:prev[key].includes(value)?prev[key].filter((item)=>item!==value):[...prev[key],value]}));
  const submit=async(event)=>{
    event.preventDefault(); setSaving(true);
    try { await onSave({ ...form, name:form.name.trim(), slug:initial?.slug || slugify(form.name), foundedYear:form.foundedYear ? Number(form.foundedYear) : null }); }
    finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="space-y-6" data-testid="investor-profile-editor">
    <section className="bg-white rounded-2xl border border-line p-5 md:p-7"><h2 className="font-display text-xl">Investor details</h2><p className="text-xs text-slate2 mt-1">Describe your firm, investment activity and how founders can reach you.</p><div className="grid sm:grid-cols-2 gap-4 mt-6">{FIELDS.map(([key,label,type,required])=><label key={key} className="block"><span className="block text-xs font-medium mb-1.5">{label}</span><input className={INPUT} type={type} required={Boolean(required)} value={form[key]??''} onChange={(e)=>set(key,e.target.value)} /></label>)}</div><label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.halalFocus)} onChange={(e)=>set('halalFocus',e.target.checked)} /> Focus on halal ventures</label></section>
    <section className="bg-white rounded-2xl border border-line p-5 md:p-7 space-y-5"><h2 className="font-display text-xl">Investment thesis</h2>{[['description','Short introduction'],['thesis','Your investment thesis']].map(([key,label])=><label key={key} className="block"><span className="block text-xs font-medium mb-1.5">{label}</span><textarea className={`${INPUT} min-h-28`} value={form[key]||''} onChange={(e)=>set(key,e.target.value)}/></label>)}<div><h3 className="text-sm font-medium mb-3">Stages you invest in</h3><div className="flex gap-2 flex-wrap">{STAGES.map((stage)=><button type="button" key={stage} aria-pressed={form.stageFocus.includes(stage)} onClick={()=>toggle('stageFocus',stage)} className={`rounded-full border px-3 py-2 text-xs ${form.stageFocus.includes(stage)?'bg-navy text-white border-navy':'border-line hover:border-coral'}`}>{stage}</button>)}</div></div><div><h3 className="text-sm font-medium mb-3">Sector focus</h3><div className="flex gap-2 flex-wrap">{categories.filter((c)=>c.status!=='Inactive').map((category)=><button type="button" key={category.slug} aria-pressed={form.focus.includes(category.name)} onClick={()=>toggle('focus',category.name)} className={`rounded-full border px-3 py-2 text-xs ${form.focus.includes(category.name)?'bg-navy text-white border-navy':'border-line hover:border-coral'}`}>{category.name}</button>)}</div></div></section>
    <section className="bg-white rounded-2xl border border-line p-5 md:p-7"><h2 className="font-display text-xl">Portfolio companies</h2><p className="text-xs text-slate2 mt-1">Choose existing public companies in your portfolio.</p><div className="grid sm:grid-cols-2 gap-2 mt-4 max-h-52 overflow-y-auto">{startups.filter((item)=>item.status==='Published').map((company)=><label key={company.slug} className="flex items-center gap-2 rounded-lg border border-line p-2.5 text-xs"><input type="checkbox" checked={form.portfolio.includes(company.slug)} onChange={()=>toggle('portfolio',company.slug)}/>{company.name}</label>)}</div></section>
    <section className="bg-white rounded-2xl border border-line p-5 md:p-7"><h2 className="font-display text-xl">Branding</h2><div className="grid sm:grid-cols-2 gap-4 mt-4"><label className="text-xs font-medium">Logo initials<input className={`${INPUT} mt-1.5`} maxLength={5} value={form.logo?.mark||''} onChange={(e)=>set('logo',{...form.logo,mark:e.target.value})}/></label><label className="text-xs font-medium">Logo color<input type="color" className="block mt-2 h-11 w-20 cursor-pointer" value={form.logo?.color||'#14233b'} onChange={(e)=>set('logo',{...form.logo,color:e.target.value})}/></label></div></section>
    <div className="flex items-center gap-4 flex-wrap"><button disabled={saving} className="btn btn-coral" type="submit"><Save size={16}/>{saving?'Saving…':initial?'Save investor profile':'Submit for admin approval'}</button><span className="text-xs text-slate2">New profiles and rejected resubmissions appear after admin approval.</span></div>
  </form>;
}

export default function InvestorDashboard() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { data, addItem, updateItem, loading } = useData();
  const { toast } = useToast();
  const [selected,setSelected] = useState('');
  const [creating,setCreating] = useState(false);
  if (currentUser?.role !== 'Investor' && !isAdmin) return <Navigate to="/dashboard" replace />;
  const owned = (data.investors||[]).filter((investor)=>investor.ownerId===currentUser?.id);
  const active = creating ? null : owned.find((investor)=>investor.slug===selected) || owned[0] || null;
  const save = async(value)=>{
    try {
      const result = active ? updateItem('investors',active.slug,value,currentUser.name) : addItem('investors',{...value,status:'Pending'},currentUser.name);
      await result.savePromise;
      setSelected(result.slug); setCreating(false);
      toast(active?'Investor profile saved.':'Investor profile submitted for admin approval.',{type:'success'});
    } catch(error) { toast(error.message||'Could not save investor profile.',{type:'warning'}); }
  };
  return <div className="wrap py-10 pb-24" data-testid="investor-dashboard"><div className="rounded-3xl bg-navy p-7 md:p-10 text-white"><div className="flex justify-between gap-4"><Handshake className="text-coral" size={26}/><button onClick={logout} className="flex items-center gap-2 text-xs text-white/70 hover:text-white"><LogOut size={15}/>Sign out</button></div><h1 className="font-display text-3xl md:text-4xl mt-6">Investor workspace</h1><p className="mt-2 text-white/70 max-w-xl text-sm">Submit your investor profile for review. Once approved, it appears in the directory and you can continue updating your investment details.</p></div>
    {loading?<p className="mt-8 text-sm text-slate2">Loading your profiles…</p>:<div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-7 mt-7"><aside className="space-y-3"><div className="bg-white border border-line rounded-2xl p-4"><h2 className="font-display text-lg mb-3">Your profiles</h2>{owned.map((item)=><button key={item.slug} onClick={()=>{setSelected(item.slug);setCreating(false);}} className={`w-full text-left p-3 rounded-xl border mb-2 ${active?.slug===item.slug?'border-coral bg-coralSoft':'border-line hover:border-coral/40'}`}><span className="block text-sm font-medium">{item.name}</span><span className="text-xs text-slate2">{item.status||'Pending'}</span></button>)}{owned.length===0&&<p className="text-xs text-slate2 mb-3">Your first profile is ready to create.</p>}<button onClick={()=>{setCreating(true);setSelected('');}} className="btn btn-outline btn-sm w-full justify-center"><Plus size={14}/> Add investor profile</button></div>{active?.status==='Published'&&<Link className="btn btn-outline btn-sm w-full justify-center" to={`/investors/${active.slug}`}>View public profile <ArrowUpRight size={14}/></Link>}</aside><div>{active&&<div className={`rounded-2xl border p-4 mb-5 text-sm ${active.status==='Published'?'bg-emeraldSoft border-emerald/20':active.status==='Rejected'?'bg-coralSoft border-coral/20':'bg-amber/10 border-amber/20'}`}><strong>{active.status==='Published'?'Published':active.status==='Rejected'?'Changes requested':'Awaiting admin approval'}</strong><p className="text-xs mt-1">{active.status==='Published'?'Your edits appear on the live profile after you save.':active.status==='Rejected'?'Update the information below and save to send it back for review.':'An administrator will review this profile before it appears publicly.'}</p></div>}<InvestorEditor key={active?.slug||'new'} initial={active} categories={data.categories||[]} startups={data.startups||[]} onSave={save}/></div></div>}
  </div>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, CircleDollarSign,
  ExternalLink, FileText, ImagePlus, Plus, Rocket, Save, Trash2, UserRound, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { StartupLogo } from '@/components/common/Logo';

const TODAY = () => new Date().toISOString().slice(0,10);
const splitCsv = (value) => Array.isArray(value) ? value : String(value || '').split(',').map((x)=>x.trim()).filter(Boolean);

const SECTIONS = [
  ['profile','Profile',Building2],
  ['pitches','Pitches',FileText],
  ['founders','Team & founders',UserRound],
  ['rounds','Funding rounds',CircleDollarSign],
  ['jobs','Jobs',BriefcaseBusiness],
  ['opportunities','Opportunities',Rocket],
];

const MANAGERS = {
  pitches: {
    title:'Investment pitches', singular:'pitch', idField:'id', nameField:'pitchTitle', statusField:'reviewStatus',
    description:'Create and maintain fundraising pitches for this startup. New and edited pitches return to the admin review queue.',
    defaults:{ pitchTitle:'', summary:'', problem:'', solution:'', market:'', businessModel:'', traction:'', requested:'', equity:'', valuation:'', minTicket:'', useOfFunds:'', visibility:'Private' },
    fields:[
      ['pitchTitle','Pitch title','text',true],['visibility','Visibility','select',false,['Private','Public','Members only']],
      ['summary','Summary','textarea'],['problem','Problem','textarea'],['solution','Solution','textarea'],
      ['market','Target market'],['businessModel','Business model'],['traction','Traction','textarea'],
      ['requested','Funding requested (USD)','number'],['equity','Equity offered (%)','number'],['valuation','Valuation (USD)','number'],['minTicket','Minimum ticket (USD)','number'],
      ['useOfFunds','Use of funds','textarea'],
    ],
    build:(form,startup)=>({ ...form, startupSlug:startup.slug, status:'Active', reviewStatus:'Pending', submitted:TODAY(), requested:Number(form.requested||0), equity:Number(form.equity||0), valuation:Number(form.valuation||0), minTicket:Number(form.minTicket||0) }),
  },
  founders: {
    title:'Team and founders', singular:'founder', idField:'slug', nameField:'name', statusField:'status',
    description:'Add founders and key team members linked to this startup profile.',
    defaults:{ name:'', role:'Founder', country:'', industry:'', photo:'', linkedin:'', bio:'', story:'', skills:'' },
    fields:[
      ['name','Full name','text',true],['role','Role'],['country','Country'],['industry','Industry'],['photo','Photo URL'],['linkedin','LinkedIn URL'],
      ['bio','Short bio','textarea'],['story','Founder story','textarea'],['skills','Skills (comma separated)'],
    ],
    build:(form,startup)=>({ ...form, startupSlug:startup.slug, status:'Pending', verified:false, skills:splitCsv(form.skills) }),
  },
  rounds: {
    title:'Funding rounds', singular:'funding round', idField:'id', nameField:'roundName', statusField:'status',
    description:'Record disclosed funding rounds, investors, valuations, and notes.',
    defaults:{ roundName:'', stage:'Seed', date:TODAY(), amount:'', valuation:'', leadInvestorSlug:'', investorSlugs:'', notes:'' },
    fields:[
      ['roundName','Round name','text',true],['stage','Stage','select',false,['Pre-Seed','Seed','Series A','Series B','Series C+','Grant','Debt']],['date','Round date','date'],
      ['amount','Amount raised (USD)','number'],['valuation','Valuation (USD)','number'],['leadInvestorSlug','Lead investor slug'],['investorSlugs','Investor slugs (comma separated)'],['notes','Notes','textarea'],
    ],
    build:(form,startup)=>({ ...form, startupSlug:startup.slug, status:'Pending', amount:Number(form.amount||0), valuation:Number(form.valuation||0), investorSlugs:splitCsv(form.investorSlugs) }),
  },
  jobs: {
    title:'Startup jobs', singular:'job', idField:'id', nameField:'title', statusField:'status',
    description:'Publish roles for this startup. New jobs remain pending until the administrator reviews them.',
    defaults:{ title:'', location:'Remote', arrangement:'Remote', type:'Full-time', level:'Mid', description:'' },
    fields:[
      ['title','Job title','text',true],['location','Location'],['arrangement','Arrangement','select',false,['Remote','Hybrid','On-site']],
      ['type','Employment type','select',false,['Full-time','Part-time','Contract','Internship','Temporary']],['level','Seniority','select',false,['Junior','Mid','Senior','Lead','Executive']],['description','Description','textarea'],
    ],
    build:(form,startup)=>({ ...form, startupSlug:startup.slug, status:'Pending', posted:TODAY(), applications:0 }),
  },
  opportunities: {
    title:'Startup opportunities', singular:'opportunity', idField:'id', nameField:'title', statusField:'status',
    description:'Add programs, events, grants, competitions, or other opportunities organized by this startup.',
    defaults:{ title:'', type:'Event', country:'', remote:false, deadline:'', industry:'', founderStage:'', description:'', image:'' },
    fields:[
      ['title','Title','text',true],['type','Opportunity type','select',false,['Accelerator','Fellowship','Grant','Competition','Demo Day','Founder Program','Event']],
      ['country','Country'],['remote','Remote','checkbox'],['deadline','Deadline','date'],['industry','Industry'],['founderStage','Founder stage'],['image','Image URL'],['description','Description','textarea'],
    ],
    build:(form,startup)=>({ ...form, startupSlug:startup.slug, organization:startup.name, status:'Pending', featured:false }),
  },
};

export default function ManageStartup() {
  const { slug } = useParams();
  const { currentUser, isAdmin } = useAuth();
  const { data, loading, updateItem, addItem, removeItem } = useData();
  const { toast } = useToast();
  const [section,setSection] = useState('profile');

  const startup = data.startups.find((item)=>item.slug===slug);
  const approvedClaim = data.claims.find((claim)=>claim.startupSlug===slug && claim.ownerId===currentUser?.id && claim.status==='Approved');
  const canManage = Boolean(isAdmin || (startup && (startup.ownerId===currentUser?.id || approvedClaim)));

  const related = useMemo(() => ({
    pitches:data.pitches.filter((item)=>item.startupSlug===slug),
    founders:data.founders.filter((item)=>item.startupSlug===slug),
    rounds:data.rounds.filter((item)=>item.startupSlug===slug),
    jobs:data.jobs.filter((item)=>item.startupSlug===slug),
    opportunities:data.opportunities.filter((item)=>item.startupSlug===slug),
  }), [data,slug]);

  if (loading) return <div className="wrap py-24 text-center text-slate2">Loading startup workspace…</div>;
  if (!startup || !canManage) return <Navigate to="/dashboard" replace />;

  return (
    <div className="wrap pt-8 pb-24">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-[12.5px] text-slate2 hover:text-ink"><ArrowLeft className="w-4 h-4"/> Back to dashboard</Link>
      <div className="mt-5 border border-line bg-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <StartupLogo startup={startup} size={64} rounded={12}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><h1 className="font-display text-[28px] truncate">Manage {startup.name}</h1><span className="tag tag-emerald"><BadgeCheck className="w-3 h-3"/> Claimed profile</span></div>
          <p className="text-[12.5px] text-slate2 mt-1">You can update the company profile and manage its pitches, team, funding rounds, jobs, and opportunities.</p>
        </div>
        <Link to={`/startups/${startup.slug}`} className="btn btn-outline"><ExternalLink className="w-4 h-4"/> View public profile</Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="border border-line bg-white rounded-2xl p-2 lg:sticky lg:top-24">
            {SECTIONS.map(([id,label,Icon])=><button key={id} onClick={()=>setSection(id)} className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-[13px] ${section===id?'bg-canvas text-ink font-medium':'text-slate2 hover:bg-canvas/60'}`}><span className="flex items-center gap-2"><Icon className="w-4 h-4"/>{label}</span>{id!=='profile'&&<span className="tag">{related[id]?.length||0}</span>}</button>)}
          </div>
        </aside>
        <main className="lg:col-span-9">
          {section==='profile' ? <ProfileEditor startup={startup} categories={data.categories} updateItem={updateItem} toast={toast}/> : <OwnerRecordManager collection={section} config={MANAGERS[section]} startup={startup} records={related[section]||[]} addItem={addItem} updateItem={updateItem} removeItem={removeItem} toast={toast}/>} 
        </main>
      </div>
    </div>
  );
}

function ProfileEditor({ startup, categories, updateItem, toast }) {
  const [form,setForm] = useState({});
  useEffect(()=>{
    setForm({
      name:startup.name||'', tagline:startup.tagline||'', category:startup.category||'', country:startup.country||'', stage:startup.stage||'Pre-Seed', fundingStage:startup.fundingStage||startup.stage||'Pre-Seed',
      businessModel:startup.businessModel||'', hq:startup.hq||'', website:startup.website||'', foundedYear:startup.foundedYear||'', teamSize:startup.teamSize||'', totalRaised:startup.totalRaised||0,
      revenue:startup.revenue||'', users:startup.users||'', growth:startup.growth||'', description:startup.description||'', banner:startup.banner||'', productImages:(startup.productImages||[]).join(', '),
      openToFunding:Boolean(startup.openToFunding), hiring:Boolean(startup.hiring), pitching:Boolean(startup.pitching),
    });
  },[startup]);
  const set=(key,value)=>setForm((prev)=>({...prev,[key]:value}));
  const submit=async(e)=>{
    e.preventDefault();
    try{
      await updateItem('startups',startup.slug,{...form,foundedYear:Number(form.foundedYear||0),teamSize:Number(form.teamSize||0),totalRaised:Number(form.totalRaised||0),productImages:splitCsv(form.productImages)});
      toast('Startup profile updated successfully.',{type:'success'});
    }catch(error){toast(error.message||'The profile could not be updated.',{type:'warning'});}
  };
  return <form onSubmit={submit} className="border border-line bg-white rounded-2xl overflow-hidden"><div className="p-5 md:p-6 border-b border-line"><div className="font-display text-[22px]">Company profile</div><p className="text-[12.5px] text-slate2 mt-1">Update the information shown on the public startup profile.</p></div><div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    <Field label="Startup name"><input required value={form.name||''} onChange={(e)=>set('name',e.target.value)} className={INPUT}/></Field>
    <Field label="Category"><select value={form.category||''} onChange={(e)=>set('category',e.target.value)} className={INPUT}><option value="">Select category</option>{categories.map((category)=><option key={category.slug} value={category.name}>{category.name}</option>)}</select></Field>
    <Field label="Tagline" wide><input value={form.tagline||''} onChange={(e)=>set('tagline',e.target.value)} className={INPUT}/></Field>
    <Field label="Country"><input value={form.country||''} onChange={(e)=>set('country',e.target.value)} className={INPUT}/></Field>
    <Field label="Headquarters"><input value={form.hq||''} onChange={(e)=>set('hq',e.target.value)} className={INPUT}/></Field>
    <Field label="Company stage"><select value={form.stage||''} onChange={(e)=>set('stage',e.target.value)} className={INPUT}>{['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped'].map((item)=><option key={item}>{item}</option>)}</select></Field>
    <Field label="Funding stage"><select value={form.fundingStage||''} onChange={(e)=>set('fundingStage',e.target.value)} className={INPUT}>{['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped'].map((item)=><option key={item}>{item}</option>)}</select></Field>
    <Field label="Business model"><input value={form.businessModel||''} onChange={(e)=>set('businessModel',e.target.value)} className={INPUT}/></Field>
    <Field label="Website"><input value={form.website||''} onChange={(e)=>set('website',e.target.value)} className={INPUT} placeholder="https://example.com"/></Field>
    <Field label="Founded year"><input type="number" value={form.foundedYear||''} onChange={(e)=>set('foundedYear',e.target.value)} className={INPUT}/></Field>
    <Field label="Team size"><input type="number" value={form.teamSize||''} onChange={(e)=>set('teamSize',e.target.value)} className={INPUT}/></Field>
    <Field label="Total raised (USD)"><input type="number" value={form.totalRaised||0} onChange={(e)=>set('totalRaised',e.target.value)} className={INPUT}/></Field>
    <Field label="Revenue"><input value={form.revenue||''} onChange={(e)=>set('revenue',e.target.value)} className={INPUT}/></Field>
    <Field label="Users / customers"><input value={form.users||''} onChange={(e)=>set('users',e.target.value)} className={INPUT}/></Field>
    <Field label="Growth"><input value={form.growth||''} onChange={(e)=>set('growth',e.target.value)} className={INPUT}/></Field>
    <Field label="Banner image URL" wide><input value={form.banner||''} onChange={(e)=>set('banner',e.target.value)} className={INPUT}/></Field>
    <Field label="Product image URLs (comma separated)" wide><input value={form.productImages||''} onChange={(e)=>set('productImages',e.target.value)} className={INPUT}/></Field>
    <Field label="Description" wide><textarea value={form.description||''} onChange={(e)=>set('description',e.target.value)} className={`${INPUT} min-h-[140px]`}/></Field>
    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">{[['openToFunding','Open to funding'],['hiring','Currently hiring'],['pitching','Currently pitching']].map(([key,label])=><label key={key} className="border border-line rounded-xl p-4 flex items-center justify-between gap-3"><span className="text-[13px]">{label}</span><input type="checkbox" checked={Boolean(form[key])} onChange={(e)=>set(key,e.target.checked)} className="w-5 h-5 accent-[#D94B3D]"/></label>)}</div>
  </div><div className="p-4 md:px-6 border-t border-line bg-canvas/40 flex justify-end"><button className="btn btn-coral"><Save className="w-4 h-4"/> Save profile</button></div></form>;
}

function OwnerRecordManager({ collection, config, startup, records, addItem, updateItem, removeItem, toast }) {
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState(config.defaults);
  const [open,setOpen] = useState(false);
  const startCreate=()=>{setEditing(null);setForm({...config.defaults});setOpen(true);};
  const startEdit=(record)=>{
    const next={...record};
    config.fields.forEach(([name,,type])=>{if(type!=='checkbox'&&Array.isArray(next[name]))next[name]=next[name].join(', ');});
    setEditing(record);setForm({...config.defaults,...next});setOpen(true);
  };
  const close=()=>{setOpen(false);setEditing(null);setForm({...config.defaults});};
  const save=async(e)=>{
    e.preventDefault();
    try{
      const payload=config.build(form,startup);
      if(editing) await updateItem(collection,editing[config.idField],payload);
      else {
        const created=addItem(collection,payload);
        if(created.savePromise)await created.savePromise;
      }
      toast(`${config.singular} ${editing?'updated':'submitted'} successfully.`,{type:'success'});close();
    }catch(error){toast(error.message||`The ${config.singular} could not be saved.`,{type:'warning'});}
  };
  const remove=async(record)=>{
    if(!window.confirm(`Delete “${record[config.nameField]}”?`))return;
    try{await removeItem(collection,record[config.idField]);toast(`${config.singular} deleted.`,{type:'success'});}catch(error){toast(error.message||'The record could not be deleted.',{type:'warning'});}
  };
  return <div className="space-y-5"><div className="border border-line bg-white rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="font-display text-[22px]">{config.title}</div><p className="text-[12.5px] text-slate2 mt-1 max-w-2xl">{config.description}</p></div><button onClick={startCreate} className="btn btn-coral"><Plus className="w-4 h-4"/> Add {config.singular}</button></div>
    {open&&<form onSubmit={save} className="border border-line bg-white rounded-2xl overflow-hidden"><div className="p-5 border-b border-line flex items-center justify-between"><div><div className="eyebrow">{editing?'Edit record':'New record'}</div><div className="font-display text-[20px] mt-1">{editing?`Edit ${config.singular}`:`Add ${config.singular}`}</div></div><button type="button" onClick={close} className="w-9 h-9 rounded-lg border border-line flex items-center justify-center"><X className="w-4 h-4"/></button></div><div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{config.fields.map(([name,label,type='text',required=false,options=[]])=><ManagerField key={name} name={name} label={label} type={type} required={required} options={options} value={form[name]} onChange={(value)=>setForm((prev)=>({...prev,[name]:value}))}/>)}</div><div className="p-4 border-t border-line flex justify-end gap-2"><button type="button" onClick={close} className="btn btn-outline">Cancel</button><button className="btn btn-coral"><Save className="w-4 h-4"/> {editing?'Save changes':'Submit for review'}</button></div></form>}
    <div className="border border-line bg-white rounded-2xl overflow-hidden">{records.length===0?<div className="p-12 text-center"><ImagePlus className="w-8 h-8 text-slate2/50 mx-auto"/><div className="font-medium text-[14px] mt-3">No {config.title.toLowerCase()} yet</div><div className="text-[12px] text-slate2 mt-1">Use the button above to add the first record.</div></div>:<div className="divide-y divide-line">{records.map((record)=><div key={record[config.idField]} className="p-4 md:p-5 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center"><RecordIcon collection={collection}/></div><div className="flex-1 min-w-0"><div className="font-medium text-[14px] truncate">{record[config.nameField]}</div><div className="text-[11.5px] text-slate2 mt-1 truncate">{record.summary||record.description||record.role||record.stage||record.location||record.type||'Linked to this startup'}</div></div><Status value={record[config.statusField]||record.status}/><button onClick={()=>startEdit(record)} className="btn btn-outline btn-sm">Edit</button><button onClick={()=>remove(record)} className="w-9 h-9 rounded-lg border border-line text-coral flex items-center justify-center"><Trash2 className="w-4 h-4"/></button></div>)}</div>}</div>
  </div>;
}

function ManagerField({ name, label, type, required, options, value, onChange }) {
  const wide=type==='textarea';
  if(type==='checkbox')return <div><span className="block text-[12px] text-slate2 mb-1.5">{label}</span><label className="h-[46px] border border-line rounded-xl px-3 flex items-center justify-between"><span className="text-[13px]">Enabled</span><input type="checkbox" checked={Boolean(value)} onChange={(e)=>onChange(e.target.checked)} className="w-5 h-5 accent-[#D94B3D]"/></label></div>;
  return <label className={wide?'md:col-span-2':''}><span className="block text-[12px] text-slate2 mb-1.5">{label}{required&&<span className="text-coral"> *</span>}</span>{type==='textarea'?<textarea required={required} value={value||''} onChange={(e)=>onChange(e.target.value)} className={`${INPUT} min-h-[110px]`}/>:type==='select'?<select required={required} value={value||''} onChange={(e)=>onChange(e.target.value)} className={INPUT}>{options.map((option)=><option key={option}>{option}</option>)}</select>:<input required={required} type={type||'text'} value={value??''} onChange={(e)=>onChange(e.target.value)} className={INPUT}/>}</label>;
}

function RecordIcon({collection}) {const Icon=collection==='pitches'?FileText:collection==='founders'?UserRound:collection==='rounds'?CalendarDays:collection==='jobs'?BriefcaseBusiness:Rocket;return <Icon className="w-4 h-4 text-coral"/>;}
function Status({value}) {const cls=['Approved','Published','Active'].includes(value)?'tag-emerald':['Rejected','Archived','Revoked'].includes(value)?'tag-coral':'tag-amber';return <span className={`tag ${cls}`}>{value||'Pending'}</span>;}
function Field({label,children,wide}) {return <label className={wide?'md:col-span-2':''}><span className="block text-[12px] text-slate2 mb-1.5">{label}</span>{children}</label>;}
const INPUT='w-full bg-white border border-line rounded-xl px-3 py-3 text-[13.5px] outline-none focus:border-ink';

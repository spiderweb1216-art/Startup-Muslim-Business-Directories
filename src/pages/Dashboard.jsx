import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import {
  BadgeCheck, Bookmark, Building2, Eye, FileText, LayoutDashboard, LogOut, Menu, Settings,
  Handshake, X, TrendingUp, Plus, Trash2, ShieldCheck, SlidersHorizontal,
} from 'lucide-react';
import { useSaved } from '@/context/SavedContext';
import { StartupLogo, InvestorLogo, Wordmark } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';

const NAV = [
  { id:'overview', label:'Overview', icon:LayoutDashboard },
  { id:'listings', label:'My listings', icon:Building2 },
  { id:'pitch', label:'My pitch submissions', icon:FileText },
  { id:'saved-startups', label:'Saved startups', icon:Bookmark },
  { id:'saved-pitches', label:'Saved pitches', icon:Bookmark },
  { id:'saved-investors', label:'Saved investors', icon:Bookmark },
  { id:'claims', label:'Claim requests', icon:Handshake },
  { id:'settings', label:'Profile settings', icon:Settings },
];

const CHART_DATA = [
  { m:'Feb', views:120 }, { m:'Mar', views:240 }, { m:'Apr', views:300 },
  { m:'May', views:420 }, { m:'Jun', views:580 }, { m:'Jul', views:690 },
];

export default function Dashboard() {
  const [sec,setSec] = useState('overview');
  const [open,setOpen] = useState(false);
  const { saved } = useSaved();
  const { currentUser, logout, updateProfile, isAdmin } = useAuth();
  const { data, removeItem } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const myClaims = useMemo(() => data.claims.filter((claim) =>
    claim.ownerId === currentUser?.id || String(claim.requesterEmail || '').toLowerCase() === String(currentUser?.email || '').toLowerCase()
  ), [data.claims,currentUser]);
  const approvedClaimSlugs = useMemo(() => new Set(myClaims.filter((claim)=>claim.status==='Approved').map((claim)=>claim.startupSlug)), [myClaims]);
  const myListings = useMemo(() => data.startups.filter((startup) => startup.ownerId === currentUser?.id || approvedClaimSlugs.has(startup.slug)), [data.startups,currentUser,approvedClaimSlugs]);
  const ownedSlugs = useMemo(() => new Set(myListings.map((startup)=>startup.slug)), [myListings]);
  const myPitches = useMemo(() => data.pitches.filter((pitch) => pitch.ownerId === currentUser?.id || ownedSlugs.has(pitch.startupSlug)), [data.pitches,currentUser,ownedSlugs]);

  const savedStartups = useMemo(() => data.startups.filter((startup)=>saved.startups.includes(startup.slug)), [data.startups,saved.startups]);
  const savedPitches = useMemo(() => data.pitches.filter((pitch)=>saved.pitches.includes(pitch.id)), [data.pitches,saved.pitches]);
  const savedInvestors = useMemo(() => data.investors.filter((investor)=>saved.investors.includes(investor.slug)), [data.investors,saved.investors]);

  const signOut=()=>{logout();navigate('/');};
  const firstListing=myListings[0];

  return <div className="wrap pt-8 pb-24" data-testid="dashboard-page">
    <div className="flex items-center gap-3 md:hidden mb-4"><button onClick={()=>setOpen(true)} className="w-9 h-9 rounded-full border border-line bg-white flex items-center justify-center"><Menu className="w-4 h-4"/></button><div className="font-display text-[22px]">Dashboard</div></div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className={`md:col-span-3 ${open?'fixed inset-0 z-50 bg-black/50':'hidden md:block'}`} onClick={()=>setOpen(false)}><div className={`${open?'absolute right-0 top-0 h-full w-72 bg-canvas p-6 overflow-y-auto':''} md:relative md:h-auto md:w-auto md:p-0`} onClick={(e)=>e.stopPropagation()}>{open&&<div className="flex items-center justify-between mb-4"><Wordmark/><button className="w-9 h-9 rounded-full border border-line bg-white flex items-center justify-center" onClick={()=>setOpen(false)}><X className="w-4 h-4"/></button></div>}<div className="bg-white border border-line rounded-2xl p-2"><div className="p-4 border-b border-line flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-coralSoft text-coral flex items-center justify-center font-semibold">{currentUser?.name?.slice(0,1)}</div><div className="min-w-0"><div className="text-[13.5px] font-medium truncate">{currentUser?.name}</div><div className="text-[11.5px] text-slate2 truncate">{currentUser?.email}</div></div></div><nav className="p-2 space-y-1">{NAV.map(({id,label,icon:Icon})=><button key={id} onClick={()=>{setSec(id);setOpen(false);}} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[13.5px] ${sec===id?'bg-canvas text-ink font-medium':'text-slate2 hover:bg-canvas/60'}`}><Icon className="w-4 h-4"/>{label}</button>)}{isAdmin&&<Link to="/admin" className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[13.5px] text-coral hover:bg-canvas/60"><ShieldCheck className="w-4 h-4"/> Admin dashboard</Link>}<button onClick={signOut} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[13.5px] text-slate2 hover:bg-canvas/60"><LogOut className="w-4 h-4"/> Sign out</button></nav></div></div></aside>

      <section className="md:col-span-9 space-y-6">
        {sec==='overview'&&<>
          <div><div className="eyebrow">Member workspace</div><h1 className="font-display text-[30px] mt-1">Welcome, {currentUser?.name?.split(' ')[0]}.</h1><p className="text-[13px] text-slate2 mt-1">Manage owned and claimed listings, publish ecosystem records, review saved profiles, and update your account.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Stat label="Listings" value={String(myListings.length)} icon={Building2}/><Stat label="Pitches" value={String(myPitches.length)} icon={FileText}/><Stat label="Saved" value={String(savedStartups.length+savedPitches.length+savedInvestors.length)} icon={Bookmark}/><Stat label="Total views" value={String(myListings.reduce((sum,item)=>sum+Number(item.views||0),0))} icon={TrendingUp}/></div>
          {firstListing&&<div className="border border-emerald/20 bg-emeraldSoft rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"><div className="w-10 h-10 rounded-xl bg-white text-emerald flex items-center justify-center"><BadgeCheck className="w-5 h-5"/></div><div className="flex-1"><div className="font-medium text-[14px]">You can manage {firstListing.name}</div><div className="text-[12px] text-slate2 mt-1">Update its profile, team, pitches, funding rounds, jobs, and opportunities from one workspace.</div></div><Link to={`/dashboard/startups/${firstListing.slug}`} className="btn btn-coral"><SlidersHorizontal className="w-4 h-4"/> Manage startup</Link></div>}
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="border border-line bg-white rounded-2xl p-6"><div className="flex items-center justify-between"><div className="font-display text-[20px]">Profile views</div><div className="text-[12.5px] text-slate2">Last six months</div></div><div className="h-64 mt-4"><ResponsiveContainer><LineChart data={CHART_DATA}><CartesianGrid strokeDasharray="4 4" stroke="#E8E3DA"/><XAxis dataKey="m" stroke="#696969" fontSize={12} tickLine={false} axisLine={false}/><YAxis stroke="#696969" fontSize={12} tickLine={false} axisLine={false}/><Tooltip/><Line type="monotone" dataKey="views" stroke="#C93636" strokeWidth={2} dot={{r:3,fill:'#C93636'}}/></LineChart></ResponsiveContainer></div></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Quick title="Submit another startup" text="Add a new company profile to the review queue." to="/submit-startup" icon={Building2}/><Quick title="Share a funding pitch" text="Submit a private or public investment pitch." to={firstListing?`/submit-pitch?startup=${firstListing.slug}`:'/submit-pitch'} icon={FileText}/></div>
        </>}

        {sec==='listings'&&<Panel title="My listings" action={<Link to="/submit-startup" className="btn btn-coral btn-sm"><Plus className="w-4 h-4"/> Add listing</Link>}><div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{myListings.map((startup)=>{
          const claimed=approvedClaimSlugs.has(startup.slug)||startup.claimed;
          const canDelete=startup.ownerId===currentUser?.id&&!claimed&&['Pending','Draft','Rejected'].includes(startup.status);
          return <div key={startup.slug} className="p-4 border border-line rounded-xl"><div className="flex items-center gap-3"><StartupLogo startup={startup}/><div className="flex-1 min-w-0"><div className="font-medium text-[14px] truncate">{startup.name}</div><div className="text-[11.5px] text-slate2">{startup.category} · {startup.country}</div><div className="flex gap-1.5 mt-2"><span className={`tag ${startup.status==='Published'?'tag-emerald':startup.status==='Rejected'?'tag-coral':'tag-amber'}`}>{startup.status}</span>{claimed&&<span className="tag tag-emerald"><BadgeCheck className="w-3 h-3"/> Claimed</span>}</div></div></div><div className="mt-4 grid grid-cols-2 gap-2"><Link to={`/dashboard/startups/${startup.slug}`} className="btn btn-coral btn-sm justify-center"><SlidersHorizontal className="w-3.5 h-3.5"/> Manage</Link><Link to={`/startups/${startup.slug}`} className="btn btn-outline btn-sm justify-center"><Eye className="w-3.5 h-3.5"/> View</Link></div>{canDelete&&<button onClick={async()=>{if(!window.confirm(`Delete ${startup.name}?`))return;try{await removeItem('startups',startup.slug,currentUser?.name);toast('Listing deleted.',{type:'success'});}catch(error){toast(error.message||'The listing could not be deleted.',{type:'warning'});}}} className="mt-2 w-full btn btn-outline btn-sm justify-center text-coral"><Trash2 className="w-3.5 h-3.5"/> Delete pending listing</button>}</div>;
        })}{myListings.length===0&&<Empty text="No startup is owned by this account yet. Submit a new listing or claim an existing startup profile."/>}</div></Panel>}

        {sec==='pitch'&&<Panel title="My pitch submissions" action={<Link to={firstListing?`/submit-pitch?startup=${firstListing.slug}`:'/submit-pitch'} className="btn btn-coral btn-sm"><Plus className="w-4 h-4"/> Submit pitch</Link>}><div className="space-y-3">{myPitches.map((pitch)=><div key={pitch.id} className="p-4 border border-line rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="font-medium">{pitch.pitchTitle}</div><div className="text-[12px] text-slate2 mt-1">{pitch.startupSlug} · ${Number(pitch.requested||0).toLocaleString()} requested · {pitch.equity||0}% equity</div></div><div className="flex items-center gap-2"><span className={`tag ${pitch.reviewStatus==='Approved'?'tag-emerald':pitch.reviewStatus==='Rejected'?'tag-coral':'tag-amber'}`}>{pitch.reviewStatus}</span>{ownedSlugs.has(pitch.startupSlug)&&<Link to={`/dashboard/startups/${pitch.startupSlug}`} className="btn btn-outline btn-sm">Manage</Link>}</div></div>)}{myPitches.length===0&&<Empty text="You have not submitted a pitch yet."/>}</div></Panel>}

        {sec==='saved-startups'&&<SavedStartups items={savedStartups}/>} 
        {sec==='saved-pitches'&&<Panel title="Saved pitches"><div className="space-y-2">{savedPitches.map((pitch)=><Link key={pitch.id} to={`/startups/${pitch.startupSlug}#pitch`} className="block p-4 border border-line rounded-xl hover:border-coral/30"><div className="font-medium">{pitch.pitchTitle}</div><div className="text-[12px] text-slate2">${Number(pitch.requested||0).toLocaleString()} requested</div></Link>)}{savedPitches.length===0&&<Empty text="No pitches saved yet."/>}</div></Panel>}
        {sec==='saved-investors'&&<Panel title="Saved investors"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{savedInvestors.map((investor)=><Link key={investor.slug} to={`/investors/${investor.slug}`} className="flex items-center gap-3 p-3 border border-line rounded-xl hover:border-coral/30"><InvestorLogo investor={investor}/><div><div className="font-medium text-[14px]">{investor.name}</div><div className="text-[12px] text-slate2">{investor.type} · {investor.country}</div></div></Link>)}{savedInvestors.length===0&&<Empty text="No investors saved yet."/>}</div></Panel>}
        {sec==='claims'&&<Panel title="Claim requests"><div className="space-y-3">{myClaims.map((claim)=><div key={claim.id} className="p-4 border border-line rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="font-medium">{claim.startupSlug}</div><div className="text-[12px] text-slate2">{claim.role} · submitted {claim.submitted}</div>{claim.notes&&<div className="text-[11.5px] text-slate2 mt-2">{claim.notes}</div>}</div><div className="flex items-center gap-2"><span className={`tag ${claim.status==='Approved'?'tag-emerald':['Rejected','Revoked'].includes(claim.status)?'tag-coral':'tag-amber'}`}>{claim.status}</span>{claim.status==='Approved'&&<Link to={`/dashboard/startups/${claim.startupSlug}`} className="btn btn-coral btn-sm">Manage profile</Link>}</div></div>)}{myClaims.length===0&&<Empty text="No claim requests are linked to this account."/>}</div></Panel>}
        {sec==='settings'&&<ProfileSettings user={currentUser} updateProfile={updateProfile} toast={toast}/>} 
      </section>
    </div>
  </div>;
}

function Stat({label,value,icon:Icon}) {return <div className="border border-line bg-white rounded-2xl p-4"><div className="flex items-center justify-between"><div className="eyebrow">{label}</div><Icon className="w-4 h-4 text-coral"/></div><div className="font-display text-[26px] mt-1">{value}</div></div>;}
function Panel({title,action,children}) {return <div className="border border-line bg-white rounded-2xl p-6"><div className="flex items-center justify-between gap-3"><div className="font-display text-[20px]">{title}</div>{action}</div><div className="mt-4">{children}</div></div>;}
function Empty({text}) {return <div className="md:col-span-2 text-center p-8 text-[13px] text-slate2 border border-dashed border-line rounded-xl">{text}</div>;}
function Quick({title,text,to,icon:Icon}) {return <Link to={to} className="border border-line bg-white rounded-2xl p-5 flex items-start gap-3 hover:border-coral/30"><div className="w-10 h-10 rounded-xl bg-coralSoft text-coral flex items-center justify-center"><Icon className="w-4 h-4"/></div><div><div className="font-medium text-[14px]">{title}</div><div className="text-[12px] text-slate2 mt-1">{text}</div></div></Link>;}
function SavedStartups({items}) {return <Panel title="Saved startups"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{items.map((startup)=><Link key={startup.slug} to={`/startups/${startup.slug}`} className="flex items-center gap-3 p-3 border border-line rounded-xl hover:border-coral/30"><StartupLogo startup={startup}/><div><div className="font-medium text-[14px]">{startup.name}</div><div className="text-[12px] text-slate2">{startup.category}</div></div></Link>)}{items.length===0&&<Empty text="No startups saved yet."/>}</div></Panel>;}
function ProfileSettings({user,updateProfile,toast}) {const [form,setForm]=useState({name:user.name,email:user.email,country:user.country||'',role:user.role});const submit=async(e)=>{e.preventDefault();const result=await updateProfile(form);toast(result.ok?'Profile updated.':result.message,{type:result.ok?'success':'warning'});};return <Panel title="Profile settings"><form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label="Full name"><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className={input}/></Field><Field label="Email"><input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className={input}/></Field><Field label="Country"><input value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} className={input}/></Field><Field label="Role"><input value={form.role} disabled className={`${input} bg-canvas`}/></Field><div className="md:col-span-2"><button className="btn btn-coral">Save changes</button></div></form></Panel>;}
const input='w-full bg-white border border-line rounded-xl p-2.5 outline-none focus:border-ink';
function Field({label,children}) {return <label><span className="text-[12px] text-slate2">{label}</span><div className="mt-1">{children}</div></label>;}

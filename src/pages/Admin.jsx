import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, BarChart3, Bell, BookOpen, BriefcaseBusiness, Building2, CheckCircle2,
  ChevronDown, CircleDollarSign, ClipboardCheck, Database, Download, Edit3, Eye,
  FileText, FolderOpen, Globe2, Handshake, Image, Inbox, LayoutDashboard, Layers3,
  LogOut, Mail, Menu, MessageSquare, MoreHorizontal, Plus, RefreshCcw, Rocket,
  Search, Settings, ShieldCheck, Star, Trash2, Upload, UserRound, Users2, X,
  Copy, ExternalLink, Save, AlertTriangle, Filter, Check, Newspaper, Send,
} from 'lucide-react';
import {
  BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useData, slugify } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Wordmark } from '@/components/common/Logo';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      ['overview', 'Overview', LayoutDashboard],
      ['activity', 'Activity log', Activity],
    ],
  },
  {
    label: 'Directory',
    items: [
      ['startups', 'Startups', Building2],
      ['founders', 'Founders', UserRound],
      ['investors', 'Investors', Handshake],
      ['categories', 'Categories', Layers3],
    ],
  },
  {
    label: 'Capital & work',
    items: [
      ['pitches', 'Pitch submissions', FileText],
      ['rounds', 'Funding rounds', CircleDollarSign],
      ['jobs', 'Jobs', BriefcaseBusiness],
      ['opportunities', 'Opportunities', Rocket],
      ['claims', 'Claim requests', ClipboardCheck],
    ],
  },
  {
    label: 'Audience',
    items: [
      ['users', 'Users', Users2],
      ['messages', 'Contact messages', MessageSquare],
      ['subscribers', 'Newsletter', Mail],
    ],
  },
  {
    label: 'Website',
    items: [
      ['pages', 'Pages & SEO', Newspaper],
      ['media', 'Media library', Image],
      ['settings', 'Site settings', Settings],
      ['data-tools', 'Backup & data', Database],
    ],
  },
];

const F = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const statusOptions = ['Published', 'Pending', 'Draft', 'Rejected', 'Archived'];

const CONFIGS = {
  startups: {
    title: 'Startups', singular: 'startup', idField: 'slug', nameField: 'name', description: 'Manage every startup profile, publication state, verification, features, funding, founders, media, and ownership.',
    columns: [
      ['name','Startup'], ['category','Category'], ['country','Country'], ['stage','Stage'], ['status','Status'], ['featured','Featured'],
    ],
    fields: [
      F('name','Startup name','text',{required:true}), F('slug','URL slug'), F('tagline','Tagline','textarea',{span:2}),
      F('category','Category','dynamic-category'), F('country','Country'), F('flag','Flag / emoji'),
      F('stage','Company stage','select',{options:['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped']}),
      F('fundingStage','Funding stage','select',{options:['Pre-Seed','Seed','Series A','Series B','Series C+','Bootstrapped']}),
      F('businessModel','Business model'), F('status','Publication status','select',{options:statusOptions}),
      F('verified','Verified','checkbox'), F('featured','Featured','checkbox'), F('openToFunding','Open to funding','checkbox'),
      F('hiring','Hiring','checkbox'), F('pitching','Pitching','checkbox'), F('totalRaised','Total raised (USD)','number'),
      F('foundedYear','Founded year','number'), F('teamSize','Team size','number'), F('hq','Headquarters'),
      F('revenue','Revenue'), F('users','Users / customers'), F('growth','Growth'),
      F('website','Website URL','url'), F('banner','Banner image URL','url',{span:2}),
      F('description','Description','textarea',{span:2}), F('founderSlugs','Founder slugs','csv',{span:2}),
      F('productImages','Product image URLs','csv',{span:2}), F('logo.mark','Logo initials'), F('logo.color','Logo color','color'),
      F('ownerId','Owner user ID'), F('addedAt','Added date','date'), F('views','Profile views','number'),
    ],
  },
  founders: {
    title:'Founders', singular:'founder', idField:'slug', nameField:'name', description:'Manage founder biographies, linked companies, visibility, verification, social links, skills, and availability.',
    columns:[['name','Founder'],['role','Role'],['startupSlug','Startup'],['country','Country'],['status','Status'],['verified','Verified']],
    fields:[
      F('name','Full name','text',{required:true}),F('slug','URL slug'),F('role','Role'),F('startupSlug','Startup slug'),
      F('country','Country'),F('flag','Flag / emoji'),F('industry','Industry'),F('status','Publication status','select',{options:statusOptions}),
      F('verified','Verified','checkbox'),F('bio','Short bio','textarea',{span:2}),F('story','Founder story','textarea',{span:2}),
      F('experience','Experience'),F('photo','Photo URL','url'),F('linkedin','LinkedIn URL','url'),
      F('skills','Skills','csv',{span:2}),F('previousStartups','Previous startups','csv'),F('openTo','Open to','csv'),
    ],
  },
  investors: {
    title:'Investors', singular:'investor', idField:'slug', nameField:'name', description:'Manage investor profiles, investment thesis, ticket range, stage focus, portfolio, verification, and featured placement.',
    columns:[['name','Investor'],['type','Type'],['country','Country'],['ticketRange','Ticket range'],['status','Status'],['featured','Featured']],
    fields:[
      F('name','Investor name','text',{required:true}),F('slug','URL slug'),F('type','Investor type'),F('country','Country'),F('flag','Flag / emoji'),
      F('status','Publication status','select',{options:statusOptions}),F('verified','Verified','checkbox'),F('featured','Featured','checkbox'),F('halalFocus','Halal focus','checkbox'),
      F('ticketRange','Ticket range'),F('portfolioCount','Portfolio count','number'),F('website','Website URL','url'),
      F('description','Description','textarea',{span:2}),F('focus','Sector focus','csv',{span:2}),F('stageFocus','Stage focus','csv'),F('portfolio','Portfolio startup slugs','csv',{span:2}),
      F('logo.mark','Logo initials'),F('logo.color','Logo color','color'),
    ],
  },
  pitches: {
    title:'Pitch submissions', singular:'pitch', idField:'id', nameField:'pitchTitle', description:'Review and manage fundraising pitches, requested capital, equity, valuation, visibility, approval, and featured placement.',
    columns:[['pitchTitle','Pitch'],['startupSlug','Startup'],['requested','Requested'],['equity','Equity'],['reviewStatus','Review'],['visibility','Visibility']],
    fields:[
      F('pitchTitle','Pitch title','text',{required:true,span:2}),F('startupSlug','Startup slug'),F('status','Pitch status','select',{options:['Active','Closed','Archived']}),
      F('reviewStatus','Review status','select',{options:['Pending','Approved','Rejected']}),F('visibility','Visibility','select',{options:['Public','Private','Members only']}),
      F('featured','Featured','checkbox'),F('requested','Requested amount (USD)','number'),F('equity','Equity (%)','number'),F('valuation','Valuation (USD)','number'),
      F('minTicket','Minimum ticket (USD)','number'),F('submitted','Submitted date','date'),F('views','Views','number'),F('ownerId','Owner user ID'),
      F('summary','Summary','textarea',{span:2}),F('problem','Problem','textarea',{span:2}),F('solution','Solution','textarea',{span:2}),
      F('market','Market'),F('businessModel','Business model'),F('traction','Traction','textarea',{span:2}),F('useOfFunds','Use of funds','textarea',{span:2}),
    ],
  },
  rounds: {
    title:'Funding rounds', singular:'funding round', idField:'id', nameField:'roundName', description:'Track disclosed rounds, lead investors, syndicates, valuation, dates, notes, and public visibility.',
    columns:[['startupSlug','Startup'],['roundName','Round'],['amount','Amount'],['valuation','Valuation'],['date','Date'],['status','Status']],
    fields:[
      F('startupSlug','Startup slug','text',{required:true}),F('roundName','Round name','text',{required:true}),F('stage','Stage'),F('date','Date','date'),
      F('amount','Amount (USD)','number'),F('valuation','Valuation (USD)','number'),F('leadInvestorSlug','Lead investor slug'),F('status','Publication status','select',{options:statusOptions}),
      F('investorSlugs','Investor slugs','csv',{span:2}),F('notes','Notes','textarea',{span:2}),
    ],
  },
  jobs: {
    title:'Jobs', singular:'job', idField:'id', nameField:'title', description:'Publish and manage ecosystem jobs, workplace arrangement, employment type, seniority, applications, and status.',
    columns:[['title','Job title'],['startupSlug','Startup'],['location','Location'],['arrangement','Arrangement'],['type','Type'],['status','Status']],
    fields:[
      F('title','Job title','text',{required:true}),F('startupSlug','Startup slug','text',{required:true}),F('location','Location'),
      F('arrangement','Arrangement','select',{options:['Remote','Hybrid','On-site']}),F('type','Employment type','select',{options:['Full-time','Part-time','Contract','Internship','Temporary']}),
      F('level','Seniority','select',{options:['Junior','Mid','Senior','Lead','Executive']}),F('posted','Posted date','date'),F('status','Publication status','select',{options:statusOptions}),
      F('applications','Applications','number'),F('description','Description','textarea',{span:2}),
    ],
  },
  opportunities: {
    title:'Opportunities', singular:'opportunity', idField:'id', nameField:'title', description:'Manage accelerators, fellowships, grants, competitions, founder programs, deadlines, eligibility, and featured placement.',
    columns:[['title','Opportunity'],['type','Type'],['organization','Organization'],['country','Country'],['deadline','Deadline'],['status','Status']],
    fields:[
      F('title','Title','text',{required:true,span:2}),F('type','Opportunity type','select',{options:['Accelerator','Fellowship','Grant','Competition','Demo Day','Founder Program','Event']}),
      F('organization','Organization'),F('country','Country'),F('remote','Remote','checkbox'),F('deadline','Deadline','date'),
      F('industry','Industry'),F('founderStage','Founder stage'),F('status','Publication status','select',{options:statusOptions}),F('featured','Featured','checkbox'),
      F('image','Image URL','url',{span:2}),F('description','Description','textarea',{span:2}),
    ],
  },
  claims: {
    title:'Claim requests', singular:'claim request', idField:'id', nameField:'requester', description:'Review ownership claims. Approving a claim automatically assigns the startup to that user, unlocks their management workspace, and closes competing claims.',
    columns:[['requester','Requester'],['startupSlug','Startup'],['role','Role'],['submitted','Submitted'],['status','Status']],
    fields:[
      F('requester','Requester name','text',{required:true}),F('requesterEmail','Requester email','email'),F('startupSlug','Startup','dynamic-startup',{required:true}),F('role','Role'),F('submitted','Submitted date','date'),
      F('status','Status','select',{options:['Pending','Under Review','More Information Required','Approved','Rejected','Revoked','Cancelled']}),F('notes','Internal notes / decision reason','textarea',{span:2}),
    ],
  },
  categories: {
    title:'Categories', singular:'category', idField:'slug', nameField:'name', description:'Control directory taxonomy, display order, category descriptions, icons, accents, and homepage features.',
    columns:[['name','Category'],['slug','Slug'],['order','Order'],['status','Status'],['featured','Featured']],
    fields:[
      F('name','Category name','text',{required:true}),F('slug','URL slug'),F('icon','Lucide icon name'),F('accent','Accent color','color'),
      F('order','Display order','number'),F('status','Status','select',{options:['Active','Inactive']}),F('featured','Featured','checkbox'),F('description','Description','textarea',{span:2}),
    ],
  },
  users: {
    title:'Users', singular:'user', idField:'id', nameField:'name', description:'Manage administrators, founders, investors, partners, member access, account status, verification, and secure database-backed credentials.',
    columns:[['name','User'],['email','Email'],['role','Role'],['country','Country'],['status','Status'],['verified','Verified']],
    fields:[
      F('name','Full name','text',{required:true}),F('email','Email','email',{required:true}),F('password','Password','text'),F('role','Role','select',{options:['Admin','Founder','Investor','Ecosystem Partner','General User']}),
      F('country','Country'),F('status','Account status','select',{options:['Active','Blocked','Pending']}),F('verified','Verified','checkbox'),F('joinedAt','Joined date','date'),
    ],
  },
  messages: {
    title:'Contact messages', singular:'message', idField:'id', nameField:'name', description:'Read, assign, update, and delete messages submitted through the public contact form.',
    columns:[['name','Sender'],['email','Email'],['topic','Topic'],['submittedAt','Received'],['status','Status']],
    fields:[
      F('name','Sender name','text',{required:true}),F('email','Email','email'),F('topic','Topic'),F('status','Status','select',{options:['Unread','Read','Replied','Archived']}),
      F('submittedAt','Received at','datetime-local'),F('message','Message','textarea',{span:2}),
    ],
  },
  subscribers: {
    title:'Newsletter subscribers', singular:'subscriber', idField:'id', nameField:'email', description:'Manage newsletter contacts, subscription state, source attribution, and exportable audience data.',
    columns:[['email','Email'],['source','Source'],['subscribedAt','Subscribed'],['status','Status']],
    fields:[
      F('email','Email','email',{required:true}),F('source','Source'),F('subscribedAt','Subscribed date','date'),F('status','Status','select',{options:['Subscribed','Unsubscribed','Bounced']}),
    ],
  },
  pages: {
    title:'Pages & SEO', singular:'page', idField:'slug', nameField:'title', description:'Manage page titles, URL slugs, search metadata, publication status, and basic content records for future CMS integration.',
    columns:[['title','Page'],['slug','Slug'],['seoTitle','SEO title'],['status','Status'],['updatedAt','Updated']],
    fields:[
      F('title','Page title','text',{required:true}),F('slug','URL slug'),F('seoTitle','SEO title','text',{span:2}),F('status','Publication status','select',{options:statusOptions}),
      F('metaDescription','Meta description','textarea',{span:2}),F('content','Page content','textarea',{span:2}),
    ],
  },
  media: {
    title:'Media library', singular:'media item', idField:'id', nameField:'name', description:'Store image and document references, accessible alt text, and save uploaded image data in MySQL.',
    columns:[['name','Media'],['type','Type'],['url','URL / file'],['alt','Alt text'],['uploadedAt','Uploaded']],
    fields:[
      F('name','Media name','text',{required:true}),F('type','Type','select',{options:['Image','Document','Video']}),F('url','File URL / local upload','file-url',{span:2}),
      F('alt','Alt text','text',{span:2}),F('uploadedAt','Uploaded date','date'),
    ],
  },
};

function formatCell(value, key) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (value == null || value === '') return '—';
  if (['requested','valuation','amount','totalRaised','minTicket'].includes(key)) {
    const n = Number(value);
    if (n >= 1000000) return `$${(n/1000000).toFixed(n%1000000===0?0:1)}M`;
    if (n >= 1000) return `$${(n/1000).toFixed(0)}K`;
    return `$${n}`;
  }
  if (String(value).length > 48) return `${String(value).slice(0,45)}…`;
  return String(value);
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
function setPath(obj, path, value) {
  const parts = path.split('.');
  const next = { ...obj };
  let cursor = next;
  parts.forEach((key, index) => {
    if (index === parts.length - 1) cursor[key] = value;
    else {
      cursor[key] = { ...(cursor[key] || {}) };
      cursor = cursor[key];
    }
  });
  return next;
}

export default function Admin() {
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, stats, databaseStatus } = useData();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const sectionLabel = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const found = group.items.find(([id]) => id === section);
      if (found) return found[1];
    }
    return 'Admin';
  }, [section]);

  return (
    <div className="admin-shell bg-[#F3F0E8] min-h-screen" data-testid="admin-page">
      <AnimatePresence>
        {sidebarOpen && <motion.button initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      </AnimatePresence>
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="h-[72px] px-5 flex items-center justify-between border-b border-white/10">
          <Wordmark variant="dark" />
          <button className="lg:hidden text-white/70" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 py-5 overflow-y-auto thin-scroll h-[calc(100vh-145px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="px-3 mb-2 text-[9.5px] uppercase tracking-[.18em] text-white/35 mono">{group.label}</div>
              <div className="space-y-1">
                {group.items.map(([id, label, Icon]) => (
                  <button key={id} onClick={() => { setSection(id); setSidebarOpen(false); }} className={`admin-nav-item ${section===id?'active':''}`}>
                    <Icon className="w-4 h-4" /><span>{label}</span>
                    {id==='messages' && stats.unreadMessages > 0 && <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-coral text-white text-[10px] flex items-center justify-center">{stats.unreadMessages}</span>}
                    {id==='startups' && stats.pendingStartups > 0 && <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-white/10 text-white/80 text-[10px] flex items-center justify-center">{stats.pendingStartups}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute left-0 right-0 bottom-0 p-4 border-t border-white/10 bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-coral text-white flex items-center justify-center font-semibold">{currentUser?.name?.slice(0,1) || 'A'}</div>
            <div className="min-w-0 flex-1"><div className="text-white text-[12.5px] truncate">{currentUser?.name}</div><div className="text-white/40 text-[10.5px] truncate">{currentUser?.email}</div></div>
            <button onClick={() => { logout(); navigate('/'); }} className="text-white/40 hover:text-white" title="Sign out"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="h-[72px] sticky top-0 z-30 bg-[#F3F0E8]/95 backdrop-blur border-b border-line px-4 md:px-7 flex items-center gap-4">
          <button className="lg:hidden w-9 h-9 border border-line bg-white rounded-lg flex items-center justify-center" onClick={() => setSidebarOpen(true)}><Menu className="w-4 h-4" /></button>
          <div><div className="eyebrow">Control panel</div><h1 className="font-display text-[21px] mt-0.5">{sectionLabel}</h1></div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] ${databaseStatus==='connected'?'bg-emerald-50 border-emerald-200 text-emerald-700':databaseStatus==='error'?'bg-red-50 border-red-200 text-red-700':'bg-white border-line text-slate2'}`}><span className={`w-2 h-2 rounded-full ${databaseStatus==='connected'?'bg-emerald-500':databaseStatus==='error'?'bg-red-500':'bg-amber-500'}`}></span>{databaseStatus==='connected'?'MySQL connected':databaseStatus==='error'?'MySQL offline':'Checking MySQL'}</div>
            <button onClick={() => setSection('messages')} className="relative w-9 h-9 border border-line bg-white rounded-lg flex items-center justify-center text-slate2 hover:text-ink"><Bell className="w-4 h-4" />{stats.unreadMessages>0&&<span className="absolute -right-1 -top-1 w-4 h-4 bg-coral text-white text-[9px] rounded-full flex items-center justify-center">{stats.unreadMessages}</span>}</button>
            <Link to="/" className="btn btn-outline btn-sm bg-white">View website <ExternalLink className="w-3.5 h-3.5" /></Link>
          </div>
        </header>

        <main className="p-4 md:p-7 max-w-[1600px] mx-auto">
          {section === 'overview' && <Overview setSection={setSection} />}
          {section === 'activity' && <ActivityLog />}
          {CONFIGS[section] && <EntityManager collection={section} config={CONFIGS[section]} />}
          {section === 'settings' && <SiteSettings />}
          {section === 'data-tools' && <DataTools />}
        </main>
      </div>
    </div>
  );
}

function Overview({ setSection }) {
  const { data, stats, updateItem } = useData();
  const { toast } = useToast();
  const categoryData = data.categories.slice(0,7).map((c) => ({ name:c.name.split(' ')[0], value:data.startups.filter((s)=>s.category===c.name).length }));
  const monthly = [
    {m:'Feb',listings:12,users:38},{m:'Mar',listings:18,users:52},{m:'Apr',listings:24,users:65},
    {m:'May',listings:29,users:81},{m:'Jun',listings:35,users:94},{m:'Jul',listings:42,users:118},
  ];
  const cards = [
    ['Total startups',stats.startups,Building2,'startups'],['Pending review',stats.pendingStartups,ClipboardCheck,'startups'],
    ['Founders',stats.founders,UserRound,'founders'],['Investors',stats.investors,Handshake,'investors'],
    ['Active pitches',stats.pitches,FileText,'pitches'],['Funding tracked',formatCell(stats.funding,'amount'),CircleDollarSign,'rounds'],
    ['Open jobs',stats.jobs,BriefcaseBusiness,'jobs'],['Registered users',stats.users,Users2,'users'],
  ];
  const pending = data.startups.filter((x)=>x.status==='Pending').slice(0,5);
  const pendingPitches = data.pitches.filter((x)=>x.reviewStatus==='Pending').slice(0,4);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div><div className="eyebrow">Today’s control center</div><h2 className="font-display text-[30px] mt-1">Ecosystem overview</h2><p className="text-slate2 text-[13.5px] mt-1">All directory records, submissions, users, audience data, and site controls are connected to MySQL.</p></div>
        <button onClick={() => setSection('startups')} className="btn btn-coral"><Plus className="w-4 h-4" /> Add startup</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {cards.map(([label,value,Icon,target])=><button key={label} onClick={()=>setSection(target)} className="text-left bg-white border border-line rounded-xl p-4 hover:border-coral/40 transition"><div className="flex items-center justify-between"><Icon className="w-4 h-4 text-coral"/><span className="text-[10px] text-slate2">Open</span></div><div className="font-display text-[22px] mt-3 truncate">{value}</div><div className="text-[10.5px] text-slate2 mt-1">{label}</div></button>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white border border-line rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="font-display text-[18px]">Directory growth</div><div className="text-[11.5px] text-slate2">Listings and users added over six months</div></div><BarChart3 className="w-4 h-4 text-slate2"/></div><div className="h-72 mt-4"><ResponsiveContainer><LineChart data={monthly}><CartesianGrid strokeDasharray="4 4" stroke="#E8E3DA"/><XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={11}/><YAxis axisLine={false} tickLine={false} fontSize={11}/><Tooltip/><Legend/><Line type="monotone" dataKey="listings" stroke="#D94B3D" strokeWidth={2}/><Line type="monotone" dataKey="users" stroke="#111827" strokeWidth={2}/></LineChart></ResponsiveContainer></div></div>
        <div className="bg-white border border-line rounded-2xl p-5"><div className="font-display text-[18px]">Category mix</div><div className="text-[11.5px] text-slate2">Published and pending startups</div><div className="h-72 mt-4"><ResponsiveContainer><PieChart><Pie data={categoryData} innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">{categoryData.map((_,i)=><Cell key={i} fill={['#D94B3D','#111827','#2F8F5B','#3B7DD8','#B58208','#7A55C7','#9B8F7B'][i%7]}/>)}</Pie><Tooltip/><Legend iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer></div></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ReviewQueue title="Startup approval queue" empty="No startup submissions are waiting." items={pending} label={(x)=>x.name} meta={(x)=>`${x.category} · ${x.country}`} onApprove={(x)=>{updateItem('startups',x.slug,{status:'Published'});toast(`${x.name} published.`,{type:'success'});}} onReject={(x)=>updateItem('startups',x.slug,{status:'Rejected'})}/>
        <ReviewQueue title="Pitch approval queue" empty="No pitches are waiting." items={pendingPitches} label={(x)=>x.pitchTitle} meta={(x)=>`${x.startupSlug} · ${formatCell(x.requested,'requested')}`} onApprove={(x)=>{updateItem('pitches',x.id,{reviewStatus:'Approved'});toast('Pitch approved.',{type:'success'});}} onReject={(x)=>updateItem('pitches',x.id,{reviewStatus:'Rejected'})}/>
      </div>
      <div className="bg-white border border-line rounded-2xl p-5"><div className="flex items-center justify-between"><div className="font-display text-[18px]">Recent activity</div><button className="text-[12px] underline text-slate2" onClick={()=>setSection('activity')}>View all</button></div><div className="mt-4 divide-y divide-line">{data.activity.slice(0,6).map((a)=><div key={a.id} className="py-3 flex gap-3"><div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center"><Activity className="w-3.5 h-3.5 text-coral"/></div><div className="flex-1"><div className="text-[13px] font-medium">{a.action}</div><div className="text-[11.5px] text-slate2">{a.detail}</div></div><div className="text-[10.5px] text-slate2 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</div></div>)}</div></div>
    </div>
  );
}

function ReviewQueue({ title, empty, items, label, meta, onApprove, onReject }) {
  return <div className="bg-white border border-line rounded-2xl overflow-hidden"><div className="p-5 border-b border-line flex items-center justify-between"><div className="font-display text-[18px]">{title}</div><span className="tag tag-amber">{items.length} pending</span></div>{items.length===0?<div className="p-8 text-center text-[13px] text-slate2">{empty}</div>:<div className="divide-y divide-line">{items.map((item)=><div key={item.id||item.slug} className="p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-canvas flex items-center justify-center"><Rocket className="w-4 h-4 text-coral"/></div><div className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate">{label(item)}</div><div className="text-[11.5px] text-slate2 truncate">{meta(item)}</div></div><button onClick={()=>onApprove(item)} className="w-8 h-8 rounded-lg border border-line hover:border-emerald text-emerald flex items-center justify-center" title="Approve"><Check className="w-4 h-4"/></button><button onClick={()=>onReject(item)} className="w-8 h-8 rounded-lg border border-line hover:border-coral text-coral flex items-center justify-center" title="Reject"><X className="w-4 h-4"/></button></div>)}</div>}</div>;
}

function EntityManager({ collection, config }) {
  const { data, idFields, addItem, updateItem, removeItem, duplicateItem, bulkUpdate, bulkRemove } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const rows = useMemo(() => data[collection] || [], [data, collection]);
  const idField = idFields[collection] || config.idField || 'id';

  const statusValues = useMemo(() => Array.from(new Set(rows.map((x)=>x.status||x.reviewStatus).filter(Boolean))), [rows]);
  const filtered = useMemo(() => rows.filter((item) => {
    const text = Object.values(item).map((v)=>Array.isArray(v)?v.join(' '):typeof v==='object'?JSON.stringify(v):String(v??'')).join(' ').toLowerCase();
    const matchesQ = text.includes(query.toLowerCase());
    const recordStatus = item.status || item.reviewStatus || '';
    return matchesQ && (status==='All' || recordStatus===status);
  }), [rows, query, status]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };
  const save = async (values) => {
    if (editing) await updateItem(collection, editing[idField], values, currentUser?.name);
    else {
      const created=addItem(collection, values, currentUser?.name);
      if(created?.savePromise)await created.savePromise;
    }
    setModalOpen(false); setEditing(null); toast(`${config.singular} ${editing?'updated':'created'}.`, { type:'success' });
  };
  const toggleAll = (checked) => setSelected(checked ? filtered.map((x)=>x[idField]) : []);
  const exportCsv = () => {
    const source = selected.length ? rows.filter((x)=>selected.includes(x[idField])) : filtered;
    if (!source.length) return toast('There is no data to export.', {type:'warning'});
    const keys = Array.from(new Set(source.flatMap(Object.keys)));
    const esc = (v) => `"${String(typeof v==='object' ? JSON.stringify(v) : v ?? '').replaceAll('"','""')}"`;
    const csv = [keys.join(','), ...source.map((r)=>keys.map((k)=>esc(r[k])).join(','))].join('\n');
    downloadBlob(csv, `${collection}-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div><div className="eyebrow">Manage records</div><h2 className="font-display text-[30px] mt-1">{config.title}</h2><p className="text-[13px] text-slate2 max-w-3xl mt-1">{config.description}</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={exportCsv} className="btn btn-outline bg-white"><Download className="w-4 h-4"/> Export CSV</button><button onClick={openCreate} className="btn btn-coral"><Plus className="w-4 h-4"/> Add {config.singular}</button></div>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2"/><input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full border border-line rounded-lg pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-ink" placeholder={`Search ${config.title.toLowerCase()}…`}/></div>
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-slate2"/><select value={status} onChange={(e)=>setStatus(e.target.value)} className="border border-line bg-white rounded-lg px-3 py-2.5 text-[12px] outline-none"><option>All</option>{statusValues.map((s)=><option key={s}>{s}</option>)}</select></div>
          <div className="text-[11.5px] text-slate2 lg:ml-auto">Showing {filtered.length} of {rows.length}</div>
        </div>

        {selected.length > 0 && <div className="px-4 py-3 bg-canvas border-b border-line flex flex-wrap items-center gap-2"><span className="text-[12px] font-medium mr-2">{selected.length} selected</span>{collection==='pitches'?<><button className="btn btn-outline btn-sm bg-white" onClick={()=>bulkUpdate(collection,selected,{reviewStatus:'Approved'},currentUser?.name)}>Approve</button><button className="btn btn-outline btn-sm bg-white" onClick={()=>bulkUpdate(collection,selected,{reviewStatus:'Rejected'},currentUser?.name)}>Reject</button></>:collection==='claims'?<><button className="btn btn-outline btn-sm bg-white text-emerald" onClick={()=>bulkUpdate(collection,selected,{status:'Approved'},currentUser?.name)}>Approve & assign</button><button className="btn btn-outline btn-sm bg-white text-coral" onClick={()=>bulkUpdate(collection,selected,{status:'Rejected'},currentUser?.name)}>Reject</button></>:statusValues.length>0&&<><button className="btn btn-outline btn-sm bg-white" onClick={()=>bulkUpdate(collection,selected,{status:'Published'},currentUser?.name)}>Publish</button><button className="btn btn-outline btn-sm bg-white" onClick={()=>bulkUpdate(collection,selected,{status:'Draft'},currentUser?.name)}>Draft</button></>}<button className="btn btn-outline btn-sm bg-white text-coral" onClick={()=>{if(window.confirm(`Delete ${selected.length} selected records?`)){bulkRemove(collection,selected,currentUser?.name);setSelected([]);}}}><Trash2 className="w-3.5 h-3.5"/> Delete</button></div>}

        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[950px] text-[12.5px]">
            <thead className="bg-canvas/70 text-slate2"><tr><th className="w-10 px-4 py-3 text-left"><input type="checkbox" checked={filtered.length>0&&selected.length===filtered.length} onChange={(e)=>toggleAll(e.target.checked)} /></th>{config.columns.map(([key,label])=><th key={key} className="text-left font-medium px-3 py-3">{label}</th>)}<th className="w-28 px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((item)=><tr key={item[idField]} className="hover:bg-canvas/35"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(item[idField])} onChange={(e)=>setSelected(e.target.checked?[...selected,item[idField]]:selected.filter((id)=>id!==item[idField]))}/></td>{config.columns.map(([key])=><td key={key} className="px-3 py-3 max-w-[260px]"><CellValue field={key} value={getPath(item,key)} item={item}/></td>)}<td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={()=>openEdit(item)} className="admin-icon-btn" title="Edit"><Edit3 className="w-3.5 h-3.5"/></button>{!['claims','users','messages','subscribers','activity'].includes(collection)&&<button onClick={()=>duplicateItem(collection,item[idField],currentUser?.name)} className="admin-icon-btn" title="Duplicate"><Copy className="w-3.5 h-3.5"/></button>}<button onClick={()=>setDeleteTarget(item)} className="admin-icon-btn text-coral" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button></div></td></tr>)}
              {filtered.length===0&&<tr><td colSpan={config.columns.length+2} className="px-5 py-14 text-center text-slate2"><Inbox className="w-7 h-7 mx-auto opacity-40"/><div className="mt-2">No matching records found.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>{modalOpen&&<RecordModal config={config} collection={collection} initial={editing} onClose={()=>{setModalOpen(false);setEditing(null);}} onSave={save}/>}</AnimatePresence>
      <AnimatePresence>{deleteTarget&&<ConfirmDelete label={deleteTarget[config.nameField]||deleteTarget[idField]} onCancel={()=>setDeleteTarget(null)} onConfirm={()=>{removeItem(collection,deleteTarget[idField],currentUser?.name);setDeleteTarget(null);toast('Record deleted.',{type:'success'});}}/>}</AnimatePresence>
    </div>
  );
}

function CellValue({ field, value, item }) {
  if (['status','reviewStatus'].includes(field)) {
    const cls = ['Published','Approved','Active','Subscribed','Replied','Read'].includes(value) ? 'tag-emerald' : ['Rejected','Blocked','Archived','Bounced'].includes(value) ? 'tag-coral' : 'tag-amber';
    return <span className={`tag ${cls}`}>{value||'—'}</span>;
  }
  if (typeof value === 'boolean') return value ? <span className="inline-flex items-center gap-1 text-emerald"><CheckCircle2 className="w-3.5 h-3.5"/> Yes</span> : <span className="text-slate2">No</span>;
  if (field==='name'||field==='title'||field==='pitchTitle') return <div><div className="font-medium text-ink truncate">{value}</div>{item.tagline&&<div className="text-[10.5px] text-slate2 truncate">{item.tagline}</div>}</div>;
  return <span className="truncate block" title={String(value??'')}>{formatCell(value,field)}</span>;
}

function RecordModal({ config, collection, initial, onClose, onSave }) {
  const { data } = useData();
  const [form, setForm] = useState(() => {
    if (initial) return JSON.parse(JSON.stringify(initial));
    const blank = {};
    config.fields.forEach((field) => {
      let value = field.type==='checkbox' ? false : field.type==='number' ? 0 : '';
      if (field.name==='status') value = collection==='categories' ? 'Active' : 'Published';
      if (field.name==='reviewStatus') value = 'Pending';
      if (field.name==='submitted'||field.name==='posted'||field.name==='addedAt'||field.name==='uploadedAt'||field.name==='subscribedAt'||field.name==='joinedAt'||field.name==='date') value = new Date().toISOString().slice(0,10);
      Object.assign(blank, setPath(blank,field.name,value));
    });
    return blank;
  });
  const [error, setError] = useState('');
  const [saving,setSaving] = useState(false);

  const change = (field, raw) => {
    let value = raw;
    if (field.type==='number') value = raw==='' ? '' : Number(raw);
    if (field.type==='checkbox') value = Boolean(raw);
    if (field.type==='csv') value = typeof raw==='string' ? raw.split(',').map((x)=>x.trim()).filter(Boolean) : raw;
    let next = setPath(form, field.name, value);
    if (!initial && (field.name==='name'||field.name==='title') && !getPath(next,'slug')) next = setPath(next,'slug',slugify(value));
    setForm(next);
  };
  const submit = async (e) => {
    e.preventDefault();
    const missing = config.fields.find((f)=>f.required&&!String(getPath(form,f.name)||'').trim());
    if (missing) return setError(`${missing.label} is required.`);
    setSaving(true);setError('');
    try{await onSave(form);}catch(error){setError(error.message||'The record could not be saved.');}finally{setSaving(false);}
  };

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-navy/65 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5" onMouseDown={onClose}><motion.form initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} transition={{duration:.2}} onSubmit={submit} onMouseDown={(e)=>e.stopPropagation()} className="bg-[#F9F7F2] w-full max-w-5xl max-h-[94vh] rounded-t-2xl md:rounded-2xl border border-line overflow-hidden flex flex-col"><div className="p-5 md:px-7 border-b border-line bg-white flex items-start gap-4"><div className="w-10 h-10 rounded-xl bg-coralSoft text-coral flex items-center justify-center">{initial?<Edit3 className="w-4 h-4"/>:<Plus className="w-4 h-4"/>}</div><div className="flex-1"><div className="eyebrow">{initial?'Edit record':'New record'}</div><h3 className="font-display text-[22px] mt-0.5">{initial?`Edit ${config.singular}`:`Add ${config.singular}`}</h3></div><button type="button" onClick={onClose} className="w-9 h-9 border border-line rounded-lg flex items-center justify-center"><X className="w-4 h-4"/></button></div><div className="p-5 md:p-7 overflow-y-auto thin-scroll"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{config.fields.map((field)=><FormField key={field.name} field={field} value={getPath(form,field.name)} data={data} onChange={(v)=>change(field,v)}/>)}</div>{error&&<div className="mt-5 p-3 rounded-lg bg-coralSoft text-coral text-[12px] flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>{error}</div>}</div><div className="p-4 md:px-7 border-t border-line bg-white flex items-center justify-end gap-2"><button type="button" onClick={onClose} className="btn btn-outline">Cancel</button><button disabled={saving} className="btn btn-coral disabled:opacity-60"><Save className="w-4 h-4"/>{saving?'Saving…':initial?'Save changes':'Create record'}</button></div></motion.form></motion.div>;
}

function FormField({ field, value, data, onChange }) {
  const cls = `w-full bg-white border border-line rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-ink ${field.type==='textarea'?'min-h-[110px] resize-y':''}`;
  const display = field.type==='csv' && Array.isArray(value) ? value.join(', ') : value ?? '';
  const options = field.type==='dynamic-category' ? data.categories.map((x)=>({value:x.name,label:x.name})) : field.type==='dynamic-startup' ? data.startups.map((x)=>({value:x.slug,label:`${x.name} (${x.slug})`})) : (field.options || []).map((x)=>({value:x,label:x}));
  return <label className={`${field.span===2?'md:col-span-2 lg:col-span-3':''} ${field.type==='checkbox'?'flex items-center gap-3 bg-white border border-line rounded-lg px-3 py-3 self-end':''}`}>
    {field.type==='checkbox' ? <><input type="checkbox" checked={Boolean(value)} onChange={(e)=>onChange(e.target.checked)} className="w-4 h-4 accent-[#D94B3D]"/><span className="text-[12.5px]">{field.label}</span></> : <><span className="block text-[11.5px] text-slate2 mb-1.5">{field.label}{field.required&&<span className="text-coral"> *</span>}</span>{field.type==='textarea'?<textarea value={display} onChange={(e)=>onChange(e.target.value)} className={cls}/>:['select','dynamic-category','dynamic-startup'].includes(field.type)?<select value={display} onChange={(e)=>onChange(e.target.value)} className={cls}><option value="">Select</option>{options.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:field.type==='color'?<div className="flex gap-2"><input type="color" value={display||'#D94B3D'} onChange={(e)=>onChange(e.target.value)} className="h-10 w-12 bg-white border border-line rounded-lg p-1"/><input value={display} onChange={(e)=>onChange(e.target.value)} className={cls}/></div>:field.type==='file-url'?<div className="space-y-2"><input value={display} onChange={(e)=>onChange(e.target.value)} className={cls} placeholder="https://… or upload below"/><input type="file" accept="image/*,.pdf" className="block w-full text-[11px] text-slate2 file:mr-3 file:rounded-md file:border-0 file:bg-canvas file:px-3 file:py-2 file:text-[11px]" onChange={(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>onChange(reader.result);reader.readAsDataURL(file);}}/>{display&&String(display).startsWith('data:image')&&<img src={display} alt="Preview" className="h-24 rounded-lg border border-line object-cover"/>}</div>:<input type={field.type==='csv'?'text':field.type} value={display} onChange={(e)=>onChange(e.target.value)} className={cls}/>}</>}
  </label>;
}

function ConfirmDelete({ label, onCancel, onConfirm }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[110] bg-navy/70 flex items-center justify-center p-5" onMouseDown={onCancel}><motion.div initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} onMouseDown={(e)=>e.stopPropagation()} className="bg-white border border-line rounded-2xl p-6 w-full max-w-md"><div className="w-11 h-11 rounded-xl bg-coralSoft text-coral flex items-center justify-center"><Trash2 className="w-5 h-5"/></div><h3 className="font-display text-[22px] mt-4">Delete this record?</h3><p className="text-[13px] text-slate2 mt-2">“{label}” will be permanently removed from the MySQL database. You can restore the populated seed records from Backup & data.</p><div className="mt-6 flex justify-end gap-2"><button onClick={onCancel} className="btn btn-outline">Cancel</button><button onClick={onConfirm} className="btn btn-coral"><Trash2 className="w-4 h-4"/> Delete</button></div></motion.div></motion.div>;
}

function ActivityLog() {
  const { data } = useData();
  const [q,setQ]=useState('');
  const rows=data.activity.filter((x)=>`${x.action} ${x.detail} ${x.actor}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-5"><div><div className="eyebrow">Audit trail</div><h2 className="font-display text-[30px] mt-1">Activity log</h2><p className="text-[13px] text-slate2 mt-1">A database-backed audit history of admin and submission actions.</p></div><div className="bg-white border border-line rounded-2xl overflow-hidden"><div className="p-4 border-b border-line"><div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2"/><input value={q} onChange={(e)=>setQ(e.target.value)} className="w-full border border-line rounded-lg pl-9 py-2.5 text-[13px] outline-none" placeholder="Search activity…"/></div></div><div className="divide-y divide-line">{rows.map((a)=><div key={a.id} className="p-4 flex items-start gap-4"><div className="w-9 h-9 rounded-lg bg-canvas flex items-center justify-center"><Activity className="w-4 h-4 text-coral"/></div><div className="flex-1"><div className="text-[13px] font-medium">{a.action}</div><div className="text-[12px] text-slate2 mt-0.5">{a.detail}</div><div className="text-[10.5px] text-slate2 mt-1">By {a.actor}</div></div><div className="text-[10.5px] text-slate2">{new Date(a.createdAt).toLocaleString()}</div></div>)}</div></div></div>;
}

function SiteSettings() {
  const { data, updateSettings } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [form,setForm]=useState(data.settings);
  const set=(k,v)=>setForm((f)=>({...f,[k]:v}));
  const save=(e)=>{e.preventDefault();updateSettings(form,currentUser?.name);toast('Site settings saved.',{type:'success'});};
  const sections=[
    ['Brand & identity',[['siteName','Site name'],['directoryName','Directory name'],['logoText','Logo text'],['tagline','Tagline'],['footerText','Footer description']]],
    ['Contact & URLs',[['siteUrl','Site URL'],['adminEmail','Admin email'],['supportEmail','Support email'],['defaultCountry','Default country'],['currency','Currency'],['timezone','Timezone']]],
    ['Social links',[['socialTwitter','Twitter / X'],['socialLinkedin','LinkedIn'],['socialInstagram','Instagram'],['socialYoutube','YouTube']]],
  ];
  return <form onSubmit={save} className="space-y-5"><div className="flex items-end justify-between gap-4"><div><div className="eyebrow">Global configuration</div><h2 className="font-display text-[30px] mt-1">Site settings</h2><p className="text-[13px] text-slate2 mt-1">Control identity, submissions, registration, contact details, social links, and maintenance behavior.</p></div><button className="btn btn-coral"><Save className="w-4 h-4"/> Save settings</button></div>{sections.map(([title,fields])=><div key={title} className="bg-white border border-line rounded-2xl p-5 md:p-6"><h3 className="font-display text-[18px]">{title}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">{fields.map(([key,label])=><label key={key} className={key==='footerText'||key==='tagline'?'md:col-span-2':''}><span className="block text-[11.5px] text-slate2 mb-1.5">{label}</span>{key==='footerText'||key==='tagline'?<textarea value={form[key]||''} onChange={(e)=>set(key,e.target.value)} className="w-full min-h-24 bg-white border border-line rounded-lg p-3 text-[13px] outline-none focus:border-ink"/>:<input value={form[key]||''} onChange={(e)=>set(key,e.target.value)} className="w-full bg-white border border-line rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-ink"/>}</label>)}</div></div>)}<div className="bg-white border border-line rounded-2xl p-5 md:p-6"><h3 className="font-display text-[18px]">Access & workflow</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">{[['submissionsEnabled','Accept startup and pitch submissions'],['registrationsEnabled','Allow new account registration'],['requireListingApproval','Require startup approval'],['requirePitchApproval','Require pitch approval'],['maintenanceMode','Maintenance mode']].map(([key,label])=><label key={key} className="flex items-center justify-between gap-4 border border-line rounded-xl p-4"><div><div className="text-[13px] font-medium">{label}</div><div className="text-[10.5px] text-slate2 mt-1">{form[key]?'Enabled':'Disabled'}</div></div><input type="checkbox" checked={Boolean(form[key])} onChange={(e)=>set(key,e.target.checked)} className="w-5 h-5 accent-[#D94B3D]"/></label>)}</div></div></form>;
}

function DataTools() {
  const { data, exportData, importData, resetData } = useData();
  const { toast } = useToast();
  const fileRef=useRef(null);
  const isDevelopment=process.env.NODE_ENV !== 'production';
  const download=()=>downloadBlob(JSON.stringify(exportData(),null,2),`crescent-cms-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json');
  const upload=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{importData(JSON.parse(reader.result));toast('Backup imported successfully.',{type:'success'});}catch{toast('The selected JSON backup is invalid.',{type:'warning'});}};reader.readAsText(file);e.target.value='';};
  const counts=Object.entries(data).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]);
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">MySQL database tools</div>
        <h2 className="font-display text-[30px] mt-1">Backup & data tools</h2>
        <p className="text-[13px] text-slate2 mt-1">Export the complete MySQL dataset or import a compatible backup.</p>
      </div>
      <div className={`grid grid-cols-1 ${isDevelopment?'md:grid-cols-3':'md:grid-cols-2'} gap-4`}>
        <ToolCard icon={Download} title="Export complete backup" text="Download startups, founders, investors, pitches, funding, jobs, users, settings, and every other CMS record as JSON." action="Download JSON" onClick={download}/>
        <ToolCard icon={Upload} title="Import a backup" text="Replace the current MySQL CMS records using a compatible JSON backup file." action="Select JSON" onClick={()=>fileRef.current?.click()}/>
        {isDevelopment&&<ToolCard icon={RefreshCcw} title="Reset local demo database" text="Restore the original local-only demo dataset and known development accounts." action="Reset local data" danger onClick={()=>{if(window.confirm('Reset all LOCAL CMS data to the original demo?')){resetData();toast('Local demo data restored.',{type:'success'});}}}/>} 
      </div>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={upload}/>
      <div className="bg-white border border-line rounded-2xl p-5">
        <div className="font-display text-[18px]">Dataset summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">{counts.map(([key,count])=><div key={key} className="border border-line rounded-xl p-3"><div className="font-display text-[22px]">{count}</div><div className="text-[10.5px] text-slate2 capitalize mt-1">{key}</div></div>)}</div>
      </div>
      <div className="bg-amberSoft border border-amber/20 rounded-2xl p-5 flex gap-3"><AlertTriangle className="w-5 h-5 text-amber shrink-0"/><div><div className="text-[13px] font-medium">MySQL database connected</div><div className="text-[12px] text-slate2 mt-1">All CMS records are stored in MySQL through the Node/Express API. Authentication uses hashed passwords and signed sessions. Use JSON export as an additional backup, not as the primary database.</div></div></div>
    </div>
  );
}

function ToolCard({icon:Icon,title,text,action,onClick,danger}) {return <div className="bg-white border border-line rounded-2xl p-5"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger?'bg-coralSoft text-coral':'bg-canvas text-ink'}`}><Icon className="w-4 h-4"/></div><h3 className="font-display text-[17px] mt-4">{title}</h3><p className="text-[12px] text-slate2 mt-2 min-h-[54px]">{text}</p><button onClick={onClick} className={`btn mt-5 ${danger?'btn-coral':'btn-outline'}`}>{action}</button></div>}

function downloadBlob(content, filename, type) {
  const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}

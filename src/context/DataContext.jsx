import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  STARTUPS, FOUNDERS, INVESTORS, ROUNDS, OPPORTUNITIES, JOBS, PITCHES, CLAIMS, CATEGORIES, COUNTRIES, STATS,
} from '@/data/mockData';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { normalizeOverviewBlocks, overviewSummary } from '@/lib/overviewBlocks';

const DataContext = createContext(null);
const clone = (value) => JSON.parse(JSON.stringify(value));
const today = () => new Date().toISOString().slice(0,10);
const now = () => new Date().toISOString();
export const slugify = (value='') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export const ID_FIELDS = {
  startups:'slug', founders:'slug', investors:'slug', rounds:'id', opportunities:'id', jobs:'id', pitches:'id', claims:'id', categories:'slug', users:'id', messages:'id', subscribers:'id', pages:'slug', media:'id', activity:'id',
};

const SETTINGS = {
  siteName:'Startup Muslim', directoryName:'Startup Muslim Atlas', siteUrl:'http://localhost:3000', adminEmail:'admin@startupmuslim.com', supportEmail:'hello@startupmuslim.com', logoText:'Startup Muslim', tagline:'The global Muslim startup ecosystem directory.', footerText:'A research atlas of Muslim founders, startups, investors, and halal economy companies shaping the future.', submissionsEnabled:true, registrationsEnabled:true, maintenanceMode:false, requireListingApproval:true, requirePitchApproval:true, defaultCountry:'United Kingdom', currency:'USD', timezone:'Asia/Karachi', socialTwitter:'#', socialLinkedin:'#', socialInstagram:'#', socialYoutube:'#', updatedAt:now(),
};

function buildFallback() {
  return {
    startups:clone(STARTUPS).map((x,i)=>({...x,status:'Published',featured:i<6,ownerId:i<3?'u-founder':'',updatedAt:x.addedAt||today(),views:420+i*73})),
    founders:clone(FOUNDERS).map((x)=>({...x,status:'Published',verified:true,updatedAt:today()})),
    investors:clone(INVESTORS).map((x,i)=>({...x,status:'Published',verified:i<8,featured:i<4,updatedAt:today()})),
    rounds:clone(ROUNDS).map((x)=>({...x,status:'Published',updatedAt:today()})),
    opportunities:clone(OPPORTUNITIES).map((x,i)=>({...x,status:'Published',featured:i<3,updatedAt:today()})),
    jobs:clone(JOBS).map((x,i)=>({...x,status:'Published',applications:[12,21,9,18,15,27,7,11][i]||5,updatedAt:today()})),
    pitches:clone(PITCHES).map((x,i)=>({...x,reviewStatus:i<5?'Approved':'Pending',featured:i<3,views:150+i*42,ownerId:i<2?'u-founder':'',updatedAt:today()})),
    claims:clone(CLAIMS).map((x)=>({...x,notes:'',updatedAt:today()})),
    categories:clone(CATEGORIES).map((x,i)=>({...x,status:'Active',order:i+1,featured:i<8})),
    users:[], messages:[], subscribers:[], pages:[], media:[], activity:[], settings:{...SETTINGS},
  };
}

function replaceArray(target,source){target.splice(0,target.length,...clone(source||[]));}
function isPublic(record){const status=record.status||record.reviewStatus||'Published';return !['Draft','Pending','Rejected','Archived','Blocked','Inactive'].includes(status);}
function syncPublicData(data){
  replaceArray(STARTUPS,(data.startups||[]).filter(isPublic));
  replaceArray(FOUNDERS,(data.founders||[]).filter(isPublic));
  replaceArray(INVESTORS,(data.investors||[]).filter(isPublic));
  replaceArray(ROUNDS,(data.rounds||[]).filter(isPublic));
  replaceArray(OPPORTUNITIES,(data.opportunities||[]).filter(isPublic));
  replaceArray(JOBS,(data.jobs||[]).filter(isPublic));
  replaceArray(PITCHES,(data.pitches||[]).filter((x)=>x.reviewStatus==='Approved'&&x.status!=='Archived'&&x.visibility==='Public'));
  replaceArray(CLAIMS,data.claims||[]);
  replaceArray(CATEGORIES,(data.categories||[]).filter((x)=>x.status!=='Inactive').sort((a,b)=>(a.order||0)-(b.order||0)));
  const countries=Array.from(new Set([...STARTUPS.map((x)=>x.country),...FOUNDERS.map((x)=>x.country),...INVESTORS.map((x)=>x.country)].filter(Boolean))).sort();
  replaceArray(COUNTRIES,countries);
  STATS.startups=STARTUPS.length;
  STATS.founders=FOUNDERS.length;
  STATS.countries=COUNTRIES.length;
  STATS.investors=INVESTORS.length;
  STATS.opportunities=OPPORTUNITIES.length;
  STATS.fundingTracked=ROUNDS.reduce((sum,x)=>sum+Number(x.amount||0),0);
  STATS.pitches=PITCHES.length;
}

export function DataProvider({children}) {
  const { currentUser } = useAuth();
  const [data,setData] = useState(()=>{const seed=buildFallback();syncPublicData(seed);return seed;});
  const [loading,setLoading]=useState(true);
  const [databaseStatus,setDatabaseStatus]=useState('checking');
  const [databaseError,setDatabaseError]=useState('');

  const applyData=useCallback((incoming)=>{
    const fallback=buildFallback();
    const next={...fallback,...incoming,settings:{...fallback.settings,...(incoming?.settings||{})}};
    syncPublicData(next);setData(next);return next;
  },[]);

  const refreshData=useCallback(async()=>{
    setLoading(true);
    try{
      const result=await api('/bootstrap');
      applyData(result.data||{});setDatabaseStatus('connected');setDatabaseError('');
      return result.data;
    }catch(error){setDatabaseStatus('error');setDatabaseError(error.message);throw error;}
    finally{setLoading(false);}
  },[applyData]);

  useEffect(()=>{refreshData().catch(()=>{});},[refreshData,currentUser?.id,currentUser?.role]);

  const commit=(updater,activity)=>{
    setData((previous)=>{
      let next=typeof updater==='function'?updater(previous):updater;
      if(activity)next={...next,activity:[{id:`a-${Date.now()}`,action:activity.action,detail:activity.detail,actor:activity.actor||currentUser?.name||'System',createdAt:now()},...(next.activity||[])].slice(0,100)};
      syncPublicData(next);return next;
    });
  };
  const persist=(promise)=>{const tracked=promise.then((result)=>refreshData().then(()=>result)).catch((error)=>{console.error(error);setDatabaseStatus('error');setDatabaseError(error.message);refreshData().catch(()=>{});throw error;});tracked.catch(()=>{});return tracked;};

  const addItem=(collection,item,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';let value={...item};
    if(idField==='slug')value.slug=value.slug||slugify(value.name||value.title||`${collection}-${Date.now()}`);else value.id=value.id||`${collection.slice(0,2)}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    if(currentUser && ['startups','founders','rounds','pitches','jobs','opportunities','claims'].includes(collection) && currentUser.role!=='Admin') value.ownerId=currentUser.id;
    value.updatedAt=value.updatedAt||today();
    commit((prev)=>({...prev,[collection]:[value,...(prev[collection]||[])]}),{action:`${collection} created`,detail:`${value.name||value.title||value.pitchTitle||value.email||value[idField]} was added.`,actor});
    const savePromise=persist(api(`/collections/${collection}`,{method:'POST',body:value}));
    return {...value,savePromise};
  };

  const updateItem=(collection,id,changes,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';
    commit((prev)=>({...prev,[collection]:(prev[collection]||[]).map((item)=>item[idField]===id?{...item,...changes,updatedAt:today()}:item)}),{action:`${collection} updated`,detail:`Record ${id} was updated.`,actor});
    return persist(api(`/collections/${collection}/${encodeURIComponent(id)}`,{method:'PUT',body:changes}));
  };
  const removeItem=(collection,id,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';
    commit((prev)=>({...prev,[collection]:(prev[collection]||[]).filter((item)=>item[idField]!==id)}),{action:`${collection} deleted`,detail:`Record ${id} was deleted.`,actor});
    return persist(api(`/collections/${collection}/${encodeURIComponent(id)}`,{method:'DELETE'}));
  };
  const duplicateItem=(collection,id,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';const source=(data[collection]||[]).find((x)=>x[idField]===id);if(!source)return;
    const copy=clone(source);if(idField==='slug'){copy.slug=`${source.slug}-copy-${Date.now().toString().slice(-4)}`;if(copy.name)copy.name+=' Copy';if(copy.title)copy.title+=' Copy';}else{copy.id=`${collection.slice(0,2)}-${Date.now()}`;if(copy.title)copy.title+=' Copy';if(copy.pitchTitle)copy.pitchTitle+=' Copy';}
    return addItem(collection,copy,actor);
  };
  const bulkUpdate=(collection,ids,changes,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';commit((prev)=>({...prev,[collection]:(prev[collection]||[]).map((item)=>ids.includes(item[idField])?{...item,...changes,updatedAt:today()}:item)}),{action:`${collection} bulk updated`,detail:`${ids.length} records were updated.`,actor});
    persist(api(`/collections/${collection}/bulk-update`,{method:'POST',body:{ids,changes}}));
  };
  const bulkRemove=(collection,ids,actor='Crescent Admin')=>{
    const idField=ID_FIELDS[collection]||'id';commit((prev)=>({...prev,[collection]:(prev[collection]||[]).filter((item)=>!ids.includes(item[idField]))}),{action:`${collection} bulk deleted`,detail:`${ids.length} records were deleted.`,actor});
    persist(api(`/collections/${collection}/bulk-delete`,{method:'POST',body:{ids}}));
  };
  const updateSettings=(changes,actor='Crescent Admin')=>{commit((prev)=>({...prev,settings:{...prev.settings,...changes,updatedAt:now()}}),{action:'Site settings updated',detail:'Global website settings were changed.',actor});persist(api('/settings',{method:'PUT',body:changes}));};

  const addMessage=(message)=>{
    const value={id:`m-${Date.now()}`,...message,status:'Unread',submittedAt:now()};
    commit((prev)=>({...prev,messages:[value,...(prev.messages||[])]}));
    persist(api('/contact',{method:'POST',body:message,auth:false}));return value;
  };
  const addSubscriber=(email,source='Footer')=>{
    if((data.subscribers||[]).some((s)=>String(s.email).toLowerCase()===String(email).toLowerCase()))return false;
    const value={id:`n-${Date.now()}`,email,source,status:'Subscribed',subscribedAt:today()};commit((prev)=>({...prev,subscribers:[value,...(prev.subscribers||[])]}));
    persist(api('/newsletter',{method:'POST',body:{email,source},auth:false}));return true;
  };
  const submitStartup=(form,user)=>{
    const overviewBlocks=normalizeOverviewBlocks(form.overviewBlocks||[]);
    const value={id:`s-${Date.now()}`,slug:slugify(form.name),name:form.name,tagline:form.tagline,category:form.category,country:form.country,flag:'🌍',stage:form.stage||'Pre-Seed',fundingStage:form.stage||'Pre-Seed',businessModel:form.model||'',verified:false,openToFunding:true,hiring:false,pitching:false,totalRaised:Number(form.raised||0),foundedYear:Number(form.foundedYear||new Date().getFullYear()),teamSize:Number(form.teamSize||1),hq:form.hq||form.country,founderSlugs:[],revenue:form.revenue||'Not disclosed',users:form.users||'Not disclosed',growth:form.growth||'Not disclosed',addedAt:today(),logo:{mark:String(form.name).slice(0,2).toUpperCase(),color:'#D94B3D'},banner:form.bannerUrl||'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop&q=70',website:form.website||'#',overviewBlocks,description:overviewSummary(overviewBlocks,form.description||form.tagline),productImages:form.bannerUrl?[form.bannerUrl]:[],status:data.settings.requireListingApproval?'Pending':'Published',featured:false,ownerId:user?.id||'',submitterName:form.founderName,submitterEmail:form.founderEmail,views:0,updatedAt:today()};
    commit((prev)=>({...prev,startups:[value,...prev.startups]}));const savePromise=persist(api('/submit-startup',{method:'POST',body:form}));return {...value,savePromise};
  };
  const submitPitch=(form,user)=>{
    const value={id:`p-${Date.now()}`,startupSlug:form.startupSlug||slugify(form.startupName||'startup'),pitchTitle:form.pitchTitle||`${form.startupName||'Startup'} fundraising pitch`,summary:form.summary||'',problem:form.problem||'',solution:form.solution||'',market:form.market||'',businessModel:form.businessModel||'',traction:form.traction||'',requested:Number(form.requested||form.amount||0),equity:Number(form.equity||0),valuation:Number(form.valuation||0),minTicket:Number(form.minTicket||0),useOfFunds:form.useOfFunds||'',visibility:form.visibility||'Private',deck:form.deck||'',demo:form.demo||'',previousFunding:form.previousFunding||'',previousInvestors:form.previousInvestors||'',founderName:form.founderName||form.founder||user?.name||'',contactEmail:form.contactEmail||form.email||user?.email||'',website:form.website||'',submitted:today(),status:'Active',reviewStatus:data.settings.requirePitchApproval?'Pending':'Approved',featured:false,ownerId:user?.id||'',views:0,updatedAt:today()};
    commit((prev)=>({...prev,pitches:[value,...prev.pitches]}));
    const ownsStartup=Boolean(user?.id&&value.startupSlug&&((data.startups||[]).some((startup)=>startup.slug===value.startupSlug&&startup.ownerId===user.id)||(data.claims||[]).some((claim)=>claim.startupSlug===value.startupSlug&&claim.ownerId===user.id&&claim.status==='Approved')));
    const request=ownsStartup?api('/collections/pitches',{method:'POST',body:value}):api('/submit-pitch',{method:'POST',body:form});
    const savePromise=persist(request);return {...value,savePromise};
  };
  const resetData=()=>{applyData(buildFallback());persist(api('/admin/reset',{method:'POST',body:{}}));};
  const importData=(payload)=>{applyData(payload);persist(api('/admin/import',{method:'POST',body:{data:payload}}));};

  const stats=useMemo(()=>({
    startups:data.startups.length,publishedStartups:data.startups.filter((x)=>x.status==='Published').length,pendingStartups:data.startups.filter((x)=>x.status==='Pending').length,founders:data.founders.length,investors:data.investors.length,pitches:data.pitches.length,pendingPitches:data.pitches.filter((x)=>x.reviewStatus==='Pending').length,funding:data.rounds.reduce((sum,x)=>sum+Number(x.amount||0),0),jobs:data.jobs.length,opportunities:data.opportunities.length,users:data.users.length,unreadMessages:data.messages.filter((x)=>x.status==='Unread').length,subscribers:data.subscribers.filter((x)=>x.status==='Subscribed').length,
  }),[data]);

  return <DataContext.Provider value={{data,stats,idFields:ID_FIELDS,loading,databaseStatus,databaseError,refreshData,addItem,updateItem,removeItem,duplicateItem,bulkUpdate,bulkRemove,updateSettings,addMessage,addSubscriber,submitStartup,submitPitch,resetData,importData,exportData:()=>clone(data)}}>{children}</DataContext.Provider>;
}

export function useData(){const ctx=useContext(DataContext);if(!ctx)throw new Error('useData must be used inside DataProvider');return ctx;}

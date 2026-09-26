const express = require('express');
const crypto = require('crypto');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { createRecord, getSettings, addActivity, listCollection, getRecord, userOwnsStartup } = require('../services/recordService');

const router=express.Router();
const today=()=>new Date().toISOString().slice(0,10);
const slugify=(v='')=>String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const id=(prefix)=>`${prefix}-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

router.post('/contact', optionalAuth, async(req,res,next)=>{
  try{
    const item={id:id('m'),name:String(req.body.name||req.user?.name||'Website visitor'),email:String(req.body.email||req.user?.email||''),topic:String(req.body.topic||'General inquiry'),message:String(req.body.message||''),status:'Unread',submittedAt:new Date().toISOString()};
    await createRecord('messages',item);await addActivity('Contact message submitted',`${item.topic} message received from ${item.email||item.name}.`,item.name);
    res.status(201).json({item});
  }catch(error){next(error);}
});

router.post('/newsletter', async(req,res,next)=>{
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({message:'Enter a valid email address.'});
    const existing=(await listCollection('subscribers',{role:'Admin'})).find((x)=>String(x.email).toLowerCase()===email);
    if(existing)return res.json({item:existing,alreadyExists:true});
    const item={id:id('n'),email,status:'Subscribed',source:req.body.source||'Website',subscribedAt:today()};
    await createRecord('subscribers',item);await addActivity('Newsletter subscription',`${email} subscribed to the newsletter.`,'Website visitor');
    res.status(201).json({item,alreadyExists:false});
  }catch(error){next(error);}
});

router.post('/submit-startup', requireAuth, async(req,res,next)=>{
  try{
    const settings=await getSettings();
    if(settings.submissionsEnabled===false)return res.status(403).json({message:'Startup submissions are currently disabled.'});
    const form=req.body||{};const slug=slugify(form.name);
    if(!slug)return res.status(400).json({message:'Startup name is required.'});
    if(await getRecord('startups',slug))return res.status(409).json({message:'A company with this name already exists. Use the Claim profile option if it is yours.'});
    const overviewBlocks=Array.isArray(form.overviewBlocks)?form.overviewBlocks.slice(0,50):[];
    const overviewDescription=overviewBlocks.find((block)=>block?.type==='paragraph'&&String(block.text||'').trim())?.text;
    const item={
      id:id('s'),slug,name:form.name,tagline:form.tagline||'',category:form.category||'',country:form.country||'',flag:'🌍',stage:form.stage||'Pre-Seed',fundingStage:form.stage||'Pre-Seed',businessModel:form.model||'',verified:false,openToFunding:true,hiring:false,pitching:false,totalRaised:Number(form.raised||0),foundedYear:Number(form.foundedYear||new Date().getFullYear()),teamSize:Number(form.teamSize||1),hq:form.hq||form.country||'',founderSlugs:[],revenue:form.revenue||'Not disclosed',users:form.users||'Not disclosed',growth:form.growth||'Not disclosed',addedAt:today(),logo:{mark:String(form.name).slice(0,2).toUpperCase(),color:'#D94B3D'},banner:form.bannerUrl||'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop&q=70',website:form.website||'#',overviewBlocks,description:String(overviewDescription||form.description||form.tagline||'').slice(0,2000),productImages:form.bannerUrl?[form.bannerUrl]:[],status:'Pending',featured:false,ownerId:req.user.id,submitterName:form.founderName||req.user.name||'',submitterEmail:form.founderEmail||req.user.email||'',views:0,updatedAt:today()
    };
    await createRecord('startups',item);await addActivity('Startup submitted',`${item.name} entered the review queue.`,req.user?.name||item.submitterName||'Visitor');
    res.status(201).json({item});
  }catch(error){if(error.code==='ER_DUP_ENTRY')return res.status(409).json({message:'A startup with this name or slug already exists.'});next(error);}
});

router.post('/submit-pitch', optionalAuth, async(req,res,next)=>{
  try{
    const settings=await getSettings();
    if(settings.submissionsEnabled===false)return res.status(403).json({message:'Pitch submissions are currently disabled.'});
    const f=req.body||{};
    const startupSlug=f.startupSlug||slugify(f.startupName||'startup');
    const existingStartup=await getRecord('startups',startupSlug);
    if(existingStartup){
      if(!req.user)return res.status(401).json({message:'Sign in and claim or own this startup before submitting a pitch for it.'});
      if(!(await userOwnsStartup(req.user.id,startupSlug)))return res.status(403).json({message:'You can only submit a pitch for a startup you own or have an approved claim for.'});
    }
    const item={id:id('p'),startupSlug,pitchTitle:f.pitchTitle||`${f.startupName||'Startup'} fundraising pitch`,summary:f.summary||'',problem:f.problem||'',solution:f.solution||'',market:f.market||'',businessModel:f.businessModel||'',traction:f.traction||'',requested:Number(f.requested||f.amount||0),equity:Number(f.equity||0),valuation:Number(f.valuation||0),minTicket:Number(f.minTicket||0),useOfFunds:f.useOfFunds||'',visibility:f.visibility||'Private',deck:f.deck||'',demo:f.demo||'',previousFunding:f.previousFunding||'',previousInvestors:f.previousInvestors||'',submitted:today(),status:'Active',reviewStatus:settings.requirePitchApproval?'Pending':'Approved',featured:false,ownerId:req.user?.id||'',views:0,updatedAt:today()};
    await createRecord('pitches',item);await addActivity('Pitch submitted',`${item.pitchTitle} entered the review queue.`,req.user?.name||'Visitor');
    res.status(201).json({item});
  }catch(error){next(error);}
});

module.exports=router;

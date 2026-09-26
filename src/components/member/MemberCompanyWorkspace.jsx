import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData, slugify } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import StartupWorkspaceEditor from '@/components/admin/StartupWorkspaceEditor';

export default function MemberCompanyWorkspace({ initial = null, onClose }) {
  const { currentUser } = useAuth();
  const { data, addItem, updateItem, removeItem } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const close = onClose || (()=>navigate('/dashboard'));

  const save = async ({ startup, pitch, pitchEnabled, rounds, founders }) => {
    if (saving) return;
    setSaving(true);
    let createdCompany = false;
    try {
      const companySlug = initial?.slug || slugify(startup.slug || startup.name);
      if (!companySlug) throw new Error('Please enter a company name.');
      // Server chooses the real publication state and owner; these values only keep the local view honest.
      const company = {
        ...startup, slug:companySlug, status:initial?.status || 'Pending',
        ownerId:currentUser.id, featured:false, verified:initial?.verified || false,
      };
      if (initial) await updateItem('startups',initial.slug,company,currentUser.name);
      else {
        const created = addItem('startups',company,currentUser.name);
        await created.savePromise;
        createdCompany = true;
      }

      const existingPitch = (data.pitches || []).find((item)=>item.startupSlug===companySlug);
      if (pitchEnabled && pitch && (pitch.pitchTitle?.trim() || pitch.summary?.trim())) {
        const payload = {
          ...pitch, startupSlug:companySlug, status:pitch.status === 'Closed' ? 'Closed' : 'Active',
          reviewStatus:initial?.status === 'Published' ? 'Approved' : 'Pending',
          ownerId:currentUser.id, submitted:pitch.submitted || new Date().toISOString().slice(0,10),
        };
        if (existingPitch) await updateItem('pitches',existingPitch.id,payload,currentUser.name);
        else { const { id, ...fresh }=payload; await addItem('pitches',fresh,currentUser.name).savePromise; }
      }
      if (!pitchEnabled && existingPitch) await removeItem('pitches',existingPitch.id,currentUser.name);

      const oldRounds = (data.rounds || []).filter((item)=>item.startupSlug===companySlug);
      const keptRounds = new Set();
      for (const round of rounds || []) {
        if (!round.roundName?.trim()) continue;
        const old = oldRounds.find((item)=>item.id===round.id);
        const payload = {...round,startupSlug:companySlug,ownerId:currentUser.id};
        if (old) { keptRounds.add(old.id); await updateItem('rounds',old.id,payload,currentUser.name); }
        else { const { id, ...fresh }=payload; await addItem('rounds',fresh,currentUser.name).savePromise; }
      }
      if (initial) for (const old of oldRounds) if (!keptRounds.has(old.id)) await removeItem('rounds',old.id,currentUser.name);

      const oldFounders = (data.founders || []).filter((item)=>item.startupSlug===companySlug);
      const keptFounders = new Set();
      const founderSlugs = [];
      for (const founder of founders || []) {
        if (!founder.name?.trim()) continue;
        const old = oldFounders.find((item)=>item.slug===founder.slug);
        const founderSlug = old?.slug || (String(founder.slug||'').startsWith('tmp-') ? slugify(founder.name) : founder.slug) || slugify(founder.name);
        if (!founderSlug) continue;
        founderSlugs.push(founderSlug);
        const payload = {...founder,slug:founderSlug,startupSlug:companySlug,ownerId:currentUser.id,verified:false};
        if (old) { keptFounders.add(old.slug); await updateItem('founders',old.slug,payload,currentUser.name); }
        else await addItem('founders',payload,currentUser.name).savePromise;
      }
      if (initial) for (const old of oldFounders) if (!keptFounders.has(old.slug)) await removeItem('founders',old.slug,currentUser.name);
      await updateItem('startups',companySlug,{founderSlugs,pitching:Boolean(pitchEnabled && pitch?.visibility==='Public')},currentUser.name);

      toast(initial ? 'Company details saved.' : 'Company and founder details sent to the administrator for review.',{type:'success'});
      close();
      if (!initial) navigate('/dashboard');
    } catch (error) {
      toast(createdCompany
        ? 'Company submitted, but some linked details did not save. Open your company in the dashboard to finish them.'
        : (error.message || 'Could not save this company.'),{type:'warning'});
      if (createdCompany) navigate('/dashboard');
    } finally { setSaving(false); }
  };

  return <StartupWorkspaceEditor initial={initial} data={data} memberMode saving={saving} onClose={close} onSave={save}/>;
}

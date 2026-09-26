import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Building2, Layers3, UserRound } from 'lucide-react';
import { useData } from '@/context/DataContext';
import MemberCompanyWorkspace from '@/components/member/MemberCompanyWorkspace';
import { useAuth } from '@/context/AuthContext';

export default function SubmitStartup() {
  const { data } = useData();
  const { currentUser } = useAuth();
  if (currentUser?.role === 'Investor') return <Navigate to="/dashboard/investor" replace />;
  if (data.settings.submissionsEnabled === false) return <div className="wrap py-24 text-center"><h1 className="font-display text-3xl">Submissions are paused</h1><p className="text-slate2 mt-3">New company submissions are temporarily unavailable.</p><Link to="/dashboard" className="btn btn-outline mt-6">Back to dashboard</Link></div>;
  return <div data-testid="submit-startup-page">
    <div className="wrap pt-10 pb-24">
      <div className="max-w-3xl"><div className="eyebrow">Your company workspace</div><h1 className="font-display text-[36px] mt-3">Submit a complete company profile.</h1><p className="text-slate2 mt-3">Add company details, founder biographies, media, investment pitch and funding rounds. An administrator reviews the new company before it appears publicly.</p></div>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">{[[Building2,'Company profile','Business details and contact information'],[UserRound,'Founders','Names, roles, bios and photos'],[Layers3,'Content','Headings, descriptions, images and products']].map(([Icon,title,detail])=><div key={title} className="bg-white border border-line rounded-2xl p-5"><Icon className="text-coral" size={22}/><h2 className="font-display text-lg mt-3">{title}</h2><p className="text-xs text-slate2 mt-1">{detail}</p></div>)}</div>
    </div>
    <MemberCompanyWorkspace/>
  </div>;
}

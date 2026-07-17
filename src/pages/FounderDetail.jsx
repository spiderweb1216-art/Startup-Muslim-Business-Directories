import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { getFounderBySlug, getStartupBySlug, FOUNDERS } from '@/data/mockData';
import { StartupLogo } from '@/components/common/Logo';
import { ArrowUpRight, Linkedin, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function FounderDetail() {
  const { slug } = useParams();
  const f = getFounderBySlug(slug);
  const { toast } = useToast();
  const { addMessage } = useData();
  const { currentUser } = useAuth();
  if (!f) return <Navigate to="/founders" replace />;
  const startup = f.startupSlug && getStartupBySlug(f.startupSlug);
  const similar = FOUNDERS.filter(x => x.slug !== f.slug && x.industry === f.industry).slice(0, 3);
  return (
    <div className="wrap pt-10 pb-24" data-testid="founder-detail-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-line bg-white rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-2 relative">
                <img src={f.photo} alt={f.name} className="w-full h-72 md:h-full object-cover" />
              </div>
              <div className="md:col-span-3 p-6 md:p-8">
                <div className="eyebrow flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{f.flag} {f.country}</div>
                <h1 className="font-display text-[36px] md:text-[44px] leading-tight mt-2">{f.name}</h1>
                <div className="text-[13.5px] text-slate2 mt-1">{f.role}{startup && <> · <Link to={`/startups/${startup.slug}`} className="hover:text-coral">{startup.name}</Link></>}</div>
                <p className="text-[14.5px] text-ink/85 mt-4 leading-relaxed">{f.bio}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.openTo.map(o => <span key={o} className="badge bg-canvas border border-line capitalize">{o.replace('-',' ')}</span>)}
                </div>
                <div className="mt-6 flex gap-2">
                  <button className="btn btn-coral" onClick={() => { addMessage({name:currentUser?.name||'Website visitor',email:currentUser?.email||'visitor@example.com',topic:'Founder contact',message:`Contact request for founder ${f.name}.`}); toast('Contact request sent to the admin inbox.', { type:'success' }); }} data-testid="founder-contact"><Mail className="w-4 h-4" /> Contact</button>
                  <a href={f.linkedin} className="btn btn-outline"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          <section className="border border-line bg-white rounded-2xl p-6">
            <div className="eyebrow">Founder story</div>
            <p className="text-[15px] leading-relaxed text-ink/85 mt-2">{f.story}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-line rounded-2xl p-5 bg-white">
              <div className="eyebrow">Skills</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {f.skills.map(s => <span key={s} className="badge bg-canvas border border-line">{s}</span>)}
              </div>
            </div>
            <div className="border border-line rounded-2xl p-5 bg-white">
              <div className="eyebrow">Experience</div>
              <div className="text-[13.5px] mt-2">{f.experience}</div>
            </div>
            <div className="border border-line rounded-2xl p-5 bg-white">
              <div className="eyebrow">Previous startups</div>
              <div className="text-[13.5px] mt-2">{f.previousStartups.length ? f.previousStartups.join(', ') : '—'}</div>
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {startup && (
            <Link to={`/startups/${startup.slug}`} className="block border border-line bg-white rounded-2xl p-5 hover:border-coral/40">
              <div className="eyebrow">Current startup</div>
              <div className="mt-3 flex items-center gap-3">
                <StartupLogo startup={startup} />
                <div>
                  <div className="font-display text-[18px]">{startup.name}</div>
                  <div className="text-[12.5px] text-slate2">{startup.category} · {startup.country}</div>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-slate2" />
              </div>
              <p className="text-[13px] text-slate2 mt-3 line-clamp-3">{startup.tagline}</p>
            </Link>
          )}
          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Similar founders</div>
            <div className="mt-3 space-y-3">
              {similar.map(sf => (
                <Link key={sf.slug} to={`/founders/${sf.slug}`} className="flex items-center gap-3 group">
                  <img src={sf.photo} alt={sf.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium">{sf.name}</div>
                    <div className="text-[12px] text-slate2">{sf.industry} · {sf.country}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate2 group-hover:text-coral" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

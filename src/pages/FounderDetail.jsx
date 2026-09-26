import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { StartupLogo } from '@/components/common/Logo';
import CountryLabel from '@/components/common/CountryLabel';
import { ArrowUpRight, Linkedin, Mail, MapPin, BadgeCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { founderOpenToLabel } from '@/constants/founderOptions';

const PUBLIC_STATUSES = new Set(['Published', 'Active']);
const isPublic = (record = {}) => !record.status || PUBLIC_STATUSES.has(record.status);
const asArray = (value) => Array.isArray(value) ? value : [];
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&auto=format&fit=crop&q=75';

export default function FounderDetail() {
  const { slug } = useParams();
  const { toast } = useToast();
  const { data, addMessage } = useData();
  const { currentUser } = useAuth();

  const f = (data.founders || []).find((founder) => founder.slug === slug && isPublic(founder));
  if (!f) return <Navigate to="/founders" replace />;

  const startup = f.startupSlug && (data.startups || []).find((item) => item.slug === f.startupSlug && isPublic(item));
  const similar = (data.founders || [])
    .filter((founder) => founder.slug !== f.slug && isPublic(founder) && (founder.industry === f.industry || founder.country === f.country))
    .sort((a, b) => Number(a.industry !== f.industry) - Number(b.industry !== f.industry))
    .slice(0, 3);

  const openTo = asArray(f.openTo);
  const skills = asArray(f.skills);
  const previousStartups = asArray(f.previousStartups);

  const contactFounder = () => {
    addMessage({
      name: currentUser?.name || 'Website visitor',
      email: currentUser?.email || 'visitor@example.com',
      topic: 'Founder contact',
      message: `Contact request for founder ${f.name}.`,
    });
    toast('Contact request sent to the admin inbox.', { type: 'success' });
  };

  return (
    <div className="wrap pt-10 pb-24" data-testid="founder-detail-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="border border-line bg-white rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] min-h-[360px]">
              <div className="relative bg-canvas min-h-[300px] md:min-h-full overflow-hidden">
                <img
                  src={f.photo || FALLBACK_PHOTO}
                  alt={f.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(event) => { event.currentTarget.src = FALLBACK_PHOTO; }}
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="eyebrow flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><CountryLabel country={f.country} explicitFlag={f.flag} /></span>
                  {f.verified && <span className="inline-flex items-center gap-1 text-emerald"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>}
                </div>
                <h1 className="font-display text-[38px] md:text-[48px] leading-[1.02] mt-3">{f.name}</h1>
                <div className="text-[14px] text-slate2 mt-2">
                  {f.role || 'Founder'}
                  {startup && <> · <Link to={`/startups/${startup.slug}`} className="text-ink hover:text-coral font-medium">{startup.name}</Link></>}
                </div>
                {f.bio && <p className="text-[15px] text-ink/80 mt-5 leading-relaxed max-w-2xl">{f.bio}</p>}

                {openTo.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {openTo.map((value) => <span key={value} className="badge bg-canvas border border-line">{founderOpenToLabel(value)}</span>)}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-2">
                  <button className="btn btn-coral" onClick={contactFounder} data-testid="founder-contact"><Mail className="w-4 h-4" /> Contact</button>
                  {f.linkedin && f.linkedin !== '#' && <a href={f.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                </div>
              </div>
            </div>
          </section>

          {f.story && (
            <section className="border border-line bg-white rounded-2xl p-6 md:p-7">
              <div className="eyebrow">Founder story</div>
              <p className="text-[15px] leading-7 text-ink/85 mt-3 whitespace-pre-line">{f.story}</p>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard title="Skills">
              {skills.length ? <div className="flex flex-wrap gap-1.5">{skills.map((skill) => <span key={skill} className="badge bg-canvas border border-line">{skill}</span>)}</div> : <span className="text-slate2">—</span>}
            </InfoCard>
            <InfoCard title="Experience"><span>{f.experience || '—'}</span></InfoCard>
            <InfoCard title="Previous startups"><span>{previousStartups.length ? previousStartups.join(', ') : '—'}</span></InfoCard>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {startup && (
            <Link to={`/startups/${startup.slug}`} className="block border border-line bg-white rounded-2xl p-5 hover:border-coral/40 transition-colors">
              <div className="eyebrow">Current startup</div>
              <div className="mt-3 flex items-center gap-3">
                <StartupLogo startup={startup} />
                <div className="min-w-0">
                  <div className="font-display text-[18px] truncate">{startup.name}</div>
                  <div className="text-[12.5px] text-slate2 flex items-center gap-1 flex-wrap"><span>{startup.category}</span><span>·</span><CountryLabel country={startup.country} explicitFlag={startup.flag} /></div>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-slate2 shrink-0" />
              </div>
              {startup.tagline && <p className="text-[13px] text-slate2 mt-3 line-clamp-3">{startup.tagline}</p>}
            </Link>
          )}

          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Profile details</div>
            <dl className="mt-3 divide-y divide-line text-[13px]">
              <MetaRow label="Industry" value={f.industry} />
              <MetaRow label="Country" value={<CountryLabel country={f.country} explicitFlag={f.flag} />} />
              <MetaRow label="Experience" value={f.experience} />
              <MetaRow label="Status" value={f.status || 'Published'} />
            </dl>
          </div>

          {similar.length > 0 && (
            <div className="border border-line bg-white rounded-2xl p-5">
              <div className="eyebrow">Similar founders</div>
              <div className="mt-3 space-y-3">
                {similar.map((founder) => (
                  <Link key={founder.slug} to={`/founders/${founder.slug}`} className="flex items-center gap-3 group">
                    <img src={founder.photo || FALLBACK_PHOTO} alt={founder.name} className="w-11 h-11 rounded-xl object-cover bg-canvas" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{founder.name}</div>
                      <div className="text-[12px] text-slate2 truncate">{founder.industry || founder.role}</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate2 group-hover:text-coral shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return <div className="border border-line rounded-2xl p-5 bg-white"><div className="eyebrow">{title}</div><div className="text-[13.5px] mt-3 leading-relaxed">{children}</div></div>;
}

function MetaRow({ label, value }) {
  return <div className="flex items-start justify-between gap-4 py-3"><dt className="text-slate2">{label}</dt><dd className="text-right font-medium">{value || '—'}</dd></div>;
}

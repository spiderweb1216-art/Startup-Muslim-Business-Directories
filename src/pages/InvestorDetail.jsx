import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { getInvestorBySlug, getStartupsByInvestor, getRoundsByInvestor, formatDate, formatMoney, STARTUPS, INVESTORS } from '@/data/mockData';
import { InvestorLogo, StartupLogo } from '@/components/common/Logo';
import SaveButton from '@/components/common/SaveButton';
import { MapPin, Globe, Mail, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function InvestorDetail() {
  const { slug } = useParams();
  const inv = getInvestorBySlug(slug);
  const { toast } = useToast();
  const { addMessage } = useData();
  const { currentUser } = useAuth();
  if (!inv) return <Navigate to="/investors" replace />;
  const portfolio = getStartupsByInvestor(inv.slug);
  const rounds = getRoundsByInvestor(inv.slug);
  return (
    <div className="wrap pt-10 pb-24" data-testid="investor-detail-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-line bg-white rounded-3xl p-6 md:p-8">
            <div className="flex items-start gap-5 flex-wrap">
              <InvestorLogo investor={inv} size={72} rounded={18} />
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-[32px] md:text-[42px] leading-tight">{inv.name}</h1>
                <div className="text-[13.5px] text-slate2 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{inv.type}</span><span className="dot-sep" />
                  <MapPin className="w-3.5 h-3.5" /> {inv.flag} {inv.country}
                </div>
                <p className="text-[15px] text-ink/85 mt-4 max-w-2xl">{inv.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={inv.website} className="btn btn-coral"><Globe className="w-4 h-4" /> Website</a>
                <button className="btn btn-outline" onClick={() => { addMessage({name:currentUser?.name||'Website visitor',email:currentUser?.email||'visitor@example.com',topic:'Investor contact',message:`Contact request for investor ${inv.name}.`}); toast('Contact request sent to the admin inbox.', { type:'success' }); }}><Mail className="w-4 h-4" /> Contact</button>
                <SaveButton type="investors" id={inv.slug} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Fact label="Ticket range" value={inv.ticketRange} />
              <Fact label="Portfolio" value={`${inv.portfolioCount} companies`} />
              <Fact label="Stage focus" value={inv.stageFocus.join(', ')} />
              <Fact label="Halal focus" value={inv.halalFocus ? 'Yes' : 'General'} />
            </div>
            <div className="mt-6">
              <div className="eyebrow mb-2">Focus areas</div>
              <div className="flex flex-wrap gap-1.5">
                {inv.focus.map(f => <span key={f} className="badge bg-canvas border border-line">{f}</span>)}
              </div>
            </div>
          </div>

          <section>
            <div className="eyebrow mb-4">Portfolio</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map(s => (
                <Link key={s.slug} to={`/startups/${s.slug}`} className="flex items-center gap-4 border border-line bg-white rounded-2xl p-4 hover:border-coral/30">
                  <StartupLogo startup={s} />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[16px]">{s.name}</div>
                    <div className="text-[12.5px] text-slate2 truncate">{s.tagline}</div>
                    <div className="text-[11.5px] text-slate2 mt-1">{s.category} · {s.stage}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate2" />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="eyebrow mb-4">Recent investments</div>
            <div className="border border-line bg-white rounded-2xl overflow-x-auto thin-scroll">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="text-slate2 text-left">
                    <th className="py-3 px-4">Startup</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map(r => {
                    const s = STARTUPS.find(x => x.slug === r.startupSlug);
                    return (
                      <tr key={r.id} className="border-t border-line">
                        <td className="py-3 px-4"><Link to={`/startups/${s?.slug}`} className="hover:text-coral">{s?.name}</Link></td>
                        <td className="py-3 px-4">{r.roundName}</td>
                        <td className="py-3 px-4 text-slate2">{formatDate(r.date)}</td>
                        <td className="py-3 px-4">{formatMoney(r.amount)}</td>
                        <td className="py-3 px-4">{r.leadInvestorSlug === inv.slug ? <span className="badge bg-coralSoft text-coralDark">Lead</span> : <span className="badge bg-canvas border border-line">Participating</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          <div className="border border-line bg-white rounded-2xl p-5">
            <div className="eyebrow">Co-investors</div>
            <div className="mt-3 space-y-2">
              {INVESTORS.filter(x => x.slug !== inv.slug).slice(0, 4).map(co => (
                <Link key={co.slug} to={`/investors/${co.slug}`} className="flex items-center gap-3 group">
                  <InvestorLogo investor={co} size={32} rounded={8} />
                  <div className="flex-1"><div className="text-[13px] font-medium">{co.name}</div><div className="text-[11.5px] text-slate2">{co.type}</div></div>
                  <ArrowUpRight className="w-4 h-4 text-slate2 group-hover:text-coral" />
                </Link>
              ))}
            </div>
          </div>
          <div className="border border-line bg-white rounded-2xl p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-coral" />
            <div className="text-[12.5px] text-slate2">Investor profiles are informational only. Not investment advice, endorsement, or Shariah certification.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return <div className="rounded-2xl border border-line p-3 bg-canvas/40"><div className="eyebrow">{label}</div><div className="text-[13.5px] font-medium mt-1">{value}</div></div>;
}

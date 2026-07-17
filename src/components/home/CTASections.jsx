import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function PitchCTA() {
  return (
    <section className="wrap py-16 md:py-24" data-testid="pitch-cta-section">
      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 md:col-span-7 panel-dark rounded-md p-8 md:p-12 atlas-grid-dark">
          <div className="eyebrow eyebrow-navy">— Submit pitch</div>
          <h3 className="font-display text-[34px] md:text-[46px] leading-[1.05] text-white mt-3">Share your pitch with a curated ecosystem of Muslim investors.</h3>
          <p className="text-white/60 text-[14.5px] mt-4 max-w-md leading-relaxed">Private by default. Every pitch is reviewed by our team within 5 business days before being shared with vetted investors.</p>
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <Link to="/submit-pitch" className="btn btn-coral">Submit pitch <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/about-directory" className="btn btn-outline-white">How it works</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="tag !bg-white/8 !text-white/70 !border-white/15"><Lock className="w-3 h-3" /> Private by default</span>
            <span className="tag !bg-white/8 !text-white/70 !border-white/15"><ShieldCheck className="w-3 h-3" /> Reviewed before publish</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 panel p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="eyebrow">Live example</div>
            <div className="font-display text-[22px] mt-2">Series A: Scaling halal BNPL</div>
            <div className="text-[12.5px] text-slate2 mt-1">HalalPay · Fintech · UK</div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-line">
              <M l="Raising" v="$12M" />
              <M l="Equity" v="12%" />
              <M l="Valuation" v="$100M" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="mono text-[11px] text-slate3 uppercase tracking-widest">Verified pitch</span>
            <Link to="/startups/halalpay#pitch" className="text-[13px] inline-flex items-center gap-1 hover:text-coral">Preview <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function M({ l, v }) { return <div><div className="eyebrow">{l}</div><div className="mono text-[18px]">{v}</div></div>; }

export function InvestorCTA() {
  return (
    <section className="bg-canvas" data-testid="investor-cta-section">
      <div className="wrap py-16 md:py-24">
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow">— For investors & partners</div>
            <h3 className="font-display text-[36px] md:text-[54px] leading-[1.03] mt-3">Are you an investor, accelerator, or ecosystem partner?</h3>
            <p className="text-[15px] text-slate2 mt-5 max-w-2xl">Join Startup Muslim to discover promising Muslim founders, halal economy startups, and investment-ready pitches — before they’re publicly listed.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-navy">Join the ecosystem <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/pitches" className="btn btn-outline">Explore active pitches</Link>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="border border-line rounded-md p-5 bg-white space-y-3">
              {[
                ['Portfolio access', 'Curated pipeline of vetted Muslim-led startups'],
                ['Early pitches', 'See rounds before they hit public listings'],
                ['Ecosystem reports', 'Quarterly research on the halal economy'],
                ['Dealroom tools', 'Save, filter, and track your interests'],
              ].map(([t, d]) => (
                <div key={t} className="flex items-start gap-3 py-2 border-b border-line last:border-none">
                  <span className="w-6 h-6 rounded bg-emeraldSoft text-emerald text-[11px] mono flex items-center justify-center">✓</span>
                  <div><div className="text-[13.5px] font-medium">{t}</div><div className="text-[12px] text-slate2">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Please enter a valid email.', { type: 'warning' });
    setDone(true); toast('Subscribed.', { type: 'success' });
  };
  return (
    <section id="newsletter" className="wrap py-16 md:py-24" data-testid="newsletter-section">
      <div className="border border-line rounded-md bg-white p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="eyebrow">— The Weekly Digest</div>
          <h3 className="font-display text-[32px] md:text-[44px] leading-[1.05] mt-3">A weekly briefing on the Muslim startup ecosystem.</h3>
          <p className="text-[14px] text-slate2 mt-4 max-w-md">New companies, funding rounds, active pitches, and hand-picked opportunities. Delivered on Sundays.</p>
          {done ? (
            <div className="mt-6 border border-emerald/40 bg-emeraldSoft rounded p-4 text-emerald text-[13.5px]" data-testid="newsletter-success">Subscribed. Look out for us on Sunday.</div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex items-center border border-line rounded-md p-1 pl-4 max-w-md" data-testid="newsletter-form">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-slate2" data-testid="newsletter-input" />
              <button className="btn btn-coral btn-sm" data-testid="newsletter-submit">Subscribe <ArrowRight className="w-3.5 h-3.5" /></button>
            </form>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['#12','12 new halal-first companies you should know'],['#11','Series A raised: HalalPay closes $8.5M'],['#10','Report: The halal economy in ASEAN'],['#09','Winter demo day roster revealed']].map(([n, t]) => (
            <div key={n} className="border border-line rounded-md p-4">
              <div className="mono text-[10.5px] text-slate3 uppercase tracking-widest">Issue {n}</div>
              <div className="font-display text-[15px] mt-1 leading-snug">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

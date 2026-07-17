import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/common/Logo';
import { Twitter, Linkedin, Instagram, Youtube, ArrowUpRight, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';

const COLS = [
  { title: 'Directory', links: [['Companies','/startups'],['Founders','/founders'],['Investors','/investors'],['Active pitches','/pitches'],['Funding','/funding'],['Jobs','/jobs']] },
  { title: 'Submit', links: [['Submit startup','/submit-startup'],['Submit pitch','/submit-pitch'],['Claim profile','/dashboard'],['Partner with us','/contact']] },
  { title: 'Resources', links: [['About','/about-directory'],['Ecosystem reports','/about-directory'],['Contact','/contact']] },
  { title: 'Legal', links: [['Privacy','/about-directory'],['Terms','/about-directory'],['Disclaimer','/about-directory']] },
];

export default function Footer() {
  const { toast } = useToast();
  const { addSubscriber, data } = useData();
  const [email, setEmail] = useState('');
  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Please enter a valid email.', { type: 'warning' });
    const added = addSubscriber(email, 'Footer');
    toast(added ? 'You’re on the list.' : 'This email is already subscribed.', { type: added ? 'success' : 'info' }); setEmail('');
  };
  return (
    <footer className="bg-navy text-white mt-24" data-testid="site-footer">
      <div className="wrap py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Wordmark variant="dark" />
            <p className="mt-5 text-[13.5px] text-white/60 max-w-xs leading-relaxed">{data.settings.footerText}</p>
            <form onSubmit={subscribe} className="mt-6 flex items-center gap-2 border border-white/15 rounded-md p-1 pl-3 max-w-sm" data-testid="footer-newsletter-form">
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Weekly ecosystem digest" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/40" data-testid="footer-newsletter-input" />
              <button className="btn btn-coral btn-sm" data-testid="footer-newsletter-submit"><Send className="w-3.5 h-3.5" /></button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-white/50">
              {[Twitter, Linkedin, Instagram, Youtube].map((I, i) => (
                <a key={i} href="#" aria-label="social" className="w-8 h-8 rounded-md border border-white/15 flex items-center justify-center hover:border-white hover:text-white transition"><I className="w-3.5 h-3.5" /></a>
              ))}
            </div>
          </div>
          {COLS.map(col => (
            <div key={col.title} className="md:col-span-2">
              <div className="eyebrow eyebrow-navy mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="group inline-flex items-center gap-1 text-[13px] text-white/70 hover:text-white">{label} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" /></Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="hr-dark mt-14 pt-8 flex flex-col md:flex-row gap-6 items-start justify-between">
          <p className="text-[12px] text-white/45 max-w-3xl leading-relaxed">
            Startup Muslim provides ecosystem information only. Listings, pitches, funding information, valuations, and investor details are not investment advice, endorsements, financial recommendations, or Shariah certification. Users should verify all information independently.
          </p>
          <p className="text-[12px] text-white/45 whitespace-nowrap mono">© {new Date().getFullYear()} — Startup Muslim Atlas</p>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, HandCoins, Rocket, Newspaper, MailPlus, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '@/components/common/Section';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';

const INQUIRIES = [
  { icon: HandCoins, title: 'Partnership', desc: 'Partner with Startup Muslim to reach founders and investors.' },
  { icon: Building2, title: 'Investor inquiry', desc: 'Get access to featured pitches and portfolio updates.' },
  { icon: Rocket, title: 'Startup submission', desc: 'List your startup on the directory.' },
  { icon: Newspaper, title: 'Media inquiry', desc: 'Press, interviews, and ecosystem reports.' },
  { icon: MailPlus, title: 'Pitch inquiry', desc: 'Talk to us about your upcoming raise.' },
];

export default function Contact() {
  const [done, setDone] = useState(false);
  const [d, setD] = useState({ name:'', email:'', topic:'General', message:'' });
  const { toast } = useToast();
  const { addMessage } = useData();
  const submit = (e) => {
    e.preventDefault();
    if (!d.name || !d.email || !d.message) return toast('Please fill in all fields.', { type: 'warning' });
    addMessage(d);
    setDone(true); toast('Message received and added to the admin inbox.', { type: 'success' });
  };
  return (
    <div className="wrap pt-10 pb-24" data-testid="contact-page">
      <SectionHeading eyebrow="Contact" title="Say hello." subtitle="For partnership, media, or founder inquiries, reach out and our team will respond." />
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border border-line bg-white rounded-2xl p-6 md:p-8">
            {done ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emeraldSoft text-emerald mx-auto flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                <h3 className="font-display text-[26px] mt-4">Message received</h3>
                <p className="text-slate2 mt-2">Thanks — we\'ll respond within 3 business days.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Your name"><input value={d.name} onChange={e=>setD({...d, name:e.target.value})} className={inp} data-testid="contact-name" /></F>
                  <F label="Email"><input type="email" value={d.email} onChange={e=>setD({...d, email:e.target.value})} className={inp} data-testid="contact-email" /></F>
                  <F label="Topic" span2>
                    <select value={d.topic} onChange={e=>setD({...d, topic:e.target.value})} className={inp}>
                      {['General','Partnership','Investor inquiry','Startup submission','Media','Pitch'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </F>
                  <F label="Message" span2><textarea value={d.message} onChange={e=>setD({...d, message:e.target.value})} className={`${inp} min-h-[140px]`} data-testid="contact-message" /></F>
                </div>
                <button className="btn btn-coral" data-testid="contact-submit">Send message</button>
              </form>
            )}
          </div>
        </div>
        <aside className="space-y-3">
          {INQUIRIES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i*0.04 }} className="border border-line bg-white rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-coral"><Icon className="w-4 h-4" /></div>
              <div><div className="font-medium text-[14px]">{title}</div><div className="text-[12.5px] text-slate2">{desc}</div></div>
            </motion.div>
          ))}
        </aside>
      </div>
    </div>
  );
}

const inp = 'w-full bg-white border border-line rounded-xl p-3 outline-none focus:border-ink text-[14px]';
function F({ label, children, span2 }) { return <div className={span2 ? 'md:col-span-2' : ''}><label className="text-[12.5px] text-slate2">{label}</label><div className="mt-1">{children}</div></div>; }

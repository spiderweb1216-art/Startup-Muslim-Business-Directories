import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, Compass, Globe2, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/common/Section';
import { STATS } from '@/data/mockData';

export default function About() {
  return (
    <div className="pb-24" data-testid="about-page">
      <section className="hero-gradient">
        <div className="wrap pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="eyebrow">About</div>
              <h1 className="font-display text-[46px] md:text-[60px] leading-[1.05] mt-3">A directory for the Muslim startup ecosystem.</h1>
              <p className="text-slate2 text-[16px] mt-5 max-w-xl leading-relaxed">Startup Muslim helps founders, investors, and ecosystem builders discover Muslim-led startups, halal economy companies, and Islamic-finance innovators shaping the future.</p>
              <div className="mt-8 flex gap-3">
                <Link to="/directory" className="btn btn-coral">Explore directory</Link>
                <Link to="/contact" className="btn btn-outline">Contact us</Link>
              </div>
            </div>
            <motion.img initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=70" alt="" className="rounded-3xl border border-line" />
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Compass, title: 'Our mission', text: 'Make the global Muslim startup ecosystem discoverable, connected, and investable — with a founder-first lens.' },
            { icon: Globe2, title: 'Who we support', text: 'Muslim founders, halal-economy operators, investors, and ecosystem builders in 75+ countries.' },
            { icon: BadgeCheck, title: 'How listings are reviewed', text: 'Every submission is reviewed by our team before publishing to keep the directory high quality and trustworthy.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="border border-line bg-white rounded-2xl p-6">
              <Icon className="w-5 h-5 text-coral" />
              <div className="font-display text-[20px] mt-3">{title}</div>
              <p className="text-[14px] text-slate2 mt-2 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-canvas">
        <div className="wrap py-16">
          <SectionHeading eyebrow="At a glance" title="The Muslim ecosystem, mapped." />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[['Startups', STATS.startups+'+'],['Founders', STATS.founders+'+'],['Countries', STATS.countries+'+'],['Investors', STATS.investors+'+'],['Pitches tracked', STATS.pitches+'+']].map(([l,v]) => (
              <div key={l} className="border border-line bg-white rounded-2xl p-5">
                <div className="eyebrow">{l}</div>
                <div className="font-display text-[28px] mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="border border-line bg-white rounded-2xl p-6 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-coral" />
          <div className="text-[13.5px] text-slate2 leading-relaxed">
            Startup Muslim provides ecosystem information only. Listings, pitches, funding information, valuations, and investor details are not investment advice, endorsements, financial recommendations, or Shariah certification. Users should verify all information independently.
          </div>
        </div>
      </section>
    </div>
  );
}

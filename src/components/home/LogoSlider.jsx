import React from 'react';
import { STARTUPS } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add filler logos so we always have 18+
const filler = [
  { name:'AtharTech', slug:'ummahcart', color:'#171717', mark:'AT' },
  { name:'MihrabAI', slug:'deenai', color:'#3B7DD8', mark:'MA' },
  { name:'NoorFund', slug:'noorlearn', color:'#B58208', mark:'NF' },
  { name:'MuslimHub', slug:'masjidsync', color:'#7A55C7', mark:'MH' },
  { name:'IqraCloud', slug:'noorlearn', color:'#2F8F5B', mark:'IQ' },
  { name:'FitraLabs', slug:'salaamhealth', color:'#C93636', mark:'FL' },
];

export default function LogoSlider() {
  const items = [...STARTUPS.map(s => ({ name:s.name, slug:s.slug, color:s.logo.color, mark:s.logo.mark })), ...filler];
  const doubled = [...items, ...items];

  return (
    <section className="py-12 md:py-16 bg-cream" data-testid="logo-slider-section">
      <div className="wrapper container-p">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">Ecosystem</div>
          <h3 className="mt-2 font-display text-[26px] md:text-[32px] leading-[1.1] text-ink">Companies in the Startup Muslim Ecosystem</h3>
          <p className="mt-2 text-[14.5px] text-subtle">Discover emerging companies building across technology, finance, education, commerce, community, and the halal economy.</p>
        </div>
        <div className="mt-8 border border-line bg-white rounded-2xl overflow-hidden shadow-soft">
          <div className="marquee-mask py-7 relative">
            <motion.div
              className="marquee-track gap-8 md:gap-12"
              style={{ animation: 'marquee 55s linear infinite' }}
            >
              {doubled.map((it, i) => (
                <Link to={`/startups/${it.slug}`} key={i} className="group flex items-center gap-3 shrink-0" aria-label={it.name}>
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-display text-[15px] opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition duration-300"
                    style={{ background: it.color }}
                  >{it.mark}</span>
                  <span className="font-display text-[16px] md:text-[18px] text-ink/70 group-hover:text-ink transition-colors whitespace-nowrap">{it.name}</span>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

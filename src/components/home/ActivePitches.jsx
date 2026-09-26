import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PitchCard from '@/components/common/PitchCard';
import { SectionHeading } from '@/components/common/Section';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useData } from '@/context/DataContext';

const isLivePitch = (pitch = {}) => pitch.status === 'Active' && pitch.reviewStatus === 'Approved' && pitch.visibility === 'Public';

export default function ActivePitches() {
  const { data } = useData();
  const list = useMemo(() => {
    const startups = new Map((data.startups || []).filter((s) => s.status === 'Published').map((s) => [s.slug, s]));
    return (data.pitches || [])
      .filter(isLivePitch)
      .map((pitch) => ({ pitch, startup: startups.get(pitch.startupSlug) }))
      .filter((row) => row.startup)
      .sort((a, b) => new Date(b.pitch.submitted || b.pitch.updatedAt || 0) - new Date(a.pitch.submitted || a.pitch.updatedAt || 0))
      .slice(0, 4);
  }, [data.pitches, data.startups]);

  return (
    <section className="py-16 md:py-24 relative" style={{ background: 'linear-gradient(180deg, #FCECEC 0%, #F7F5F0 100%)' }} data-testid="active-pitches-section">
      <div className="wrapper container-p">
        <SectionHeading
          eyebrow="Actively raising"
          title="Startup pitches, live."
          subtitle="Explore startups currently raising investment across the Muslim startup ecosystem."
          right={<Link to="/pitches" className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ink hover:text-brand">View all pitches <ArrowRight className="w-4 h-4" /></Link>}
        />
        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {list.map(({ pitch, startup }, i) => <PitchCard key={pitch.id} pitch={pitch} startup={startup} index={i} />)}
          </div>
        ) : (
          <div className="mt-8 border border-line rounded-2xl bg-white p-6 text-[13px] text-slate2">No approved public pitches are available from the backend yet.</div>
        )}
        <div className="mt-8 rounded-2xl border border-line bg-white p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
          <p className="text-[12.5px] text-subtle leading-relaxed flex-1">
            Pitches are listed for informational purposes only and do not constitute investment advice, Shariah certification, or endorsement. Investors should conduct independent due diligence before making any decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

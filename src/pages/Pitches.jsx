import React, { useMemo } from 'react';
import PitchCard from '@/components/common/PitchCard';
import { SectionHeading } from '@/components/common/Section';
import { useData } from '@/context/DataContext';
import { Database, FileText } from 'lucide-react';

const isLivePitch = (pitch = {}) =>
  pitch.status === 'Active' &&
  pitch.reviewStatus === 'Approved' &&
  pitch.visibility === 'Public';

export default function Pitches() {
  const { data, loading, databaseStatus } = useData();

  const rows = useMemo(() => {
    const startupsBySlug = new Map(
      (data.startups || [])
        .filter((startup) => startup.status === 'Published')
        .map((startup) => [startup.slug, startup])
    );

    return (data.pitches || [])
      .filter(isLivePitch)
      .map((pitch) => ({ pitch, startup: startupsBySlug.get(pitch.startupSlug) }))
      .filter((row) => row.startup)
      .sort((a, b) => new Date(b.pitch.submitted || b.pitch.updatedAt || 0) - new Date(a.pitch.submitted || a.pitch.updatedAt || 0));
  }, [data.pitches, data.startups]);

  return (
    <div className="wrap pt-10 pb-24" data-testid="pitches-page">
      <SectionHeading
        eyebrow="Active pitches"
        title="Startups currently raising."
        subtitle="Explore live investment pitches from Muslim founders across the ecosystem. Every listing below comes from the backend database."
      />

      {rows.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map(({ pitch, startup }, i) => (
            <PitchCard key={pitch.id} pitch={pitch} startup={startup} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8 border border-line rounded-2xl bg-white p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-sandLight mx-auto flex items-center justify-center">
            {databaseStatus === 'error' ? <Database className="w-5 h-5 text-coral" /> : <FileText className="w-5 h-5 text-slate2" />}
          </div>
          <h3 className="font-display text-[20px] mt-4">
            {loading ? 'Loading pitches…' : databaseStatus === 'error' ? 'Backend database unavailable' : 'No public pitches yet'}
          </h3>
          <p className="text-[13px] text-slate2 mt-2 max-w-lg mx-auto">
            {databaseStatus === 'error'
              ? 'Start MySQL/API and refresh this page. Dummy pitch cards are intentionally not shown.'
              : 'A pitch appears here when it is Active, Approved and Public and its company profile is Published.'}
          </p>
        </div>
      )}

      <div className="mt-10 border border-line rounded-2xl bg-white p-5 text-[12.5px] text-slate2 leading-relaxed">
        Pitches are provided for informational purposes only and do not constitute investment advice, Shariah certification, or endorsement. Investors should conduct independent due diligence.
      </div>
    </div>
  );
}

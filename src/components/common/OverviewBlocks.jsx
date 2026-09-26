import React from 'react';
import { getOverviewBlocks } from '@/lib/overviewBlocks';

const imageWidth = {
  medium: 'max-w-2xl',
  wide: 'max-w-4xl',
  full: 'max-w-none',
};

export default function OverviewBlocks({ startup }) {
  const blocks = getOverviewBlocks(startup);

  if (!blocks.length) {
    return (
      <section>
        <div className="eyebrow">About</div>
        <h2 className="font-display text-[26px] mt-2">About {startup?.name || 'this company'}</h2>
        <p className="text-[14px] text-slate2 mt-3">No overview content has been added yet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8" data-testid="company-overview-blocks">
      {blocks.map((block) => {
        if (block.type === 'heading') {
          const classes = block.level === 4
            ? 'font-display text-[19px] md:text-[21px] leading-tight'
            : block.level === 3
              ? 'font-display text-[22px] md:text-[25px] leading-tight'
              : 'font-display text-[27px] md:text-[32px] leading-[1.1]';
          if (block.level === 4) return <h4 key={block.id} className={classes}>{block.text}</h4>;
          if (block.level === 3) return <h3 key={block.id} className={classes}>{block.text}</h3>;
          return <h2 key={block.id} className={classes}>{block.text}</h2>;
        }

        if (block.type === 'paragraph') {
          return <p key={block.id} className="max-w-3xl whitespace-pre-line text-[15px] md:text-[15.5px] text-ink/85 leading-[1.8]">{block.text}</p>;
        }

        if (block.type === 'image' && block.src) {
          return (
            <figure key={block.id} className={`w-full ${imageWidth[block.size] || imageWidth.wide}`}>
              <img src={block.src} alt={block.alt || ''} className="w-full max-h-[560px] object-cover rounded-xl border border-line bg-white" loading="lazy" />
              {block.caption && <figcaption className="mt-2 text-[11.5px] text-slate2 leading-relaxed">{block.caption}</figcaption>}
            </figure>
          );
        }

        if (block.type === 'gallery' && block.images?.length) {
          const grid = block.columns === 4 ? 'md:grid-cols-4' : block.columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
          return (
            <div key={block.id} className={`grid grid-cols-1 ${grid} gap-3 md:gap-4`}>
              {block.images.map((image) => (
                <figure key={image.id} className="min-w-0">
                  <img src={image.src} alt={image.alt || ''} className="w-full aspect-[4/3] object-cover rounded-xl border border-line bg-white" loading="lazy" />
                  {image.caption && <figcaption className="mt-1.5 text-[11px] text-slate2 leading-relaxed">{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

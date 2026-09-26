import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, Globe2, MapPin, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import SaveButton from '@/components/common/SaveButton';
import { normalizeOverviewBlocks } from '@/lib/overviewBlocks';

const publicRecord = (item) => item && !['Draft','Pending','Rejected','Archived','Inactive'].includes(item.status || 'Published');
const dateLabel = (value) => {
  if (!value) return 'To be announced';
  const date = new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' });
};
const categoriesOf = (item) => [...new Set([item.category, ...(Array.isArray(item.categories) ? item.categories : []), item.type].filter(Boolean))];

function Content({ blocks }) {
  return <div className="space-y-7" data-testid="opportunity-content">
    {blocks.map((block) => {
      if (block.type === 'heading') {
        const cls = block.level === 4 ? 'font-display text-xl' : block.level === 3 ? 'font-display text-2xl' : 'font-display text-[28px] md:text-[32px]';
        if (block.level === 4) return <h4 id={block.id} key={block.id} className={cls}>{block.text}</h4>;
        if (block.level === 3) return <h3 id={block.id} key={block.id} className={cls}>{block.text}</h3>;
        return <h2 id={block.id} key={block.id} className={cls}>{block.text}</h2>;
      }
      if (block.type === 'paragraph') return <p key={block.id} className="whitespace-pre-line leading-[1.85] text-[15px] text-ink/85">{block.text}</p>;
      if (block.type === 'image' && block.src) return <figure key={block.id}><img loading="lazy" src={block.src} alt={block.alt || ''} className="w-full max-h-[560px] object-cover rounded-xl border border-line"/>{block.caption && <figcaption className="text-xs text-slate2 mt-2">{block.caption}</figcaption>}</figure>;
      if (block.type === 'gallery') return <div key={block.id} className={`grid grid-cols-1 ${block.columns === 4 ? 'md:grid-cols-4' : block.columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>{(block.images || []).map((image)=><figure key={image.id}><img loading="lazy" src={image.src} alt={image.alt || ''} className="w-full aspect-[4/3] object-cover rounded-xl border border-line"/>{image.caption && <figcaption className="text-xs text-slate2 mt-2">{image.caption}</figcaption>}</figure>)}</div>;
      return null;
    })}
  </div>;
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, databaseStatus } = useData();
  const opportunities = (data.opportunities || []).filter(publicRecord);
  const item = opportunities.find((entry) => String(entry.id) === id);
  const [search, setSearch] = React.useState('');
  if (loading || databaseStatus === 'checking') return <div className="wrap py-24">Loading opportunity…</div>;
  if (databaseStatus === 'error') return <div className="wrap py-24">Opportunity data is temporarily unavailable.</div>;
  if (!item) return <div className="wrap py-24"><h1 className="font-display text-3xl">Opportunity unavailable</h1><Link to="/opportunities" className="btn btn-outline mt-6">Browse opportunities</Link></div>;
  const blocks = normalizeOverviewBlocks(item.overviewBlocks);
  const related = opportunities.filter((entry)=>entry.id !== item.id && (entry.type === item.type || categoriesOf(entry).some((category)=>categoriesOf(item).includes(category)))).slice(0,4);
  const applyUrl = /^https?:\/\//i.test(item.applicationUrl || '') ? item.applicationUrl : '';
  const submitSearch = (event) => { event.preventDefault(); navigate(`/opportunities?q=${encodeURIComponent(search.trim())}`); };
  return <div className="bg-canvas/35 min-h-screen" data-testid="opportunity-detail-page">
    <div className="wrap pt-8 pb-24">
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm text-slate2 hover:text-ink"><ArrowLeft size={16}/> All opportunities</Link>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-7 xl:gap-10 mt-7 items-start">
        <article className="bg-white border border-line rounded-2xl overflow-hidden min-w-0">
          {item.image && <img src={item.image} alt={item.title} className="w-full max-h-[420px] aspect-[16/8] object-cover"/>}
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap gap-2">{categoriesOf(item).map((category)=><Link key={category} to={`/opportunities?category=${encodeURIComponent(category)}`} className="tag hover:border-ink">{category}</Link>)}</div>
            <h1 className="font-display text-[32px] md:text-[44px] leading-tight mt-5">{item.title}</h1>
            <p className="text-[15px] text-slate2 mt-3">By {item.organization || 'Organization not listed'}</p>
            {item.description && <p className="mt-7 text-[16px] leading-[1.75] text-ink/85 border-l-[3px] border-coral pl-5">{item.description}</p>}
            <div className="mt-8 border-t border-line pt-8 space-y-8">
              {blocks.length > 0 && <Content blocks={blocks}/>}
              {item.eligibility && <section><h2 className="font-display text-[26px]">Who can apply</h2><p className="mt-3 text-[15px] leading-[1.8] whitespace-pre-line text-ink/85">{item.eligibility}</p></section>}
              {item.benefits && <section><h2 className="font-display text-[26px]">What you receive</h2><p className="mt-3 text-[15px] leading-[1.8] whitespace-pre-line text-ink/85">{item.benefits}</p></section>}
              {!blocks.length && !item.eligibility && !item.benefits && <p className="text-slate2">Further details have not been published yet. Check the application information for updates.</p>}
            </div>
          </div>
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24" aria-label="Opportunity sidebar">
          <div className="bg-white border border-line rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between"><h2 className="font-display text-[21px]">At a glance</h2><SaveButton type="opportunities" id={item.id}/></div>
            <dl className="mt-5 divide-y divide-line text-[13px]">
              <div className="py-3 flex justify-between gap-4"><dt className="text-slate2 inline-flex items-center gap-2"><CalendarDays size={15}/> Deadline</dt><dd className="text-right font-medium">{dateLabel(item.deadline)}</dd></div>
              <div className="py-3 flex justify-between gap-4"><dt className="text-slate2 inline-flex items-center gap-2"><MapPin size={15}/> Location</dt><dd className="text-right font-medium">{item.remote ? 'Global / Remote' : item.country || 'Not specified'}</dd></div>
              {item.industry && <div className="py-3 flex justify-between gap-4"><dt className="text-slate2">Industry</dt><dd className="text-right font-medium">{item.industry}</dd></div>}
              {item.founderStage && <div className="py-3 flex justify-between gap-4"><dt className="text-slate2">Founder stage</dt><dd className="text-right font-medium">{item.founderStage}</dd></div>}
              <div className="py-3 flex justify-between gap-4"><dt className="text-slate2">Type</dt><dd className="text-right font-medium">{item.type || 'Opportunity'}</dd></div>
            </dl>
            {applyUrl ? <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-coral w-full mt-5 justify-center">Apply on official site <ArrowUpRight size={16}/></a> : <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-xs text-slate2">Application link has not been provided yet.</p>}
          </div>
          <form onSubmit={submitSearch} className="bg-white border border-line rounded-2xl p-5"><label htmlFor="opportunity-sidebar-search" className="font-display text-[19px]">Search opportunities</label><div className="flex mt-3 gap-2"><input id="opportunity-sidebar-search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name or keyword" className="min-w-0 flex-1 border border-line rounded-lg px-3 text-sm"/><button aria-label="Search opportunities" className="btn btn-navy"><Search size={17}/></button></div></form>
          {related.length > 0 && <div className="bg-white border border-line rounded-2xl p-5"><h2 className="font-display text-[19px]">Related opportunities</h2><div className="divide-y divide-line mt-2">{related.map((entry)=><Link to={`/opportunities/${encodeURIComponent(entry.id)}`} key={entry.id} className="block py-3 group"><span className="text-[10px] uppercase tracking-wide text-coral">{entry.type}</span><span className="block text-sm font-medium group-hover:text-coral mt-1">{entry.title}</span></Link>)}</div></div>}
          <div className="text-xs text-slate2 px-1 flex items-center gap-2"><Globe2 size={14}/> Verify details with the organizer before applying.</div>
        </aside>
      </div>
    </div>
  </div>;
}

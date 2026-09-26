import React, { useMemo, useRef, useState } from 'react';
import {
  AlignLeft, ChevronDown, ChevronUp, Copy, GripVertical, Image as ImageIcon,
  Images, LayoutPanelLeft, Plus, Trash2, Type, Upload,
} from 'lucide-react';
import { createOverviewBlock, normalizeOverviewBlocks } from '@/lib/overviewBlocks';

const INPUT = 'w-full bg-white border border-line rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-ink';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Choose an image file.'));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error('Each uploaded image must be 1.5 MB or smaller. Use an image URL for larger files.'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

const WIDGETS = [
  ['heading', Type, 'Heading', 'Section title'],
  ['paragraph', AlignLeft, 'Text', 'Description / copy'],
  ['image', ImageIcon, 'Image', 'Single visual'],
  ['gallery', Images, 'Gallery', 'Image collection'],
];

export default function OverviewBlockEditor({ value, onChange, compact = false, subject = 'company' }) {
  const blocks = normalizeOverviewBlocks(value);
  const [selectedId, setSelectedId] = useState(blocks[0]?.id || '');
  const [error, setError] = useState('');

  const selectedIndex = useMemo(() => {
    const index = blocks.findIndex((b) => b.id === selectedId);
    return index >= 0 ? index : blocks.length ? 0 : -1;
  }, [blocks, selectedId]);

  const setBlocks = (next) => onChange(normalizeOverviewBlocks(next));
  const add = (type) => {
    const block = createOverviewBlock(type);
    setBlocks([...blocks, block]);
    setSelectedId(block.id);
  };
  const update = (index, patch) => setBlocks(blocks.map((block, i) => i === index ? { ...block, ...patch } : block));
  const remove = (index) => {
    const next = blocks.filter((_, i) => i !== index);
    setBlocks(next);
    setSelectedId(next[Math.min(index, next.length - 1)]?.id || '');
  };
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };
  const duplicate = (index) => {
    const source = JSON.parse(JSON.stringify(blocks[index]));
    source.id = `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (Array.isArray(source.images)) source.images = source.images.map((image, i) => ({ ...image, id: `${source.id}-image-${i + 1}` }));
    const next = [...blocks];
    next.splice(index + 1, 0, source);
    setBlocks(next);
    setSelectedId(source.id);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-[#F4F1EA] ${compact ? '' : 'min-h-[560px]'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] min-h-[560px]">
        <aside className="border-b lg:border-b-0 lg:border-r border-line bg-[#101827] text-white p-4">
          <div className="flex items-center gap-2">
            <LayoutPanelLeft className="w-4 h-4 text-coral" />
            <div>
              <div className="text-[12px] font-semibold">Overview widgets</div>
              <div className="text-[10px] text-white/45 mt-0.5">Click to add to canvas</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {WIDGETS.map(([type, Icon, label]) => (
              <button key={type} type="button" onClick={() => add(type)} className="rounded-xl border border-white/10 bg-white/[0.055] p-3 text-left hover:bg-white/10 hover:border-white/20 transition">
                <Icon className="w-4 h-4 text-coral" />
                <div className="text-[11px] font-medium mt-2">{label}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-[9.5px] uppercase tracking-[0.17em] text-white/40">Navigator</div>
            <div className="space-y-1.5 mt-3 max-h-[300px] overflow-y-auto thin-scroll pr-1">
              {blocks.length === 0 && <div className="text-[10.5px] leading-relaxed text-white/40">Your page is empty. Add a widget above.</div>}
              {blocks.map((block, index) => {
                const Icon = block.type === 'heading' ? Type : block.type === 'image' ? ImageIcon : block.type === 'gallery' ? Images : AlignLeft;
                const active = selectedIndex === index;
                return <button key={block.id} type="button" onClick={() => setSelectedId(block.id)} className={`w-full rounded-lg px-2.5 py-2 flex items-center gap-2 text-left ${active ? 'bg-white text-ink' : 'text-white/70 hover:bg-white/10'}`}>
                  <GripVertical className={`w-3 h-3 ${active ? 'text-slate2' : 'text-white/30'}`} />
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-coral' : 'text-white/60'}`} />
                  <span className="text-[10.5px] truncate flex-1">{block.type === 'paragraph' ? 'Text' : block.type} {index + 1}</span>
                </button>;
              })}
            </div>
          </div>
        </aside>

        <section className="p-4 md:p-6 overflow-y-auto max-h-[72vh] thin-scroll">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="eyebrow">Live content canvas</div>
              <div className="font-display text-[20px] mt-1">Build the {subject === 'company' ? 'Overview tab' : `${subject} page`}</div>
              <p className="text-[11.5px] text-slate2 mt-1">The order here is exactly the order visitors see on the public {subject} page.</p>
            </div>
            <span className="tag bg-white">{blocks.length} block{blocks.length === 1 ? '' : 's'}</span>
          </div>

          {error && <div className="mb-4 rounded-lg bg-coralSoft px-3 py-2 text-[11.5px] text-coral">{error}</div>}

          <div className="mx-auto max-w-4xl rounded-2xl border border-line bg-white p-4 md:p-7 min-h-[410px] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            {blocks.length === 0 && (
              <button type="button" onClick={() => add('heading')} className="w-full min-h-[320px] border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center text-center hover:border-coral/50 bg-canvas/25">
                <Plus className="w-6 h-6 text-coral" />
                <div className="font-medium text-[13px] mt-3">Start building the Overview</div>
                <div className="text-[11px] text-slate2 mt-1">Choose a widget from the left or click here.</div>
              </button>
            )}

            <div className="space-y-3">
              {blocks.map((block, index) => {
                const active = selectedIndex === index;
                return (
                  <div key={block.id} onClick={() => setSelectedId(block.id)} className={`group rounded-xl border bg-white transition ${active ? 'border-coral shadow-[0_0_0_2px_rgba(217,75,61,0.08)]' : 'border-transparent hover:border-line'}`}>
                    <div className={`flex items-center gap-2 px-3 py-2 border-b ${active ? 'border-coral/15 bg-coralSoft/35' : 'border-transparent group-hover:border-line group-hover:bg-canvas/40'}`}>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-slate2 flex-1">{block.type === 'paragraph' ? 'Text' : block.type}</span>
                      <button type="button" onClick={(e)=>{e.stopPropagation();move(index,-1);}} disabled={index===0} className="admin-icon-btn disabled:opacity-25"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={(e)=>{e.stopPropagation();move(index,1);}} disabled={index===blocks.length-1} className="admin-icon-btn disabled:opacity-25"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={(e)=>{e.stopPropagation();duplicate(index);}} className="admin-icon-btn"><Copy className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={(e)=>{e.stopPropagation();remove(index);}} className="admin-icon-btn text-coral"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="p-3 md:p-4">
                      {block.type === 'heading' && <HeadingEditor block={block} onChange={(patch) => update(index, patch)} />}
                      {block.type === 'paragraph' && <ParagraphEditor block={block} onChange={(patch) => update(index, patch)} />}
                      {block.type === 'image' && <ImageEditor block={block} onChange={(patch) => update(index, patch)} onError={setError} />}
                      {block.type === 'gallery' && <GalleryEditor block={block} onChange={(patch) => update(index, patch)} onError={setError} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeadingEditor({ block, onChange }) {
  return <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-3"><input value={block.text || ''} onChange={(e) => onChange({ text: e.target.value })} className={`${INPUT} font-display text-[18px]`} placeholder="Section heading" /><select value={block.level || 2} onChange={(e) => onChange({ level: Number(e.target.value) })} className={INPUT}><option value={2}>Heading 2</option><option value={3}>Heading 3</option><option value={4}>Heading 4</option></select></div>;
}

function ParagraphEditor({ block, onChange }) {
  return <textarea value={block.text || ''} onChange={(e) => onChange({ text: e.target.value })} className={`${INPUT} min-h-[130px] resize-y leading-relaxed`} placeholder="Write the company story, mission, problem, solution, or any description…" />;
}

function ImageEditor({ block, onChange, onError }) {
  const inputRef = useRef(null);
  const upload = async (file) => {
    try { onError(''); onChange({ src: await fileToDataUrl(file) }); }
    catch (error) { onError(error.message); }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
        <input value={block.src || ''} onChange={(e) => onChange({ src: e.target.value })} className={INPUT} placeholder="Image URL or upload an image" />
        <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-outline bg-white"><Upload className="w-3.5 h-3.5" /> Choose image</button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = ''; }} />
      </div>
      {block.src && <img src={block.src} alt="Block preview" className="w-full max-h-72 rounded-lg border border-line object-cover bg-canvas" />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={block.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} className={INPUT} placeholder="Alt text" />
        <select value={block.size || 'wide'} onChange={(e) => onChange({ size: e.target.value })} className={INPUT}><option value="medium">Medium width</option><option value="wide">Wide</option><option value="full">Full content width</option></select>
      </div>
      <input value={block.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} className={INPUT} placeholder="Caption (optional)" />
    </div>
  );
}

function GalleryEditor({ block, onChange, onError }) {
  const [url, setUrl] = useState('');
  const inputRef = useRef(null);
  const images = Array.isArray(block.images) ? block.images : [];
  const addImages = (newImages) => onChange({ images: [...images, ...newImages].slice(0, 12) });
  const addUrl = () => {
    const src = url.trim(); if (!src) return;
    addImages([{ id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, src, alt:'', caption:'' }]);
    setUrl('');
  };
  const upload = async (files) => {
    try {
      onError('');
      const selected = Array.from(files || []).slice(0, Math.max(0, 12-images.length));
      const urls = await Promise.all(selected.map(fileToDataUrl));
      addImages(urls.map((src,i)=>({ id:`gallery-${Date.now()}-${i}`, src, alt:'', caption:'' })));
    } catch (error) { onError(error.message); }
  };
  const patchImage = (id, patch) => onChange({ images: images.map((image)=>image.id===id?{...image,...patch}:image) });
  const removeImage = (id) => onChange({ images: images.filter((image)=>image.id!==id) });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
        <input value={url} onChange={(e)=>setUrl(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addUrl();}}} className={INPUT} placeholder="Paste image URL" />
        <button type="button" onClick={addUrl} className="btn btn-outline bg-white"><Plus className="w-3.5 h-3.5" /> Add URL</button>
        <button type="button" onClick={()=>inputRef.current?.click()} className="btn btn-outline bg-white"><Upload className="w-3.5 h-3.5" /> Upload</button>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e)=>{upload(e.target.files);e.target.value='';}} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate2">{images.length}/12 images</span>
        <select value={block.columns || 3} onChange={(e)=>onChange({columns:Number(e.target.value)})} className={`${INPUT} max-w-[150px]`}><option value={2}>2 columns</option><option value={3}>3 columns</option><option value={4}>4 columns</option></select>
      </div>
      {images.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{images.map((image)=><div key={image.id} className="border border-line rounded-lg overflow-hidden bg-canvas/30"><div className="relative"><img src={image.src} alt={image.alt || ''} className="w-full h-28 object-cover"/><button type="button" onClick={()=>removeImage(image.id)} className="absolute top-2 right-2 w-7 h-7 rounded-md bg-navy/80 text-white flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button></div><div className="p-2 space-y-2"><input value={image.alt||''} onChange={(e)=>patchImage(image.id,{alt:e.target.value})} className={`${INPUT} !py-1.5 !text-[11px]`} placeholder="Alt text"/><input value={image.caption||''} onChange={(e)=>patchImage(image.id,{caption:e.target.value})} className={`${INPUT} !py-1.5 !text-[11px]`} placeholder="Caption"/></div></div>)}</div>}
    </div>
  );
}

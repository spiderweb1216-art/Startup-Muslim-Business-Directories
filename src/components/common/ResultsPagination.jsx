import React from 'react';
import { visiblePageNumbers } from '@/lib/pagination';

// Shared for the Companies archive, Investors archive and Discover atlas.
// Parent owns page state; filtering changes reset it to page one.
export default function ResultsPagination({ page, totalPages, from, to, total, onPageChange, noun = 'results' }) {
  return (
    <div className="mt-7 flex flex-col md:flex-row items-center justify-between gap-3" data-testid="results-pagination">
      <p className="text-[12.5px] text-slate2" role="status">
        Showing <strong className="text-ink">{from}–{to}</strong> of <strong className="text-ink">{total}</strong> {noun}
      </p>
      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label={`${noun} pages`}>
          <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}
            className="min-w-9 h-9 px-2.5 rounded-md border border-line bg-white text-[12px] disabled:opacity-40 disabled:cursor-not-allowed hover:border-ink"
            aria-label="Previous page">Previous</button>
          {visiblePageNumbers(page, totalPages).map((number, index) => number === 'ellipsis' ? (
            <span key={`gap-${index}`} className="px-1.5 text-slate2" aria-hidden="true">…</span>
          ) : (
            <button key={number} type="button" onClick={() => onPageChange(number)}
              aria-label={`Go to page ${number}`} aria-current={number === page ? 'page' : undefined}
              className={`min-w-9 h-9 px-2 rounded-md border text-[12.5px] ${number === page ? 'bg-navy border-navy text-white' : 'bg-white border-line text-ink hover:border-ink'}`}>
              {number}
            </button>
          ))}
          <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
            className="min-w-9 h-9 px-2.5 rounded-md border border-line bg-white text-[12px] disabled:opacity-40 disabled:cursor-not-allowed hover:border-ink"
            aria-label="Next page">Next</button>
        </nav>
      )}
    </div>
  );
}

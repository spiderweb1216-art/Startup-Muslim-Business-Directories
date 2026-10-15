// Funding totals displayed publicly must reflect the company's published
// funding-round records, not the separately editable startup.totalRaised field.
// Keeping this read-only avoids changing existing companies or import behavior.
const NON_PUBLIC_STATUSES = new Set([
  'Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive',
  'Revoked', 'Cancelled',
]);

export function isPublicFundingRound(round) {
  return Boolean(round) && !NON_PUBLIC_STATUSES.has(round.status || 'Published');
}

export function getFundingSummary(rounds, startupSlug) {
  let roundCount = 0;
  let disclosedCount = 0;
  let totalRaised = 0;

  if (!startupSlug) return { roundCount, disclosedCount, totalRaised };

  for (const round of Array.isArray(rounds) ? rounds : []) {
    if (round?.startupSlug !== startupSlug || !isPublicFundingRound(round)) continue;
    roundCount += 1;
    // Missing/undisclosed amounts must never be interpreted as confirmed $0.
    if (round.amount === '' || round.amount == null) continue;
    const amount = Number(round.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    disclosedCount += 1;
    totalRaised += amount;
  }
  return { roundCount, disclosedCount, totalRaised };
}

export function fundingRaisedLabel(summary, formatMoney) {
  if (!summary?.roundCount) return '—';
  if (!summary.disclosedCount) return 'Undisclosed';
  return formatMoney(summary.totalRaised);
}

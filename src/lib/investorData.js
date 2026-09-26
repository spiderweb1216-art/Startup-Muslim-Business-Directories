export const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export const isPublicInvestorRecord = (record = {}) => {
  const status = record.status || 'Published';
  return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive'].includes(status);
};

export const isPublicRound = (record = {}) => {
  const status = record.status || 'Published';
  return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive'].includes(status);
};

export const roundInvestorSlugs = (round = {}) => {
  const slugs = new Set(asArray(round.investorSlugs));
  if (round.leadInvestorSlug) slugs.add(round.leadInvestorSlug);
  return [...slugs];
};

export const getInvestorRounds = (rounds = [], investorSlug = '') => {
  if (!investorSlug) return [];
  return rounds
    .filter(isPublicRound)
    .filter((round) => roundInvestorSlugs(round).includes(investorSlug))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};

export const getInvestorPortfolioSlugs = (investor = {}, rounds = []) => {
  const slugs = new Set(asArray(investor.portfolio));
  getInvestorRounds(rounds, investor.slug).forEach((round) => {
    if (round.startupSlug) slugs.add(round.startupSlug);
  });
  return [...slugs];
};

export const getInvestorPortfolio = (investor = {}, startups = [], rounds = []) => {
  const bySlug = new Map(startups.map((startup) => [startup.slug, startup]));
  return getInvestorPortfolioSlugs(investor, rounds)
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .filter((startup) => {
      const status = startup.status || 'Published';
      return !['Draft', 'Pending', 'Rejected', 'Archived', 'Blocked', 'Inactive'].includes(status);
    });
};

export const getPortfolioCount = (investor = {}, startups = [], rounds = []) =>
  getInvestorPortfolio(investor, startups, rounds).length;

export const getInvestorTypes = (investors = []) => [
  'All',
  ...Array.from(new Set(investors.filter(isPublicInvestorRecord).map((item) => item.type).filter(Boolean))).sort(),
];

export const getInvestorStages = (investors = []) => [
  'All',
  ...Array.from(new Set(investors.filter(isPublicInvestorRecord).flatMap((item) => asArray(item.stageFocus)).filter(Boolean))).sort(),
];

export const getInvestorCoInvestors = (investor = {}, investors = [], rounds = [], startups = []) => {
  if (!investor.slug) return [];
  const ownRounds = getInvestorRounds(rounds, investor.slug);
  const ownPortfolio = new Set(getInvestorPortfolioSlugs(investor, rounds));
  const scores = new Map();

  ownRounds.forEach((round) => {
    roundInvestorSlugs(round).forEach((slug) => {
      if (!slug || slug === investor.slug) return;
      scores.set(slug, (scores.get(slug) || 0) + 3);
    });
  });

  investors.filter(isPublicInvestorRecord).forEach((candidate) => {
    if (candidate.slug === investor.slug) return;
    const candidatePortfolio = getInvestorPortfolioSlugs(candidate, rounds);
    const overlap = candidatePortfolio.filter((slug) => ownPortfolio.has(slug)).length;
    if (overlap) scores.set(candidate.slug, (scores.get(candidate.slug) || 0) + overlap);
  });

  return investors
    .filter(isPublicInvestorRecord)
    .filter((candidate) => candidate.slug !== investor.slug)
    .map((candidate) => ({
      ...candidate,
      _relationshipScore: scores.get(candidate.slug) || 0,
      _portfolioCount: getPortfolioCount(candidate, startups, rounds),
    }))
    .filter((candidate) => candidate._relationshipScore > 0)
    .sort((a, b) => b._relationshipScore - a._relationshipScore || a.name.localeCompare(b.name));
};

export const formatInvestorMoney = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return String(value || '—');
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return amount ? `$${amount.toLocaleString()}` : '—';
};

export const formatInvestorDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const latestInvestorRound = (rounds = [], investorSlug = '') =>
  getInvestorRounds(rounds, investorSlug)[0] || null;

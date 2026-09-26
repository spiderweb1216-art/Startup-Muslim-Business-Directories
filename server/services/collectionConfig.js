const bool = (value) => value ? 1 : 0;
const number = (value) => Number(value || 0);
const nullable = (value) => value === '' || value == null ? null : value;

const COLLECTIONS = {
  categories: {
    table: 'categories', idField: 'slug', nameField: 'name',
    indexed: (r) => ({ status:r.status || 'Active', display_order:number(r.order), featured:bool(r.featured) }),
  },
  startups: {
    table: 'startups', idField: 'slug', nameField: 'name',
    indexed: (r) => ({ status:r.status || 'Pending', owner_id:nullable(r.ownerId), featured:bool(r.featured), verified:bool(r.verified), category:nullable(r.category), country:nullable(r.country), stage:nullable(r.stage), total_raised:number(r.totalRaised), views:number(r.views) }),
  },
  founders: {
    table: 'founders', idField: 'slug', nameField: 'name',
    indexed: (r) => ({ status:r.status || 'Published', owner_id:nullable(r.ownerId), verified:bool(r.verified), startup_slug:nullable(r.startupSlug), country:nullable(r.country), industry:nullable(r.industry) }),
  },
  investors: {
    table: 'investors', idField: 'slug', nameField: 'name',
    indexed: (r) => ({ status:r.status || 'Published', owner_id:nullable(r.ownerId), verified:bool(r.verified), featured:bool(r.featured), investor_type:nullable(r.type), country:nullable(r.country) }),
  },
  rounds: {
    table: 'funding_rounds', idField: 'id', nameField: 'roundName',
    indexed: (r) => ({ status:r.status || 'Published', startup_slug:nullable(r.startupSlug), amount:number(r.amount), valuation:number(r.valuation), round_date:nullable(r.date) }),
  },
  pitches: {
    table: 'pitches', idField: 'id', nameField: 'pitchTitle',
    indexed: (r) => ({ status:r.status || 'Active', review_status:r.reviewStatus || 'Pending', visibility:r.visibility || 'Private', owner_id:nullable(r.ownerId), startup_slug:nullable(r.startupSlug), featured:bool(r.featured), requested:number(r.requested), views:number(r.views) }),
  },
  jobs: {
    table: 'jobs', idField: 'id', nameField: 'title',
    indexed: (r) => ({ status:r.status || 'Published', startup_slug:nullable(r.startupSlug), location:nullable(r.location), arrangement:nullable(r.arrangement), job_type:nullable(r.type) }),
  },
  opportunities: {
    table: 'opportunities', idField: 'id', nameField: 'title',
    indexed: (r) => ({ status:r.status || 'Published', opportunity_type:nullable(r.type), organization:nullable(r.organization), country:nullable(r.country), deadline:nullable(r.deadline), featured:bool(r.featured) }),
  },
  claims: {
    table: 'claim_requests', idField: 'id', nameField: 'requester',
    indexed: (r) => ({ status:r.status || 'Pending', owner_id:nullable(r.ownerId), startup_slug:nullable(r.startupSlug), requester_email:nullable(r.requesterEmail || r.email) }),
  },
  messages: {
    table: 'contact_messages', idField: 'id', nameField: 'name',
    indexed: (r) => ({ email:nullable(r.email), topic:nullable(r.topic), status:r.status || 'Unread' }),
  },
  subscribers: {
    table: 'newsletter_subscribers', idField: 'id', nameField: 'email',
    indexed: (r) => ({ email:r.email, status:r.status || 'Subscribed', source:nullable(r.source) }),
  },
  pages: {
    table: 'pages', idField: 'slug', nameField: 'title',
    indexed: (r) => ({ status:r.status || 'Draft', seo_title:nullable(r.seoTitle) }),
  },
  media: {
    table: 'media', idField: 'id', nameField: 'name',
    indexed: (r) => ({ media_type:nullable(r.type), media_url:nullable(r.url) }),
  },
  activity: {
    table: 'activity_logs', idField: 'id', nameField: 'action',
    indexed: (r) => ({ action:r.action || 'Activity', actor:nullable(r.actor), detail:nullable(r.detail), created_at:nullable(r.createdAt) || new Date() }),
  },
};

const ADMIN_ONLY = new Set(['users','messages','subscribers','activity']);
const MEMBER_OWNED = new Set(['startups','founders','investors','rounds','pitches','jobs','opportunities','claims']);
const STARTUP_LINKED = new Set(['founders','rounds','pitches','jobs','opportunities']);

module.exports = { COLLECTIONS, ADMIN_ONLY, MEMBER_OWNED, STARTUP_LINKED };

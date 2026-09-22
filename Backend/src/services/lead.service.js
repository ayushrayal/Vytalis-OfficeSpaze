const { Lead, LEAD_STATUS } = require('../models/Lead');
const windsorProvider = require('../providers/windsor.provider');
const { logActivity } = require('./activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const KNOWN_RAW_FIELDS = new Set([
  'id',
  'full_name',
  'email',
  'phone_number',
  'created_time',
  'date',
  'account_id',
  'account_name',
  'form_id',
  'form_name',
  'campaign',
  'campaign_id',
  'adset_id',
  'adset_name',
  'ad_id',
  'ad_name',
  'data_fetched_at'
]);

/**
 * Normalizes a raw Windsor.ai lead record into a standard internal lead format.
 * - Safely maps `id` to `metaLeadId`.
 * - Preserves nulls for missing optional fields.
 * - Accurately converts `created_time` to Date without timezone corruption.
 * - Dynamically extracts custom form responses if present.
 *
 * @param {Object} raw
 * @returns {Object|null}
 */
const normalizeWindsorLead = (raw) => {
  if (!raw || (!raw.id && raw.id !== 0)) {
    return null;
  }

  const metaLeadId = String(raw.id).trim();
  if (!metaLeadId) return null;

  // Safe Date parsing for created_time (e.g. "2026-06-24T19:31:23+0000")
  let createdTime = null;
  if (raw.created_time) {
    const parsed = new Date(raw.created_time);
    if (!isNaN(parsed.getTime())) {
      createdTime = parsed;
    }
  }

  // Safe Date parsing for data_fetched_at
  let dataFetchedAt = null;
  if (raw.data_fetched_at) {
    const parsed = new Date(raw.data_fetched_at);
    if (!isNaN(parsed.getTime())) {
      dataFetchedAt = parsed;
    }
  }

  // Extract any custom question fields or unrecognized fields into formResponses
  const formResponses = [];
  for (const [key, val] of Object.entries(raw)) {
    if (!KNOWN_RAW_FIELDS.has(key) && val !== undefined && val !== null && String(val).trim() !== '') {
      formResponses.push({
        field: key,
        value: typeof val === 'object' ? JSON.stringify(val) : String(val)
      });
    }
  }

  return {
    metaLeadId,
    fullName: raw.full_name ? String(raw.full_name).trim() : null,
    email: raw.email && typeof raw.email === 'string' && raw.email.trim() ? raw.email.trim().toLowerCase() : null,
    phoneNumber: raw.phone_number ? String(raw.phone_number).trim() : null,
    createdTime,
    source: 'facebook_leads',
    accountId: raw.account_id ? String(raw.account_id).trim() : null,
    accountName: raw.account_name ? String(raw.account_name).trim() : null,
    formId: raw.form_id ? String(raw.form_id).trim() : null,
    formName: raw.form_name ? String(raw.form_name).trim() : null,
    formResponses,
    campaignId: raw.campaign_id ? String(raw.campaign_id).trim() : null,
    campaignName: (raw.campaign || raw.campaign_name) ? String(raw.campaign || raw.campaign_name).trim() : null,
    adSetId: raw.adset_id ? String(raw.adset_id).trim() : null,
    adSetName: raw.adset_name ? String(raw.adset_name).trim() : null,
    adId: raw.ad_id ? String(raw.ad_id).trim() : null,
    adName: raw.ad_name ? String(raw.ad_name).trim() : null,
    dataFetchedAt
  };
};

/**
 * Upserts a normalized lead document by `metaLeadId`.
 * If new: creates lead with default status 'NEW'.
 * If existing: updates Windsor source attributes and `lastSyncedAt`.
 * NEVER overwrites or resets CRM-managed fields:
 * (`assignedTo`, `assignedAt`, `assignedBy`, `status`, `nextFollowUpAt`, `notes`).
 *
 * @param {Object} normalizedLead
 * @returns {Promise<{ lead: Object, isNew: boolean }>}
 */
const upsertLead = async (normalizedLead) => {
  const { metaLeadId } = normalizedLead;

  const existing = await Lead.findOne({ metaLeadId });

  if (!existing) {
    const created = await Lead.create({
      ...normalizedLead,
      status: 'NEW',
      lastSyncedAt: new Date()
    });
    return { lead: created, isNew: true };
  }

  // Update only Windsor source fields that can legitimately evolve
  if (normalizedLead.fullName && !existing.fullName) existing.fullName = normalizedLead.fullName;
  if (normalizedLead.email && !existing.email) existing.email = normalizedLead.email;
  if (normalizedLead.phoneNumber && !existing.phoneNumber) existing.phoneNumber = normalizedLead.phoneNumber;
  if (normalizedLead.createdTime && !existing.createdTime) existing.createdTime = normalizedLead.createdTime;

  if (normalizedLead.accountName) existing.accountName = normalizedLead.accountName;
  if (normalizedLead.formName) existing.formName = normalizedLead.formName;
  if (normalizedLead.campaignName) existing.campaignName = normalizedLead.campaignName;
  if (normalizedLead.adSetName) existing.adSetName = normalizedLead.adSetName;
  if (normalizedLead.adName) existing.adName = normalizedLead.adName;
  if (normalizedLead.dataFetchedAt) existing.dataFetchedAt = normalizedLead.dataFetchedAt;

  if (normalizedLead.formResponses && normalizedLead.formResponses.length > 0) {
    existing.formResponses = normalizedLead.formResponses;
  }

  existing.lastSyncedAt = new Date();

  // CRM fields: assignedTo, assignedAt, assignedBy, status, nextFollowUpAt, notes remain untouched!
  await existing.save();

  return { lead: existing, isNew: false };
};

/**
 * Syncs Facebook Lead Ads records from Windsor.ai to MongoDB.
 *
 * @param {Object} params
 * @param {string} [params.datePreset='last_90d']
 * @param {string} [params.dateFrom]
 * @param {string} [params.dateTo]
 * @param {string} [params.accountId]
 * @param {Object} [params.actor] - Current authenticated user triggering the sync
 * @returns {Promise<{ fetched: number, created: number, updated: number, skipped: number, errors: number }>}
 */
const syncLeads = async ({ datePreset = 'last_90d', dateFrom, dateTo, accountId, actor } = {}) => {
  const result = await windsorProvider.fetchFacebookLeads({
    datePreset,
    dateFrom,
    dateTo,
    accountId
  });

  const rawData = result.rawData || [];
  let fetched = rawData.length;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const CHUNK_SIZE = 25;
  for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
    const chunk = rawData.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (rawRecord) => {
        try {
          const normalized = normalizeWindsorLead(rawRecord);
          if (!normalized) {
            skipped++;
            return;
          }

          const { isNew } = await upsertLead(normalized);
          if (isNew) {
            created++;
          } else {
            updated++;
          }
        } catch (recordError) {
          errors++;
          console.error('[LeadService] Failed to persist individual lead record:', {
            recordId: rawRecord?.id,
            error: recordError.message
          });
        }
      })
    );
  }

  // 19. Activity Logging: Single batch entry, no PII (phone/email)
  await logActivity({
    action: 'synced',
    entityType: 'meta_lead',
    entityName: 'Meta Leads Sync',
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'System Admin',
      email: actor?.email || ''
    },
    metadata: {
      fetched,
      created,
      updated,
      skipped,
      errors
    }
  });

  // 20. SSE Broadcast: Safe summary event
  broadcastDashboardUpdate({
    type: 'META_LEADS_SYNCED',
    entity: 'meta_lead',
    action: 'synced',
    fetched,
    created,
    updated
  });

  return {
    fetched,
    created,
    updated,
    skipped,
    errors
  };
};

/**
 * Retrieves leads with server-side pagination, search, and filtering.
 *
 * @param {Object} queryParams
 * @returns {Promise<{ leads: Array<Object>, pagination: Object }>}
 */
const getLeads = async ({
  page = 1,
  limit = 20,
  search,
  status,
  assignedTo,
  dateFrom,
  dateTo
} = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {};

  if (status && LEAD_STATUS.includes(status.toUpperCase())) {
    query.status = status.toUpperCase();
  }

  if (assignedTo) {
    if (assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else if (assignedTo === 'assigned') {
      query.assignedTo = { $ne: null };
    } else {
      query.assignedTo = assignedTo;
    }
  }

  if (dateFrom || dateTo) {
    query.createdTime = {};
    if (dateFrom) {
      query.createdTime.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdTime.$lte = end;
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { fullName: regex },
      { email: regex },
      { phoneNumber: regex },
      { campaignName: regex },
      { formName: regex }
    ];
  }

  const [total, leads] = await Promise.all([
    Lead.countDocuments(query),
    Lead.find(query)
      .populate('assignedTo', 'name email role status')
      .populate('assignedBy', 'name email')
      .sort({ createdTime: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / parsedLimit);
  const hasNextPage = parsedPage < totalPages;
  const hasPrevPage = parsedPage > 1 && totalPages > 0;

  return {
    leads,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
};

/**
 * Retrieves a single lead by its MongoDB ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getLeadById = async (id) => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email role status')
    .populate('assignedBy', 'name email');

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  return lead;
};

/**
 * Diagnostic test endpoint function (admin-only).
 * Calls Windsor, normalizes rows, returns counts and sample rows WITHOUT persisting to DB.
 *
 * @param {Object} options
 * @returns {Promise<{ count: number, accountId: string, sample: Array<Object> }>}
 */
const testWindsorConnection = async ({ datePreset = 'last_90d', accountId } = {}) => {
  const result = await windsorProvider.fetchFacebookLeads({
    datePreset,
    accountId
  });

  const rawData = result.rawData || [];
  const normalizedSample = rawData.slice(0, 5).map(normalizeWindsorLead).filter(Boolean);

  return {
    count: rawData.length,
    accountId: result.accountId,
    sample: normalizedSample
  };
};

/**
 * Retrieves latest sync status and metrics.
 *
 * @returns {Promise<Object>}
 */
const getSyncStatus = async () => {
  const [totalLeads, latestLead] = await Promise.all([
    Lead.countDocuments(),
    Lead.findOne().sort({ lastSyncedAt: -1 }).select('lastSyncedAt createdTime')
  ]);

  return {
    totalLeads,
    lastSyncedAt: latestLead?.lastSyncedAt || null,
    latestLeadCreatedTime: latestLead?.createdTime || null
  };
};

module.exports = {
  normalizeWindsorLead,
  upsertLead,
  syncLeads,
  getLeads,
  getLeadById,
  testWindsorConnection,
  getSyncStatus
};

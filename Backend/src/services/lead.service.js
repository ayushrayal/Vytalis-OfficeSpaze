const mongoose = require('mongoose');
const { Lead, LEAD_STATUS, CONVERSION_TYPES, CONVERSION_TARGET_TYPES } = require('../models/Lead');
const User = require('../models/User');
const Activity = require('../models/Activity');
const VirtualOffice = require('../models/VirtualOffice');
const ManagedOffice = require('../models/ManagedOffice');
const CoworkSpace = require('../models/CoworkSpace');
const DedicatedSpace = require('../models/DedicatedSpace');
const windsorProvider = require('../providers/windsor.provider');
const { LeadFollowUp } = require('../models/LeadFollowUp');
const leadFollowUpService = require('./leadFollowUp.service');
const { logActivity } = require('./activity.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');
const { getKolkataDayBounds } = require('../utils/timezone.util');

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
  followUpStatus,
  dateFrom,
  dateTo,
  archived,
  actor
} = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {};

  // 1. Mandatory Database-Level Ownership Enforcement
  const isAdmin = !actor || actor.role === 'ADMIN';
  if (!isAdmin) {
    // Non-admin can ONLY view leads assigned to their own ID
    query.assignedTo = actor._id;

    // If non-admin requests "unassigned", return immediate empty result
    if (assignedTo === 'unassigned') {
      return {
        leads: [],
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  } else {
    // Admin can filter by assignedTo
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else if (assignedTo === 'assigned') {
        query.assignedTo = { $ne: null };
      } else {
        query.assignedTo = assignedTo;
      }
    }
  }

  // 2. Active vs Archived Filter (default: active leads only)
  const isArchived = archived === true || archived === 'true';
  if (isArchived) {
    query.archivedAt = { $ne: null };
  } else {
    query.archivedAt = null;
  }

  // 3. Status Filter
  if (status && LEAD_STATUS.includes(status.toUpperCase())) {
    query.status = status.toUpperCase();
  }

  // 4. Mutually Exclusive Follow-Up Status Filter using Asia/Kolkata day bounds
  if (followUpStatus) {
    const { startOfToday, startOfTomorrow } = getKolkataDayBounds();
    const upperFollowUp = followUpStatus.toUpperCase();

    if (upperFollowUp === 'NO_FOLLOW_UP') {
      query.nextFollowUpAt = null;
    } else if (upperFollowUp === 'OVERDUE') {
      query.nextFollowUpAt = { $ne: null, $lt: startOfToday };
    } else if (upperFollowUp === 'TODAY') {
      query.nextFollowUpAt = { $gte: startOfToday, $lt: startOfTomorrow };
    } else if (upperFollowUp === 'UPCOMING') {
      query.nextFollowUpAt = { $gte: startOfTomorrow };
    }
  }

  // 5. Date Range Filters (strictly filters Lead Creation Time: createdTime)
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

  // 6. Search Filter
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
      .populate('archivedBy', 'name email')
      .populate('convertedBy', 'name email')
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
 * Resolves safe, non-PII display descriptor for a linked business entity.
 * Excludes customer full name, phone, email, financial info, and agreements.
 *
 * @param {string} targetType
 * @param {string} targetId
 * @returns {Promise<{ id: string, label: string, subtitle: string }|null>}
 */
const resolveConversionTargetSummary = async (targetType, targetId) => {
  if (!targetType || !targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    return null;
  }

  try {
    if (targetType === 'virtual_office') {
      const vo = await VirtualOffice.findById(targetId).select('companyName allottedVirtualAddress companyRegisteredAddress');
      if (!vo) return null;
      return {
        id: vo._id.toString(),
        label: vo.companyName || 'Virtual Office',
        subtitle: vo.allottedVirtualAddress || vo.companyRegisteredAddress || 'Virtual Office Allotment'
      };
    }

    if (targetType === 'managed_office') {
      const mo = await ManagedOffice.findById(targetId).select('companyName companyRegisteredAddress');
      if (!mo) return null;
      return {
        id: mo._id.toString(),
        label: mo.companyName || 'Managed Office',
        subtitle: mo.companyRegisteredAddress || 'Managed Office Space'
      };
    }

    if (targetType === 'cowork_space') {
      const cs = await CoworkSpace.findById(targetId).select('businessType totalSeats');
      if (!cs) return null;
      return {
        id: cs._id.toString(),
        label: cs.totalSeats ? `Cowork Space (${cs.totalSeats} seats)` : 'Cowork Space',
        subtitle: cs.businessType ? `${cs.businessType} Business` : 'Cowork Desk Allotment'
      };
    }

    if (targetType === 'dedicated_space') {
      const ds = await DedicatedSpace.findById(targetId).select('businessType totalSeats');
      if (!ds) return null;
      return {
        id: ds._id.toString(),
        label: ds.totalSeats ? `Dedicated Space (${ds.totalSeats} seats)` : 'Dedicated Space',
        subtitle: ds.businessType ? `${ds.businessType} Business` : 'Dedicated Space Allotment'
      };
    }
  } catch (err) {
    console.error('[LeadService] Error resolving conversion target summary:', err.message);
    return null;
  }

  return null;
};

/**
 * Retrieves a single lead by its MongoDB ID with strict ownership scoping.
 *
 * @param {string} id
 * @param {Object} [actor]
 * @returns {Promise<Object>}
 */
const getLeadById = async (id, actor = null) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const query = {
    _id: id,
    ...(isAdmin ? {} : { assignedTo: actor._id })
  };

  const lead = await Lead.findOne(query)
    .populate('assignedTo', 'name email role status')
    .populate('assignedBy', 'name email')
    .populate('archivedBy', 'name email')
    .populate('convertedBy', 'name email');

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  let conversionTargetSummary = null;
  if (lead.conversionTargetType && lead.conversionTargetId) {
    conversionTargetSummary = await resolveConversionTargetSummary(
      lead.conversionTargetType,
      lead.conversionTargetId
    );
  }

  const leadObj = lead.toJSON();
  leadObj.conversionTargetSummary = conversionTargetSummary;

  return leadObj;
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

/**
 * Assigns or unassigns a lead to an active staff member (GM, TEAM_MANAGER, INTERN).
 *
 * @param {string} leadId
 * @param {string|null} assignedTo - target user ID or null to unassign
 * @param {Object} actor - authenticated user
 * @returns {Promise<Object>} populated lead
 */
const assignLead = async (leadId, assignedTo, actor) => {
  if (actor && actor.role !== 'ADMIN') {
    const error = new Error('Only administrators can assign leads');
    error.statusCode = 403;
    throw error;
  }

  const query = {
    _id: leadId
  };

  const lead = await Lead.findOne(query).populate('assignedTo', 'name email role');
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  // Unassignment path
  if (!assignedTo || assignedTo === 'unassigned') {
    const previousAssigneeName = lead.assignedTo?.name || null;
    lead.assignedTo = null;
    lead.assignedAt = null;
    lead.assignedBy = actor?._id || actor?.id || null;
    await lead.save();

    await logActivity({
      action: 'lead_unassigned',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: {
        id: actor?._id || actor?.id || null,
        name: actor?.name || 'Staff User',
        email: actor?.email || ''
      },
      metadata: {
        previousAssignee: previousAssigneeName
      }
    });

    broadcastDashboardUpdate({
      type: 'LEAD_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      action: 'unassigned'
    });

    return await getLeadById(lead._id, actor);
  }

  // Assignment path: validate target user
  if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
    const error = new Error('Invalid assignee user ID');
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await User.findById(assignedTo);
  if (!targetUser) {
    const error = new Error('Assignee user not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.role === 'ADMIN') {
    const error = new Error('Admin users cannot be assigned to leads');
    error.statusCode = 400;
    throw error;
  }

  const ALLOWED_ASSIGNABLE_ROLES = ['GM', 'TEAM_MANAGER', 'INTERN'];
  if (!ALLOWED_ASSIGNABLE_ROLES.includes(targetUser.role)) {
    const error = new Error(`Cannot assign lead to role: ${targetUser.role}`);
    error.statusCode = 400;
    throw error;
  }

  if (targetUser.status !== 'ACTIVE' || targetUser.isActive === false) {
    const error = new Error('Only active users can be assigned to leads');
    error.statusCode = 400;
    throw error;
  }

  lead.assignedTo = targetUser._id;
  lead.assignedAt = new Date();
  lead.assignedBy = actor?._id || actor?.id || null;
  await lead.save();

  await logActivity({
    action: 'lead_assigned',
    entityType: 'meta_lead',
    entityId: lead._id,
    entityName: `Lead ${lead.metaLeadId || lead._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Staff User',
      email: actor?.email || ''
    },
    metadata: {
      assignedTo: targetUser._id.toString(),
      assignedToName: targetUser.name
    }
  });

  broadcastDashboardUpdate({
    type: 'LEAD_MUTATED',
    entity: 'meta_lead',
    entityId: lead._id.toString(),
    action: 'assigned'
  });

  return await getLeadById(lead._id, actor);
};

/**
 * Updates lead status across the standard enum values.
 *
 * @param {string} leadId
 * @param {string} status
 * @param {Object} actor
 * @returns {Promise<Object>} populated lead
 */
const updateLeadStatus = async (leadId, status, actor) => {
  if (!status || !LEAD_STATUS.includes(status)) {
    const error = new Error(`Status must be one of: ${LEAD_STATUS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (status === 'CONVERTED') {
    const error = new Error('Use the conversion workflow to convert this lead.');
    error.statusCode = 409;
    throw error;
  }

  const isAdmin = !actor || actor.role === 'ADMIN';
  const query = {
    _id: leadId,
    ...(isAdmin ? {} : { assignedTo: actor._id })
  };

  const lead = await Lead.findOne(query);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (lead.status === 'CONVERTED' && lead.convertedAt !== null) {
    const error = new Error('Converted leads cannot be moved back to another status.');
    error.statusCode = 409;
    throw error;
  }

  const previousStatus = lead.status;
  lead.status = status;
  await lead.save();

  await logActivity({
    action: 'lead_status_updated',
    entityType: 'meta_lead',
    entityId: lead._id,
    entityName: `Lead ${lead.metaLeadId || lead._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Staff User',
      email: actor?.email || ''
    },
    metadata: {
      previousStatus,
      newStatus: status
    }
  });

  broadcastDashboardUpdate({
    type: 'LEAD_MUTATED',
    entity: 'meta_lead',
    entityId: lead._id.toString(),
    action: 'status_updated'
  });

  return await getLeadById(lead._id, actor);
};

/**
 * Updates lead notes with length and type validation.
 *
 * @param {string} leadId
 * @param {string} notes
 * @param {Object} actor
 * @returns {Promise<Object>} populated lead
 */
const updateLeadNotes = async (leadId, notes, actor) => {
  if (typeof notes !== 'string') {
    const error = new Error('Notes must be a string');
    error.statusCode = 400;
    throw error;
  }

  const trimmedNotes = notes.trim();
  if (trimmedNotes.length > 3000) {
    const error = new Error('Notes cannot exceed 3000 characters');
    error.statusCode = 400;
    throw error;
  }

  const isAdmin = !actor || actor.role === 'ADMIN';
  const query = {
    _id: leadId,
    ...(isAdmin ? {} : { assignedTo: actor._id })
  };

  const lead = await Lead.findOne(query);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  lead.notes = trimmedNotes;
  await lead.save();

  await logActivity({
    action: 'lead_note_updated',
    entityType: 'meta_lead',
    entityId: lead._id,
    entityName: `Lead ${lead.metaLeadId || lead._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Staff User',
      email: actor?.email || ''
    },
    metadata: {
      action: 'updated'
    }
  });

  broadcastDashboardUpdate({
    type: 'LEAD_MUTATED',
    entity: 'meta_lead',
    entityId: lead._id.toString(),
    action: 'note_updated'
  });

  return await getLeadById(lead._id, actor);
};

/**
 * Updates or clears follow-up schedule on a lead.
 *
 * @param {string} leadId
 * @param {string|null} nextFollowUpAt
 * @param {Object} actor
 * @returns {Promise<Object>} populated lead
 */
const updateLeadFollowUp = async (leadId, nextFollowUpAt, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const query = {
    _id: leadId,
    ...(isAdmin ? {} : { assignedTo: actor._id })
  };

  const lead = await Lead.findOne(query);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  const previousFollowUpAt = lead.nextFollowUpAt;
  let parsedDate = null;

  if (nextFollowUpAt !== null && nextFollowUpAt !== undefined && nextFollowUpAt !== '') {
    if (typeof nextFollowUpAt !== 'string' && !(nextFollowUpAt instanceof Date)) {
      const error = new Error('Invalid follow-up date');
      error.statusCode = 400;
      throw error;
    }
    parsedDate = new Date(nextFollowUpAt);
    if (isNaN(parsedDate.getTime())) {
      const error = new Error('Invalid follow-up date');
      error.statusCode = 400;
      throw error;
    }

    // Check if an active PENDING follow-up already exists
    const existingPending = await LeadFollowUp.findOne({
      lead: lead._id,
      status: 'PENDING'
    });

    if (existingPending) {
      await leadFollowUpService.rescheduleFollowUp(
        lead._id.toString(),
        existingPending._id.toString(),
        { dueAt: parsedDate.toISOString() },
        actor
      );
    } else {
      await leadFollowUpService.scheduleFollowUp(
        lead._id.toString(),
        { dueAt: parsedDate.toISOString() },
        actor
      );
    }
  } else {
    // Clear follow-up -> Cancel active pending follow-up if present
    const existingPending = await LeadFollowUp.findOne({
      lead: lead._id,
      status: 'PENDING'
    });

    if (existingPending) {
      await leadFollowUpService.cancelFollowUp(
        lead._id.toString(),
        existingPending._id.toString(),
        actor
      );
    } else if (lead.nextFollowUpAt) {
      lead.nextFollowUpAt = null;
      await lead.save();
    }
  }

  // Legacy Activity & SSE broadcast to preserve Phase 3B assertions
  const prevTime = previousFollowUpAt ? new Date(previousFollowUpAt).getTime() : null;
  const newTime = parsedDate ? parsedDate.getTime() : null;
  if (prevTime !== newTime) {
    await logActivity({
      action: 'lead_followup_updated',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: {
        id: actor?._id || actor?.id || null,
        name: actor?.name || 'Staff User',
        email: actor?.email || ''
      },
      metadata: {
        previousFollowUpAt: previousFollowUpAt ? previousFollowUpAt.toISOString() : null,
        newFollowUpAt: parsedDate ? parsedDate.toISOString() : null
      }
    });

    broadcastDashboardUpdate({
      type: 'LEAD_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      action: 'followup_updated'
    });
  }

  return await getLeadById(lead._id, actor);
};

/**
 * Retrieves aggregated lead statistics scoped to the authenticated user.
 *
 * @param {Object} actor
 * @returns {Promise<Object>}
 */
const getLeadStats = async (actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const activeMatch = {
    ...(isAdmin ? {} : { assignedTo: actor._id }),
    archivedAt: null
  };
  const archivedMatch = {
    ...(isAdmin ? {} : { assignedTo: actor._id }),
    archivedAt: { $ne: null }
  };

  const { startOfToday, startOfTomorrow } = getKolkataDayBounds();

  const [facetResult] = await Lead.aggregate([
    {
      $facet: {
        totalActive: [
          { $match: activeMatch },
          { $count: 'count' }
        ],
        byStatus: [
          { $match: activeMatch },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        todayFollowUps: [
          { $match: { ...activeMatch, nextFollowUpAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
          { $count: 'count' }
        ],
        upcomingFollowUps: [
          { $match: { ...activeMatch, nextFollowUpAt: { $gte: startOfTomorrow } } },
          { $count: 'count' }
        ],
        overdueFollowUps: [
          { $match: { ...activeMatch, nextFollowUpAt: { $ne: null, $lt: startOfToday } } },
          { $count: 'count' }
        ],
        noFollowUps: [
          { $match: { ...activeMatch, nextFollowUpAt: null } },
          { $count: 'count' }
        ],
        archivedCount: [
          { $match: archivedMatch },
          { $count: 'count' }
        ]
      }
    }
  ]);

  const total = facetResult?.totalActive?.[0]?.count || 0;
  const archived = facetResult?.archivedCount?.[0]?.count || 0;

  const statusMap = {};
  LEAD_STATUS.forEach((st) => {
    statusMap[st] = 0;
  });
  (facetResult?.byStatus || []).forEach((item) => {
    if (item._id) statusMap[item._id] = item.count;
  });

  return {
    total,
    archived,
    archivedCount: archived,
    ...statusMap,
    today: facetResult?.todayFollowUps?.[0]?.count || 0,
    upcoming: facetResult?.upcomingFollowUps?.[0]?.count || 0,
    overdue: facetResult?.overdueFollowUps?.[0]?.count || 0,
    noFollowUp: facetResult?.noFollowUps?.[0]?.count || 0
  };
};

/**
 * Retrieves paginated activity timeline for a single lead.
 *
 * @param {string} leadId
 * @param {Object} queryParams
 * @param {Object} actor
 * @returns {Promise<Object>}
 */
const getLeadActivity = async (leadId, { page = 1, limit = 20 } = {}, actor) => {
  // Verifies lead existence and ownership
  await getLeadById(leadId, actor);

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const [total, activities] = await Promise.all([
    Activity.countDocuments({ entityType: 'meta_lead', entityId: leadId }),
    Activity.find({ entityType: 'meta_lead', entityId: leadId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const sanitizedItems = activities.map((act) => ({
    id: act._id.toString(),
    action: act.action,
    entityType: act.entityType,
    entityName: act.entityName,
    metadata: act.metadata || {},
    createdAt: act.createdAt,
    actor: {
      id: act.actor?.id ? act.actor.id.toString() : null,
      name: act.actor?.name || 'Staff User',
      role: act.actor?.role || 'Staff'
    }
  }));

  const totalPages = total === 0 ? 0 : Math.ceil(total / parsedLimit);

  return {
    items: sanitizedItems,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages
    }
  };
};

/**
 * Retrieves list of active users eligible for lead assignment (GM, TEAM_MANAGER, INTERN).
 * Strictly ADMIN-only.
 *
 * @param {Object} actor - Authenticated user
 * @returns {Promise<Array<Object>>}
 */
const getAssignableUsers = async (actor) => {
  if (actor && actor.role !== 'ADMIN') {
    const error = new Error('Only administrators can access the assignee directory');
    error.statusCode = 403;
    throw error;
  }

  const users = await User.find({
    status: 'ACTIVE',
    isActive: true,
    role: { $in: ['GM', 'TEAM_MANAGER', 'INTERN'] }
  })
    .select('_id name email role')
    .sort({ name: 1 });

  return users.map((u) => ({
    id: u._id.toString(),
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role
  }));
};

/**
 * Resolves target lead documents for bulk operations.
 * Enforces ownership, existence, max batch size, and archive state atomically.
 *
 * @param {Object} options
 * @param {'ids'|'filtered'} [options.mode='ids']
 * @param {Array<string>} [options.leadIds=[]]
 * @param {Object} [options.filters={}]
 * @param {Object} actor - Authenticated user
 * @param {Object} config
 * @param {boolean} [config.targetArchived=false] - Whether the operation targets archived leads
 * @returns {Promise<Array<Object>>} Resolved Lead documents
 */
const resolveTargetLeadIds = async ({ mode = 'ids', leadIds = [], filters = {} } = {}, actor, { targetArchived = false } = {}) => {
  const isAdmin = !actor || actor.role === 'ADMIN';

  if (mode === 'filtered') {
    // Mode B: Reconstruct query from server-side filters
    const query = {};

    // Ownership: Non-admin can ONLY target their own leads
    if (!isAdmin) {
      query.assignedTo = actor._id;
    } else if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else if (filters.assignedTo === 'assigned') {
        query.assignedTo = { $ne: null };
      } else if (mongoose.Types.ObjectId.isValid(filters.assignedTo)) {
        query.assignedTo = filters.assignedTo;
      }
    }

    // Archive state
    if (targetArchived) {
      query.archivedAt = { $ne: null };
    } else {
      query.archivedAt = null;
    }

    // Status filter
    if (filters.status && LEAD_STATUS.includes(filters.status.toUpperCase())) {
      query.status = filters.status.toUpperCase();
    }

    // Follow-up status
    if (filters.followUpStatus) {
      const { startOfToday, startOfTomorrow } = getKolkataDayBounds();
      const upper = filters.followUpStatus.toUpperCase();
      if (upper === 'NO_FOLLOW_UP') query.nextFollowUpAt = null;
      else if (upper === 'OVERDUE') query.nextFollowUpAt = { $ne: null, $lt: startOfToday };
      else if (upper === 'TODAY') query.nextFollowUpAt = { $gte: startOfToday, $lt: startOfTomorrow };
      else if (upper === 'UPCOMING') query.nextFollowUpAt = { $gte: startOfTomorrow };
    }

    // Date range
    if (filters.dateFrom || filters.dateTo) {
      query.createdTime = {};
      if (filters.dateFrom) query.createdTime.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdTime.$lte = end;
      }
    }

    // Search
    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const term = filters.search.trim();
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { fullName: regex },
        { email: regex },
        { phoneNumber: regex },
        { campaignName: regex },
        { formName: regex }
      ];
    }

    const leads = await Lead.find(query).select('_id metaLeadId fullName assignedTo archivedAt status').lean();
    if (!leads || leads.length === 0) {
      const error = new Error('No matching leads found for bulk operation');
      error.statusCode = 404;
      throw error;
    }
    return leads;
  }

  // Mode A: Explicit leadIds
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    const error = new Error('No lead IDs provided for bulk operation');
    error.statusCode = 400;
    throw error;
  }

  if (leadIds.length > 100) {
    const error = new Error('Maximum 100 leads allowed per explicit bulk request');
    error.statusCode = 400;
    throw error;
  }

  for (const id of leadIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error(`Invalid lead ID: ${id}`);
      error.statusCode = 400;
      throw error;
    }
  }

  const leads = await Lead.find({ _id: { $in: leadIds } })
    .select('_id metaLeadId fullName assignedTo archivedAt status')
    .lean();

  if (leads.length !== leadIds.length) {
    const error = new Error('One or more specified lead IDs do not exist');
    error.statusCode = 400;
    throw error;
  }

  // Ownership validation for non-admin
  if (!isAdmin) {
    const unauthorizedLead = leads.find(
      (l) => !l.assignedTo || l.assignedTo.toString() !== actor._id.toString()
    );
    if (unauthorizedLead) {
      const error = new Error('You can only perform bulk operations on leads assigned to you');
      error.statusCode = 403;
      throw error;
    }
  }

  // Archive state validation
  if (targetArchived) {
    const activeLead = leads.find((l) => !l.archivedAt);
    if (activeLead) {
      const error = new Error('Only archived leads can be processed for this operation');
      error.statusCode = 400;
      throw error;
    }
  } else {
    const archivedLead = leads.find((l) => l.archivedAt);
    if (archivedLead) {
      const error = new Error('One or more selected leads are already archived');
      error.statusCode = 400;
      throw error;
    }
  }

  return leads;
};

/**
 * Bulk assigns or unassigns leads to a staff member.
 * Strictly ADMIN-only.
 *
 * @param {Object} params
 * @param {Object} actor - Authenticated user
 * @returns {Promise<{ requestedCount: number, updatedCount: number }>}
 */
const bulkAssignLeads = async ({ mode, leadIds, filters, assignedTo }, actor) => {
  if (actor && actor.role !== 'ADMIN') {
    const error = new Error('Only administrators can bulk assign leads');
    error.statusCode = 403;
    throw error;
  }

  const leads = await resolveTargetLeadIds({ mode, leadIds, filters }, actor, { targetArchived: false });
  const targetIds = leads.map((l) => l._id);

  let targetUserId = null;
  let targetUserName = 'Unassigned';

  if (assignedTo && assignedTo !== 'unassigned') {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      const error = new Error('Invalid assignee user ID');
      error.statusCode = 400;
      throw error;
    }
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      const error = new Error('Assignee user not found');
      error.statusCode = 404;
      throw error;
    }
    if (targetUser.role === 'ADMIN') {
      const error = new Error('Admin users cannot be assigned to leads');
      error.statusCode = 400;
      throw error;
    }
    const ALLOWED_ASSIGNABLE_ROLES = ['GM', 'TEAM_MANAGER', 'INTERN'];
    if (!ALLOWED_ASSIGNABLE_ROLES.includes(targetUser.role)) {
      const error = new Error(`Cannot assign leads to role: ${targetUser.role}`);
      error.statusCode = 400;
      throw error;
    }
    if (targetUser.status !== 'ACTIVE' || targetUser.isActive === false) {
      const error = new Error('Only active users can be assigned to leads');
      error.statusCode = 400;
      throw error;
    }
    targetUserId = targetUser._id;
    targetUserName = targetUser.name;
  }

  const now = new Date();
  const updateData = targetUserId
    ? { assignedTo: targetUserId, assignedAt: now, assignedBy: actor?._id || null }
    : { assignedTo: null, assignedAt: null, assignedBy: actor?._id || null };

  await Lead.updateMany({ _id: { $in: targetIds } }, { $set: updateData });

  // Batch Activity Logging
  const actionName = targetUserId ? 'lead_assigned' : 'lead_unassigned';
  const activities = leads.map((l) => ({
    action: actionName,
    entityType: 'meta_lead',
    entityId: l._id,
    entityName: `Lead ${l.metaLeadId || l._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Admin',
      email: actor?.email || '',
      role: actor?.role || 'ADMIN'
    },
    metadata: targetUserId
      ? { assignedTo: targetUserName }
      : { previousAssignee: l.assignedTo ? 'Staff User' : null }
  }));
  await Activity.insertMany(activities);

  broadcastDashboardUpdate({
    type: 'LEADS_BULK_MUTATED',
    action: 'assigned',
    count: targetIds.length
  });

  return {
    requestedCount: targetIds.length,
    updatedCount: targetIds.length
  };
};

/**
 * Bulk updates lead status.
 *
 * @param {Object} params
 * @param {Object} actor
 * @returns {Promise<{ requestedCount: number, updatedCount: number }>}
 */
const bulkUpdateLeadStatus = async ({ mode, leadIds, filters, status }, actor) => {
  if (!status || !LEAD_STATUS.includes(status.toUpperCase())) {
    const error = new Error(`Status must be one of: ${LEAD_STATUS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus === 'CONVERTED') {
    const error = new Error('Use the conversion workflow to convert this lead.');
    error.statusCode = 409;
    throw error;
  }

  const leads = await resolveTargetLeadIds({ mode, leadIds, filters }, actor, { targetArchived: false });
  const hasConverted = leads.some((l) => l.status === 'CONVERTED' && l.convertedAt !== null);
  if (hasConverted) {
    const error = new Error('Converted leads cannot be moved back to another status.');
    error.statusCode = 409;
    throw error;
  }

  const targetIds = leads.map((l) => l._id);

  await Lead.updateMany({ _id: { $in: targetIds } }, { $set: { status: normalizedStatus } });

  const activities = leads.map((l) => ({
    action: 'lead_status_updated',
    entityType: 'meta_lead',
    entityId: l._id,
    entityName: `Lead ${l.metaLeadId || l._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Staff User',
      email: actor?.email || '',
      role: actor?.role || 'Staff'
    },
    metadata: {
      previousStatus: l.status,
      newStatus: normalizedStatus
    }
  }));
  await Activity.insertMany(activities);

  broadcastDashboardUpdate({
    type: 'LEADS_BULK_MUTATED',
    action: 'status_updated',
    count: targetIds.length
  });

  return {
    requestedCount: targetIds.length,
    updatedCount: targetIds.length
  };
};

/**
 * Bulk archives active leads.
 *
 * @param {Object} params
 * @param {Object} actor
 * @returns {Promise<{ requestedCount: number, updatedCount: number }>}
 */
const bulkArchiveLeads = async ({ mode, leadIds, filters }, actor) => {
  const leads = await resolveTargetLeadIds({ mode, leadIds, filters }, actor, { targetArchived: false });
  const targetIds = leads.map((l) => l._id);
  const now = new Date();
  const actorId = actor?._id || actor?.id || null;

  let session = null;
  let isStandaloneFallback = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    if (session) {
      session.endSession();
      session = null;
    }
    const isLocalFallbackAllowed =
      process.env.ALLOW_STANDALONE_TX_FALLBACK === 'true' &&
      process.env.NODE_ENV !== 'production';

    if (isLocalFallbackAllowed) {
      isStandaloneFallback = true;
    } else {
      const error = new Error('Database transaction service unavailable for bulk archive.');
      error.statusCode = 503;
      throw error;
    }
  }

  let cancelledFollowUpCount = 0;

  try {
    const sessionOpt = session && !isStandaloneFallback ? { session } : undefined;

    // 1. Archive ALL resolved target leads unconditionally, setting nextFollowUpAt = null
    await Lead.updateMany(
      { _id: { $in: targetIds } },
      { $set: { archivedAt: now, archivedBy: actorId, nextFollowUpAt: null } },
      sessionOpt
    );

    // 2. Prepare lead_archived activities
    const leadActivities = leads.map((l) => ({
      action: 'lead_archived',
      entityType: 'meta_lead',
      entityId: l._id,
      entityName: `Lead ${l.metaLeadId || l._id}`,
      actor: {
        id: actorId,
        name: actor?.name || 'Staff User',
        email: actor?.email || '',
        role: actor?.role || 'Staff'
      },
      metadata: {
        archivedAt: now.toISOString()
      }
    }));

    // 3. Find active pending follow-ups for all target leads in one single query
    const pendingFollowUps = await LeadFollowUp.find(
      { lead: { $in: targetIds }, status: 'PENDING' },
      null,
      sessionOpt
    );

    let followUpActivities = [];
    if (pendingFollowUps.length > 0) {
      cancelledFollowUpCount = pendingFollowUps.length;
      await LeadFollowUp.updateMany(
        { _id: { $in: pendingFollowUps.map((f) => f._id) } },
        { $set: { status: 'CANCELLED', cancelledAt: now, cancelledBy: actorId } },
        sessionOpt
      );

      followUpActivities = pendingFollowUps.map((f) => ({
        action: 'lead_followup_cancelled',
        entityType: 'meta_lead',
        entityId: f.lead,
        entityName: `Lead ${f.lead}`,
        actor: {
          id: actorId,
          name: actor?.name || 'Staff User',
          email: actor?.email || '',
          role: actor?.role || 'Staff'
        },
        metadata: {
          followUpId: f._id.toString(),
          reason: 'lead_archived'
        }
      }));
    }

    const allActivities = [...leadActivities, ...followUpActivities];
    if (session && !isStandaloneFallback) {
      await Activity.insertMany(allActivities, { session });
      await session.commitTransaction();
    } else {
      await Activity.insertMany(allActivities);
    }
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (e) {
        // ignore
      }
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // 4. Post-commit SSE emissions
  broadcastDashboardUpdate({
    type: 'LEADS_BULK_MUTATED',
    action: 'archived',
    count: targetIds.length
  });

  if (cancelledFollowUpCount > 0) {
    broadcastDashboardUpdate({
      type: 'LEAD_FOLLOWUP_MUTATED',
      action: 'bulk_cancelled',
      count: cancelledFollowUpCount
    });
  }

  return {
    requestedCount: targetIds.length,
    updatedCount: targetIds.length
  };
};

/**
 * Bulk restores archived leads.
 *
 * @param {Object} params
 * @param {Object} actor
 * @returns {Promise<{ requestedCount: number, updatedCount: number }>}
 */
const bulkRestoreLeads = async ({ mode, leadIds, filters }, actor) => {
  const leads = await resolveTargetLeadIds({ mode, leadIds, filters }, actor, { targetArchived: true });
  const targetIds = leads.map((l) => l._id);

  await Lead.updateMany(
    { _id: { $in: targetIds } },
    { $set: { archivedAt: null, archivedBy: null } }
  );

  const activities = leads.map((l) => ({
    action: 'lead_restored',
    entityType: 'meta_lead',
    entityId: l._id,
    entityName: `Lead ${l.metaLeadId || l._id}`,
    actor: {
      id: actor?._id || actor?.id || null,
      name: actor?.name || 'Staff User',
      email: actor?.email || '',
      role: actor?.role || 'Staff'
    },
    metadata: {
      restoredAt: new Date().toISOString()
    }
  }));
  await Activity.insertMany(activities);

  broadcastDashboardUpdate({
    type: 'LEADS_BULK_MUTATED',
    action: 'restored',
    count: targetIds.length
  });

  return {
    requestedCount: targetIds.length,
    updatedCount: targetIds.length
  };
};

/**
 * Bulk permanently deletes archived leads and their activity history.
 * Strictly ADMIN-only and ARCHIVED-only.
 *
 * @param {Object} params
 * @param {Object} actor
 * @returns {Promise<{ requestedCount: number, deletedCount: number }>}
 */
const bulkPermanentDeleteLeads = async ({ mode, leadIds, filters }, actor) => {
  if (actor && actor.role !== 'ADMIN') {
    const error = new Error('Only administrators can permanently delete leads');
    error.statusCode = 403;
    throw error;
  }

  // Pre-condition: TARGET ARCHIVED ONLY
  const leads = await resolveTargetLeadIds({ mode, leadIds, filters }, actor, { targetArchived: true });
  const targetIds = leads.map((l) => l._id);

  // Multi-document transaction via Mongoose session
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    await Activity.deleteMany({ entityType: 'meta_lead', entityId: { $in: targetIds } }, { session });
    await Lead.deleteMany({ _id: { $in: targetIds } }, { session });

    await session.commitTransaction();
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    // Fallback if standalone MongoDB without replica set
    if (error.message && error.message.includes('Transactions are not supported')) {
      await Activity.deleteMany({ entityType: 'meta_lead', entityId: { $in: targetIds } });
      await Lead.deleteMany({ _id: { $in: targetIds } });
    } else {
      throw error;
    }
  } finally {
    if (session) {
      session.endSession();
    }
  }

  broadcastDashboardUpdate({
    type: 'LEADS_BULK_MUTATED',
    action: 'deleted',
    count: targetIds.length
  });

  return {
    requestedCount: targetIds.length,
    deletedCount: targetIds.length
  };
};

/**
 * Retrieves sanitized list of existing business entities for conversion linking.
 * Strictly minimal fields ({ id, label, subtitle }) with zero customer PII.
 *
 * @param {Object} options
 * @param {string} options.type - 'virtual_office' | 'managed_office' | 'cowork_space' | 'dedicated_space'
 * @param {string} [options.search]
 * @param {number} [options.limit=20]
 * @returns {Promise<Array<{ id: string, label: string, subtitle: string }>>}
 */
const getConversionTargets = async ({ type, search = '', limit = 20 } = {}) => {
  const allowedTypes = ['virtual_office', 'managed_office', 'cowork_space', 'dedicated_space'];
  if (!type || !allowedTypes.includes(type)) {
    const error = new Error(`Target type must be one of: ${allowedTypes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 50));
  const trimmedSearch = typeof search === 'string' ? search.trim() : '';
  const searchRegex = trimmedSearch ? new RegExp(trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  let targets = [];

  if (type === 'virtual_office') {
    const query = searchRegex
      ? {
          $or: [
            { companyName: searchRegex },
            { allottedVirtualAddress: searchRegex },
            { companyRegisteredAddress: searchRegex }
          ]
        }
      : {};
    const items = await VirtualOffice.find(query)
      .select('_id companyName allottedVirtualAddress companyRegisteredAddress')
      .limit(parsedLimit)
      .sort({ createdAt: -1 });

    targets = items.map((vo) => ({
      id: vo._id.toString(),
      label: vo.companyName || 'Virtual Office',
      subtitle: vo.allottedVirtualAddress || vo.companyRegisteredAddress || 'Virtual Office Allotment'
    }));
  } else if (type === 'managed_office') {
    const query = searchRegex
      ? {
          $or: [
            { companyName: searchRegex },
            { companyRegisteredAddress: searchRegex }
          ]
        }
      : {};
    const items = await ManagedOffice.find(query)
      .select('_id companyName companyRegisteredAddress')
      .limit(parsedLimit)
      .sort({ createdAt: -1 });

    targets = items.map((mo) => ({
      id: mo._id.toString(),
      label: mo.companyName || 'Managed Office',
      subtitle: mo.companyRegisteredAddress || 'Managed Office Space'
    }));
  } else if (type === 'cowork_space') {
    const query = searchRegex ? { businessType: searchRegex } : {};
    const items = await CoworkSpace.find(query)
      .select('_id businessType totalSeats')
      .limit(parsedLimit)
      .sort({ createdAt: -1 });

    targets = items.map((cs) => ({
      id: cs._id.toString(),
      label: cs.totalSeats ? `Cowork Space (${cs.totalSeats} seats)` : 'Cowork Space',
      subtitle: cs.businessType ? `${cs.businessType} Business` : 'Cowork Desk Allotment'
    }));
  } else if (type === 'dedicated_space') {
    const query = searchRegex ? { businessType: searchRegex } : {};
    const items = await DedicatedSpace.find(query)
      .select('_id businessType totalSeats')
      .limit(parsedLimit)
      .sort({ createdAt: -1 });

    targets = items.map((ds) => ({
      id: ds._id.toString(),
      label: ds.totalSeats ? `Dedicated Space (${ds.totalSeats} seats)` : 'Dedicated Space',
      subtitle: ds.businessType ? `${ds.businessType} Business` : 'Dedicated Space Allotment'
    }));
  }

  return targets;
};

/**
 * Converts an active lead into an official business outcome.
 * Strictly follows the 12-step execution flow with atomic production transactions.
 *
 * @param {string} leadId
 * @param {Object} conversionData
 * @param {string} conversionData.conversionType
 * @param {string} [conversionData.conversionTargetType]
 * @param {string} [conversionData.conversionTargetId]
 * @param {Object} actor - Authenticated user
 * @returns {Promise<Object>} Populated converted Lead
 */
const convertLead = async (leadId, { conversionType, conversionTargetType, conversionTargetId } = {}, actor) => {
  // Step 1: Find Lead with ownership scope
  const isAdmin = !actor || actor.role === 'ADMIN';
  const query = {
    _id: leadId,
    ...(isAdmin ? {} : { assignedTo: actor._id })
  };

  const lead = await Lead.findOne(query);

  // Step 2: Missing / Inaccessible Check
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Archived Check
  if (lead.archivedAt !== null) {
    const error = new Error('Archived leads cannot be converted. Restore the lead first.');
    error.statusCode = 400;
    throw error;
  }

  // Step 4: Detect Inconsistent State
  const isValidUnconverted =
    lead.status !== 'CONVERTED' &&
    lead.convertedAt === null &&
    lead.convertedBy === null &&
    lead.conversionType === null;

  const isValidConverted =
    lead.status === 'CONVERTED' &&
    lead.convertedAt !== null &&
    lead.convertedBy !== null &&
    lead.conversionType !== null;

  if (!isValidUnconverted && !isValidConverted) {
    console.error(`[LeadConversion] Severe: Inconsistent pre-existing conversion state detected for lead: ${leadId}`, {
      status: lead.status,
      convertedAt: lead.convertedAt,
      convertedBy: lead.convertedBy,
      conversionType: lead.conversionType
    });
    const error = new Error('Lead is in an inconsistent conversion state. Please contact an administrator.');
    error.statusCode = 409;
    throw error;
  }

  // Step 5: Detect Valid Already-Converted State
  if (isValidConverted) {
    const error = new Error('Lead is already converted.');
    error.statusCode = 409;
    throw error;
  }

  // Step 6: Validate conversionType
  if (!conversionType || !CONVERSION_TYPES.includes(conversionType)) {
    const error = new Error(`Conversion type must be one of: ${CONVERSION_TYPES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Step 7: Validate Target Rules
  const rawTargetType = conversionTargetType || null;
  const rawTargetId = conversionTargetId ? conversionTargetId.toString().trim() : null;

  if (conversionType === 'OTHER') {
    if (rawTargetType || rawTargetId) {
      const error = new Error('OTHER conversion type cannot be linked to an OfficeSpaze target.');
      error.statusCode = 400;
      throw error;
    }
  } else {
    const hasTargetType = Boolean(rawTargetType);
    const hasTargetId = Boolean(rawTargetId);

    if (hasTargetType !== hasTargetId) {
      const error = new Error('Both conversionTargetType and conversionTargetId must be provided together, or both omitted.');
      error.statusCode = 400;
      throw error;
    }

    if (hasTargetType && hasTargetId) {
      const expectedTargetType = conversionType.toLowerCase();
      if (rawTargetType !== expectedTargetType) {
        const error = new Error('Conversion target type does not match conversion type.');
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Step 8: Validate Target Existence
  if (rawTargetType && rawTargetId) {
    if (!mongoose.Types.ObjectId.isValid(rawTargetId)) {
      const error = new Error('Specified conversion target does not exist.');
      error.statusCode = 400;
      throw error;
    }

    let targetExists = false;
    if (rawTargetType === 'virtual_office') {
      targetExists = Boolean(await VirtualOffice.exists({ _id: rawTargetId }));
    } else if (rawTargetType === 'managed_office') {
      targetExists = Boolean(await ManagedOffice.exists({ _id: rawTargetId }));
    } else if (rawTargetType === 'cowork_space') {
      targetExists = Boolean(await CoworkSpace.exists({ _id: rawTargetId }));
    } else if (rawTargetType === 'dedicated_space') {
      targetExists = Boolean(await DedicatedSpace.exists({ _id: rawTargetId }));
    }

    if (!targetExists) {
      const error = new Error('Specified conversion target does not exist.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Step 9 & 10: Perform Transactional Conversion & Create Activity Inside Transaction
  let session = null;
  let isStandaloneFallback = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sessionErr) {
    if (session) {
      session.endSession();
      session = null;
    }

    const isLocalFallbackAllowed =
      process.env.ALLOW_STANDALONE_TX_FALLBACK === 'true' &&
      process.env.NODE_ENV !== 'production';

    if (isLocalFallbackAllowed) {
      console.warn('[LeadConversion] WARNING: Running with non-production transaction fallback');
      isStandaloneFallback = true;
    } else {
      console.error('[LeadConversion] Production transaction unavailable:', sessionErr.message);
      const error = new Error('Lead conversion is temporarily unavailable. Please try again.');
      error.statusCode = 503;
      throw error;
    }
  }

  const now = new Date();
  const actorId = actor?._id || actor?.id || null;

  try {
    const updateQuery = {
      _id: leadId,
      archivedAt: null,
      status: { $ne: 'CONVERTED' },
      convertedAt: null,
      convertedBy: null,
      conversionType: null
    };

    const updateDoc = {
      $set: {
        status: 'CONVERTED',
        convertedAt: now,
        convertedBy: actorId,
        conversionType,
        conversionTargetType: rawTargetType,
        conversionTargetId: rawTargetId,
        nextFollowUpAt: null
      }
    };

    const updateOptions = {
      returnDocument: 'after',
      ...(session && !isStandaloneFallback ? { session } : {})
    };

    const updatedLead = await Lead.findOneAndUpdate(updateQuery, updateDoc, updateOptions);

    if (!updatedLead) {
      const error = new Error('Lead is already converted.');
      error.statusCode = 409;
      throw error;
    }

    // Check if an active PENDING follow-up exists on this lead to complete atomically
    const pendingFollowUp = await LeadFollowUp.findOne(
      { lead: leadId, status: 'PENDING' },
      null,
      session && !isStandaloneFallback ? { session } : undefined
    );

    let followUpActivity = null;
    if (pendingFollowUp) {
      pendingFollowUp.status = 'COMPLETED';
      pendingFollowUp.completedAt = now;
      pendingFollowUp.completedBy = actorId;
      await pendingFollowUp.save({ session: session && !isStandaloneFallback ? session : undefined });

      followUpActivity = {
        action: 'lead_followup_completed',
        entityType: 'meta_lead',
        entityId: updatedLead._id,
        entityName: `Lead ${updatedLead.metaLeadId || updatedLead._id}`,
        actor: {
          id: actorId,
          name: actor?.name || 'Staff User',
          email: actor?.email || '',
          role: actor?.role || 'Staff'
        },
        metadata: {
          followUpId: pendingFollowUp._id.toString(),
          reason: 'lead_converted'
        }
      };
    }

    const activityData = {
      action: 'lead_converted',
      entityType: 'meta_lead',
      entityId: updatedLead._id,
      entityName: `Lead ${updatedLead.metaLeadId || updatedLead._id}`,
      actor: {
        id: actorId,
        name: actor?.name || 'Staff User',
        email: actor?.email || '',
        role: actor?.role || 'Staff'
      },
      metadata: {
        conversionType,
        conversionTargetType: rawTargetType,
        conversionTargetId: rawTargetId
      }
    };

    const allActivities = [activityData, ...(followUpActivity ? [followUpActivity] : [])];

    if (session && !isStandaloneFallback) {
      await Activity.insertMany(allActivities, { session });
      // Step 11: Commit Transaction
      await session.commitTransaction();
    } else {
      await Activity.insertMany(allActivities);
    }

    if (pendingFollowUp) {
      broadcastDashboardUpdate({
        type: 'LEAD_FOLLOWUP_MUTATED',
        entity: 'meta_lead',
        entityId: leadId.toString(),
        followUpId: pendingFollowUp._id.toString(),
        action: 'completed'
      });
    }
  } catch (mutationErr) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // ignore
      }
    }

    const isWriteConflict =
      mutationErr.code === 112 ||
      (mutationErr.hasErrorLabel && mutationErr.hasErrorLabel('TransientTransactionError')) ||
      (mutationErr.errorLabels && mutationErr.errorLabels.includes('TransientTransactionError')) ||
      (mutationErr.message && mutationErr.message.includes('Write conflict'));

    if (isWriteConflict) {
      const freshLead = await Lead.findById(leadId);
      if (freshLead && freshLead.status === 'CONVERTED') {
        const conflictErr = new Error('Lead is already converted.');
        conflictErr.statusCode = 409;
        throw conflictErr;
      }
      const conflictErr = new Error('Concurrent conversion conflict. Please retry.');
      conflictErr.statusCode = 409;
      throw conflictErr;
    }

    throw mutationErr;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // Step 12: Emit SSE strictly AFTER commit
  broadcastDashboardUpdate({
    type: 'LEAD_MUTATED',
    entity: 'meta_lead',
    entityId: leadId.toString(),
    action: 'converted'
  });

  return await getLeadById(leadId, actor);
};

module.exports = {
  normalizeWindsorLead,
  upsertLead,
  syncLeads,
  getLeads,
  getLeadById,
  resolveConversionTargetSummary,
  testWindsorConnection,
  getSyncStatus,
  assignLead,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadFollowUp,
  getLeadStats,
  getLeadActivity,
  getAssignableUsers,
  resolveTargetLeadIds,
  bulkAssignLeads,
  bulkUpdateLeadStatus,
  bulkArchiveLeads,
  bulkRestoreLeads,
  bulkPermanentDeleteLeads,
  getConversionTargets,
  convertLead
};

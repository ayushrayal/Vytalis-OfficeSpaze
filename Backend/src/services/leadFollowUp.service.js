const mongoose = require('mongoose');
const { Lead } = require('../models/Lead');
const { LeadFollowUp } = require('../models/LeadFollowUp');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');
const { getKolkataDayBounds } = require('../utils/timezone.util');

/**
 * Helper to acquire a transaction session or determine fallback.
 */
const startTransactionSession = async () => {
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
      const error = new Error('Database transaction service unavailable for follow-up operation.');
      error.statusCode = 503;
      throw error;
    }
  }

  return { session, isStandaloneFallback };
};

/**
 * Validates note content against CRM rules.
 */
const sanitizeNotes = (notes) => {
  if (notes === null || notes === undefined) return '';
  if (typeof notes !== 'string') {
    const error = new Error('Notes must be a string');
    error.statusCode = 400;
    throw error;
  }
  const trimmed = notes.trim();
  if (trimmed.length > 3000) {
    const error = new Error('Follow-up notes cannot exceed 3000 characters');
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
};

/**
 * Validates dueAt date and ensures it is in the future.
 */
const validateFutureDate = (dueAt) => {
  if (!dueAt) {
    const error = new Error('Follow-up due date and time is required');
    error.statusCode = 400;
    throw error;
  }
  const parsed = new Date(dueAt);
  if (isNaN(parsed.getTime())) {
    const error = new Error('Invalid follow-up date and time');
    error.statusCode = 400;
    throw error;
  }
  if (parsed.getTime() <= Date.now()) {
    const error = new Error('Follow-up time must be in the future.');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

/**
 * Helper to build safe actor summary for Activity audit.
 */
const buildSafeActor = (actor) => ({
  id: actor?._id || actor?.id || null,
  name: actor?.name || 'Staff User',
  email: actor?.email || '',
  role: actor?.role || 'Staff'
});

/**
 * Schedules a new follow-up for a lead.
 * Enforces single active pending follow-up atomically.
 *
 * @param {string} leadId
 * @param {Object} data - { dueAt, notes }
 * @param {Object} actor - Authenticated user
 * @returns {Promise<Object>} Created LeadFollowUp
 */
const scheduleFollowUp = async (leadId, { dueAt, notes }, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;
  const parsedDate = validateFutureDate(dueAt);
  const cleanNotes = sanitizeNotes(notes);

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    // 1. Scoped lead query (enforces ownership isolation)
    const lead = await Lead.findOne({
      _id: leadId,
      ...(isAdmin ? {} : { assignedTo: actorId })
    }).session(session && !isStandaloneFallback ? session : null);

    if (!lead) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    if (lead.archivedAt) {
      const error = new Error('Archived leads cannot have scheduled follow-ups. Restore the lead first.');
      error.statusCode = 400;
      throw error;
    }

    if (lead.status === 'CONVERTED') {
      const error = new Error('Converted leads cannot have new follow-ups scheduled.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Application-level single pending check
    const existingPending = await LeadFollowUp.findOne({
      lead: lead._id,
      status: 'PENDING'
    }).session(session && !isStandaloneFallback ? session : null);

    if (existingPending) {
      const error = new Error('Lead already has a pending follow-up.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Create LeadFollowUp document
    const followUpData = {
      lead: lead._id,
      dueAt: parsedDate,
      status: 'PENDING',
      notes: cleanNotes,
      createdBy: actorId
    };

    let followUp;
    if (session && !isStandaloneFallback) {
      const [created] = await LeadFollowUp.create([followUpData], { session });
      followUp = created;
    } else {
      followUp = await LeadFollowUp.create(followUpData);
    }

    // 4. Synchronize Lead.nextFollowUpAt
    lead.nextFollowUpAt = parsedDate;
    await lead.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 5. Create Activity record (strictly zero PII)
    const activityData = {
      action: 'lead_followup_scheduled',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        dueAt: parsedDate.toISOString()
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    // 6. Post-commit SSE emission
    broadcastDashboardUpdate({
      type: 'LEAD_FOLLOWUP_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      followUpId: followUp._id.toString(),
      action: 'scheduled'
    });

    return followUp;
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (e) {
        // ignore
      }
    }

    // Translate MongoDB duplicate key error on partial unique index to 409 Conflict
    if (err.code === 11000 || (err.message && err.message.includes('E11000 duplicate key'))) {
      const conflictErr = new Error('Lead already has a pending follow-up.');
      conflictErr.statusCode = 409;
      throw conflictErr;
    }

    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Reschedules an active pending follow-up.
 *
 * @param {string} leadId
 * @param {string} followUpId
 * @param {Object} data - { dueAt }
 * @param {Object} actor
 * @returns {Promise<Object>} Updated LeadFollowUp
 */
const rescheduleFollowUp = async (leadId, followUpId, { dueAt }, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;
  const parsedDate = validateFutureDate(dueAt);

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    // 1. Scoped lead query
    const lead = await Lead.findOne({
      _id: leadId,
      ...(isAdmin ? {} : { assignedTo: actorId })
    }).session(session && !isStandaloneFallback ? session : null);

    if (!lead) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Double-bound follow-up lookup
    const followUp = await LeadFollowUp.findOne({
      _id: followUpId,
      lead: lead._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error('Only pending follow-ups can be rescheduled.');
      error.statusCode = 409;
      throw error;
    }

    const previousDueAt = followUp.dueAt;
    followUp.dueAt = parsedDate;
    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 3. Synchronize Lead.nextFollowUpAt
    lead.nextFollowUpAt = parsedDate;
    await lead.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 4. Create Activity record
    const activityData = {
      action: 'lead_followup_rescheduled',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        previousDueAt: previousDueAt ? previousDueAt.toISOString() : null,
        newDueAt: parsedDate.toISOString()
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    // 5. Post-commit SSE emission
    broadcastDashboardUpdate({
      type: 'LEAD_FOLLOWUP_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      followUpId: followUp._id.toString(),
      action: 'rescheduled'
    });

    return followUp;
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
};

/**
 * Marks a pending follow-up as COMPLETED and synchronizes Lead.nextFollowUpAt to null.
 *
 * @param {string} leadId
 * @param {string} followUpId
 * @param {Object} actor
 * @returns {Promise<Object>} Updated LeadFollowUp
 */
const completeFollowUp = async (leadId, followUpId, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;
  const now = new Date();

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    // 1. Scoped lead query
    const lead = await Lead.findOne({
      _id: leadId,
      ...(isAdmin ? {} : { assignedTo: actorId })
    }).session(session && !isStandaloneFallback ? session : null);

    if (!lead) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Double-bound follow-up query
    const followUp = await LeadFollowUp.findOne({
      _id: followUpId,
      lead: lead._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error('Only pending follow-ups can be completed.');
      error.statusCode = 409;
      throw error;
    }

    followUp.status = 'COMPLETED';
    followUp.completedAt = now;
    followUp.completedBy = actorId;
    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 3. Synchronize Lead.nextFollowUpAt to null
    lead.nextFollowUpAt = null;
    await lead.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 4. Create Activity record
    const activityData = {
      action: 'lead_followup_completed',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString()
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    // 5. Post-commit SSE
    broadcastDashboardUpdate({
      type: 'LEAD_FOLLOWUP_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      followUpId: followUp._id.toString(),
      action: 'completed'
    });

    return followUp;
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
};

/**
 * Cancels an active pending follow-up and synchronizes Lead.nextFollowUpAt to null.
 *
 * @param {string} leadId
 * @param {string} followUpId
 * @param {Object} actor
 * @returns {Promise<Object>} Updated LeadFollowUp
 */
const cancelFollowUp = async (leadId, followUpId, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;
  const now = new Date();

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    // 1. Scoped lead query
    const lead = await Lead.findOne({
      _id: leadId,
      ...(isAdmin ? {} : { assignedTo: actorId })
    }).session(session && !isStandaloneFallback ? session : null);

    if (!lead) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Double-bound follow-up query
    const followUp = await LeadFollowUp.findOne({
      _id: followUpId,
      lead: lead._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error('Only pending follow-ups can be cancelled.');
      error.statusCode = 409;
      throw error;
    }

    followUp.status = 'CANCELLED';
    followUp.cancelledAt = now;
    followUp.cancelledBy = actorId;
    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 3. Synchronize Lead.nextFollowUpAt to null
    lead.nextFollowUpAt = null;
    await lead.save({ session: session && !isStandaloneFallback ? session : undefined });

    // 4. Create Activity record
    const activityData = {
      action: 'lead_followup_cancelled',
      entityType: 'meta_lead',
      entityId: lead._id,
      entityName: `Lead ${lead.metaLeadId || lead._id}`,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString()
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    // 5. Post-commit SSE
    broadcastDashboardUpdate({
      type: 'LEAD_FOLLOWUP_MUTATED',
      entity: 'meta_lead',
      entityId: lead._id.toString(),
      followUpId: followUp._id.toString(),
      action: 'cancelled'
    });

    return followUp;
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
};

/**
 * Retrieves paginated follow-up history for a specific lead.
 * Enforces ownership isolation before querying.
 *
 * @param {string} leadId
 * @param {Object} query - { page, limit, status }
 * @param {Object} actor
 * @returns {Promise<Object>}
 */
const getLeadFollowUps = async (leadId, { page = 1, limit = 20, status } = {}, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;

  // 1. Scoped lead verification
  const lead = await Lead.findOne({
    _id: leadId,
    ...(isAdmin ? {} : { assignedTo: actorId })
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const match = { lead: lead._id };
  if (status) {
    match.status = status;
  }

  const [followUps, total] = await Promise.all([
    LeadFollowUp.find(match)
      .populate('createdBy', 'name email role')
      .populate('completedBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    LeadFollowUp.countDocuments(match)
  ]);

  return {
    followUps,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Retrieves global or scoped follow-ups for the dedicated Follow-ups page and widget.
 * Enforces ownership at the database query level.
 *
 * @param {Object} params - { page, limit, status, category, search, dateFrom, dateTo }
 * @param {Object} actor
 * @returns {Promise<Object>}
 */
const getFollowUpsList = async (params = {}, actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;

  const parsedPage = Math.max(1, parseInt(params.page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(params.limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  // 1. Bounded search string
  const rawSearch = (params.search || '').trim().slice(0, 100);
  const escapedSearch = rawSearch ? rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;

  // 2. Resolve accessible lead IDs
  const leadMatch = {
    archivedAt: null,
    ...(isAdmin ? {} : { assignedTo: actorId })
  };

  if (escapedSearch) {
    leadMatch.$or = [
      { fullName: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
      { phoneNumber: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  // Fetch authorized leads
  const accessibleLeads = await Lead.find(leadMatch).select('_id fullName email phoneNumber status assignedTo');
  const accessibleLeadIds = accessibleLeads.map((l) => l._id);

  // If non-admin has 0 assigned leads, return empty immediately
  if (accessibleLeadIds.length === 0 && !escapedSearch) {
    return {
      followUps: [],
      pagination: { page: parsedPage, limit: parsedLimit, total: 0, totalPages: 0 }
    };
  }

  // 3. Build FollowUp match filter
  const followUpMatch = {
    lead: { $in: accessibleLeadIds }
  };

  // Status or Category filter
  const { startOfToday, startOfTomorrow } = getKolkataDayBounds();

  if (params.category) {
    const cat = params.category.toLowerCase();
    if (cat === 'today') {
      followUpMatch.status = 'PENDING';
      followUpMatch.dueAt = { $gte: startOfToday, $lt: startOfTomorrow };
    } else if (cat === 'upcoming') {
      followUpMatch.status = 'PENDING';
      followUpMatch.dueAt = { $gte: startOfTomorrow };
    } else if (cat === 'overdue') {
      followUpMatch.status = 'PENDING';
      followUpMatch.dueAt = { $lt: startOfToday };
    } else if (cat === 'completed') {
      followUpMatch.status = 'COMPLETED';
    }
  } else if (params.status) {
    followUpMatch.status = params.status;
  }

  // Date range filters
  if (params.dateFrom || params.dateTo) {
    followUpMatch.dueAt = followUpMatch.dueAt || {};
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      if (!isNaN(fromDate.getTime())) followUpMatch.dueAt.$gte = fromDate;
    }
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      if (!isNaN(toDate.getTime())) followUpMatch.dueAt.$lte = toDate;
    }
  }

  const [followUps, total] = await Promise.all([
    LeadFollowUp.find(followUpMatch)
      .populate('lead', 'fullName email phoneNumber status assignedTo accountName')
      .populate('createdBy', 'name email role')
      .populate('completedBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .sort({ dueAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    LeadFollowUp.countDocuments(followUpMatch)
  ]);

  return {
    followUps,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Returns aggregated follow-up metrics scoped to the actor.
 *
 * @param {Object} actor
 * @returns {Promise<Object>}
 */
const getFollowUpMetrics = async (actor) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;

  const leadMatch = {
    archivedAt: null,
    ...(isAdmin ? {} : { assignedTo: actorId })
  };

  const accessibleLeads = await Lead.find(leadMatch).select('_id');
  const accessibleLeadIds = accessibleLeads.map((l) => l._id);

  if (accessibleLeadIds.length === 0) {
    return {
      today: 0,
      upcoming: 0,
      overdue: 0,
      completedToday: 0,
      missed: 0,
      pendingTotal: 0
    };
  }

  const { startOfToday, startOfTomorrow } = getKolkataDayBounds();

  const [facetResult] = await LeadFollowUp.aggregate([
    { $match: { lead: { $in: accessibleLeadIds } } },
    {
      $facet: {
        today: [
          { $match: { status: 'PENDING', dueAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
          { $count: 'count' }
        ],
        upcoming: [
          { $match: { status: 'PENDING', dueAt: { $gte: startOfTomorrow } } },
          { $count: 'count' }
        ],
        overdue: [
          { $match: { status: 'PENDING', dueAt: { $lt: startOfToday } } },
          { $count: 'count' }
        ],
        completedToday: [
          { $match: { status: 'COMPLETED', completedAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
          { $count: 'count' }
        ],
        missed: [
          { $match: { status: 'MISSED' } },
          { $count: 'count' }
        ],
        pendingTotal: [
          { $match: { status: 'PENDING' } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    today: facetResult?.today?.[0]?.count || 0,
    upcoming: facetResult?.upcoming?.[0]?.count || 0,
    overdue: facetResult?.overdue?.[0]?.count || 0,
    completedToday: facetResult?.completedToday?.[0]?.count || 0,
    missed: facetResult?.missed?.[0]?.count || 0,
    pendingTotal: facetResult?.pendingTotal?.[0]?.count || 0
  };
};

/**
 * Validates the actor for markMissedFollowUps.
 * Fails fast if missing, invalid, or inactive.
 */
const resolveMissedActor = async (actorId) => {
  let targetId = actorId || process.env.SYSTEM_ACTOR_USER_ID;

  if (!targetId) {
    const error = new Error('A valid actorId or SYSTEM_ACTOR_USER_ID is required for missed follow-up processing.');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    const error = new Error('Invalid actorId format for missed follow-up processing.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetId);
  if (!user || user.status !== 'ACTIVE' || user.isActive === false) {
    const error = new Error('Resolved actor for missed follow-up processing is inactive or does not exist.');
    error.statusCode = 400;
    throw error;
  }

  return user;
};

/**
 * Batched, idempotent service to transition overdue PENDING follow-ups to MISSED.
 *
 * @param {Object} options
 * @param {string} [options.actorId] - Explicit admin actor or system actor
 * @param {number} [options.batchSize=100] - Bounded batch size
 * @returns {Promise<{ processedCount: number, batchesRun: number }>}
 */
const markMissedFollowUps = async ({ actorId, batchSize = 100 } = {}) => {
  // 1. Resolve and validate actor once before processing any batch
  const resolvedUser = await resolveMissedActor(actorId);
  const safeActor = buildSafeActor(resolvedUser);

  const { startOfToday } = getKolkataDayBounds();
  let totalProcessed = 0;
  let batchesRun = 0;

  const parsedBatchSize = Math.max(1, Math.min(parseInt(batchSize, 10) || 100, 500));

  // Process eligible records in bounded batches
  while (true) {
    const { session, isStandaloneFallback } = await startTransactionSession();

    try {
      // Find a batch of PENDING records whose dueAt is before startOfToday
      const eligibleFollowUps = await LeadFollowUp.find({
        status: 'PENDING',
        dueAt: { $lt: startOfToday }
      })
        .limit(parsedBatchSize)
        .session(session && !isStandaloneFallback ? session : null);

      if (eligibleFollowUps.length === 0) {
        if (session) session.endSession();
        break;
      }

      const batchFollowUpIds = eligibleFollowUps.map((f) => f._id);
      const batchLeadIds = [...new Set(eligibleFollowUps.map((f) => f.lead.toString()))];

      // 1. Bulk update follow-ups to MISSED
      await LeadFollowUp.updateMany(
        { _id: { $in: batchFollowUpIds } },
        { $set: { status: 'MISSED' } },
        { session: session && !isStandaloneFallback ? session : undefined }
      );

      // 2. Synchronize Lead.nextFollowUpAt = null for affected leads
      await Lead.updateMany(
        { _id: { $in: batchLeadIds } },
        { $set: { nextFollowUpAt: null } },
        { session: session && !isStandaloneFallback ? session : undefined }
      );

      // 3. Create Activities (zero customer PII)
      const activities = eligibleFollowUps.map((f) => ({
        action: 'lead_followup_missed',
        entityType: 'meta_lead',
        entityId: f.lead,
        entityName: `Lead ${f.lead}`,
        actor: safeActor,
        metadata: {
          followUpId: f._id.toString(),
          reason: 'missed_cutoff'
        }
      }));

      if (session && !isStandaloneFallback) {
        await Activity.insertMany(activities, { session });
        await session.commitTransaction();
      } else {
        await Activity.insertMany(activities);
      }

      totalProcessed += eligibleFollowUps.length;
      batchesRun++;

      // 4. Emit exactly one compact bulk SSE event per batch
      broadcastDashboardUpdate({
        type: 'LEAD_FOLLOWUP_MUTATED',
        action: 'bulk_missed',
        count: eligibleFollowUps.length
      });
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
  }

  return {
    processedCount: totalProcessed,
    batchesRun
  };
};

module.exports = {
  scheduleFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  cancelFollowUp,
  getLeadFollowUps,
  getFollowUpsList,
  getFollowUpMetrics,
  markMissedFollowUps,
  resolveMissedActor
};

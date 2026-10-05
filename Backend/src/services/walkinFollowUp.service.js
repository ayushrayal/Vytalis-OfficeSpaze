const mongoose = require('mongoose');
const WalkIn = require('../models/WalkIn');
const { WalkInFollowUp } = require('../models/WalkInFollowUp');
const Activity = require('../models/Activity');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');
const { getKolkataDayBounds, getKolkataDateRangeBounds } = require('../utils/timezone.util');



/**
 * Helper to acquire a transaction session or determine fallback.
 */
const startTransactionSession = async () => {
  let session = null;
  let isStandaloneFallback = false;

  if (mongoose.connection.readyState !== 1) {
    return { session: null, isStandaloneFallback: true };
  }

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    if (session) {
      session.endSession();
      session = null;
    }
    // Standalone mongo fallback for test/dev environments
    isStandaloneFallback = true;
  }

  return { session, isStandaloneFallback };
};

/**
 * Sanitizes note string.
 */
const sanitizeNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note !== 'string') {
    const error = new Error('Note must be a string');
    error.statusCode = 400;
    throw error;
  }
  const trimmed = note.trim();
  if (trimmed.length > 3000) {
    const error = new Error('Follow-up note cannot exceed 3000 characters');
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
  name: actor?.name && typeof actor.name === 'string' ? actor.name.trim() : 'Staff User',
  email: actor?.email && typeof actor.email === 'string' ? actor.email.trim().toLowerCase() : ''
});

/**
 * Schedules a new follow-up for a Walk-in.
 * Enforces single active pending follow-up atomically.
 */
const scheduleFollowUp = async (walkInId, { dueAt, note, notes }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const parsedDate = validateFutureDate(dueAt);
  const rawNote = note !== undefined ? note : notes;
  const cleanNote = sanitizeNote(rawNote);
  const actorId = actor?._id || actor?.id;

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    const walkIn = await WalkIn.findById(walkInId).session(session && !isStandaloneFallback ? session : null);
    if (!walkIn) {
      const error = new Error('Walk-in not found');
      error.statusCode = 404;
      throw error;
    }

    // Application-level single pending check
    const existingPending = await WalkInFollowUp.findOne({
      walkIn: walkIn._id,
      status: 'PENDING'
    }).session(session && !isStandaloneFallback ? session : null);

    if (existingPending) {
      const error = new Error('Walk-in already has a pending follow-up.');
      error.statusCode = 409;
      throw error;
    }

    const followUpData = {
      walkIn: walkIn._id,
      dueAt: parsedDate,
      status: 'PENDING',
      note: cleanNote,
      createdBy: actorId
    };

    let followUp;
    if (session && !isStandaloneFallback) {
      const [created] = await WalkInFollowUp.create([followUpData], { session });
      followUp = created;
    } else {
      followUp = await WalkInFollowUp.create(followUpData);
    }

    // Synchronize walkIn.nextFollowUpAt
    walkIn.nextFollowUpAt = parsedDate;
    await walkIn.save({ session: session && !isStandaloneFallback ? session : undefined });

    // Activity record (zero sensitive customer PII)
    const activityData = {
      action: 'walk_in_follow_up_scheduled',
      entityType: 'walk_in',
      entityId: walkIn._id,
      entityName: walkIn.name,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        dueAt: parsedDate.toISOString(),
        note: cleanNote || null
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id.toString(),
      action: 'followup_scheduled'
    });

    return followUp;
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }

    if (err.code === 11000 || (err.message && err.message.includes('E11000 duplicate key'))) {
      const conflictErr = new Error('Walk-in already has a pending follow-up.');
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
 */
const rescheduleFollowUp = async (walkInId, followUpId, { dueAt, note, notes }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId) || !mongoose.Types.ObjectId.isValid(followUpId)) {
    const error = new Error('Invalid walk-in or follow-up identifier');
    error.statusCode = 404;
    throw error;
  }

  const parsedDate = validateFutureDate(dueAt);
  const rawNote = note !== undefined ? note : notes;
  const cleanNote = rawNote !== undefined ? sanitizeNote(rawNote) : null;
  const actorId = actor?._id || actor?.id;

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    const walkIn = await WalkIn.findById(walkInId).session(session && !isStandaloneFallback ? session : null);
    if (!walkIn) {
      const error = new Error('Walk-in not found');
      error.statusCode = 404;
      throw error;
    }

    const followUp = await WalkInFollowUp.findOne({
      _id: followUpId,
      walkIn: walkIn._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found for this walk-in.');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error(`Only PENDING follow-ups can be rescheduled. Current status: ${followUp.status}`);
      error.statusCode = 400;
      throw error;
    }

    const previousDueAt = followUp.dueAt;
    followUp.dueAt = parsedDate;
    followUp.rescheduledAt = new Date();
    followUp.rescheduledBy = actorId;
    if (cleanNote !== null && cleanNote !== '') {
      followUp.note = cleanNote;
    }

    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    walkIn.nextFollowUpAt = parsedDate;
    await walkIn.save({ session: session && !isStandaloneFallback ? session : undefined });

    const activityData = {
      action: 'walk_in_follow_up_rescheduled',
      entityType: 'walk_in',
      entityId: walkIn._id,
      entityName: walkIn.name,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        previousDueAt: previousDueAt ? previousDueAt.toISOString() : null,
        dueAt: parsedDate.toISOString(),
        note: cleanNote || null
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id.toString(),
      action: 'followup_rescheduled'
    });

    return followUp;
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Marks a pending follow-up as COMPLETED.
 */
const completeFollowUp = async (walkInId, followUpId, { note, notes }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId) || !mongoose.Types.ObjectId.isValid(followUpId)) {
    const error = new Error('Invalid walk-in or follow-up identifier');
    error.statusCode = 404;
    throw error;
  }

  const rawNote = note !== undefined ? note : notes;
  const cleanNote = rawNote !== undefined ? sanitizeNote(rawNote) : '';
  const actorId = actor?._id || actor?.id;

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    const walkIn = await WalkIn.findById(walkInId).session(session && !isStandaloneFallback ? session : null);
    if (!walkIn) {
      const error = new Error('Walk-in not found');
      error.statusCode = 404;
      throw error;
    }

    const followUp = await WalkInFollowUp.findOne({
      _id: followUpId,
      walkIn: walkIn._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found for this walk-in.');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error(`Only PENDING follow-ups can be completed. Current status: ${followUp.status}`);
      error.statusCode = 400;
      throw error;
    }

    followUp.status = 'COMPLETED';
    followUp.completedAt = new Date();
    followUp.completedBy = actorId;
    if (cleanNote) {
      followUp.note = cleanNote;
    }

    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    walkIn.nextFollowUpAt = null;
    await walkIn.save({ session: session && !isStandaloneFallback ? session : undefined });

    const activityData = {
      action: 'walk_in_follow_up_completed',
      entityType: 'walk_in',
      entityId: walkIn._id,
      entityName: walkIn.name,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        note: cleanNote || null
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id.toString(),
      action: 'followup_completed'
    });

    return followUp;
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Marks a pending follow-up as CANCELLED.
 */
const cancelFollowUp = async (walkInId, followUpId, { note, notes }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId) || !mongoose.Types.ObjectId.isValid(followUpId)) {
    const error = new Error('Invalid walk-in or follow-up identifier');
    error.statusCode = 404;
    throw error;
  }

  const rawNote = note !== undefined ? note : notes;
  const cleanNote = rawNote !== undefined ? sanitizeNote(rawNote) : '';
  const actorId = actor?._id || actor?.id;

  const { session, isStandaloneFallback } = await startTransactionSession();

  try {
    const walkIn = await WalkIn.findById(walkInId).session(session && !isStandaloneFallback ? session : null);
    if (!walkIn) {
      const error = new Error('Walk-in not found');
      error.statusCode = 404;
      throw error;
    }

    const followUp = await WalkInFollowUp.findOne({
      _id: followUpId,
      walkIn: walkIn._id
    }).session(session && !isStandaloneFallback ? session : null);

    if (!followUp) {
      const error = new Error('Follow-up task not found for this walk-in.');
      error.statusCode = 404;
      throw error;
    }

    if (followUp.status !== 'PENDING') {
      const error = new Error(`Only PENDING follow-ups can be cancelled. Current status: ${followUp.status}`);
      error.statusCode = 400;
      throw error;
    }

    followUp.status = 'CANCELLED';
    followUp.cancelledAt = new Date();
    followUp.cancelledBy = actorId;
    if (cleanNote) {
      followUp.note = cleanNote;
    }

    await followUp.save({ session: session && !isStandaloneFallback ? session : undefined });

    walkIn.nextFollowUpAt = null;
    await walkIn.save({ session: session && !isStandaloneFallback ? session : undefined });

    const activityData = {
      action: 'walk_in_follow_up_cancelled',
      entityType: 'walk_in',
      entityId: walkIn._id,
      entityName: walkIn.name,
      actor: buildSafeActor(actor),
      metadata: {
        followUpId: followUp._id.toString(),
        note: cleanNote || null
      }
    };

    if (session && !isStandaloneFallback) {
      await Activity.create([activityData], { session });
      await session.commitTransaction();
    } else {
      await Activity.create(activityData);
    }

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id.toString(),
      action: 'followup_cancelled'
    });

    return followUp;
  } catch (err) {
    if (session && !isStandaloneFallback) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Idempotently checks and transitions overdue PENDING follow-ups for a specific walk-in to MISSED.
 * According to application timezone (Asia/Kolkata), dueAt < startOfToday is considered missed.
 */
const checkAndTransitionMissedFollowUps = async (walkInId) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId)) return;

  const { startOfToday } = getKolkataDayBounds();

  const overduePending = await WalkInFollowUp.find({
    walkIn: walkInId,
    status: 'PENDING',
    dueAt: { $lt: startOfToday }
  });

  if (overduePending.length === 0) return;

  for (const f of overduePending) {
    f.status = 'MISSED';
    await f.save();

    await WalkIn.findByIdAndUpdate(walkInId, {
      $set: { nextFollowUpAt: null }
    });

    await Activity.create({
      action: 'walk_in_follow_up_missed',
      entityType: 'walk_in',
      entityId: walkInId,
      entityName: 'Walk-in',
      actor: { id: null, name: 'System', email: '' },
      metadata: {
        followUpId: f._id.toString(),
        reason: 'missed_cutoff'
      }
    });
  }
};

/**
 * Retrieves follow-up list for a walk-in, after checking for missed follow-ups.
 */
const getWalkInFollowUps = async (walkInId) => {
  if (!mongoose.Types.ObjectId.isValid(walkInId)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  // Idempotently transition any overdue follow-up first
  await checkAndTransitionMissedFollowUps(walkInId);

  const followUps = await WalkInFollowUp.find({ walkIn: walkInId })
    .populate('createdBy', 'name email')
    .populate('completedBy', 'name email')
    .populate('cancelledBy', 'name email')
    .populate('rescheduledBy', 'name email')
    .sort({ createdAt: -1 });

  const activeFollowUp = followUps.find((f) => f.status === 'PENDING') || null;

  return {
    activeFollowUp,
    followUps
  };
};

/**
 * Global batch processor to mark all overdue PENDING walk-in follow-ups as MISSED.
 */
const markMissedWalkInFollowUps = async ({ batchSize = 100 } = {}) => {
  const { startOfToday } = getKolkataDayBounds();
  let totalProcessed = 0;
  const parsedBatchSize = Math.max(1, Math.min(parseInt(batchSize, 10) || 100, 500));

  while (true) {
    const overdue = await WalkInFollowUp.find({
      status: 'PENDING',
      dueAt: { $lt: startOfToday }
    }).limit(parsedBatchSize);

    if (overdue.length === 0) break;

    const followUpIds = overdue.map((f) => f._id);
    const walkInIds = [...new Set(overdue.map((f) => f.walkIn.toString()))];

    await WalkInFollowUp.updateMany(
      { _id: { $in: followUpIds } },
      { $set: { status: 'MISSED' } }
    );

    await WalkIn.updateMany(
      { _id: { $in: walkInIds } },
      { $set: { nextFollowUpAt: null } }
    );

    const activities = overdue.map((f) => ({
      action: 'walk_in_follow_up_missed',
      entityType: 'walk_in',
      entityId: f.walkIn,
      entityName: 'Walk-in',
      actor: { id: null, name: 'System', email: '' },
      metadata: {
        followUpId: f._id.toString(),
        reason: 'missed_cutoff'
      }
    }));

    await Activity.insertMany(activities);
    totalProcessed += overdue.length;
  }

  return { processedCount: totalProcessed };
};

/**
 * Global Walk-in Follow-ups endpoint supporting date range, status, and pagination.
 *
 * Supported query parameters:
 * - range / dateRange: 'all' | 'today' | 'week' | 'month' (default 'all')
 * - status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'MISSED' (default 'PENDING')
 * - page: 1-indexed page number (default 1)
 * - limit: items per page (default 20, max 100)
 */
const getGlobalFollowUps = async (query = {}) => {
  const range = query.range || query.dateRange || 'all';
  const status = query.status ? String(query.status).trim().toUpperCase() : 'PENDING';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Build match filter
  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  // Filter based on FOLLOW-UP DUE DATE (dueAt)
  const { start, end } = getKolkataDateRangeBounds(range);
  if (start && end) {
    filter.dueAt = { $gte: start, $lt: end };
  }

  const [items, total, metricsResult] = await Promise.all([
    WalkInFollowUp.find(filter)
      .populate('walkIn', 'name phone email status source date notes')
      .populate('createdBy', 'name email')
      .sort({ dueAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WalkInFollowUp.countDocuments(filter),
    (async () => {
      const now = new Date();
      const { startOfToday, startOfTomorrow } = getKolkataDayBounds(now);
      const [facets] = await WalkInFollowUp.aggregate([
        {
          $facet: {
            pending: [
              { $match: { status: 'PENDING' } },
              { $count: 'count' }
            ],
            today: [
              { $match: { status: 'PENDING', dueAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
              { $count: 'count' }
            ],
            overdue: [
              { $match: { status: 'PENDING', dueAt: { $lt: now } } },
              { $count: 'count' }
            ],
            upcoming: [
              { $match: { status: 'PENDING', dueAt: { $gte: startOfTomorrow } } },
              { $count: 'count' }
            ]
          }
        }
      ]);

      return {
        pending: facets?.pending?.[0]?.count || 0,
        today: facets?.today?.[0]?.count || 0,
        overdue: facets?.overdue?.[0]?.count || 0,
        upcoming: facets?.upcoming?.[0]?.count || 0
      };

    })()
  ]);

  const formattedItems = items.map((f) => ({
    id: f._id.toString(),
    _id: f._id.toString(),
    dueAt: f.dueAt,
    note: f.note || '',
    status: f.status,
    createdAt: f.createdAt,
    walkIn: f.walkIn
      ? {
          id: f.walkIn._id.toString(),
          _id: f.walkIn._id.toString(),
          name: f.walkIn.name,
          phone: f.walkIn.phone,
          email: f.walkIn.email || '',
          status: f.walkIn.status || 'NEW',
          source: f.walkIn.source || '',
          date: f.walkIn.date
        }
      : null
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: formattedItems,
    pagination: {
      page,
      limit,
      total,
      pages: totalPages,
      totalPages
    },
    metrics: metricsResult
  };
};

module.exports = {
  scheduleFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  cancelFollowUp,
  getWalkInFollowUps,
  getGlobalFollowUps,
  checkAndTransitionMissedFollowUps,
  markMissedWalkInFollowUps
};


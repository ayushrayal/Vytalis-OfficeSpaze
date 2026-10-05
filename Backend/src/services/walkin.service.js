const mongoose = require('mongoose');
const WalkIn = require('../models/WalkIn');
const { WALKIN_STATUSES } = require('../models/WalkIn');
const { WalkInFollowUp } = require('../models/WalkInFollowUp');
const Activity = require('../models/Activity');
const { getKolkataDateRangeBounds } = require('../utils/timezone.util');

const createWalkIn = async ({ name, phone, email, date, source, notes, status }) => {
  const walkInData = {
    name: name.trim(),
    phone: phone.trim(),
    date: new Date(date),
    source: source.trim(),
    email: email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null,
    notes: notes && typeof notes === 'string' && notes.trim() ? notes.trim() : null
  };

  if (status && WALKIN_STATUSES.includes(status)) {
    walkInData.status = status;
  }

  const walkIn = await WalkIn.create(walkInData);
  return walkIn;
};

const getWalkInStats = async (refDate = new Date()) => {
  const { start: todayStart, end: todayEnd } = getKolkataDateRangeBounds('today', refDate);
  const { start: weekStart, end: weekEnd } = getKolkataDateRangeBounds('week', refDate);
  const { start: monthStart, end: monthEnd } = getKolkataDateRangeBounds('month', refDate);

  const [statsResult] = await WalkIn.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        today: [
          { $match: { date: { $gte: todayStart, $lt: todayEnd } } },
          { $count: 'count' }
        ],
        thisWeek: [
          { $match: { date: { $gte: weekStart, $lt: weekEnd } } },
          { $count: 'count' }
        ],
        thisMonth: [
          { $match: { date: { $gte: monthStart, $lt: monthEnd } } },
          { $count: 'count' }
        ],
        withEmail: [
          { $match: { email: { $exists: true, $nin: [null, ''] } } },
          { $count: 'count' }
        ],
        withNotes: [
          { $match: { notes: { $exists: true, $nin: [null, ''] } } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    total: statsResult?.total?.[0]?.count || 0,
    today: statsResult?.today?.[0]?.count || 0,
    thisWeek: statsResult?.thisWeek?.[0]?.count || 0,
    thisMonth: statsResult?.thisMonth?.[0]?.count || 0,
    withEmail: statsResult?.withEmail?.[0]?.count || 0,
    withNotes: statsResult?.withNotes?.[0]?.count || 0
  };

};

const getWalkIns = async (query = {}) => {
  const filter = {};

  // Date range filter using Asia/Kolkata calendar boundaries
  const effectiveRange = query.dateRange || query.range || 'all';
  const { start, end } = getKolkataDateRangeBounds(effectiveRange);
  if (start && end) {
    filter.date = { $gte: start, $lt: end };
  }

  // Source filter (preserve existing source filtering)
  if (query.source && query.source !== 'all' && typeof query.source === 'string' && query.source.trim()) {
    filter.source = query.source.trim();
  }

  // Search filter across name, phone, email, source, notes
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const term = query.search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { source: { $regex: term, $options: 'i' } },
      { notes: { $regex: term, $options: 'i' } }
    ];
  }

  const [walkIns, stats, sources] = await Promise.all([
    WalkIn.find(filter).sort({ date: -1, createdAt: -1 }),
    getWalkInStats(),
    WalkIn.distinct('source', { source: { $exists: true, $nin: [null, ''] } })
  ]);

  return {
    walkIns,
    stats,
    sources: sources.filter(Boolean).sort((a, b) => a.localeCompare(b))
  };
};

const getWalkInById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const walkIn = await WalkIn.findById(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  return walkIn;
};

const updateWalkIn = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const cleanUpdate = {};

  if (updateData.name !== undefined) {
    cleanUpdate.name = updateData.name.trim();
  }

  if (updateData.phone !== undefined) {
    cleanUpdate.phone = updateData.phone.trim();
  }

  if (updateData.date !== undefined) {
    cleanUpdate.date = new Date(updateData.date);
  }

  if (updateData.source !== undefined) {
    cleanUpdate.source = updateData.source.trim();
  }

  if (updateData.email !== undefined) {
    cleanUpdate.email =
      typeof updateData.email === 'string' && updateData.email.trim()
        ? updateData.email.trim().toLowerCase()
        : null;
  }

  if (updateData.notes !== undefined) {
    cleanUpdate.notes =
      typeof updateData.notes === 'string' && updateData.notes.trim()
        ? updateData.notes.trim()
        : null;
  }

  if (updateData.status !== undefined) {
    if (!WALKIN_STATUSES.includes(updateData.status)) {
      const error = new Error(`Invalid walk-in status: ${updateData.status}`);
      error.statusCode = 400;
      throw error;
    }
    cleanUpdate.status = updateData.status;
  }

  const walkIn = await WalkIn.findByIdAndUpdate(id, cleanUpdate, {
    new: true,
    runValidators: true
  });

  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  return walkIn;
};

const updateWalkInStatus = async (id, { status, note }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  if (!status || !WALKIN_STATUSES.includes(status)) {
    const error = new Error(`Invalid walk-in status: ${status}. Must be one of: ${WALKIN_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  let cleanNote = null;
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      const error = new Error('Note must be a string');
      error.statusCode = 400;
      throw error;
    }
    cleanNote = note.trim();
    if (cleanNote.length > 3000) {
      const error = new Error('Note cannot exceed 3000 characters');
      error.statusCode = 400;
      throw error;
    }
  }

  const walkIn = await WalkIn.findById(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = walkIn.status || 'NEW';
  walkIn.status = status;
  await walkIn.save();

  // Create Activity log (zero customer PII in activity metadata)
  const actorId = actor?._id || actor?.id || null;
  const actorName = actor?.name && typeof actor.name === 'string' ? actor.name.trim() : 'Staff User';
  const actorEmail = actor?.email && typeof actor.email === 'string' ? actor.email.trim().toLowerCase() : '';

  await Activity.create({
    action: 'walk_in_status_updated',
    entityType: 'walk_in',
    entityId: walkIn._id,
    entityName: walkIn.name,
    actor: {
      id: actorId,
      name: actorName,
      email: actorEmail
    },
    metadata: {
      previousStatus,
      newStatus: status,
      note: cleanNote || null
    }
  });

  return walkIn;
};

const addWalkInNote = async (id, { note }, actor) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  if (!note || typeof note !== 'string' || !note.trim()) {
    const error = new Error('Note content is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanNote = note.trim();
  if (cleanNote.length > 3000) {
    const error = new Error('Note cannot exceed 3000 characters');
    error.statusCode = 400;
    throw error;
  }

  const walkIn = await WalkIn.findById(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const actorId = actor?._id || actor?.id || null;
  const actorName = actor?.name && typeof actor.name === 'string' ? actor.name.trim() : 'Staff User';
  const actorEmail = actor?.email && typeof actor.email === 'string' ? actor.email.trim().toLowerCase() : '';

  const activity = await Activity.create({
    action: 'walk_in_note_added',
    entityType: 'walk_in',
    entityId: walkIn._id,
    entityName: walkIn.name,
    actor: {
      id: actorId,
      name: actorName,
      email: actorEmail
    },
    metadata: {
      note: cleanNote
    }
  });

  return activity;
};

const getWalkInActivity = async (id, { page = 1, limit = 20 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const walkInExists = await WalkIn.exists({ _id: id });
  if (!walkInExists) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const [total, activities] = await Promise.all([
    Activity.countDocuments({ entityType: 'walk_in', entityId: id }),
    Activity.find({ entityType: 'walk_in', entityId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / parsedLimit);

  return {
    activities: activities.map((act) => ({
      ...act,
      id: act._id ? act._id.toString() : act.id
    })),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1 && totalPages > 0
    }
  };
};

const deleteWalkIn = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const walkIn = await WalkIn.findByIdAndDelete(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  // Cascade delete associated follow-ups
  await WalkInFollowUp.deleteMany({ walkIn: id });

  return true;
};

module.exports = {
  createWalkIn,
  getWalkIns,
  getWalkInStats,
  getWalkInById,
  updateWalkIn,
  updateWalkInStatus,
  addWalkInNote,
  getWalkInActivity,
  deleteWalkIn
};


const Activity = require('../models/Activity');

/**
 * Persists an activity record safely.
 * Non-blocking for caller: catches internal errors and logs them without interrupting primary business workflows.
 */
const logActivity = async ({
  action,
  entityType,
  entityId,
  entityName,
  actor,
  metadata = {}
}) => {
  try {
    const actorId = actor?._id || actor?.id || null;
    const actorName = actor?.name && typeof actor.name === 'string' ? actor.name.trim() : 'System';
    const actorEmail = actor?.email && typeof actor.email === 'string' ? actor.email.trim().toLowerCase() : '';

    const activity = await Activity.create({
      action,
      entityType,
      entityId,
      entityName: entityName ? String(entityName).trim() : 'Unknown',
      actor: {
        id: actorId,
        name: actorName,
        email: actorEmail
      },
      metadata
    });

    return activity;
  } catch (error) {
    // Failure logging strategy: Never crash or rollback the successful business mutation
    console.error('[ActivityService Error]: Failed to record activity log:', {
      error: error.message,
      action,
      entityType,
      entityId,
      entityName
    });
    return null;
  }
};

/**
 * Retrieves recent activities in reverse chronological order with server-side pagination.
 */
const getRecentActivities = async ({ page = 1, limit = 10, entityType } = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {};
  if (entityType && typeof entityType === 'string' && entityType.trim()) {
    query.entityType = entityType.trim();
  }

  const [total, activities] = await Promise.all([
    Activity.countDocuments(query),
    Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean()
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / parsedLimit);
  const hasNextPage = parsedPage < totalPages;
  const hasPrevPage = parsedPage > 1 && totalPages > 0;

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
      hasNextPage,
      hasPrevPage
    }
  };
};

module.exports = {
  logActivity,
  getRecentActivities
};

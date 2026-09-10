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
 * Retrieves recent activities in reverse chronological order.
 */
const getRecentActivities = async ({ limit = 10, entityType } = {}) => {
  const parsedLimit = Number(limit);
  const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 10;

  const query = {};
  if (entityType && typeof entityType === 'string' && entityType.trim()) {
    query.entityType = entityType.trim();
  }

  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return activities.map((act) => ({
    ...act,
    id: act._id ? act._id.toString() : act.id
  }));
};

module.exports = {
  logActivity,
  getRecentActivities
};

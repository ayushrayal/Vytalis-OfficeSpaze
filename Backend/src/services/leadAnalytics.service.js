const mongoose = require('mongoose');
const { Lead, LEAD_STATUS, CONVERSION_TYPES } = require('../models/Lead');
const { LeadFollowUp } = require('../models/LeadFollowUp');
const User = require('../models/User');
const {
  TIMEZONE,
  getKolkataDayBounds,
  getKolkataAnalyticsRange,
  generateContinuousDateBuckets
} = require('../utils/timezone.util');

/**
 * Builds the database-level ownership and archive filter.
 * Guaranteed server-side: Non-admin users are strictly forced to their own user ID
 * and cannot view archived records. Client parameters cannot bypass this rule.
 *
 * @param {Object} actor - Authenticated user from authMiddleware
 * @param {boolean} [includeArchived=false] - Only respected for ADMIN
 * @returns {{ baseMatch: Object, isAdmin: boolean, actorId: any, isArchivedIncluded: boolean }}
 */
const buildLeadScopeMatch = (actor, includeArchived = false) => {
  const isAdmin = !actor || actor.role === 'ADMIN';
  const actorId = actor?._id || actor?.id;

  const baseMatch = {};

  if (!isAdmin) {
    // Non-admin is strictly scoped to own assigned leads
    baseMatch.assignedTo = new mongoose.Types.ObjectId(actorId);
    // Non-admin is locked to active leads only
    baseMatch.archivedAt = null;
  } else {
    // Admin: respect includeArchived toggle
    const shouldIncludeArchived = includeArchived === true || includeArchived === 'true';
    if (!shouldIncludeArchived) {
      baseMatch.archivedAt = null;
    }
  }

  return {
    baseMatch,
    isAdmin,
    actorId,
    isArchivedIncluded: isAdmin && (includeArchived === true || includeArchived === 'true')
  };
};

/**
 * Builds date range match condition for lead creation time.
 * Falls back to createdAt if createdTime is null.
 *
 * @param {Date} start
 * @param {Date} end
 * @returns {Object}
 */
const buildLeadDateCondition = (start, end) => ({
  $or: [
    { createdTime: { $gte: start, $lte: end } },
    { createdTime: null, createdAt: { $gte: start, $lte: end } }
  ]
});

/**
 * Retrieves high-level KPI metrics, status distribution, conversion summary,
 * and follow-up snapshot for the authorized scope and date range.
 *
 * @param {Object} params
 * @param {string} [params.preset='last30days']
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {boolean} [params.includeArchived=false]
 * @param {Object} params.actor
 * @returns {Promise<{ kpis: Object, statusDistribution: Object, conversionSummary: Object, followUpSummary: Object, meta: Object }>}
 */
const getOverviewAnalytics = async ({ preset = 'last30days', startDate, endDate, includeArchived, actor } = {}) => {
  const { start, end, preset: effectivePreset, rangeLabel } = getKolkataAnalyticsRange({
    preset,
    startDate,
    endDate
  });

  const { baseMatch, isAdmin, isArchivedIncluded } = buildLeadScopeMatch(actor, includeArchived);
  const dateMatch = buildLeadDateCondition(start, end);

  // Full match combining scope and creation date range
  const scopedPeriodMatch = {
    ...baseMatch,
    ...dateMatch
  };

  const { startOfToday, startOfTomorrow } = getKolkataDayBounds();

  // Single aggregation pipeline for leads metrics
  const [facetResult] = await Lead.aggregate([
    {
      $facet: {
        totalPeriodLeads: [
          { $match: scopedPeriodMatch },
          { $count: 'count' }
        ],
        activePeriodLeads: [
          { $match: { ...scopedPeriodMatch, archivedAt: null } },
          { $count: 'count' }
        ],
        archivedPeriodLeads: [
          { $match: { ...scopedPeriodMatch, archivedAt: { $ne: null } } },
          { $count: 'count' }
        ],
        byStatus: [
          { $match: scopedPeriodMatch },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        conversionsByType: [
          {
            $match: {
              ...scopedPeriodMatch,
              status: 'CONVERTED',
              conversionType: { $ne: null }
            }
          },
          { $group: { _id: '$conversionType', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const totalLeads = facetResult?.totalPeriodLeads?.[0]?.count || 0;
  const activeLeads = facetResult?.activePeriodLeads?.[0]?.count || 0;
  const archivedLeads = facetResult?.archivedPeriodLeads?.[0]?.count || 0;

  // Status map
  const statusCounts = {};
  LEAD_STATUS.forEach((st) => {
    statusCounts[st] = 0;
  });
  (facetResult?.byStatus || []).forEach((item) => {
    if (item._id && statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
    }
  });

  const statusDistribution = {};
  LEAD_STATUS.forEach((st) => {
    const count = statusCounts[st] || 0;
    statusDistribution[st] = {
      count,
      percentage: totalLeads > 0 ? Number(((count / totalLeads) * 100).toFixed(2)) : 0
    };
  });

  // Eligible leads for operational conversion rate
  const eligibleLeads = isArchivedIncluded ? totalLeads : activeLeads;
  const convertedLeads = statusCounts['CONVERTED'] || 0;
  const conversionRate = eligibleLeads > 0 ? Number(((convertedLeads / eligibleLeads) * 100).toFixed(2)) : 0;

  // Conversion breakdown by type
  const conversionTypeCounts = {};
  CONVERSION_TYPES.forEach((t) => {
    conversionTypeCounts[t] = 0;
  });
  (facetResult?.conversionsByType || []).forEach((item) => {
    if (item._id && conversionTypeCounts[item._id] !== undefined) {
      conversionTypeCounts[item._id] = item.count;
    }
  });

  const conversionByType = {};
  CONVERSION_TYPES.forEach((t) => {
    const count = conversionTypeCounts[t] || 0;
    conversionByType[t] = {
      count,
      percentage: convertedLeads > 0 ? Number(((count / convertedLeads) * 100).toFixed(2)) : 0
    };
  });

  // Follow-up metrics scoped to accessible active leads
  const leadMatchForFollowUps = {
    archivedAt: null,
    ...(isAdmin ? {} : { assignedTo: baseMatch.assignedTo })
  };
  const accessibleLeads = await Lead.find(leadMatchForFollowUps).select('_id');
  const accessibleLeadIds = accessibleLeads.map((l) => l._id);

  let followUpSummary = {
    pending: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    missed: 0
  };

  if (accessibleLeadIds.length > 0) {
    const [followUpFacet] = await LeadFollowUp.aggregate([
      { $match: { lead: { $in: accessibleLeadIds } } },
      {
        $facet: {
          pending: [
            { $match: { status: 'PENDING' } },
            { $count: 'count' }
          ],
          overdue: [
            { $match: { status: 'PENDING', dueAt: { $lt: startOfToday } } },
            { $count: 'count' }
          ],
          dueToday: [
            { $match: { status: 'PENDING', dueAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
            { $count: 'count' }
          ],
          upcoming: [
            { $match: { status: 'PENDING', dueAt: { $gte: startOfTomorrow } } },
            { $count: 'count' }
          ],
          completedInRange: [
            { $match: { status: 'COMPLETED', completedAt: { $gte: start, $lte: end } } },
            { $count: 'count' }
          ],
          cancelledInRange: [
            { $match: { status: 'CANCELLED', cancelledAt: { $gte: start, $lte: end } } },
            { $count: 'count' }
          ],
          missedTotal: [
            { $match: { status: 'MISSED' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    followUpSummary = {
      pending: followUpFacet?.pending?.[0]?.count || 0,
      overdue: followUpFacet?.overdue?.[0]?.count || 0,
      dueToday: followUpFacet?.dueToday?.[0]?.count || 0,
      upcoming: followUpFacet?.upcoming?.[0]?.count || 0,
      completed: followUpFacet?.completedInRange?.[0]?.count || 0,
      cancelled: followUpFacet?.cancelledInRange?.[0]?.count || 0,
      missed: followUpFacet?.missedTotal?.[0]?.count || 0
    };
  }

  return {
    kpis: {
      totalLeads,
      activeLeads,
      archivedLeads,
      newLeads: statusCounts['NEW'] || 0,
      contactedLeads: statusCounts['CONTACTED'] || 0,
      followUpLeads: statusCounts['FOLLOW_UP'] || 0,
      qualifiedLeads: statusCounts['QUALIFIED'] || 0,
      convertedLeads,
      lostLeads: statusCounts['LOST'] || 0,
      conversionRate,
      pendingFollowUps: followUpSummary.pending,
      overdueFollowUps: followUpSummary.overdue
    },
    statusDistribution,
    conversionSummary: {
      totalConverted: convertedLeads,
      conversionRate,
      byType: conversionByType
    },
    followUpSummary,
    meta: {
      timezone: TIMEZONE,
      range: {
        preset: effectivePreset,
        start: start.toISOString(),
        end: end.toISOString(),
        rangeLabel
      },
      includeArchived: isArchivedIncluded,
      scope: isAdmin ? 'GLOBAL' : 'SCOPED_USER',
      conversionRate: {
        value: conversionRate,
        numerator: convertedLeads,
        denominator: eligibleLeads,
        denominatorType: isArchivedIncluded ? 'matched_leads_in_scope' : 'active_leads_in_scope',
        formula: '(convertedLeads / totalEligibleLeads) * 100',
        isCohort: false,
        note: 'Operational conversion rate for leads created within the selected date range.'
      },
      followUpTimeBasis: {
        snapshot: 'dueAt',
        completed: 'completedAt',
        cancelled: 'cancelledAt',
        missed: 'current_state_count'
      }
    }
  };
};

/**
 * Retrieves daily time-series trends for leads created and conversions completed
 * across the selected date range, zero-filling missing dates.
 *
 * @param {Object} params
 * @param {string} [params.preset='last30days']
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {boolean} [params.includeArchived=false]
 * @param {Object} params.actor
 * @returns {Promise<{ trends: Array<{ date: string, leads: number, conversions: number }>, meta: Object }>}
 */
const getTrendAnalytics = async ({ preset = 'last30days', startDate, endDate, includeArchived, actor } = {}) => {
  const { start, end, preset: effectivePreset, rangeLabel } = getKolkataAnalyticsRange({
    preset,
    startDate,
    endDate
  });

  const { baseMatch, isAdmin, isArchivedIncluded } = buildLeadScopeMatch(actor, includeArchived);
  const leadDateMatch = buildLeadDateCondition(start, end);

  // 1. Daily Leads Created Pipeline
  const leadsPerDay = await Lead.aggregate([
    {
      $match: {
        ...baseMatch,
        ...leadDateMatch
      }
    },
    {
      $project: {
        dateStr: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: { $ifNull: ['$createdTime', '$createdAt'] },
            timezone: TIMEZONE
          }
        }
      }
    },
    {
      $group: {
        _id: '$dateStr',
        count: { $sum: 1 }
      }
    }
  ]);

  // 2. Daily Official Conversions Pipeline
  // Converted leads whose convertedAt falls within the date range
  const conversionsPerDay = await Lead.aggregate([
    {
      $match: {
        ...baseMatch,
        convertedAt: { $gte: start, $lte: end },
        status: 'CONVERTED'
      }
    },
    {
      $project: {
        dateStr: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$convertedAt',
            timezone: TIMEZONE
          }
        }
      }
    },
    {
      $group: {
        _id: '$dateStr',
        count: { $sum: 1 }
      }
    }
  ]);

  // Index maps
  const leadsMap = new Map();
  leadsPerDay.forEach((row) => {
    if (row._id) leadsMap.set(row._id, row.count);
  });

  const conversionsMap = new Map();
  conversionsPerDay.forEach((row) => {
    if (row._id) conversionsMap.set(row._id, row.count);
  });

  // Continuous date buckets in Asia/Kolkata
  const dateBuckets = generateContinuousDateBuckets(start, end);
  const trends = dateBuckets.map((date) => ({
    date,
    leads: leadsMap.get(date) || 0,
    conversions: conversionsMap.get(date) || 0
  }));

  return {
    trends,
    meta: {
      timezone: TIMEZONE,
      range: {
        preset: effectivePreset,
        start: start.toISOString(),
        end: end.toISOString(),
        rangeLabel
      },
      includeArchived: isArchivedIncluded,
      scope: isAdmin ? 'GLOBAL' : 'SCOPED_USER',
      totalBuckets: trends.length
    }
  };
};

/**
 * Assignee performance analytics. Strictly ADMIN-only.
 * Returns operational and conversion metrics per assignee while preserving
 * historical ownership for inactive staff and unassigned leads.
 *
 * @param {Object} params
 * @param {string} [params.preset='last30days']
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {boolean} [params.includeArchived=false]
 * @param {Object} params.actor
 * @returns {Promise<{ assignees: Array<Object>, meta: Object }>}
 */
const getAssigneeAnalytics = async ({ preset = 'last30days', startDate, endDate, includeArchived, actor } = {}) => {
  if (actor && actor.role !== 'ADMIN') {
    const error = new Error('Access denied: Assignee analytics is restricted to administrators.');
    error.statusCode = 403;
    throw error;
  }

  const { start, end, preset: effectivePreset, rangeLabel } = getKolkataAnalyticsRange({
    preset,
    startDate,
    endDate
  });

  const shouldIncludeArchived = includeArchived === true || includeArchived === 'true';
  const leadMatch = {
    ...(shouldIncludeArchived ? {} : { archivedAt: null }),
    ...buildLeadDateCondition(start, end)
  };

  // 1. Fetch all currently active eligible staff
  const activeStaff = await User.find({
    status: 'ACTIVE',
    isActive: true,
    role: { $in: ['GM', 'TEAM_MANAGER', 'INTERN'] }
  })
    .select('_id name email role status')
    .sort({ name: 1 })
    .lean();

  // 2. Aggregate leads in date range by assignedTo and status
  const leadAggregations = await Lead.aggregate([
    { $match: leadMatch },
    {
      $group: {
        _id: {
          assignedTo: '$assignedTo',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // 3. Aggregate follow-up metrics by lead's assignedTo
  const { startOfToday } = getKolkataDayBounds();
  const followUpAggregations = await LeadFollowUp.aggregate([
    {
      $match: { status: 'PENDING' }
    },
    {
      $lookup: {
        from: 'leads',
        localField: 'lead',
        foreignField: '_id',
        as: 'leadDoc'
      }
    },
    { $unwind: '$leadDoc' },
    {
      $match: {
        ...(shouldIncludeArchived ? {} : { 'leadDoc.archivedAt': null })
      }
    },
    {
      $group: {
        _id: '$leadDoc.assignedTo',
        pendingTotal: { $sum: 1 },
        overdueTotal: {
          $sum: {
            $cond: [{ $lt: ['$dueAt', startOfToday] }, 1, 0]
          }
        }
      }
    }
  ]);

  const followUpMap = new Map();
  followUpAggregations.forEach((row) => {
    const key = row._id ? row._id.toString() : 'unassigned';
    followUpMap.set(key, {
      pending: row.pendingTotal || 0,
      overdue: row.overdueTotal || 0
    });
  });

  // Group lead counts by assignee ID
  const assigneeMetricsMap = new Map();

  leadAggregations.forEach((row) => {
    const assignedToId = row._id.assignedTo ? row._id.assignedTo.toString() : 'unassigned';
    const status = row._id.status;
    const count = row.count || 0;

    if (!assigneeMetricsMap.has(assignedToId)) {
      assigneeMetricsMap.set(assignedToId, {
        totalLeads: 0,
        new: 0,
        contacted: 0,
        followUp: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      });
    }

    const current = assigneeMetricsMap.get(assignedToId);
    current.totalLeads += count;

    if (status === 'NEW') current.new += count;
    else if (status === 'CONTACTED') current.contacted += count;
    else if (status === 'FOLLOW_UP') current.followUp += count;
    else if (status === 'QUALIFIED') current.qualified += count;
    else if (status === 'CONVERTED') current.converted += count;
    else if (status === 'LOST') current.lost += count;
  });

  // 4. Resolve identities for all assignedToIds
  const assignedUserIds = Array.from(assigneeMetricsMap.keys()).filter((id) => id !== 'unassigned');
  const referencedUsers = await User.find({ _id: { $in: assignedUserIds } })
    .select('_id name email role status isActive')
    .lean();

  const userMap = new Map();
  activeStaff.forEach((u) => userMap.set(u._id.toString(), u));
  referencedUsers.forEach((u) => userMap.set(u._id.toString(), u));

  const allAssigneeIds = new Set([...userMap.keys(), ...assigneeMetricsMap.keys()]);

  const result = [];

  for (const assigneeKey of allAssigneeIds) {
    if (assigneeKey === 'unassigned') {
      const counts = assigneeMetricsMap.get('unassigned') || {
        totalLeads: 0,
        new: 0,
        contacted: 0,
        followUp: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      };
      const fu = followUpMap.get('unassigned') || { pending: 0, overdue: 0 };
      const rate = counts.totalLeads > 0 ? Number(((counts.converted / counts.totalLeads) * 100).toFixed(2)) : 0;

      result.push({
        assigneeId: null,
        name: 'Unassigned',
        email: null,
        role: 'NONE',
        status: 'UNASSIGNED',
        totalLeads: counts.totalLeads,
        new: counts.new,
        contacted: counts.contacted,
        followUp: counts.followUp,
        qualified: counts.qualified,
        converted: counts.converted,
        lost: counts.lost,
        pendingFollowUps: fu.pending,
        overdueFollowUps: fu.overdue,
        conversionRate: rate
      });
      continue;
    }

    const user = userMap.get(assigneeKey);
    const counts = assigneeMetricsMap.get(assigneeKey) || {
      totalLeads: 0,
      new: 0,
      contacted: 0,
      followUp: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    };
    const fu = followUpMap.get(assigneeKey) || { pending: 0, overdue: 0 };
    const rate = counts.totalLeads > 0 ? Number(((counts.converted / counts.totalLeads) * 100).toFixed(2)) : 0;

    result.push({
      assigneeId: assigneeKey,
      name: user ? user.name : 'Unknown / Deleted User',
      email: user ? user.email : '',
      role: user ? user.role : 'UNKNOWN',
      status: user ? (user.isActive && user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') : 'DELETED',
      totalLeads: counts.totalLeads,
      new: counts.new,
      contacted: counts.contacted,
      followUp: counts.followUp,
      qualified: counts.qualified,
      converted: counts.converted,
      lost: counts.lost,
      pendingFollowUps: fu.pending,
      overdueFollowUps: fu.overdue,
      conversionRate: rate
    });
  }

  // Sort: active staff first, then by totalLeads descending, then name
  result.sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    if (b.totalLeads !== a.totalLeads) return b.totalLeads - a.totalLeads;
    return (a.name || '').localeCompare(b.name || '');
  });

  return {
    assignees: result,
    meta: {
      timezone: TIMEZONE,
      range: {
        preset: effectivePreset,
        start: start.toISOString(),
        end: end.toISOString(),
        rangeLabel
      },
      includeArchived: shouldIncludeArchived,
      totalAssignees: result.length
    }
  };
};

/**
 * Detailed conversion analytics by official conversionType.
 *
 * @param {Object} params
 * @returns {Promise<{ conversions: Object, meta: Object }>}
 */
const getConversionAnalytics = async ({ preset = 'last30days', startDate, endDate, includeArchived, actor } = {}) => {
  const { start, end, preset: effectivePreset, rangeLabel } = getKolkataAnalyticsRange({
    preset,
    startDate,
    endDate
  });

  const { baseMatch, isAdmin, isArchivedIncluded } = buildLeadScopeMatch(actor, includeArchived);
  const dateMatch = buildLeadDateCondition(start, end);

  const scopedPeriodMatch = {
    ...baseMatch,
    ...dateMatch
  };

  const [leadFacet] = await Lead.aggregate([
    {
      $facet: {
        totalPeriodLeads: [
          { $match: scopedPeriodMatch },
          { $count: 'count' }
        ],
        convertedPeriodLeads: [
          { $match: { ...scopedPeriodMatch, status: 'CONVERTED' } },
          { $count: 'count' }
        ],
        byType: [
          {
            $match: {
              ...scopedPeriodMatch,
              status: 'CONVERTED'
            }
          },
          {
            $group: {
              _id: '$conversionType',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  const totalPeriodLeads = leadFacet?.totalPeriodLeads?.[0]?.count || 0;
  const convertedPeriodLeads = leadFacet?.convertedPeriodLeads?.[0]?.count || 0;
  const conversionRate = totalPeriodLeads > 0 ? Number(((convertedPeriodLeads / totalPeriodLeads) * 100).toFixed(2)) : 0;

  const typeCounts = {};
  CONVERSION_TYPES.forEach((t) => {
    typeCounts[t] = 0;
  });
  let unclassifiedConversions = 0;

  (leadFacet?.byType || []).forEach((row) => {
    if (row._id && typeCounts[row._id] !== undefined) {
      typeCounts[row._id] = row.count;
    } else {
      unclassifiedConversions += row.count;
    }
  });

  const breakdown = {};
  CONVERSION_TYPES.forEach((t) => {
    const count = typeCounts[t] || 0;
    breakdown[t] = {
      count,
      percentage: convertedPeriodLeads > 0 ? Number(((count / convertedPeriodLeads) * 100).toFixed(2)) : 0
    };
  });

  return {
    conversions: {
      totalLeads: totalPeriodLeads,
      convertedLeads: convertedPeriodLeads,
      conversionRate,
      breakdown,
      unclassifiedConversions
    },
    meta: {
      timezone: TIMEZONE,
      range: {
        preset: effectivePreset,
        start: start.toISOString(),
        end: end.toISOString(),
        rangeLabel
      },
      includeArchived: isArchivedIncluded,
      scope: isAdmin ? 'GLOBAL' : 'SCOPED_USER'
    }
  };
};

/**
 * Detailed follow-up analytics derived authoritatively from LeadFollowUp.
 *
 * @param {Object} params
 * @returns {Promise<{ followUps: Object, meta: Object }>}
 */
const getFollowUpAnalytics = async ({ preset = 'last30days', startDate, endDate, includeArchived, actor } = {}) => {
  const { start, end, preset: effectivePreset, rangeLabel } = getKolkataAnalyticsRange({
    preset,
    startDate,
    endDate
  });

  const { baseMatch, isAdmin, isArchivedIncluded } = buildLeadScopeMatch(actor, includeArchived);

  // Accessible leads filter
  const leadMatch = {
    ...(isArchivedIncluded ? {} : { archivedAt: null }),
    ...(isAdmin ? {} : { assignedTo: baseMatch.assignedTo })
  };
  const accessibleLeads = await Lead.find(leadMatch).select('_id');
  const accessibleLeadIds = accessibleLeads.map((l) => l._id);

  if (accessibleLeadIds.length === 0) {
    return {
      followUps: {
        snapshot: { pending: 0, overdue: 0, dueToday: 0, upcoming: 0 },
        periodEvents: { completed: 0, cancelled: 0, missed: 0 }
      },
      meta: {
        timezone: TIMEZONE,
        range: { preset: effectivePreset, start: start.toISOString(), end: end.toISOString(), rangeLabel },
        includeArchived: isArchivedIncluded,
        scope: isAdmin ? 'GLOBAL' : 'SCOPED_USER'
      }
    };
  }

  const { startOfToday, startOfTomorrow } = getKolkataDayBounds();

  const [facet] = await LeadFollowUp.aggregate([
    { $match: { lead: { $in: accessibleLeadIds } } },
    {
      $facet: {
        pending: [
          { $match: { status: 'PENDING' } },
          { $count: 'count' }
        ],
        overdue: [
          { $match: { status: 'PENDING', dueAt: { $lt: startOfToday } } },
          { $count: 'count' }
        ],
        dueToday: [
          { $match: { status: 'PENDING', dueAt: { $gte: startOfToday, $lt: startOfTomorrow } } },
          { $count: 'count' }
        ],
        upcoming: [
          { $match: { status: 'PENDING', dueAt: { $gte: startOfTomorrow } } },
          { $count: 'count' }
        ],
        completedInRange: [
          { $match: { status: 'COMPLETED', completedAt: { $gte: start, $lte: end } } },
          { $count: 'count' }
        ],
        cancelledInRange: [
          { $match: { status: 'CANCELLED', cancelledAt: { $gte: start, $lte: end } } },
          { $count: 'count' }
        ],
        missedTotal: [
          { $match: { status: 'MISSED' } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    followUps: {
      snapshot: {
        pending: facet?.pending?.[0]?.count || 0,
        overdue: facet?.overdue?.[0]?.count || 0,
        dueToday: facet?.dueToday?.[0]?.count || 0,
        upcoming: facet?.upcoming?.[0]?.count || 0
      },
      periodEvents: {
        completed: facet?.completedInRange?.[0]?.count || 0,
        cancelled: facet?.cancelledInRange?.[0]?.count || 0,
        missed: facet?.missedTotal?.[0]?.count || 0
      }
    },
    meta: {
      timezone: TIMEZONE,
      range: {
        preset: effectivePreset,
        start: start.toISOString(),
        end: end.toISOString(),
        rangeLabel
      },
      includeArchived: isArchivedIncluded,
      scope: isAdmin ? 'GLOBAL' : 'SCOPED_USER',
      followUpTimeBasis: {
        snapshot: 'dueAt',
        completed: 'completedAt',
        cancelled: 'cancelledAt',
        missed: 'current_state_count'
      }
    }
  };
};

module.exports = {
  buildLeadScopeMatch,
  getOverviewAnalytics,
  getTrendAnalytics,
  getAssigneeAnalytics,
  getConversionAnalytics,
  getFollowUpAnalytics
};

const leadAnalyticsService = require('../services/leadAnalytics.service');

/**
 * Controller for CRM Lead Analytics.
 * Enforces standardized response envelope: { success, message, data, meta, errors }.
 */

/**
 * GET /api/leads/analytics/overview
 * Protected by authMiddleware + requirePermission('meta_leads', 'view')
 */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const { preset, startDate, endDate, includeArchived } = req.query;

    const result = await leadAnalyticsService.getOverviewAnalytics({
      preset,
      startDate,
      endDate,
      includeArchived,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Overview analytics retrieved successfully',
      data: {
        kpis: result.kpis,
        statusDistribution: result.statusDistribution,
        conversionSummary: result.conversionSummary,
        followUpSummary: result.followUpSummary
      },
      meta: result.meta,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/analytics/trends
 * Protected by authMiddleware + requirePermission('meta_leads', 'view')
 */
const getTrendAnalytics = async (req, res, next) => {
  try {
    const { preset, startDate, endDate, includeArchived } = req.query;

    const result = await leadAnalyticsService.getTrendAnalytics({
      preset,
      startDate,
      endDate,
      includeArchived,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Trend analytics retrieved successfully',
      data: {
        trends: result.trends
      },
      meta: result.meta,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/analytics/assignees
 * Strictly ADMIN only: protected by authMiddleware + requireAdmin
 */
const getAssigneeAnalytics = async (req, res, next) => {
  try {
    const { preset, startDate, endDate, includeArchived } = req.query;

    const result = await leadAnalyticsService.getAssigneeAnalytics({
      preset,
      startDate,
      endDate,
      includeArchived,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Assignee analytics retrieved successfully',
      data: {
        assignees: result.assignees
      },
      meta: result.meta,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/analytics/conversions
 * Protected by authMiddleware + requirePermission('meta_leads', 'view')
 */
const getConversionAnalytics = async (req, res, next) => {
  try {
    const { preset, startDate, endDate, includeArchived } = req.query;

    const result = await leadAnalyticsService.getConversionAnalytics({
      preset,
      startDate,
      endDate,
      includeArchived,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Conversion analytics retrieved successfully',
      data: result.conversions,
      meta: result.meta,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/analytics/follow-ups
 * Protected by authMiddleware + requirePermission('meta_leads', 'view')
 */
const getFollowUpAnalytics = async (req, res, next) => {
  try {
    const { preset, startDate, endDate, includeArchived } = req.query;

    const result = await leadAnalyticsService.getFollowUpAnalytics({
      preset,
      startDate,
      endDate,
      includeArchived,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Follow-up analytics retrieved successfully',
      data: result.followUps,
      meta: result.meta,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewAnalytics,
  getTrendAnalytics,
  getAssigneeAnalytics,
  getConversionAnalytics,
  getFollowUpAnalytics
};

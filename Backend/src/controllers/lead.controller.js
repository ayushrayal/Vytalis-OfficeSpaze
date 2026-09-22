const leadService = require('../services/lead.service');

/**
 * Triggers sync of Meta Lead Ads from Windsor.ai to MongoDB.
 * Restricted to ADMIN role.
 *
 * POST /api/leads/sync
 */
const syncLeads = async (req, res, next) => {
  try {
    const { datePreset, dateFrom, dateTo, accountId } = req.body || {};

    const result = await leadService.syncLeads({
      datePreset,
      dateFrom,
      dateTo,
      accountId,
      actor: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Meta leads synced successfully',
      data: {
        fetched: result.fetched,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves leads with server-side pagination, search, and filtering.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads
 */
const getLeads = async (req, res, next) => {
  try {
    const { page, limit, search, status, assignedTo, dateFrom, dateTo } = req.query;

    const result = await leadService.getLeads({
      page,
      limit,
      search,
      status,
      assignedTo,
      dateFrom,
      dateTo
    });

    return res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: {
        leads: result.leads
      },
      meta: {
        pagination: result.pagination
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single lead by its MongoDB ID.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/:id
 */
const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully',
      data: {
        lead
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves ingestion sync status.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/sync/status
 */
const getSyncStatus = async (req, res, next) => {
  try {
    const status = await leadService.getSyncStatus();

    return res.status(200).json({
      success: true,
      message: 'Sync status retrieved successfully',
      data: status,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Diagnostic test endpoint to verify Windsor connection and return sample leads without persisting.
 * Admin-only.
 *
 * POST /api/leads/test-windsor
 */
const testWindsor = async (req, res, next) => {
  try {
    const { datePreset, accountId } = req.body || {};

    const result = await leadService.testWindsorConnection({
      datePreset,
      accountId
    });

    return res.status(200).json({
      success: true,
      message: 'Windsor facebook_leads connection verified',
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncLeads,
  getLeads,
  getLeadById,
  getSyncStatus,
  testWindsor
};

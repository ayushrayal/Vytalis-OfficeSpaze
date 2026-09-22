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
    const { page, limit, search, status, assignedTo, followUpStatus, dateFrom, dateTo, archived } = req.query;

    const result = await leadService.getLeads({
      page,
      limit,
      search,
      status,
      assignedTo,
      followUpStatus,
      dateFrom,
      dateTo,
      archived,
      actor: req.user
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
 * Retrieves a single lead by its MongoDB ID with ownership scoping.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/:id
 */
const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);

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

/**
 * Assigns or unassigns a lead to an eligible staff member.
 * Protected by authMiddleware + requirePermission('meta_leads', 'update').
 *
 * PATCH /api/leads/:id/assignment
 */
const assignLead = async (req, res, next) => {
  try {
    const { assignedTo } = req.body || {};
    const lead = await leadService.assignLead(req.params.id, assignedTo, req.user);

    return res.status(200).json({
      success: true,
      message: assignedTo && assignedTo !== 'unassigned' ? 'Lead assigned successfully' : 'Lead unassigned successfully',
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
 * Updates status of a lead.
 * Protected by authMiddleware + requirePermission('meta_leads', 'update').
 *
 * PATCH /api/leads/:id/status
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const lead = await leadService.updateLeadStatus(req.params.id, status, req.user);

    return res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
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
 * Updates notes on a lead.
 * Protected by authMiddleware + requirePermission('meta_leads', 'update').
 *
 * PATCH /api/leads/:id/notes
 */
const updateLeadNotes = async (req, res, next) => {
  try {
    const { notes } = req.body || {};
    const lead = await leadService.updateLeadNotes(req.params.id, notes, req.user);

    return res.status(200).json({
      success: true,
      message: 'Lead notes updated successfully',
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
 * Retrieves eligible assignable users for leads (GM, TEAM_MANAGER, INTERN).
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/assignees
 */
const getAssignableUsers = async (req, res, next) => {
  try {
    const assignees = await leadService.getAssignableUsers();

    return res.status(200).json({
      success: true,
      message: 'Assignable users retrieved successfully',
      data: {
        assignees
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves aggregated lead statistics scoped to authenticated user.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/stats
 */
const getLeadStats = async (req, res, next) => {
  try {
    const stats = await leadService.getLeadStats(req.user);

    return res.status(200).json({
      success: true,
      message: 'Lead statistics retrieved successfully',
      data: stats,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates or clears follow-up on a lead.
 * Protected by authMiddleware + requirePermission('meta_leads', 'update').
 *
 * PATCH /api/leads/:id/follow-up
 */
const updateLeadFollowUp = async (req, res, next) => {
  try {
    const { nextFollowUpAt } = req.body || {};
    const lead = await leadService.updateLeadFollowUp(req.params.id, nextFollowUpAt, req.user);

    return res.status(200).json({
      success: true,
      message: nextFollowUpAt ? 'Follow-up scheduled successfully' : 'Follow-up cleared successfully',
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
 * Retrieves paginated activity history for a lead.
 * Protected by authMiddleware + requirePermission('meta_leads', 'view').
 *
 * GET /api/leads/:id/activity
 */
const getLeadActivity = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await leadService.getLeadActivity(req.params.id, { page, limit }, req.user);

    return res.status(200).json({
      success: true,
      message: 'Lead activity retrieved successfully',
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assigns or unassigns leads to a staff member.
 * Strictly ADMIN-only.
 *
 * POST /api/leads/bulk/assignment
 */
const bulkAssignLeads = async (req, res, next) => {
  try {
    const { mode, leadIds, filters, assignedTo } = req.body || {};
    const result = await leadService.bulkAssignLeads(
      { mode, leadIds, filters, assignedTo },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: assignedTo && assignedTo !== 'unassigned'
        ? `Successfully assigned ${result.updatedCount} leads`
        : `Successfully unassigned ${result.updatedCount} leads`,
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk updates lead status.
 *
 * POST /api/leads/bulk/status
 */
const bulkUpdateLeadStatus = async (req, res, next) => {
  try {
    const { mode, leadIds, filters, status } = req.body || {};
    const result = await leadService.bulkUpdateLeadStatus(
      { mode, leadIds, filters, status },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated status to ${status} for ${result.updatedCount} leads`,
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk archives active leads.
 *
 * POST /api/leads/bulk/archive
 */
const bulkArchiveLeads = async (req, res, next) => {
  try {
    const { mode, leadIds, filters } = req.body || {};
    const result = await leadService.bulkArchiveLeads(
      { mode, leadIds, filters },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Successfully archived ${result.updatedCount} leads`,
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk restores archived leads.
 *
 * POST /api/leads/bulk/restore
 */
const bulkRestoreLeads = async (req, res, next) => {
  try {
    const { mode, leadIds, filters } = req.body || {};
    const result = await leadService.bulkRestoreLeads(
      { mode, leadIds, filters },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Successfully restored ${result.updatedCount} leads`,
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk permanently deletes archived leads and activities.
 * Strictly ADMIN-only.
 *
 * DELETE /api/leads/bulk/permanent
 */
const bulkPermanentDeleteLeads = async (req, res, next) => {
  try {
    const { mode, leadIds, filters } = req.body || {};
    const result = await leadService.bulkPermanentDeleteLeads(
      { mode, leadIds, filters },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Successfully permanently deleted ${result.deletedCount} leads and activity logs`,
      data: result,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves sanitized list of conversion targets.
 * GET /api/leads/conversion-targets
 */
const getConversionTargets = async (req, res, next) => {
  try {
    const { type, search, limit } = req.query;
    const targets = await leadService.getConversionTargets({ type, search, limit });

    return res.status(200).json({
      success: true,
      message: 'Conversion targets fetched successfully',
      data: {
        targets
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Converts an active lead into an official business outcome.
 * POST /api/leads/:id/convert
 */
const convertLead = async (req, res, next) => {
  try {
    const { conversionType, conversionTargetType, conversionTargetId } = req.body || {};
    const lead = await leadService.convertLead(
      req.params.id,
      { conversionType, conversionTargetType, conversionTargetId },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Lead converted successfully',
      data: {
        lead
      },
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
  testWindsor,
  assignLead,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadFollowUp,
  getLeadStats,
  getLeadActivity,
  getAssignableUsers,
  bulkAssignLeads,
  bulkUpdateLeadStatus,
  bulkArchiveLeads,
  bulkRestoreLeads,
  bulkPermanentDeleteLeads,
  getConversionTargets,
  convertLead
};

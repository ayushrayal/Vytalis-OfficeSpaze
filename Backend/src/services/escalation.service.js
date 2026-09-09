const mongoose = require('mongoose');
const Escalation = require('../models/Escalation');
const settingService = require('./setting.service');

const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

const calculateDueAt = (baseDate, resolveTimeHours) => {
  return new Date(baseDate.getTime() + resolveTimeHours * 60 * 60 * 1000);
};

const createEscalation = async (data) => {
  const { escalationType, description, escalatedBy, priority, resolveTime } = data;

  const numericResolveTime = Number(resolveTime);
  if (isNaN(numericResolveTime) || numericResolveTime <= 0) {
    const error = new Error('Resolve time must be a number greater than 0');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const resolveDueAt = calculateDueAt(now, numericResolveTime);

  const escalation = await Escalation.create({
    escalationType: escalationType.trim(),
    description: description.trim(),
    escalatedBy: escalatedBy.trim(),
    priority: priority || 'Medium',
    resolveTime: numericResolveTime,
    resolveDueAt,
    resolvedAt: null,
    status: 'OPEN'
  });

  return escalation;
};

const getEscalations = async (queryParams = {}) => {
  const { search, status, priority, escalationType } = queryParams;
  const now = new Date();
  const alertWindowHours = await settingService.getAlertWindowHours();
  const dueSoonCutoff = new Date(now.getTime() + alertWindowHours * 60 * 60 * 1000);

  const filter = {};

  // Text search
  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { escalationType: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { escalatedBy: { $regex: term, $options: 'i' } }
    ];
  }

  // Priority filter
  if (priority && priority !== 'All') {
    filter.priority = priority;
  }

  // Escalation Type filter
  if (escalationType && escalationType !== 'All') {
    filter.escalationType = escalationType;
  }

  // Status filter
  if (status && status !== 'All') {
    if (status === 'RESOLVED') {
      filter.resolvedAt = { $ne: null };
    } else if (status === 'OVERDUE') {
      filter.resolvedAt = null;
      filter.resolveDueAt = { $lte: now };
    } else if (status === 'OPEN') {
      filter.resolvedAt = null;
      filter.resolveDueAt = { $gt: now };
    } else if (status === 'DUE_SOON') {
      filter.resolvedAt = null;
      filter.resolveDueAt = { $gt: now, $lte: dueSoonCutoff };
    }
  }

  const rawEscalations = await Escalation.find(filter);

  // Compute operational summary counts across all active records
  const allEscalations = await Escalation.find();
  const summary = {
    total: allEscalations.length,
    open: 0,
    dueSoon: 0,
    overdue: 0,
    resolved: 0
  };

  allEscalations.forEach((item) => {
    if (item.resolvedAt) {
      summary.resolved += 1;
    } else if (now >= item.resolveDueAt) {
      summary.overdue += 1;
    } else {
      summary.open += 1;
      if (item.resolveDueAt <= dueSoonCutoff) {
        summary.dueSoon += 1;
      }
    }
  });

  // Sort deterministically by operational SLA urgency:
  // 1. Overdue escalations first (longest overdue first)
  // 2. Open escalations by nearest resolveDueAt
  // 3. Priority as tie-breaker (High > Medium > Low)
  // 4. Resolved escalations at the very end
  const sortedEscalations = rawEscalations.sort((a, b) => {
    const aResolved = Boolean(a.resolvedAt);
    const bResolved = Boolean(b.resolvedAt);

    if (aResolved && !bResolved) return 1;
    if (!aResolved && bResolved) return -1;
    if (aResolved && bResolved) {
      return new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime();
    }

    const aDue = new Date(a.resolveDueAt).getTime();
    const bDue = new Date(b.resolveDueAt).getTime();
    const aOverdue = now.getTime() >= aDue;
    const bOverdue = now.getTime() >= bDue;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Both overdue: most overdue first (earlier deadline first)
    // Both pending: soonest deadline first
    if (aDue !== bDue) {
      return aDue - bDue;
    }

    // Tie breaker: Priority
    const pA = PRIORITY_ORDER[a.priority] || 2;
    const pB = PRIORITY_ORDER[b.priority] || 2;
    return pA - pB;
  });

  return {
    escalations: sortedEscalations.map((e) => e.toJSON()),
    summary,
    alertWindowHours
  };
};

const getAttentionEscalations = async () => {
  const now = new Date();
  const alertWindowHours = await settingService.getAlertWindowHours();
  const alertCutoff = new Date(now.getTime() + alertWindowHours * 60 * 60 * 1000);

  // Business Rule:
  // Show escalations that are NOT resolved AND (remaining <= alertWindowHours OR OVERDUE)
  // Mathematically: resolvedAt is null and resolveDueAt <= now + alertWindowHours
  const attentionRecords = await Escalation.find({
    resolvedAt: null,
    resolveDueAt: { $lte: alertCutoff }
  });

  // Sort: Overdue first, then soonest deadline, then priority
  const sorted = attentionRecords.sort((a, b) => {
    const aDue = new Date(a.resolveDueAt).getTime();
    const bDue = new Date(b.resolveDueAt).getTime();
    const aOverdue = now.getTime() >= aDue;
    const bOverdue = now.getTime() >= bDue;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    if (aDue !== bDue) {
      return aDue - bDue;
    }

    const pA = PRIORITY_ORDER[a.priority] || 2;
    const pB = PRIORITY_ORDER[b.priority] || 2;
    return pA - pB;
  });

  return {
    escalations: sorted.map((e) => e.toJSON()),
    alertWindowHours,
    totalAttentionCount: sorted.length
  };
};

const getEscalationById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  const escalation = await Escalation.findById(id);
  if (!escalation) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  return escalation.toJSON();
};

const updateEscalation = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  const escalation = await Escalation.findById(id);
  if (!escalation) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.escalationType !== undefined) {
    escalation.escalationType = updateData.escalationType.trim();
  }

  if (updateData.description !== undefined) {
    escalation.description = updateData.description.trim();
  }

  if (updateData.escalatedBy !== undefined) {
    escalation.escalatedBy = updateData.escalatedBy.trim();
  }

  if (updateData.priority !== undefined) {
    escalation.priority = updateData.priority;
  }

  // If resolveTime changes on an unresolved escalation, recalculate resolveDueAt from createdAt
  if (updateData.resolveTime !== undefined) {
    const numericResolveTime = Number(updateData.resolveTime);
    if (isNaN(numericResolveTime) || numericResolveTime <= 0) {
      const error = new Error('Resolve time must be a number greater than 0');
      error.statusCode = 400;
      throw error;
    }

    escalation.resolveTime = numericResolveTime;
    if (!escalation.resolvedAt) {
      escalation.resolveDueAt = calculateDueAt(escalation.createdAt, numericResolveTime);
    }
  }

  await escalation.save();
  return escalation.toJSON();
};

const resolveEscalation = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  const escalation = await Escalation.findById(id);
  if (!escalation) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  if (escalation.resolvedAt) {
    const error = new Error('This escalation has already been resolved');
    error.statusCode = 400;
    throw error;
  }

  escalation.resolvedAt = new Date();
  escalation.status = 'RESOLVED';

  await escalation.save();
  return escalation.toJSON();
};

const deleteEscalation = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  const escalation = await Escalation.findByIdAndDelete(id);
  if (!escalation) {
    const error = new Error('Escalation not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  createEscalation,
  getEscalations,
  getAttentionEscalations,
  getEscalationById,
  updateEscalation,
  resolveEscalation,
  deleteEscalation
};
